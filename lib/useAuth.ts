'use client';

import type { Session, User } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';

import { createClient } from '@/lib/supabase/client';

// ── Dev bypass ────────────────────────────────────────────────────────────────
// In development, calling setDevLogin(true) injects a fake session so you can
// test authenticated UI without a real Supabase account.
// NEVER ships to production — gated on NODE_ENV at build time.
const DEV_KEY = '__DEV_LOGIN__';

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
 * `onAuthStateChange` also fires on TOKEN_REFRESHED, so `session` always holds
 * a current access token — which matters because that token is what gets
 * handed to the child notes sites when a card is clicked.
 */
export function useAuth() {
  const supabase = useMemo(() => createClient(), []);

  const [session, setSession] = useState<Session | null>(null);
  // With no Supabase client there is nothing to wait for, so skip the spinner.
  const [loading, setLoading] = useState(supabase !== null);

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

  useEffect(() => {
    if (!supabase) return;
    // If dev session is active, don't overwrite it with the real (null) one
    if (process.env.NODE_ENV === 'development' && localStorage.getItem(DEV_KEY) === '1') {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return {
    supabase,
    session,
    user: session?.user ?? null,
    loading,
    isAuthenticated: Boolean(session),
  };
}

