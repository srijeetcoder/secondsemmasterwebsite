'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, KeyRound, ShieldCheck } from 'lucide-react';
import { useCallback } from 'react';

import type { Session } from '@supabase/supabase-js';

import { buildHandoffUrl } from '@/lib/handoff';
import type { Subject } from '@/lib/subjects';

type Props = {
  subject: Subject;
  session: Session | null;
  /** Called instead of navigating when the user is signed out. */
  onLocked: (subject: Subject) => void;
  index: number;
};

export function NoteCard({ subject, session, onLocked, index }: Props) {
  const Icon = subject.icon;
  const isAuthed = Boolean(session);

  // The href already carries the session, so the click is a plain link
  // navigation — no popup blocker issues, and middle-click / "open in new tab"
  // both keep working.
  const href = buildHandoffUrl(subject.url, session);
  const hostname = new URL(subject.url).hostname;

  // Feed cursor position to the CSS spotlight gradient.
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }, []);

  const body = (
    <>
      <div className="note-card__spotlight pointer-events-none absolute inset-0" aria-hidden />
      <div className="note-card__rule pointer-events-none absolute inset-x-0 top-0 h-px" aria-hidden />

      <div className="relative flex h-full flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="note-card__icon flex h-11 w-11 items-center justify-center rounded-xl border">
              <Icon className="h-[22px] w-[22px]" strokeWidth={1.75} />
            </span>
            <span className="note-card__badge inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide">
              {subject.badge}
            </span>
          </div>

          <ArrowUpRight className="note-card__link-icon h-5 w-5 shrink-0" aria-hidden />
        </div>

        <div className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {subject.code}
          </p>
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-white sm:text-xl">
            {subject.title}
          </h3>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{subject.description}</p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <span className="truncate text-xs text-slate-500">{hostname}</span>

          {isAuthed ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-2.5 py-1 text-[11px] font-medium text-emerald-200/90">
              <ShieldCheck className="h-3 w-3" />
              Session will carry over
            </span>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-slate-400">
              <KeyRound className="h-3 w-3" />
              Sign in required
            </span>
          )}
        </div>
      </div>
    </>
  );

  const shared = {
    className: 'note-card group h-full text-left',
    style: { '--accent': subject.accent } as React.CSSProperties,
    onMouseMove: handleMouseMove,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.995 }}
      className="h-full"
      layout
    >
      {isAuthed ? (
        <a {...shared} href={href} target="_blank" rel="noopener noreferrer">
          {body}
        </a>
      ) : (
        <button
          {...shared}
          type="button"
          onClick={() => onLocked(subject)}
          className={`${shared.className} w-full`}
          aria-label={`${subject.code} ${subject.title} — sign in required`}
        >
          {body}
        </button>
      )}
    </motion.div>
  );
}
