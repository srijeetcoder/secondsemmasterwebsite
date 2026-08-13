# Codebase Map - Semester 2 Notes Hub

## Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Runtime**: Fluid Compute (default)
- **Frontend**: React 19, Tailwind CSS, Framer Motion, Lucide React
- **Backend**: Supabase Auth (@supabase/supabase-js + @supabase/ssr)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Architecture Overview
- Central landing hub with SSO gateway
- Four child sites: Basic CS & Programming, Chemistry-I, Chemistry Laboratory, Mathematics-II
- Cross-domain authentication using Supabase JWT/refresh tokens
- Shared Supabase project for all child sites
- Client-server separation with token-based cross-domain handoff

## Key Components
- `app/layout.tsx` - Root layout with fonts, metadata, dark theme shell
- `app/page.tsx` - Server entry + architecture notes
- `app/globals.css` - Glassmorphism + per-card accent system
- `app/auth/callback/route.ts` - Exchange code for session (OAuth + magic link)
- `components/HubClient.tsx` - Top bar, hero, search, grid orchestration
- `components/NoteCard.tsx` - Glass card with accent glow, handoff link
- `lib/handoff.ts` - Cross-domain token handoff + origin allowlist
- `integration/child-site-auth.ts` - Drop-in snippet for child sites

## Data Flow
1. User signs in on hub → Supabase issues JWT + refresh token
2. Card click → hub appends tokens to child site URL fragment
3. Child site reads tokens → calls `supabase.auth.setSession()`
4. Supabase verifies JWT, stores session, refreshes it
5. Tokens scrubbed from address bar via history.replaceState

## Dependencies
- `@supabase/ssr` (v0.12.4)
- `@supabase/supabase-js` (v2.111.0)
- `framer-motion` (v12.43.0)
- `lucide-react` (v1.28.0)
- `next` (v16.2.12)
- `react` (v19.2.8)
- `react-dom` (v19.2.8)
- `tailwindcss` (v3.4.13)
- `typescript` (v5.6.3)
- `eslint` + `eslint-config-next` (for linting)
- `postcss` (v8.4.47)
- `autoprefixer` (v10.4.20)
- `tailwindcss` (v3.4.13)
- `supabase` client/server modules

## Security Considerations
- Hash fragments (not ?access_token=) to prevent token leakage
- ALLOWED_HANDOFF_ORIGINS restrict tokens to four child site origins
- HTTPS required; http:// targets fall back to token-free URL
- History scrubbing via history.replaceState
- Session guards in child site auth module

## Scalability Notes
- Fluid Compute enables concurrent request sharing (up to 5GB package size)
- Supabase handles auth and database layer
- Cross-domain handoff avoids server-side token transmission
- Single Supabase project shared across all child sites

## Testing
- `npm test` - Handoff allowlist / token placement, search filtering
- `npm run typecheck` - TypeScript compilation
- `npm run lint` - ESLint checks

## Deployment
- `vercel deploy --prod`
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel env vars
- Add deployed domain's `/auth/callback` to Supabase redirect allowlist

## Roadmap Phases
1. **Phase 1**: Infrastructure setup - SSO gateway, Supabase integration
2. **Phase 2**: Child site development - Four study-notes sites
3. **Phase 3**: Cross-domain handoff optimization
4. **Phase 4**: Performance tuning and scaling

## Known Limitations
- Current codebase lacks comprehensive documentation (README.md only)
- No existing ADRs/PRDs/SPECs in the project
- Minimal test coverage (only handoff + search checks)
- Need to wire up child site authentication snippets

## Risks
- Token leakage risk if handoff allowlist is misconfigured
- Cross-domain complexity increases attack surface
- Supabase connection pooling under high concurrency
- SEO considerations for dynamically generated child sites

## Open Questions
- Should we implement a centralized config for child site environments?
- How to handle session expiration and automatic redirection?
- Are there any security audits needed for the cross-domain flow?
- What monitoring/observability is in place for the SSO gateway?
