import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

/**
 * Server-side Supabase client (Server Components, Route Handlers, Server Actions).
 *
 * Used by `app/auth/callback/route.ts` to run `exchangeCodeForSession`, which is
 * the PKCE step that turns the `?code=` Supabase sends back after Google OAuth /
 * magic-link into a real cookie-backed session.
 */
export async function createClient() {
  // Next 15+ made `cookies()` async.
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Middleware refreshes the session, so this is safe to ignore.
        }
      },
    },
  });
}
