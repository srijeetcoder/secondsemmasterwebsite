/**
 * Shared Supabase environment configuration.
 *
 * Kept in its own module (no 'use client' / no 'next/headers') so that both the
 * browser client and the server client can import it without pulling
 * server-only or client-only code into the wrong bundle.
 *
 * Set these in `.env.local` — see `.env.local.example`:
 *   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
 *
 * Note: `process.env.NEXT_PUBLIC_*` must be referenced as a full static
 * expression (not `process.env[key]`) for Next.js to inline it at build time.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** True once both env vars look real, so the UI can show a setup hint instead of crashing. */
export const isSupabaseConfigured =
  SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20;
