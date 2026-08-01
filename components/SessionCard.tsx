'use client';

import { motion } from 'framer-motion';
import { LockKeyhole, LogOut, ShieldCheck, Sparkles } from 'lucide-react';

import type { Session } from '@supabase/supabase-js';

import { UserAvatar, displayName } from './UserAvatar';

type Props = {
  session: Session | null;
  loading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
};

/**
 * The wide "session status" strip under the hero.
 * Logged out  -> "Sign In to Access Notes" CTA.
 * Logged in   -> avatar, email, Session Active badge, token expiry, Sign out.
 */
export function SessionCard({ session, loading, onSignIn, onSignOut }: Props) {
  if (loading) {
    return <div className="h-[86px] w-full animate-pulse rounded-2xl bg-white/[0.04]" />;
  }

  const user = session?.user;

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass flex flex-col gap-4 rounded-2xl px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      >
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#242728] bg-[#0D0F10]">
            <LockKeyhole className="h-[18px] w-[18px] text-[#929694]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#E8E8E5]">You are browsing as a guest</p>
            <p className="mt-0.5 text-sm text-[#929694]">
              Sign in once here and all four notes sites open already authenticated.
            </p>
          </div>
        </div>

        <button
          onClick={onSignIn}
          className="btn-contrast flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
        >
          <Sparkles className="h-4 w-4" />
          Sign In to Access Notes
        </button>
      </motion.div>
    );
  }

  const expiresAt = session?.expires_at ? new Date(session.expires_at * 1000) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass flex flex-col gap-4 rounded-2xl px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="relative shrink-0">
          <UserAvatar user={user} size={44} />
          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#090A0B] bg-[#6D9B82] animate-pulse-ring" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-[#E8E8E5]">{displayName(user)}</p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#6D9B82]/25 bg-[#6D9B82]/[0.09] px-2.5 py-0.5 text-[11px] font-medium text-[#6D9B82]">
              <ShieldCheck className="h-3 w-3" />
              Session Active
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-[#929694]">{user.email}</p>
          {expiresAt && (
            <p className="mt-0.5 text-[11px] text-[#626766]">
              Token valid until{' '}
              {expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · auto-refreshes
            </p>
          )}
        </div>
      </div>

      <button
        onClick={onSignOut}
        className="btn-primary flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium hover:!text-rose-400 hover:!border-rose-500/20 hover:!bg-rose-950/20"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </motion.div>
  );
}
