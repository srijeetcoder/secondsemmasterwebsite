/* ===========================================================================
 * DROP-IN AUTH FOR A CHILD NOTES SITE
 * ===========================================================================
 *
 * Copy this file into each of the four notes sites:
 *   - cnotesbycsrijeet.vercel.app     (ESCS 201)
 *   - chem-notes-nhm8.vercel.app      (BSCH 201)
 *   - pracchem.vercel.app             (BSCH 291)
 *   - mathsnotesbysrijeet.vercel.app  (BSM 201)
 *
 * SETUP ON THE CHILD SITE
 * -----------------------
 *   npm install @supabase/supabase-js
 *
 *   .env.local  (EXACTLY the same values as the hub — this is the whole point):
 *     NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
 *     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
 *
 * No database, no user table, no login form, no password handling on this
 * site. It only ever *consumes* a session that the hub already created.
 *
 * HOW THE HANDOFF WORKS
 * ---------------------
 *   1. The hub builds a URL like:
 *        https://pracchem.vercel.app/#access_token=eyJ...&refresh_token=v1...
 *   2. `adoptSessionFromHub()` reads those two tokens and calls
 *      `supabase.auth.setSession()`.
 *   3. Supabase verifies the JWT signature against the shared project, stores
 *      the session locally, and starts auto-refreshing it. Done.
 *
 * The tokens are read from the URL *hash* by default (never sent to a server,
 * so they stay out of access logs), but this reads the query string too, so it
 * keeps working if you flip HANDOFF_MODE to 'query' on the hub.
 * =========================================================================== */

import { createClient, type User } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/** Where to bounce users who arrive without a session. */
const HUB_URL = 'https://your-hub-domain.vercel.app';

/**
 * Adopts the session handed over by the hub, if one is present in the URL.
 * Returns the signed-in user, or `null` if nobody is signed in.
 *
 * Call this once, as early as possible in the app lifecycle — in a top-level
 * `useEffect`, a root layout client component, or a plain `<script>` for a
 * non-React site.
 */
export async function adoptSessionFromHub(): Promise<User | null> {
  if (typeof window === 'undefined') return null;

  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const query = new URLSearchParams(window.location.search);

  const accessToken = hash.get('access_token') ?? query.get('access_token');
  const refreshToken = hash.get('refresh_token') ?? query.get('refresh_token');

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // Scrub tokens from the address bar + history entry either way.
    window.history.replaceState({}, document.title, window.location.pathname);

    if (error) {
      console.error('[auth] Session handoff failed:', error.message);
    }
  }

  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/**
 * Guard for pages that require a login: adopts any incoming session, and
 * redirects back to the hub when there is none.
 *
 * The `next` parameter lets the hub send the user straight back here after
 * they sign in (wire it up on the hub if you want that round trip).
 */
export async function requireAuth(): Promise<User | null> {
  const user = await adoptSessionFromHub();

  if (!user) {
    const back = encodeURIComponent(window.location.href);
    window.location.replace(`${HUB_URL}/?next=${back}`);
    return null;
  }

  return user;
}

/** Signs the user out on this site only; the hub session stays alive. */
export async function signOutLocally() {
  await supabase.auth.signOut();
}

/* ---------------------------------------------------------------------------
 * REACT USAGE EXAMPLE
 * ---------------------------------------------------------------------------
 *
 *   'use client';
 *   import { useEffect, useState } from 'react';
 *   import type { User } from '@supabase/supabase-js';
 *   import { adoptSessionFromHub, supabase } from '@/lib/child-site-auth';
 *
 *   export function useHubSession() {
 *     const [user, setUser] = useState<User | null>(null);
 *     const [loading, setLoading] = useState(true);
 *
 *     useEffect(() => {
 *       adoptSessionFromHub().then((u) => {
 *         setUser(u);
 *         setLoading(false);
 *       });
 *
 *       const { data: { subscription } } = supabase.auth.onAuthStateChange(
 *         (_e, session) => setUser(session?.user ?? null),
 *       );
 *       return () => subscription.unsubscribe();
 *     }, []);
 *
 *     // Optional: Realtime listener to auto-kick if another device signs in
 *     useEffect(() => {
 *       if (!user?.id) return;
 *       const channel = supabase
 *         .channel(`child-session-lock-${user.id}`)
 *         .on(
 *           'postgres_changes',
 *           { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
 *           () => {
 *             // If needed, check active_session_id vs local token or prompt re-auth
 *           }
 *         )
 *         .subscribe();
 *       return () => { supabase.removeChannel(channel); };
 *     }, [user?.id]);
 *
 *     return { user, loading };
 *   }
 *
 * PLAIN HTML / NO BUILD STEP
 * --------------------------
 *
 *   <script type="module">
 *     import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
 *     const supabase = createClient('https://your-project-ref.supabase.co', 'your-anon-key');
 *     const p = new URLSearchParams(location.hash.slice(1));
 *     const at = p.get('access_token'), rt = p.get('refresh_token');
 *     if (at && rt) {
 *       await supabase.auth.setSession({ access_token: at, refresh_token: rt });
 *       history.replaceState({}, '', location.pathname);
 *     }
 *     const { data } = await supabase.auth.getUser();
 *     console.log('Signed in as', data.user?.email);
 *   </script>
 * ------------------------------------------------------------------------- */
