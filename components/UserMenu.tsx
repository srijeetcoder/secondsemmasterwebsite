'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { LogIn, LogOut, ShieldCheck, User as UserIcon, Clock } from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import type { User } from '@supabase/supabase-js';

import { UserAvatar, displayName } from './UserAvatar';

type Props = {
  user: User | null;
  loading: boolean;
  isScrolled?: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenProfile: () => void;
};

/** Compact auth control for the top bar: hover-to-expand avatar + absolute dropdown. */
export function UserMenu({ user, loading, isScrolled = false, onSignIn, onSignOut, onOpenProfile }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  // Close on outside click or Escape
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

  // Clean up timer on unmount
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  if (loading) {
    return <div className="h-10 w-10 animate-pulse rounded-full bg-white/[0.06] shrink-0" />;
  }

  if (!user) {
    return (
      <button
        onClick={onSignIn}
        className="btn-primary flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shrink-0 whitespace-nowrap"
      >
        <LogIn className="h-4 w-4 shrink-0" />
        <span className="hidden xs:inline">Sign in</span>
        <span className="xs:hidden">In</span>
      </button>
    );
  }

  // When scrolled the navbar is anchored left → dropdown must open rightward (left-0).
  // When at top the profile icon is on the far right → dropdown opens leftward (right-0).
  const dropdownAlign = isScrolled ? 'left-0' : 'right-0';

  return (
    <div
      ref={ref}
      className="relative shrink-0"
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
    >
      {/* ── Trigger button — always fixed 40×40, never affects navbar height ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 touch-manipulation ${
          open
            ? 'border-[#4AA6A8]/40 bg-white/[0.08] shadow-[0_0_0_3px_rgba(74,166,168,0.12)]'
            : 'border-white/10 bg-white/[0.05] hover:bg-white/[0.08] hover:border-[#4AA6A8]/30'
        }`}
        aria-label="Open user menu"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <UserAvatar user={user} size={30} />
      </button>

      {/* ── Dropdown panel — absolute, never in layout flow ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            style={{ transformOrigin: isScrolled ? 'top left' : 'top right' }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className={`absolute ${dropdownAlign} top-[calc(100%+10px)] z-[200] w-72 max-w-[calc(100vw-2rem)] rounded-[20px] border border-white/10 bg-[#09090b]/98 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl`}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-3">
              <UserAvatar user={user} size={38} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white leading-tight">{displayName(user)}</p>
                <p className="truncate text-[10px] text-neutral-400 mt-0.5 leading-none">{user.email}</p>
              </div>
            </div>

            {/* Session badge */}
            <div className="flex items-center gap-1.5 rounded-lg border border-[#6D9B82]/20 bg-[#6D9B82]/[0.07] px-2.5 py-1.5 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6D9B82] animate-pulse shrink-0" />
              <span className="text-[9px] font-mono font-bold tracking-wider text-[#6D9B82] uppercase">Study Session Active</span>
            </div>

            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => { onOpenProfile(); setOpen(false); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-neutral-400 hover:bg-white/5 hover:text-white transition group touch-manipulation"
              >
                <UserIcon className="h-3.5 w-3.5 shrink-0 text-neutral-500 group-hover:text-[#4AA6A8] transition" />
                <span>View Profile</span>
              </button>

              <button
                onClick={() => { onOpenProfile(); setOpen(false); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-neutral-400 hover:bg-white/5 hover:text-white transition group touch-manipulation"
              >
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-neutral-500 group-hover:text-[#4AA6A8] transition" />
                <span>Account Settings</span>
              </button>

              <button
                onClick={() => { router.push('/history'); setOpen(false); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-neutral-400 hover:bg-white/5 hover:text-white transition group touch-manipulation"
              >
                <Clock className="h-3.5 w-3.5 shrink-0 text-neutral-500 group-hover:text-[#4AA6A8] transition" />
                <span>Study History Logs</span>
              </button>

              <button
                onClick={() => { onSignOut(); setOpen(false); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-neutral-400 hover:bg-rose-500/10 hover:text-rose-200 transition group mt-1.5 border-t border-white/[0.05] pt-3 touch-manipulation"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0 text-neutral-500 group-hover:text-rose-400 transition" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
