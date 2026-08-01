import { NextResponse } from 'next/server';

import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

/**
 * OAuth / magic-link landing route.
 *
 * Supabase redirects here with `?code=...` after Google sign-in or after the
 * user clicks a magic link. `exchangeCodeForSession` completes the PKCE flow
 * and writes the session cookies, so by the time we redirect back to `/`
 * the hub already knows who the user is.
 *
 * Register this exact URL in Supabase:
 *   Authentication -> URL Configuration -> Redirect URLs
 *     http://localhost:3000/auth/callback
 *     https://<your-hub-domain>/auth/callback
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // Supabase can also report failures straight on the redirect.
  const errorDescription = searchParams.get('error_description');
  if (errorDescription) {
    return NextResponse.redirect(
      `${origin}/?auth_error=${encodeURIComponent(errorDescription)}`,
    );
  }

  if (!isSupabaseConfigured) {
    return NextResponse.redirect(`${origin}/?auth_error=Supabase%20is%20not%20configured`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // `next` is validated as a relative path so this cannot become an open redirect.
      const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';
      return NextResponse.redirect(`${origin}${safeNext}`);
    }

    return NextResponse.redirect(
      `${origin}/?auth_error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(`${origin}/?auth_error=Missing%20auth%20code`);
}
