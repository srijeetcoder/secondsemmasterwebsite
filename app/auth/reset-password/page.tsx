'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

import { createClient } from '@/lib/supabase/client';

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Page wrapper (Suspense boundary required by Next.js for useSearchParams)  */
/* ─────────────────────────────────────────────────────────────────────────── */

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Main content                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

type Phase = 'exchanging' | 'form' | 'success' | 'error';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const [phase, setPhase] = useState<Phase>('exchanging');
  const [exchangeError, setExchangeError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const passwordRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  // Exchange the PKCE code for a session as soon as the page mounts.
  useEffect(() => {
    if (!code) {
      setExchangeError('Invalid reset link — no code found. Please request a new one.');
      setPhase('error');
      return;
    }

    if (!supabase) {
      setExchangeError('Supabase is not configured.');
      setPhase('error');
      return;
    }

    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) {
          setExchangeError(error.message);
          setPhase('error');
        } else {
          setPhase('form');
          setTimeout(() => passwordRef.current?.focus(), 150);
        }
      })
      .catch((e: unknown) => {
        setExchangeError(e instanceof Error ? e.message : 'Unknown error.');
        setPhase('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setFormError('Passwords do not match.');
      return;
    }

    setBusy(true);
    setFormError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPhase('success');
      // Redirect home after 2.5 s
      setTimeout(() => router.push('/'), 2500);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not update password.');
    } finally {
      setBusy(false);
    }
  }

  /* ── Strength indicator ─────────────────────────────────────────────── */
  function strengthLevel(pwd: string): 0 | 1 | 2 | 3 {
    if (pwd.length === 0) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;
    return score as 0 | 1 | 2 | 3;
  }

  const strength = strengthLevel(password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'];
  const strengthColor = ['', '#EA4335', '#FBBC05', '#6D9B82'];

  return (
    <div className="min-h-screen bg-[#090A0B] flex items-center justify-center p-4">
      {/* Subtle background glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(74,166,168,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* ── Exchanging session ─────────────────────────────────── */}
          {phase === 'exchanging' && (
            <motion.div
              key="exchanging"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-16 text-center"
            >
              <Loader2 className="h-8 w-8 animate-spin text-[#4AA6A8]" />
              <p className="text-sm text-[#929694]">Verifying reset link…</p>
            </motion.div>
          )}

          {/* ── Error ─────────────────────────────────────────────── */}
          {phase === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-strong rounded-2xl px-6 py-8 text-center"
            >
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/25 bg-rose-500/[0.08]">
                <AlertCircle className="h-7 w-7 text-rose-400" />
              </div>
              <h1 className="mb-2 text-xl font-semibold text-[#E8E8E5]">Link invalid or expired</h1>
              <p className="mb-6 text-sm text-[#929694]">{exchangeError}</p>
              <button
                onClick={() => router.push('/')}
                className="btn-contrast rounded-xl px-5 py-2.5 text-sm font-semibold"
              >
                Back to home
              </button>
            </motion.div>
          )}

          {/* ── New password form ──────────────────────────────────── */}
          {phase === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-strong rounded-2xl px-6 pb-7 pt-7 sm:px-7"
            >
              {/* Header */}
              <div className="mb-6">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#4AA6A8]/25 bg-[#4AA6A8]/10">
                  <Sparkles className="h-5 w-5 text-[#4AA6A8]" />
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-[#E8E8E5]">
                  Set a new password
                </h1>
                <p className="mt-1 text-sm text-[#929694]">
                  Choose something strong that you haven&apos;t used before.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New password */}
                <div>
                  <label
                    htmlFor="reset-password"
                    className="mb-1.5 block text-xs font-medium text-[#929694]"
                  >
                    New password
                  </label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#626766]" />
                    <input
                      id="reset-password"
                      ref={passwordRef}
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setFormError(null); }}
                      placeholder="At least 6 characters"
                      className="search-input w-full rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#626766] transition hover:text-[#929694]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3].map((lvl) => (
                          <div
                            key={lvl}
                            className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{
                              backgroundColor:
                                strength >= lvl ? strengthColor[strength] : 'rgba(255,255,255,0.08)',
                            }}
                          />
                        ))}
                      </div>
                      <p
                        className="text-[11px] font-medium"
                        style={{ color: strengthColor[strength] }}
                      >
                        {strengthLabel[strength]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label
                    htmlFor="reset-confirm"
                    className="mb-1.5 block text-xs font-medium text-[#929694]"
                  >
                    Confirm new password
                  </label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#626766]" />
                    <input
                      id="reset-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => { setConfirm(e.target.value); setFormError(null); }}
                      placeholder="Re-enter your password"
                      className="search-input w-full rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#626766] transition hover:text-[#929694]"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Match indicator */}
                  {confirm.length > 0 && (
                    <p
                      className="mt-1.5 text-[11px] font-medium"
                      style={{ color: confirm === password ? '#6D9B82' : '#EA4335' }}
                    >
                      {confirm === password ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>

                {/* Error */}
                {formError && (
                  <div className="flex items-start gap-2 rounded-xl border border-rose-400/25 bg-rose-500/[0.08] px-3.5 py-2.5 text-sm text-rose-200">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="btn-contrast flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update password
                </button>
              </form>
            </motion.div>
          )}

          {/* ── Success ───────────────────────────────────────────── */}
          {phase === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass-strong rounded-2xl px-6 py-10 text-center"
            >
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#6D9B82]/25 bg-[#6D9B82]/10">
                <CheckCircle2 className="h-7 w-7 text-[#6D9B82]" />
              </div>
              <h1 className="mb-2 text-xl font-semibold text-[#E8E8E5]">Password updated!</h1>
              <p className="text-sm text-[#929694]">
                Your password has been changed successfully. Redirecting you home…
              </p>
              <div className="mt-5 flex justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-[#4AA6A8]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Full-page spinner (Suspense fallback)                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

function FullPageSpinner() {
  return (
    <div className="min-h-screen bg-[#090A0B] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#4AA6A8]" />
    </div>
  );
}
