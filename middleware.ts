import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from '@/lib/supabase/config';

// ── In-Memory IP Rate Limiter (Edge & Server Protection) ─────────────────────
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const ipRateLimitMap = new Map<string, RateLimitEntry>();
const CLEANUP_INTERVAL = 60 * 1000; // clean expired records every minute
let lastCleanup = Date.now();

function checkIpRateLimit(ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();

  // Periodic memory cleanup to prevent memory leak
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    lastCleanup = now;
    for (const [key, entry] of ipRateLimitMap.entries()) {
      if (entry.resetAt <= now) {
        ipRateLimitMap.delete(key);
      }
    }
  }

  const record = ipRateLimitMap.get(ip);
  if (!record || record.resetAt <= now) {
    ipRateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  record.count += 1;
  if (record.count > maxRequests) {
    return false;
  }
  return true;
}

/**
 * Keeps the Supabase session cookie fresh and protects against DDoS / abuse.
 */
export async function middleware(request: NextRequest) {
  // Extract client IP address from standard headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const clientIp = (forwarded ? forwarded.split(',')[0].trim() : realIp) || '127.0.0.1';

  const pathname = request.nextUrl.pathname;

  // 1. API Route Protection (Max 60 requests per minute per IP)
  if (pathname.startsWith('/api/')) {
    const isAllowed = checkIpRateLimit(`api_${clientIp}`, 60, 60 * 1000);
    if (!isAllowed) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please slow down.',
          retryAfterSeconds: 60,
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '60',
          },
        }
      );
    }
  }

  // 2. Auth Endpoints Protection (Max 30 requests per minute per IP)
  if (pathname.startsWith('/auth/')) {
    const isAllowed = checkIpRateLimit(`auth_${clientIp}`, 30, 60 * 1000);
    if (!isAllowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded on authentication endpoints. Please wait 1 minute.',
          retryAfterSeconds: 60,
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
          },
        }
      );
    }
  }

  // 3. General Site Traffic Rate Limit (Max 180 requests per minute per IP)
  const isGeneralAllowed = checkIpRateLimit(`site_${clientIp}`, 180, 60 * 1000);
  if (!isGeneralAllowed) {
    return new NextResponse('Too many requests. Please wait a moment before reloading.', {
      status: 429,
      headers: { 'Retry-After': '60' },
    });
  }

  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Refresh token validation
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and image files.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
