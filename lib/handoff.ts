import type { Session } from '@supabase/supabase-js';

/* ===========================================================================
 * CROSS-DOMAIN SESSION HANDOFF
 * ===========================================================================
 *
 * WHY THIS EXISTS
 * ---------------
 * The hub and the four notes sites live on different origins
 * (`*.vercel.app` subdomains are separate origins), so they cannot share
 * cookies or localStorage. What they CAN share is the Supabase project itself.
 *
 * So the flow is:
 *   1. The user signs in once, here on the hub.
 *   2. When they click a card, we append the hub's access + refresh token to
 *      the destination URL.
 *   3. The child site reads those tokens and calls `supabase.auth.setSession()`
 *      with the SAME project URL + anon key. Supabase validates the JWT
 *      server-side, and the child site now has a real, refreshable session.
 *
 * The child site needs no database, no user table, and no auth UI of its own.
 * See `integration/child-site-auth.ts` for the drop-in snippet.
 *
 * HASH vs QUERY
 * -------------
 * Default is `'hash'` (`site.com/#access_token=...`). Prefer it: the fragment
 * is never sent to the server, so tokens stay out of server logs, proxy logs,
 * and the Referer header. Switch to `'query'` only if a child site is a static
 * export that reads `?access_token=` server-side.
 * The snippet in `integration/` reads both, so either mode works.
 *
 * SECURITY NOTES (worth reading before you deploy)
 * ------------------------------------------------
 *  - Tokens land in the address bar and in browser history. The child snippet
 *    strips them via `history.replaceState` the moment it consumes them.
 *  - Only ever hand off to origins you control. `ALLOWED_HANDOFF_ORIGINS`
 *    below is enforced in `buildHandoffUrl` so a typo'd or injected URL can
 *    never receive a token.
 *  - Access tokens are short-lived (1h by default in Supabase). The refresh
 *    token is the sensitive one — that is why the allowlist matters.
 *  - Everything must be HTTPS. `buildHandoffUrl` refuses plain http.
 * =========================================================================== */

/** Where tokens are placed on the destination URL. 'hash' is the safer default. */
export const HANDOFF_MODE: 'hash' | 'query' = 'hash';

/** Only these origins may ever receive a session token. */
export const ALLOWED_HANDOFF_ORIGINS = [
  'https://cnotesbycsrijeet.vercel.app',
  'https://chem-notes-nhm8.vercel.app',
  'https://pracchem.vercel.app',
  'https://mathsnotesbysrijeet.vercel.app',
];

/**
 * Builds the destination URL for a notes site, carrying the current session.
 *
 * Returns the plain URL (no tokens) when there is no session, when the target
 * is not on the allowlist, or when the target is not HTTPS — so a failure here
 * degrades to "open the site logged out", never to "leak a token".
 */
export function buildHandoffUrl(baseUrl: string, session: Session | null): string {
  if (!session?.access_token || !session?.refresh_token) return baseUrl;

  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    return baseUrl;
  }

  if (url.protocol !== 'https:') return baseUrl;
  if (!ALLOWED_HANDOFF_ORIGINS.includes(url.origin)) return baseUrl;

  const originalHash = url.hash && url.hash !== '#' ? url.hash.substring(1) : '';

  const payload = new URLSearchParams({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: String(session.expires_at ?? ''),
    token_type: session.token_type ?? 'bearer',
    type: 'sso_handoff',
  });

  if (originalHash) {
    payload.set('redirect_hash', originalHash);
  }

  if (HANDOFF_MODE === 'hash') {
    url.hash = payload.toString();
  } else {
    payload.forEach((value, key) => url.searchParams.set(key, value));
  }

  return url.toString();
}

/** True when the session is still valid (with a 60s safety margin). */
export function isSessionFresh(session: Session | null): boolean {
  if (!session?.expires_at) return Boolean(session);
  return session.expires_at * 1000 - Date.now() > 60_000;
}
