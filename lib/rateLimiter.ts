/**
 * Comprehensive Security & Rate Limiter:
 * 1. Login Lockout: 5 consecutive failed password attempts -> 15-minute lockout.
 * 2. Account Creation: Max 5 accounts every 15 days per device/IP.
 * 3. Password Reset: Max 5 attempts every 1 hour per device & email.
 * 4. In-memory IP Rate Limiter for server middleware & API routes.
 */

const ACCOUNT_CREATION_KEY = '__AUTH_ACCOUNT_CREATIONS__';
const PASSWORD_RESET_KEY = '__AUTH_PASSWORD_RESETS__';
const LOGIN_ATTEMPTS_KEY = '__AUTH_LOGIN_FAILED_ATTEMPTS__';
const LOGIN_LOCKOUT_KEY = '__AUTH_LOGIN_LOCKOUT__';

const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

export const MAX_ACCOUNT_CREATIONS_15_DAYS = 5;
export const MAX_PASSWORD_RESETS_1_HOUR = 5;
export const MAX_FAILED_LOGIN_ATTEMPTS = 5;

interface TimestampLog {
  timestamp: number;
  identifier?: string;
}

interface LoginAttemptLog {
  count: number;
  lastAttempt: number;
  lockoutUntil?: number;
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

/** Format milliseconds into human readable duration */
export function formatRemainingDuration(ms: number): string {
  if (ms <= 0) return '0 seconds';
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (totalSeconds > 86400) {
    const days = Math.ceil(totalSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  if (minutes > 60) {
    const hours = Math.ceil(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds > 0 ? `${seconds}s` : ''}`.trim();
  }
  return `${totalSeconds} seconds`;
}

/* ── 1. Login Lockout Protection (5 Failed Attempts -> 15 min Lock) ───────── */

function getLoginLogs(): Record<string, LoginAttemptLog> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLoginLogs(logs: Record<string, LoginAttemptLog>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(logs));
  } catch (err) {
    console.warn('[rateLimiter] Error saving login logs:', err);
  }
}

/** Check if account is currently locked due to 5 failed password attempts */
export function checkLoginLockout(email: string): {
  locked: boolean;
  attempts: number;
  remainingAttempts: number;
  remainingMs: number;
  errorMessage?: string;
} {
  const normalized = email.trim().toLowerCase();
  const logs = getLoginLogs();
  const entry = logs[normalized];
  const now = Date.now();

  if (!entry) {
    return { locked: false, attempts: 0, remainingAttempts: MAX_FAILED_LOGIN_ATTEMPTS, remainingMs: 0 };
  }

  // Check if active lockout exists
  if (entry.lockoutUntil && entry.lockoutUntil > now) {
    const remainingMs = entry.lockoutUntil - now;
    const durationStr = formatRemainingDuration(remainingMs);
    return {
      locked: true,
      attempts: entry.count,
      remainingAttempts: 0,
      remainingMs,
      errorMessage: `Account temporarily locked due to ${MAX_FAILED_LOGIN_ATTEMPTS} incorrect password attempts. Please wait ${durationStr} before trying again, or use "Forgot password" to reset your password.`,
    };
  }

  // If lockout expired or 15 mins passed since last attempt, reset
  if (now - entry.lastAttempt > FIFTEEN_MINUTES_MS) {
    delete logs[normalized];
    saveLoginLogs(logs);
    return { locked: false, attempts: 0, remainingAttempts: MAX_FAILED_LOGIN_ATTEMPTS, remainingMs: 0 };
  }

  const remainingAttempts = Math.max(0, MAX_FAILED_LOGIN_ATTEMPTS - entry.count);
  return {
    locked: false,
    attempts: entry.count,
    remainingAttempts,
    remainingMs: 0,
  };
}

/** Record a failed password attempt */
export function recordFailedLoginAttempt(email: string): {
  isLockedNow: boolean;
  remainingAttempts: number;
  errorMessage: string;
} {
  const normalized = email.trim().toLowerCase();
  const logs = getLoginLogs();
  const entry = logs[normalized] || { count: 0, lastAttempt: Date.now() };
  const now = Date.now();

  entry.count += 1;
  entry.lastAttempt = now;

  if (entry.count >= MAX_FAILED_LOGIN_ATTEMPTS) {
    entry.lockoutUntil = now + FIFTEEN_MINUTES_MS;
    logs[normalized] = entry;
    saveLoginLogs(logs);

    return {
      isLockedNow: true,
      remainingAttempts: 0,
      errorMessage: `Account locked: You have entered an incorrect password ${MAX_FAILED_LOGIN_ATTEMPTS} times. For security, your account is locked for 15 minutes. You can reset your password anytime via "Forgot password".`,
    };
  }

  logs[normalized] = entry;
  saveLoginLogs(logs);

  const remaining = MAX_FAILED_LOGIN_ATTEMPTS - entry.count;
  return {
    isLockedNow: false,
    remainingAttempts: remaining,
    errorMessage: `Incorrect password. You have ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before a 15-minute account lockout.`,
  };
}

/** Reset login attempts after successful sign in */
export function recordSuccessfulLogin(email: string) {
  const normalized = email.trim().toLowerCase();
  const logs = getLoginLogs();
  if (logs[normalized]) {
    delete logs[normalized];
    saveLoginLogs(logs);
  }
}

/* ── 2. Account Creation Rate Limiting (Max 5 every 15 days) ──────────────── */

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
    const timeStr = formatRemainingDuration(Math.max(0, waitTimeMs));

    return {
      allowed: false,
      count,
      remaining: 0,
      errorMessage: `Account creation limit reached: Maximum ${MAX_ACCOUNT_CREATIONS_15_DAYS} accounts every 15 days allowed from this IP/device. Please try again in ${timeStr} or sign in to an existing account.`,
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

/* ── 3. Password Reset Rate Limiting (Max 5 every 1 hour) ─────────────────── */

export function checkPasswordResetLimit(email?: string): {
  allowed: boolean;
  count: number;
  remaining: number;
  errorMessage?: string;
} {
  const entries = getValidTimestamps(PASSWORD_RESET_KEY, ONE_HOUR_MS);
  
  const relevantEntries = email
    ? entries.filter((e) => !e.identifier || e.identifier.toLowerCase() === email.toLowerCase())
    : entries;

  const count = relevantEntries.length;
  const remaining = Math.max(0, MAX_PASSWORD_RESETS_1_HOUR - count);

  if (count >= MAX_PASSWORD_RESETS_1_HOUR) {
    const oldest = relevantEntries[0]?.timestamp || Date.now();
    const waitTimeMs = oldest + ONE_HOUR_MS - Date.now();
    const timeStr = formatRemainingDuration(Math.max(0, waitTimeMs));

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
