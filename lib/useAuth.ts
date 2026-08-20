'use client';

import type { Session, User } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';

import { createClient } from '@/lib/supabase/client';

// ── Dev bypass ────────────────────────────────────────────────────────────────
// In development, calling setDevLogin(true) injects a fake session so you can
// test authenticated UI without a real Supabase account.
// NEVER ships to production — gated on NODE_ENV at build time.
const DEV_KEY = '__DEV_LOGIN__';
const DEVICE_SESSION_KEY = '__HUB_DEVICE_SESSION_ID__';

function getOrCreateDeviceSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(DEVICE_SESSION_KEY);
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem(DEVICE_SESSION_KEY, id);
  }
  return id;
}

export function setDevLogin(active: boolean) {
  if (process.env.NODE_ENV !== 'development') return;
  if (active) {
    localStorage.setItem(DEV_KEY, '1');
  } else {
    localStorage.removeItem(DEV_KEY);
  }
  // Notify all useAuth instances on this page
  window.dispatchEvent(new Event('dev-auth-change'));
}

function makeDevSession(): Session {
  const fakeUser: User = {
    id: 'dev-user-0000',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'dev@localhost',
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: { provider: 'dev', providers: ['dev'] },
    user_metadata: { full_name: 'Dev User', avatar_url: '' },
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_anonymous: false,
  };
  return {
    access_token: 'dev-access-token',
    refresh_token: 'dev-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: fakeUser,
  };
}

/**
 * Single source of truth for "who is signed in" across the hub.
 *
 * Enforces Single-Active-Device session locking via Supabase Realtime:
 * If the user logs in from another device/browser, this instance gets notified
 * immediately and safely logs out locally with an informative notice.
 */
export function useAuth() {
  const supabase = useMemo(() => createClient(), []);

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(supabase !== null);
  const [sessionConflict, setSessionConflict] = useState(false);

  // Dev bypass — reads localStorage flag and responds to changes
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const sync = () => {
      const isDevLoggedIn = localStorage.getItem(DEV_KEY) === '1';
      if (isDevLoggedIn) {
        setSession(makeDevSession());
        setLoading(false);
      }
    };

    sync();
    window.addEventListener('dev-auth-change', sync);
    return () => window.removeEventListener('dev-auth-change', sync);
  }, []);

  // Main session lifecycle and Realtime single-active-device listener
  useEffect(() => {
    if (!supabase) return;
    if (process.env.NODE_ENV === 'development' && localStorage.getItem(DEV_KEY) === '1') {
      setLoading(false);
      return;
    }

    let active = true;

    // Helper to ensure profile exists (self-healing) and register active session
    const claimActiveDeviceSession = async (currUser: User) => {
      const localId = getOrCreateDeviceSessionId();
      try {
        const meta = currUser.user_metadata || {};
        const fullName = meta.full_name || meta.name || '';
        const college = meta.college || '';
        const year = meta.year || '';
        const semester = meta.semester || '';
        const dob = meta.dob || null;

        await supabase
          .from('profiles')
          .upsert(
            {
              id: currUser.id,
              email: currUser.email,
              full_name: fullName,
              college: college,
              year: year,
              semester: semester,
              dob: dob ? dob : null,
              active_session_id: localId,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
      } catch (err) {
        console.warn('[auth] Could not upsert active session profile:', err);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
      if (data.session?.user) {
        claimActiveDeviceSession(data.session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setLoading(false);

      if (event === 'SIGNED_IN' && nextSession?.user) {
        // Generate a new device session id on fresh sign-in and claim it
        const newLocalId = typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem(DEVICE_SESSION_KEY, newLocalId);
        claimActiveDeviceSession(nextSession.user);
        setSessionConflict(false);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem(DEVICE_SESSION_KEY);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Supabase Realtime listener to detect if another device logged into the same account
  useEffect(() => {
    if (!supabase || !session?.user?.id) return;
    const userId = session.user.id;

    const channel = supabase
      .channel(`active-device-lock-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        async (payload: any) => {
          const remoteSessionId = payload.new?.active_session_id;
          const currentLocalId = typeof window !== 'undefined' ? localStorage.getItem(DEVICE_SESSION_KEY) : null;

          // If the profile's active_session_id changed to something other than this device's ID
          if (remoteSessionId && currentLocalId && remoteSessionId !== currentLocalId) {
            console.warn('[auth] Account session was claimed by another device. Logging out.');
            localStorage.removeItem(DEVICE_SESSION_KEY);
            setSessionConflict(true);
            try {
              await supabase.auth.signOut({ scope: 'local' });
            } catch (err) {
              console.error('[auth] Error signing out on conflict:', err);
            }
            setSession(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, session?.user?.id]);

  const dismissConflict = () => setSessionConflict(false);

  return {
    supabase,
    session,
    user: session?.user ?? null,
    loading,
    isAuthenticated: Boolean(session),
    sessionConflict,
    dismissConflict,
  };
}

