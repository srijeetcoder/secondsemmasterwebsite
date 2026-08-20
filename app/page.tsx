import { HubClient } from '@/components/HubClient';

/* ===========================================================================
 * SEMESTER 2 NOTES HUB — the "mother" site
 * ===========================================================================
 *
 * QUICK START
 * -----------
 *   1. cp .env.local.example .env.local   (then paste your Supabase values)
 *   2. npm install
 *   3. npm run dev
 *
 * WHAT THIS APP DOES
 * ------------------
 *   - Renders a searchable hub linking to four notes sites.
 *   - Owns the ONLY Supabase Auth session in the system. Users sign in here
 *     via Google OAuth, email + password, or a magic link.
 *   - Hands that session to a child site when its card is clicked, by
 *     appending the access + refresh tokens to the destination URL.
 *
 * WHERE THE INTERESTING BITS LIVE
 * -------------------------------
 *   lib/handoff.ts               the cross-domain token handoff + origin allowlist
 *   lib/supabase/client.ts       browser client (cookie-backed, via @supabase/ssr)
 *   lib/supabase/server.ts       server client used by the OAuth callback
 *   app/auth/callback/route.ts   exchangeCodeForSession — completes OAuth / magic link
 *   proxy.ts                     refreshes the session cookie on every request
 *   integration/child-site-auth.ts  drop-in snippet for the four child sites
 *
 * The in-page "Developer integration guide" section repeats all of this with
 * copy-paste snippets, so it stays discoverable without reading the source.
 * =========================================================================== */

export default function Page() {
  return (
    <main className="relative min-h-screen">
      <HubClient />
    </main>
  );
}
