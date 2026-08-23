/**
 * Rate Limiter for Authentication Actions:
 * 1. Account Creation: Max 5 accounts every 15 days per device/browser.
 * 2. Password Reset / Change: Max 5 attempts every 1 hour per device & email.
 */

const ACCOUNT_CREATION_KEY = '__AUTH_ACCOUNT_CREATIONS__';
const PASSWORD_RESET_KEY = '__AUTH_PASSWORD_RESETS__';

const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

export const MAX_ACCOUNT_CREATIONS_15_DAYS = 5;
export const MAX_PASSWORD_RESETS_1_HOUR = 5;

interface TimestampLog {
  timestamp: number;
  identifier?: string;
}

/** Helper to get stored timestamps and prune expired ones */
function getValidTimestamps(storageKey: string, windowMs: number): TimestampLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const entries: TimestampLog[] = JSON.parse(raw);
    const now = Date.now();
    const valid = entries.filter((e) => now - e.timestamp < windowMs);
    
    // Save pruned list if items were removed
    if (valid.length !== entries.length) {
      localStorage.setItem(storageKey, JSON.stringify(valid));
    }
    return valid;
  } catch (err) {
    console.warn('[rateLimiter] Error reading storage:', err);
    return [];
  }
}

/** Record a new timestamp */
function recordTimestamp(storageKey: string, windowMs: number, identifier?: string) {
  if (typeof window === 'undefined') return;
  try {
    const current = getValidTimestamps(storageKey, windowMs);
    current.push({ timestamp: Date.now(), identifier });
    localStorage.setItem(storageKey, JSON.stringify(current));
  } catch (err) {
    console.warn('[rateLimiter] Error writing storage:', err);
  }
}

/** Format milliseconds into readable duration */
function formatRemainingTime(ms: number): string {
  const hours = Math.ceil(ms / (1000 * 60 * 60));
  if (hours > 24) {
    const days = Math.ceil(hours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  if (hours > 1) {
    return `${hours} hours`;
  }
  const minutes = Math.ceil(ms / (1000 * 60));
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}

/* ── 1. Account Creation Rate Limiting (Max 5 every 15 days) ──────────────── */

export function checkAccountCreationLimit(): {
  allowed: boolean;
  count: number;
  remaining: number;
  errorMessage?: string;
} {
  const entries = getValidTimestamps(ACCOUNT_CREATION_KEY, FIFTEEN_DAYS_MS);
  const count = entries.length;
  const remaining = Math.max(0, MAX_ACCOUNT_CREATIONS_15_DAYS - count);

  if (count >= MAX_ACCOUNT_CREATIONS_15_DAYS) {
    const oldest = entries[0]?.timestamp || Date.now();
    const waitTimeMs = oldest + FIFTEEN_DAYS_MS - Date.now();
    const timeStr = formatRemainingTime(Math.max(0, waitTimeMs));

    return {
      allowed: false,
      count,
      remaining: 0,
      errorMessage: `Account creation limit reached: Maximum ${MAX_ACCOUNT_CREATIONS_15_DAYS} accounts every 15 days allowed on this device. Please try again in ${timeStr} or sign in to an existing account.`,
    };
  }

  return {
    allowed: true,
    count,
    remaining,
  };
}

export function recordAccountCreation() {
  recordTimestamp(ACCOUNT_CREATION_KEY, FIFTEEN_DAYS_MS);
}

/* ── 2. Password Reset Rate Limiting (Max 5 every 1 hour) ─────────────────── */

export function checkPasswordResetLimit(email?: string): {
  allowed: boolean;
  count: number;
  remaining: number;
  errorMessage?: string;
} {
  const entries = getValidTimestamps(PASSWORD_RESET_KEY, ONE_HOUR_MS);
  
  // Filter by email if provided, or check total device attempts
  const relevantEntries = email
    ? entries.filter((e) => !e.identifier || e.identifier.toLowerCase() === email.toLowerCase())
    : entries;

  const count = relevantEntries.length;
  const remaining = Math.max(0, MAX_PASSWORD_RESETS_1_HOUR - count);

  if (count >= MAX_PASSWORD_RESETS_1_HOUR) {
    const oldest = relevantEntries[0]?.timestamp || Date.now();
    const waitTimeMs = oldest + ONE_HOUR_MS - Date.now();
    const timeStr = formatRemainingTime(Math.max(0, waitTimeMs));

    return {
      allowed: false,
      count,
      remaining: 0,
      errorMessage: `Password reset limit reached: Maximum ${MAX_PASSWORD_RESETS_1_HOUR} reset attempts allowed every 1 hour. Please try again in ${timeStr}.`,
    };
  }

  return {
    allowed: true,
    count,
    remaining,
  };
}

export function recordPasswordReset(email?: string) {
  recordTimestamp(PASSWORD_RESET_KEY, ONE_HOUR_MS, email);
}
