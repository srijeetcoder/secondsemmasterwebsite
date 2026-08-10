'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LogIn, LogOut, ShieldCheck, User as UserIcon, Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { User } from '@supabase/supabase-js';

import { UserAvatar, displayName } from './UserAvatar';

type Props = {
  user: User | null;
  loading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenProfile: () => void;
};

/** Compact auth control for the top bar: avatar dropdown, or a Sign In button. */
export function UserMenu({ user, loading, onSignIn, onSignOut, onOpenProfile }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (loading) {
    return <div className="h-10 w-28 animate-pulse rounded-xl bg-white/[0.06]" />;
  }

  if (!user) {
    return (
      <button
        onClick={onSignIn}
        className="btn-primary flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
      >
        <LogIn className="h-4 w-4" />
        Sign in
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex items-center gap-2.5 border border-white/10 bg-white/[0.05] py-1.5 pl-1.5 pr-3 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.09] ${
          open ? 'rounded-full' : 'rounded-xl'
        }`}
      >
        <UserAvatar user={user} size={30} />
        <span className="hidden max-w-[9rem] truncate text-sm font-medium text-slate-200 sm:block">
          {displayName(user)}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="glass-strong absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-xl p-1.5"
          >
            <div className="flex items-center gap-3 px-2.5 py-2.5">
              <UserAvatar user={user} size={38} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{displayName(user)}</p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              </div>
            </div>

            <div className="mx-2 my-1 flex items-center gap-1.5 rounded-lg border border-[#6D9B82]/20 bg-[#6D9B82]/[0.07] px-2.5 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#6D9B82]" />
              <span className="text-xs font-medium text-[#6D9B82]">Session Active</span>
            </div>

            <button
              onClick={() => {
                setOpen(false);
                onOpenProfile();
              }}
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-[#929694] transition hover:bg-white/5 hover:text-slate-200"
            >
              <UserIcon className="h-4 w-4" />
              View Profile
            </button>

            <button
              onClick={() => {
                setOpen(false);
                router.push('/history');
              }}
              role="menuitem"
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-[#929694] transition hover:bg-white/5 hover:text-slate-200"
            >
              <Clock className="h-4 w-4" />
              Study History Logs
            </button>

            <button
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              role="menuitem"
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-[#929694] transition hover:bg-rose-500/10 hover:text-rose-200"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
