# Semester 2 Notes Hub

A central landing hub **and** single sign-on gateway for four semester-2 study-notes sites.
Users sign in once here; every child site opens already authenticated, with no database
of its own.

| Subject | Code | Site |
| --- | --- | --- |
| Basic CS & Programming | ESCS 201 | https://cnotesbycsrijeet.vercel.app/ |
| Chemistry-I | BSCH 201 | https://chem-notes-nhm8.vercel.app/ |
| Chemistry Laboratory | BSCH 291 | https://pracchem.vercel.app/ |
| Mathematics-II | BSM 201 | https://mathsnotesbysrijeet.vercel.app/ |

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS · Framer Motion · Lucide ·
Supabase Auth (`@supabase/supabase-js` + `@supabase/ssr`)

---

## 1. Run it locally

```bash
npm install
cp .env.local.example .env.local   # then paste your Supabase values
npm run dev
```

Open http://localhost:3000.

The app renders fine without Supabase credentials — it shows a setup banner and disables
sign-in, so you can look at the UI before wiring anything up.

## 2. Configure Supabase

Get both values from **Supabase → Settings → API**:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Restart the dev server afterwards — Next.js inlines `NEXT_PUBLIC_*` at boot.

> The `anon` key is meant to be public. Never put the `service_role` key in a
> `NEXT_PUBLIC_` variable.

Then, in **Authentication → URL Configuration**, add:

```
Site URL:
  https://<your-hub-domain>

Redirect URLs:
  http://localhost:3000/auth/callback
  https://<your-hub-domain>/auth/callback
  https://cnotesbycsrijeet.vercel.app
  https://chem-notes-nhm8.vercel.app
  https://pracchem.vercel.app
  https://mathsnotesbysrijeet.vercel.app
```

For Google sign-in, enable the Google provider under **Authentication → Providers** and
paste in your OAuth client ID/secret from the Google Cloud console.

## 3. How the cross-domain handoff works

The hub and the notes sites are separate origins, so they cannot share cookies. What they
share instead is **the Supabase project itself**.

1. The user signs in on the hub. Supabase issues an access token (JWT) and a refresh token.
2. When a card is clicked, the hub appends both tokens to the destination URL:
   ```
   https://pracchem.vercel.app/#access_token=eyJ...&refresh_token=v1...&expires_at=...
   ```
3. The child site reads them and calls `supabase.auth.setSession({ access_token, refresh_token })`
   using the **same** project URL and anon key. Supabase verifies the JWT signature, stores
   the session, and takes over refreshing it.

The child site needs no user table, no auth UI, and no password handling.

**Why the hash fragment and not `?access_token=`** — fragments are never transmitted to the
server, so tokens stay out of server logs, proxy logs, and the `Referer` header. To switch,
set `HANDOFF_MODE = 'query'` in [`lib/handoff.ts`](lib/handoff.ts); the child snippet reads
both, so nothing else changes.

Other safeguards in `lib/handoff.ts`:

- `ALLOWED_HANDOFF_ORIGINS` — tokens are only ever appended to those four origins. Any other
  URL gets the plain link, so a typo can't leak a session.
- HTTPS is required; `http://` targets silently fall back to the token-free URL.
- The child snippet calls `history.replaceState` immediately, scrubbing tokens from the
  address bar and the history entry.

## 4. Wire up a child site

Copy [`integration/child-site-auth.ts`](integration/child-site-auth.ts) into the child
project, set the same two env vars, and call it on load:

```ts
import { adoptSessionFromHub } from '@/lib/child-site-auth';

useEffect(() => {
  adoptSessionFromHub().then((user) => {
    console.log('Signed in as', user?.email);
  });
}, []);
```

That file also contains a `requireAuth()` guard that bounces signed-out visitors back to the
hub, and a plain `<script type="module">` version for sites without a build step.

## 5. Project layout

```
app/
  layout.tsx                 fonts, metadata, dark theme shell
  page.tsx                   server entry + architecture notes
  globals.css                glassmorphism + per-card accent system
  auth/callback/route.ts     exchangeCodeForSession (OAuth + magic link)
components/
  HubClient.tsx              top bar, hero, search, grid orchestration
  NoteCard.tsx               glass card, accent glow, handoff link
  AuthModal.tsx              Google / password / magic-link sign-in
  SessionCard.tsx            "Session Active" strip + logout
  UserMenu.tsx               avatar dropdown in the top bar
  IntegrationGuide.tsx       in-page developer docs
  BackgroundMesh.tsx         animated radial gradient mesh
lib/
  handoff.ts                 cross-domain token handoff + origin allowlist
  subjects.ts                the four subjects + search filter
  useAuth.ts                 session hook
  supabase/{config,client,server}.ts
proxy.ts                     refreshes the session cookie per request
                             (Next 16's replacement for middleware.ts)
integration/child-site-auth.ts   drop-in snippet for the child sites
scripts/*.test.mjs           handoff + search checks — `npm test`
```

## 6. Checks

```bash
npm test        # handoff allowlist / token placement, search filtering
npm run typecheck
npm run lint
```

## 7. Deploy

```bash
vercel deploy --prod
```

Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel project's
environment variables, then add the deployed domain's `/auth/callback` to the Supabase
redirect allowlist.
