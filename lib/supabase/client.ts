'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './config';

/**
 * Browser-side Supabase client for the hub (the "mother" site).
 *
 * `createBrowserClient` from @supabase/ssr stores the session in cookies rather
 * than only localStorage, which is what lets the Next.js middleware and server
 * components see the same logged-in user.
 */

let cached: SupabaseClient | null = null;

/** Returns a singleton browser client, or `null` when env vars are missing. */
export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!cached) {
    cached = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return cached;
}

export { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured };
