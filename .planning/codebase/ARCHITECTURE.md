# Architecture Analysis - Semester 2 Notes Hub

## System Architecture
- **Type**: Multi-tenant SSO gateway + child sites
- **Pattern**: Client-server separation with token-based cross-domain handoff
- **Deployment**: Vercel (Fluid Compute) → Single-page application with server-side rendering
- **Data Flow**: Hub → JWT/Refresh tokens → Child sites via URL fragment

## Technical Architecture Decisions

### 1. Cross-Domain Authentication Flow
- **Decision**: Use hash fragments (#access_token=...) for token passing
- **Rationale**: Fragments are never transmitted to servers, preventing token leakage
- **Implementation**: `lib/handoff.ts` implements allowlist of 4 child site origins
- **Security**: HTTPS required, history.replaceState scrubs tokens from URL bar

### 2. Shared Supabase Project
- **Decision**: Single Supabase project serves all 4 child sites
- **Rationale**: Eliminates need for per-site auth infrastructure
- **Implementation**: Child sites use `adoptSessionFromHub()` with shared credentials
- **Benefit**: Single point of authentication, centralized user management

### 3. React/Next.js Architecture
- **Framework**: Next.js 16 App Router (React 19)
- **Pattern**: File-system based routing
- **Styling**: Tailwind CSS + Framer Motion for animations
- **Component Pattern**: Atomic design (HubClient, NoteCard, etc.)

### 4. Authentication Flow
- **Hub**: Google/password/magic link sign-in via Supabase Auth
- **OAuth**: Code exchange in `app/auth/callback/route.ts`
- **Token Handoff**: JWT + refresh token via fragment to child sites
- **Session Management**: Child sites call `supabase.auth.setSession()`

### 5. Security Architecture
- **Origin Whitelisting**: Only 4 approved child sites receive tokens
- **Transport Security**: HTTPS enforced, tokens never sent to servers
- **Session Security**: Refresh tokens stored in Supabase sessions
- **Input Validation**: Allowlist prevents arbitrary token destinations

## Infrastructure Components

### Frontend Layer
- **Next.js App**: Server components for SSR, client components for interactivity
- **Auth UI**: React components in `components/` for sign-in flows
- **Theme**: Dark mode with glassmorphism design system (`globals.css`)
- **Navigation**: Dynamic grid of NoteCard components

### Backend Layer
- **Supabase**: PostgreSQL database + authentication
- **Edge Functions**: Not used (current codebase uses standard Next.js API routes)
- **Auth Hooks**: `useAuth.ts` for React component state management
- **Configuration**: Environment variables for Supabase connection

### Integration Layer
- **Child Site Auth**: `integration/child-site-auth.ts` snippet
- **Handoff Logic**: `lib/handoff.ts` implements cross-domain token passing
- **Subject Management**: `lib/subjects.ts` for the 4 semester subjects
- **Search**: Grid filtering by subject

## Security Architecture

### Threat Model
1. **Token Leakage**: Tokens transmitted via URL fragments (safest) but still vulnerable if allowlist is misconfigured
2. **Session Hijacking**: JWT tokens could be stolen if not properly secured
3. **Cross-Site Scripting**: Potential in child sites if not properly sandboxed
4. **Origin Spoofing**: Allowlist bypasses if properly validated

### Security Controls
- **Input Validation**: Strict origin checking
- **Transport Security**: HTTPS only, no mixed content
- **Session Security**: Token refresh in Supabase
- **UI Security**: Escape all dynamic content

## Performance Architecture

### Optimization Decisions
- **Fluid Compute**: Vercel functions reuse instances for better performance
- **SSR**: Next.js Server Components for initial load performance
- **Caching**: Browser cache for static assets, SSR caching for dynamic content
- **Edge Network**: Vercel global CDN for content delivery

### Performance Considerations
- **Token Handoff**: Fragment-based approach reduces server load
- **Session Management**: Supabase handles refresh efficiently
- **State Management**: Client-side state management with React hooks

## Technology Stack Analysis

### Strengths
- **Modern Framework**: Next.js 16 with App Router provides excellent developer experience
- **Auth Integration**: Supabase provides enterprise-grade authentication
- **Component Architecture**: Atomic design pattern promotes reusability
- **Styling**: Tailwind CSS enables rapid UI development
- **Animation**: Framer Motion provides professional animations

### Weaknesses
- **Limited Testing**: Only handoff and search tests exist
- **Documentation**: Minimal beyond README.md
- **Configuration**: Manual setup required for Supabase
- **Security**: Custom security logic increases complexity
- **Scaling**: Token handoff may not scale well with many child sites

## Technical Debt

### Current Issues
1. **No TypeScript Config**: `tsconfig.json` missing (though TypeScript types exist)
2. **Missing Documentation**: No ADR, PRD, or SPEC documents
3. **Limited Error Handling**: Basic error handling in auth flows
4. **No Monitoring**: No logging or observability
5. **Hardcoded Origins**: Allowlist is hardcoded in `lib/handoff.ts`

### Future Refactoring Needs
1. **Environment Configuration**: Centralized configuration management
2. **Security Hardening**: Security audit and penetration testing
3. **Performance Optimization**: Further optimization of token handoff
4. **Code Quality**: Comprehensive test coverage, linting
5. **Documentation**: Technical documentation for architecture decisions

## Recommendations

### Immediate (Phase 1)
1. **Secure Deployment**: Configure Supabase redirect URLs
2. **Environment Setup**: Proper environment variable management
3. **Security Audit**: Review allowlist implementation
4. **Testing**: Add comprehensive tests for handoff flow

### Medium-term (Phase 2)
1. **Configuration Management**: Centralized config service
2. **Monitoring**: Implement logging and metrics
3. **Documentation**: Create architectural decision records
4. **Security Hardening**: Regular security reviews

### Long-term (Phase 3)
1. **Scale-Out**: Evaluation for more child sites
2. **Performance**: Further optimization
3. **Technology Updates**: Evaluate new web technologies
4. **Architecture Review**: Regular architectural assessments