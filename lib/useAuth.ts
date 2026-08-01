'use client';

import type { Session } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';

import { createClient } from '@/lib/supabase/client';

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

  useEffect(() => {
    if (!supabase) return;

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
