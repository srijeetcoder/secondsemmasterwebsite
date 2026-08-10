import { NextResponse } from 'next/server';

import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

/**
 * OAuth / magic-link / password-reset landing route.
 *
 * Supabase redirects here with `?code=...` after:
 *   - Google sign-in
 *   - Email confirmation magic link
 *   - Password reset link  ← `type=recovery` is present in this case
 *
 * For recovery links we forward to /auth/reset-password so the user can
 * set a new password on a dedicated page after the session is exchanged.
 *
 * Register this exact URL in Supabase:
 *   Authentication -> URL Configuration -> Redirect URLs
 *     http://localhost:3000/auth/callback
 *     https://<your-hub-domain>/auth/callback
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type'); // "recovery" for password-reset links
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
    // For password-reset flows, forward the raw code to the reset page so it
    // can exchange it client-side and immediately show the new-password form.
    if (type === 'recovery') {
      return NextResponse.redirect(
        `${origin}/auth/reset-password?code=${encodeURIComponent(code)}`,
      );
    }

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
