'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import {
  checkPasswordResetLimit,
  recordPasswordReset,
} from '@/lib/rateLimiter';

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

type Phase = 'exchanging' | 'form' | 'manual-otp' | 'success' | 'error';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const [phase, setPhase] = useState<Phase>('exchanging');
  const [exchangeError, setExchangeError] = useState<string | null>(null);

  // Manual OTP state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password fields
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const passwordRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  // Exchange the PKCE code for a session if code is present in URL
  useEffect(() => {
    if (!supabase) {
      setExchangeError('Supabase is not configured.');
      setPhase('error');
      return;
    }

    if (!code) {
      // If no code parameter, provide direct OTP entry form
      setPhase('manual-otp');
      return;
    }

    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) {
          setExchangeError(error.message);
          setPhase('manual-otp');
          setFormError('Reset link expired or invalid. You can enter your email and OTP code directly below.');
        } else {
          setPhase('form');
          setTimeout(() => passwordRef.current?.focus(), 150);
        }
      })
      .catch((e: unknown) => {
        setExchangeError(e instanceof Error ? e.message : 'Unknown error.');
        setPhase('manual-otp');
      });
  }, [code, supabase]);

  // Password update via active session (when PKCE code was exchanged)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    // Check rate limit: max 5 times every 1 hour
    const resetLimit = checkPasswordResetLimit();
    if (!resetLimit.allowed) {
      setFormError(resetLimit.errorMessage || 'Password reset limit reached (Max 5 attempts per hour).');
      return;
    }

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

      recordPasswordReset();
      setPhase('success');
      setTimeout(() => router.push('/'), 2200);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not update password.');
    } finally {
      setBusy(false);
    }
  }

  // Password update via email + 6-digit OTP verification
  async function handleManualOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    const token = otp.join('');
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    // Check rate limit
    const resetLimit = checkPasswordResetLimit(email.trim());
    if (!resetLimit.allowed) {
      setFormError(resetLimit.errorMessage || 'Password reset limit reached (Max 5 attempts per hour).');
      return;
    }

    if (token.length < 6) {
      setFormError('Please enter the complete 6-digit OTP code.');
      return;
    }
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
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        type: 'recovery',
      });

      if (verifyError) {
        throw new Error('Invalid or expired OTP code. Please request a new one.');
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      recordPasswordReset(email.trim());

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('auth-toast', {
            detail: {
              type: 'success',
              title: 'Password Reset Successfully!',
              message: 'Your password has been changed successfully.',
            },
          })
        );
      }

      setPhase('success');
      setTimeout(() => router.push('/'), 2200);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to reset password.');
    } finally {
      setBusy(false);
    }
  }

  // Resend OTP from standalone reset page
  async function handleResendOtp() {
    if (!supabase || !email.trim() || resendCooldown > 0) return;

    const resetLimit = checkPasswordResetLimit(email.trim());
    if (!resetLimit.allowed) {
      setFormError(resetLimit.errorMessage || 'Password reset limit reached (Max 5 attempts per hour).');
      return;
    }

    setBusy(true);
    setFormError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      setResendCooldown(60);
      setNotice('A fresh 6-digit reset code has been sent to your email.');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not send OTP.');
    } finally {
      setBusy(false);
    }
  }

  /* ── OTP input helpers ────────────────────────────────────────────────── */
  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setFormError(null);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const next = ['', '', '', '', '', ''];
    digits.forEach((d, i) => (next[i] = d));
    setOtp(next);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
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

          {/* ── Error Screen ───────────────────────────────────────── */}
          {phase === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-strong rounded-2xl px-6 py-8 text-center border border-white/10 bg-[#0e1113]/95"
            >
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/25 bg-rose-500/[0.08]">
                <AlertCircle className="h-7 w-7 text-rose-400" />
              </div>
              <h1 className="mb-2 text-xl font-semibold text-[#E8E8E5]">Configuration Issue</h1>
              <p className="mb-6 text-sm text-[#929694]">{exchangeError}</p>
              <button
                onClick={() => router.push('/')}
                className="btn-contrast rounded-xl px-5 py-2.5 text-sm font-semibold"
              >
                Back to home
              </button>
            </motion.div>
          )}

          {/* ── Direct OTP Reset Form ──────────────────────────────── */}
          {phase === 'manual-otp' && (
            <motion.div
              key="manual-otp"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-strong rounded-2xl px-6 pb-7 pt-7 sm:px-7 border border-white/10 bg-[#0e1113]/95 shadow-2xl"
            >
              <div className="mb-6">
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl border border-white/10 bg-white/[0.04] p-1 shadow-sm">
                    <img
                      src="/logo.png"
                      alt="Notes4BtechCSE Logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-[#E8E8E5]">
                  Reset Your Password
                </h1>
                <p className="mt-1 text-sm text-[#929694]">
                  Enter your email, 6-digit OTP code, and new password.
                </p>
              </div>

              <form onSubmit={handleManualOtpSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="manual-reset-email" className="mb-1.5 block text-xs font-medium text-[#929694]">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#626766]" />
                    <input
                      id="manual-reset-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="search-input w-full rounded-xl py-2.5 pl-10 pr-3 text-sm focus:outline-none bg-[#090A0B]/80 border border-white/10 text-[#E8E8E5] focus:border-[#4AA6A8]/60 transition"
                    />
                  </div>
                </div>

                {/* 6-digit OTP code */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-[#929694]">
                    6-Digit OTP Code
                  </label>
                  <div
                    className="flex gap-2 justify-between"
                    onPaste={handleOtpPaste}
                  >
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        id={`page-otp-digit-${i}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={`
                          search-input h-11 w-full rounded-xl text-center text-lg font-semibold
                          tracking-widest focus:outline-none transition-all duration-150 bg-[#090A0B]/80
                          border border-white/10
                          ${digit ? 'border-[#4AA6A8] text-[#4AA6A8] shadow-[0_0_10px_rgba(74,166,168,0.2)]' : 'text-[#E8E8E5]'}
                        `}
                        aria-label={`Digit ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label htmlFor="manual-new-password" className="mb-1.5 block text-xs font-medium text-[#929694]">
                    New Password
                  </label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#626766]" />
                    <input
                      id="manual-new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setFormError(null); }}
                      placeholder="At least 6 characters"
                      className="search-input w-full rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none bg-[#090A0B]/80 border border-white/10 text-[#E8E8E5] focus:border-[#4AA6A8]/60 transition"
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
                      <p className="text-[11px] font-medium" style={{ color: strengthColor[strength] }}>
                        {strengthLabel[strength]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label htmlFor="manual-confirm-password" className="mb-1.5 block text-xs font-medium text-[#929694]">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#626766]" />
                    <input
                      id="manual-confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={confirm}
                      onChange={(e) => { setConfirm(e.target.value); setFormError(null); }}
                      placeholder="Re-enter your password"
                      className="search-input w-full rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none bg-[#090A0B]/80 border border-white/10 text-[#E8E8E5] focus:border-[#4AA6A8]/60 transition"
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
                  {confirm.length > 0 && (
                    <p
                      className="mt-1.5 text-[11px] font-medium"
                      style={{ color: confirm === password ? '#6D9B82' : '#EA4335' }}
                    >
                      {confirm === password ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>

                {formError && (
                  <div className="flex items-start gap-2 rounded-xl border border-rose-400/25 bg-rose-500/[0.08] px-3.5 py-2.5 text-sm text-rose-200">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {notice && (
                  <div className="flex items-start gap-2 rounded-xl border border-[#6D9B82]/25 bg-[#6D9B82]/[0.08] px-3.5 py-2.5 text-sm text-[#6D9B82]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{notice}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="btn-contrast flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 shadow-md"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Verify OTP & Update Password
                </button>
              </form>

              <div className="mt-5 flex items-center justify-between text-sm">
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center gap-1.5 text-[#929694] transition hover:text-[#E8E8E5]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Home
                </button>

                <button
                  onClick={handleResendOtp}
                  disabled={busy || !email || resendCooldown > 0}
                  className="flex items-center gap-1.5 text-[#4AA6A8] transition hover:text-[#5ec2c4] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── New password form (Session Exchanged via Link) ───────── */}
          {phase === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-strong rounded-2xl px-6 pb-7 pt-7 sm:px-7 border border-white/10 bg-[#0e1113]/95 shadow-2xl"
            >
              <div className="mb-6">
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl border border-white/10 bg-white/[0.04] p-1 shadow-sm">
                    <img
                      src="/logo.png"
                      alt="Notes4BtechCSE Logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-[#E8E8E5]">
                  Set a New Password
                </h1>
                <p className="mt-1 text-sm text-[#929694]">
                  Choose a secure password for your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New password */}
                <div>
                  <label htmlFor="reset-password" className="mb-1.5 block text-xs font-medium text-[#929694]">
                    New Password
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
                      className="search-input w-full rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none bg-[#090A0B]/80 border border-white/10 text-[#E8E8E5] focus:border-[#4AA6A8]/60 transition"
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
                      <p className="text-[11px] font-medium" style={{ color: strengthColor[strength] }}>
                        {strengthLabel[strength]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label htmlFor="reset-confirm" className="mb-1.5 block text-xs font-medium text-[#929694]">
                    Confirm New Password
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
                      className="search-input w-full rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none bg-[#090A0B]/80 border border-white/10 text-[#E8E8E5] focus:border-[#4AA6A8]/60 transition"
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

                  {confirm.length > 0 && (
                    <p
                      className="mt-1.5 text-[11px] font-medium"
                      style={{ color: confirm === password ? '#6D9B82' : '#EA4335' }}
                    >
                      {confirm === password ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>

                {formError && (
                  <div className="flex items-start gap-2 rounded-xl border border-rose-400/25 bg-rose-500/[0.08] px-3.5 py-2.5 text-sm text-rose-200">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="btn-contrast flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 shadow-md"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update Password
                </button>
              </form>
            </motion.div>
          )}

          {/* ── Success Screen ─────────────────────────────────────── */}
          {phase === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass-strong rounded-2xl px-6 py-10 text-center border border-white/10 bg-[#0e1113]/95 shadow-2xl"
            >
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#6D9B82]/25 bg-[#6D9B82]/10 shadow-[0_0_20px_rgba(109,155,130,0.2)]">
                <CheckCircle2 className="h-7 w-7 text-[#6D9B82]" />
              </div>
              <h1 className="mb-2 text-xl font-semibold text-[#E8E8E5]">Password Updated!</h1>
              <p className="text-sm text-[#929694]">
                Your password has been changed successfully. Redirecting you home…
              </p>
              <div className="mt-5 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-[#4AA6A8]" />
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
