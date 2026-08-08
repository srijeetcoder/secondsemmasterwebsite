'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  Sparkles,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { SupabaseClient } from '@supabase/supabase-js';

type Mode = 'signin' | 'signup';

type Props = {
  open: boolean;
  onClose: () => void;
  supabase: SupabaseClient | null;
  /** Shown above the form when the user hit a locked card, e.g. "BSM 201". */
  reason?: string | null;
};

const MODE_COPY: Record<Mode, { title: string; subtitle: string; cta: string }> = {
  signin: {
    title: 'Welcome back',
    subtitle: 'Sign in once — every notes site unlocks.',
    cta: 'Sign in',
  },
  signup: {
    title: 'Create your account',
    subtitle: 'One account covers all four semester subjects.',
    cta: 'Create account',
  },
};

const COLLEGES = [
  "Maulana Abul Kalam Azad University of Technology (MAKAUT)",
  "Heritage Institute of Technology (HIT)",
  "Institute of Engineering and Management (IEM)",
  "Techno Main Salt Lake (TMSL)",
  "Netaji Subhash Engineering College (NSEC)",
  "Jadavpur University (JU)",
  "Calcutta University (CU)",
  "Haldia Institute of Technology (HIT Haldia)",
  "Kalyani Government Engineering College (KGEC)",
  "Jalpaiguri Government Engineering College (JGEC)",
  "Massachusetts Institute of Technology (MIT), USA",
  "Stanford University, USA",
  "Harvard University, USA",
  "California Institute of Technology (Caltech), USA",
  "University of Oxford, UK",
  "University of Cambridge, UK",
  "Imperial College London, UK",
  "ETH Zurich, Switzerland",
  "National University of Singapore (NUS)",
  "Nanyang Technological University (NTU), Singapore",
  "University of Toronto, Canada",
  "Tsinghua University, China",
  "Peking University, China",
  "University of Tokyo, Japan",
  "Indian Institute of Technology Kharagpur (IIT KGP)",
  "Indian Institute of Technology Bombay (IIT B)",
  "Indian Institute of Technology Delhi (IIT D)",
  "Other College / University"
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

function AuthPanel({ onClose, supabase, reason }: Omit<Props, 'open'>) {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [college, setCollege] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState<null | 'email' | 'google'>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);

  // Focus the first field once the entrance animation has settled.
  useEffect(() => {
    const t = setTimeout(() => emailRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, []);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
  }

  const redirectTo =
    typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;

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
    // On success the browser navigates away to Google, so no cleanup needed.
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return setError('Supabase is not configured yet — see the setup guide below.');

    // Email validation: must end with @gmail.com
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
              dob: dob,
              college: college,
              year: year,
              semester: semester,
            },
          },
        });
        if (signUpError) throw signUpError;

        if (data.session) {
          onClose(); // Email confirmation is off — the user is already in.
        } else {
          setNotice(`Confirmation email sent to ${email}. Click the link to finish signing up.`);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  const copy = MODE_COPY[mode];
  const needsPassword = true;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={copy.title}
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className="glass-strong relative z-10 w-full max-w-md overflow-hidden rounded-2xl"
    >
            {/* Accent hairline along the top edge */}
            <div className="absolute inset-x-0 top-0 h-px bg-[#242728]" />

            <button
              onClick={onClose}
              aria-label="Close sign-in dialog"
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="px-6 pb-6 pt-7 sm:px-7">
              <div className="mb-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#4AA6A8]/25 bg-[#4AA6A8]/10">
                  <Sparkles className="h-5 w-5 text-[#4AA6A8]" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-[#E8E8E5]">{copy.title}</h2>
                <p className="mt-1 text-sm text-[#929694]">{copy.subtitle}</p>
              </div>

              {reason && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#A58A55]/20 bg-[#A58A55]/[0.07] px-3.5 py-2.5 text-sm text-[#A58A55]">
                  <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-[#A58A55]" />
                  <span>
                    Sign in to open <span className="font-medium text-[#E8E8E5]">{reason}</span>.
                  </span>
                </div>
              )}

              {/* Google OAuth */}
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

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-[11px] uppercase tracking-widest text-slate-500">
                  or use email
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
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
                      placeholder="you@college.edu"
                      className="search-input w-full rounded-xl py-2.5 pl-10 pr-3 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                {/*
                  Kept mounted and collapsed rather than unmounted, so the field
                  is never a hidden-but-required control mid-animation (browsers
                  refuse to submit those). `disabled` takes it out of constraint
                  validation entirely while in magic-link mode.
                */}
                <motion.div
                  initial={false}
                  animate={{
                    height: needsPassword ? 'auto' : 0,
                    opacity: needsPassword ? 1 : 0,
                  }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                  aria-hidden={!needsPassword}
                >
                  <label
                    htmlFor="auth-password"
                    className="mb-1.5 block text-xs font-medium text-[#929694]"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#626766]" />
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      disabled={!needsPassword}
                      minLength={6}
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="search-input w-full rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      tabIndex={needsPassword ? 0 : -1}
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#626766] transition hover:text-[#929694]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>

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
                              <option key={i + 1} value={`Semester ${i + 1}`}>{`Semester ${i + 1}`}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

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

                <button
                  type="submit"
                  disabled={busy !== null}
                  className="btn-contrast flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy === 'email' && <Loader2 className="h-4 w-4 animate-spin" />}
                  {copy.cta}
                </button>
              </form>

              {/* Mode switching */}
              <div className="mt-5 space-y-2 text-center text-sm">
                {mode === 'signin' && (
                  <p className="text-[#929694]">
                    No account yet?{' '}
                    <button
                      onClick={() => switchMode('signup')}
                      className="font-medium text-[#E8E8E5] underline transition hover:text-[#929694]"
                    >
                      Create one
                    </button>
                  </p>
                )}

                {mode === 'signup' && (
                  <p className="text-[#929694]">
                    Already registered?{' '}
                    <button
                      onClick={() => switchMode('signin')}
                      className="font-medium text-[#E8E8E5] underline transition hover:text-[#929694]"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
      </div>
    </motion.div>
  );
}

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
