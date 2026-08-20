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
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { SupabaseClient } from '@supabase/supabase-js';
import { setDevLogin } from '@/lib/useAuth';

type Mode = 'signin' | 'signup' | 'otp' | 'forgot' | 'forgot-sent';

type Props = {
  open: boolean;
  onClose: () => void;
  supabase: SupabaseClient | null;
  /** Shown above the form when the user hit a locked card, e.g. "BSM 201". */
  reason?: string | null;
};

const COLLEGES = [
  'Maulana Abul Kalam Azad University of Technology (MAKAUT)',
  'Heritage Institute of Technology (HIT)',
  'Institute of Engineering and Management (IEM)',
  'Techno Main Salt Lake (TMSL)',
  'Netaji Subhash Engineering College (NSEC)',
  'Haldia Institute of Technology (HIT Haldia)',
  'Kalyani Government Engineering College (KGEC)',
  'Jalpaiguri Government Engineering College (JGEC)',
  'Government College of Engineering and Leather Technology (GCELT)',
  'Government College of Engineering and Ceramic Technology (GCECT)',
  'RCC Institute of Information Technology (RCCIIT)',
  'Narula Institute of Technology (NIT Agarpara)',
  'MCKV Institute of Engineering (MCKVIE)',
  'Asansol Engineering College (AEC)',
  'Meghnad Saha Institute of Technology (MSIT)',
  'Academy of Technology (AOT)',
  'Techno International New Town (TINT)',
  "St. Thomas' College of Engineering and Technology (STCET)",
  'B.P. Poddar Institute of Management and Technology (BPPIMT)',
  'Other MAKAUT Affiliated College',
];

/**
 * Shell: owns the backdrop, the Escape handler and the exit animation.
 *
 * The form itself lives in <AuthPanel />, which is mounted only while the
 * dialog is open — so every open starts from clean state without an effect
 * reaching in to reset it.
 */
export function AuthModal({ open, onClose, supabase, reason }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#090A0B]/80 backdrop-blur-sm"
          />
          <AuthPanel onClose={onClose} supabase={supabase} reason={reason} />
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  AuthPanel                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

function AuthPanel({ onClose, supabase, reason }: Omit<Props, 'open'>) {
  const [mode, setMode] = useState<Mode>('signin');

  // Shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState<null | 'email' | 'google' | 'otp' | 'resend' | 'forgot'>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Signup-only fields
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [college, setCollege] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCooldown, setResendCooldown] = useState(0);

  const emailRef = useRef<HTMLInputElement>(null);

  // Focus the first field once the entrance animation has settled.
  useEffect(() => {
    const t = setTimeout(() => emailRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, []);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  // Focus first OTP box when entering OTP mode
  useEffect(() => {
    if (mode === 'otp') {
      const t = setTimeout(() => otpRefs.current[0]?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [mode]);

  function resetAll() {
    setEmail('');
    setPassword('');
    setFullName('');
    setDob('');
    setCollege('');
    setYear('');
    setSemester('');
    setOtp(['', '', '', '', '', '']);
    setError(null);
    setNotice(null);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
  }

  const redirectTo =
    typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;

  /* ── Google OAuth ─────────────────────────────────────────────────────── */
  async function handleGoogle() {
    if (!supabase) return setError('Supabase is not configured yet — see the setup guide below.');
    setBusy('google');
    setError(null);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });

    if (oauthError) {
      setError(oauthError.message);
      setBusy(null);
    }
  }

  /* ── Dev one-click login (development only) ───────────────────────────── */
  function handleDevLogin() {
    setDevLogin(true);
    onClose();
  }

  /* ── Sign-in / Sign-up submit ─────────────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return setError('Supabase is not configured yet — see the setup guide below.');

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setError('Only Gmail addresses (@gmail.com) are allowed.');
      return;
    }

    setBusy('email');
    setError(null);
    setNotice(null);

    try {
      if (mode === 'signup') {
        if (!fullName || !dob || !college || !year || !semester) {
          throw new Error('Please fill in all registration fields.');
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTo,
            data: {
              full_name: fullName,
              dob,
              college,
              year,
              semester,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data.session) {
          // Email confirmation disabled — user is already logged in.
          onClose();
        } else {
          // Supabase sent a confirmation email (OTP or magic link).
          setOtp(['', '', '', '', '', '']);
          setResendCooldown(60);
          switchMode('otp');
        }
      } else {
        // mode === 'signin'
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        onClose();
      }
    } catch (err) {
      setError(sanitizeError(err, 'Something went wrong. Please try again.'));
    } finally {
      setBusy(null);
    }
  }

  /* ── OTP verification ─────────────────────────────────────────────────── */
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    const token = otp.join('');
    if (token.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setBusy('otp');
    setError(null);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      });
      if (verifyError) throw verifyError;
      onClose();
    } catch (err) {
      setError(sanitizeError(err, 'Invalid or expired code. Please try again.'));
    } finally {
      setBusy(null);
    }
  }

  async function handleResendOtp() {
    if (!supabase || resendCooldown > 0) return;
    setBusy('resend');
    setError(null);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (resendError) throw resendError;
      setResendCooldown(60);
      setNotice('A new code has been sent to your email.');
    } catch (err) {
      setError(sanitizeError(err, 'Could not resend code.'));
    } finally {
      setBusy(null);
    }
  }

  /* ── Forgot password ──────────────────────────────────────────────────── */
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return setError('Supabase is not configured yet.');

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setError('Only Gmail addresses (@gmail.com) are allowed.');
      return;
    }

    setBusy('forgot');
    setError(null);

    try {
      // redirectTo must point to a URL already whitelisted in Supabase's
      // Redirect URLs list. We use /auth/callback which handles ?type=recovery
      // by forwarding to /auth/reset-password.
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback`
            : undefined,
      });
      if (resetError) throw resetError;
      switchMode('forgot-sent');
    } catch (err) {
      setError(sanitizeError(err, 'Could not send reset email. Please try again later.'));
    } finally {
      setBusy(null);
    }
  }

  /* ── OTP input helpers ────────────────────────────────────────────────── */
  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError(null);
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

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Authentication"
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className="glass-strong relative z-10 w-full max-w-md overflow-hidden rounded-2xl"
    >
      {/* Accent hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-[#242728]" />

      <button
        onClick={onClose}
        aria-label="Close dialog"
        className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="px-6 pb-6 pt-7 sm:px-7">
        <AnimatePresence mode="wait" initial={false}>
          {/* ── SIGN-IN / SIGN-UP ──────────────────────────────────────── */}
          {(mode === 'signin' || mode === 'signup') && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#4AA6A8]/25 bg-[#4AA6A8]/10">
                  <Sparkles className="h-5 w-5 text-[#4AA6A8]" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-[#E8E8E5]">
                  {mode === 'signin' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="mt-1 text-sm text-[#929694]">
                  {mode === 'signin'
                    ? 'Sign in once — every notes site unlocks.'
                    : 'One account covers all four semester subjects.'}
                </p>
              </div>

              {reason && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#A58A55]/20 bg-[#A58A55]/[0.07] px-3.5 py-2.5 text-sm text-[#A58A55]">
                  <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-[#A58A55]" />
                  <span>
                    Sign in to open <span className="font-medium text-[#E8E8E5]">{reason}</span>.
                  </span>
                </div>
              )}

              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={busy !== null}
                className="btn-primary flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy === 'google' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon className="h-4 w-4" />
                )}
                Continue with Google
              </button>

              {/* Dev Login — visible only in development */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  type="button"
                  onClick={handleDevLogin}
                  disabled={busy !== null}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/[0.06] px-4 py-2 text-xs font-medium text-amber-400 transition hover:border-amber-400/60 hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy === 'dev' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">DEV</span>
                  )}
                  Dev Login
                </button>
              )}

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-[11px] uppercase tracking-widest text-slate-500">
                  or use email
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Email */}
                <div>
                  <label htmlFor="auth-email" className="mb-1.5 block text-xs font-medium text-[#929694]">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#626766]" />
                    <input
                      id="auth-email"
                      ref={emailRef}
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@gmail.com"
                      className="search-input w-full rounded-xl py-2.5 pl-10 pr-3 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="auth-password" className="mb-1.5 block text-xs font-medium text-[#929694]">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#626766]" />
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                  {/* Forgot password link — only in sign-in mode */}
                  {mode === 'signin' && (
                    <div className="mt-1.5 text-right">
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="text-xs text-[#929694] underline-offset-2 transition hover:text-[#E8E8E5] hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>

                {/* Signup extra fields */}
                <AnimatePresence>
                  {mode === 'signup' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="space-y-3 overflow-hidden pb-1"
                    >
                      <div>
                        <label htmlFor="auth-fullname" className="mb-1.5 block text-xs font-medium text-[#929694]">
                          Full name
                        </label>
                        <input
                          id="auth-fullname"
                          type="text"
                          required={mode === 'signup'}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your Name"
                          className="search-input w-full rounded-xl py-2.5 px-3 text-sm focus:outline-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="auth-dob" className="mb-1.5 block text-xs font-medium text-[#929694]">
                          Date of Birth
                        </label>
                        <input
                          id="auth-dob"
                          type="date"
                          required={mode === 'signup'}
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="search-input w-full rounded-xl py-2.5 px-3 text-sm focus:outline-none [color-scheme:dark]"
                        />
                      </div>

                      <div>
                        <label htmlFor="auth-college" className="mb-1.5 block text-xs font-medium text-[#929694]">
                          College / University
                        </label>
                        <select
                          id="auth-college"
                          required={mode === 'signup'}
                          value={college}
                          onChange={(e) => setCollege(e.target.value)}
                          className="search-input w-full rounded-xl py-2.5 px-3 text-sm focus:outline-none bg-[#0D0F10] border border-white/10 text-slate-200"
                        >
                          <option value="">Select your college</option>
                          {COLLEGES.map((clg) => (
                            <option key={clg} value={clg}>{clg}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="auth-year" className="mb-1.5 block text-xs font-medium text-[#929694]">
                            Year
                          </label>
                          <select
                            id="auth-year"
                            required={mode === 'signup'}
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="search-input w-full rounded-xl py-2.5 px-3 text-sm focus:outline-none bg-[#0D0F10] border border-white/10 text-slate-200"
                          >
                            <option value="">Select Year</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="auth-semester" className="mb-1.5 block text-xs font-medium text-[#929694]">
                            Semester
                          </label>
                          <select
                            id="auth-semester"
                            required={mode === 'signup'}
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            className="search-input w-full rounded-xl py-2.5 px-3 text-sm focus:outline-none bg-[#0D0F10] border border-white/10 text-slate-200"
                          >
                            <option value="">Select Sem</option>
                            {Array.from({ length: 8 }, (_, i) => (
                              <option key={i + 1} value={`Semester ${i + 1}`}>
                                Semester {i + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <FeedbackBanner error={error} notice={notice} />

                <button
                  type="submit"
                  disabled={busy !== null}
                  className="btn-contrast flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy === 'email' && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === 'signin' ? 'Sign in' : 'Create account'}
                </button>
              </form>

              {/* Mode switcher */}
              <div className="mt-5 space-y-2 text-center text-sm">
                {mode === 'signin' ? (
                  <p className="text-[#929694]">
                    No account yet?{' '}
                    <button
                      onClick={() => { resetAll(); switchMode('signup'); }}
                      className="font-medium text-[#E8E8E5] underline transition hover:text-[#929694]"
                    >
                      Create one
                    </button>
                  </p>
                ) : (
                  <p className="text-[#929694]">
                    Already registered?{' '}
                    <button
                      onClick={() => { resetAll(); switchMode('signin'); }}
                      className="font-medium text-[#E8E8E5] underline transition hover:text-[#929694]"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* ── OTP VERIFICATION ──────────────────────────────────────── */}
          {mode === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#4AA6A8]/25 bg-[#4AA6A8]/10">
                  <Mail className="h-5 w-5 text-[#4AA6A8]" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-[#E8E8E5]">
                  Check your email
                </h2>
                <p className="mt-1 text-sm text-[#929694]">
                  We sent a 6-digit code to{' '}
                  <span className="font-medium text-[#E8E8E5]">{email}</span>. Enter it below to
                  verify your account.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                {/* OTP boxes */}
                <div>
                  <label className="mb-3 block text-xs font-medium text-[#929694]">
                    Verification code
                  </label>
                  <div
                    className="flex gap-2 justify-between"
                    onPaste={handleOtpPaste}
                  >
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        id={`otp-digit-${i}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={`
                          search-input h-12 w-full rounded-xl text-center text-lg font-semibold
                          tracking-widest focus:outline-none transition-all duration-150
                          ${digit ? 'border-[#4AA6A8]/60 text-[#4AA6A8]' : 'text-[#E8E8E5]'}
                        `}
                        aria-label={`Digit ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <FeedbackBanner error={error} notice={notice} />

                <button
                  type="submit"
                  disabled={busy === 'otp' || otp.join('').length < 6}
                  className="btn-contrast flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy === 'otp' && <Loader2 className="h-4 w-4 animate-spin" />}
                  Verify account
                </button>
              </form>

              {/* Resend + back */}
              <div className="mt-5 flex items-center justify-between text-sm">
                <button
                  onClick={() => { resetAll(); switchMode('signup'); }}
                  className="flex items-center gap-1.5 text-[#929694] transition hover:text-[#E8E8E5]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>

                <button
                  onClick={handleResendOtp}
                  disabled={busy === 'resend' || resendCooldown > 0}
                  className="flex items-center gap-1.5 text-[#929694] transition hover:text-[#E8E8E5] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy === 'resend' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── FORGOT PASSWORD ────────────────────────────────────────── */}
          {mode === 'forgot' && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#A58A55]/25 bg-[#A58A55]/10">
                  <KeyRound className="h-5 w-5 text-[#A58A55]" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-[#E8E8E5]">
                  Reset your password
                </h2>
                <p className="mt-1 text-sm text-[#929694]">
                  Enter your Gmail address and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="mb-1.5 block text-xs font-medium text-[#929694]">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#626766]" />
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      autoFocus
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@gmail.com"
                      className="search-input w-full rounded-xl py-2.5 pl-10 pr-3 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <FeedbackBanner error={error} notice={notice} />

                <button
                  type="submit"
                  disabled={busy === 'forgot'}
                  className="btn-contrast flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy === 'forgot' && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send reset link
                </button>
              </form>

              <div className="mt-5 text-center text-sm">
                <button
                  onClick={() => switchMode('signin')}
                  className="flex items-center gap-1.5 text-[#929694] transition hover:text-[#E8E8E5] mx-auto"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to sign in
                </button>
              </div>
            </motion.div>
          )}

          {/* ── FORGOT PASSWORD — SENT ─────────────────────────────────── */}
          {mode === 'forgot-sent' && (
            <motion.div
              key="forgot-sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="py-4 text-center"
            >
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#6D9B82]/25 bg-[#6D9B82]/10">
                <CheckCircle2 className="h-7 w-7 text-[#6D9B82]" />
              </div>
              <h2 className="mb-2 text-xl font-semibold tracking-tight text-[#E8E8E5]">
                Reset link sent!
              </h2>
              <p className="text-sm text-[#929694] mb-1">
                We sent a password reset link to
              </p>
              <p className="text-sm font-medium text-[#E8E8E5] mb-5">{email}</p>
              <p className="text-xs text-[#626766] mb-6">
                Click the link in the email to set a new password. The link expires in 1 hour. Check your spam folder if you don&apos;t see it.
              </p>
              <button
                onClick={() => switchMode('signin')}
                className="flex items-center gap-1.5 text-sm text-[#929694] transition hover:text-[#E8E8E5] mx-auto"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Error message sanitizer                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Supabase sometimes surfaces raw HTTP status codes (e.g. "0", "422") as the
 * error message. This helper converts those meaningless strings into the
 * provided human-readable fallback.
 */
function sanitizeError(err: unknown, fallback: string): string {
  const raw =
    err instanceof Error
      ? err.message
      : typeof (err as { message?: unknown })?.message === 'string'
        ? String((err as { message: string }).message)
        : '';

  // Treat empty strings or pure-numeric strings as meaningless
  if (!raw || /^\d+$/.test(raw.trim())) return fallback;
  return raw;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Shared banner                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

function FeedbackBanner({ error, notice }: { error: string | null; notice: string | null }) {
  return (
    <>
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-400/25 bg-rose-500/[0.08] px-3.5 py-2.5 text-sm text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="flex items-start gap-2 rounded-xl border border-[#6D9B82]/25 bg-[#6D9B82]/[0.08] px-3.5 py-2.5 text-sm text-[#6D9B82]">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Google icon                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51Z"
      />
    </svg>
  );
}
