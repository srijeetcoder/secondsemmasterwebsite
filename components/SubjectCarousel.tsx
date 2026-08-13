'use client';

import { motion, useAnimation, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight, KeyRound, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Session } from '@supabase/supabase-js';

import { buildHandoffUrl } from '@/lib/handoff';
import type { Subject } from '@/lib/subjects';

type Props = {
  subjects: Subject[];
  session: Session | null;
  /** Called instead of navigating when the user is signed out. */
  onLocked: (subject: Subject) => void;
};

/** Horizontal distance (px) a pointer must travel to count as a swipe. */
const SWIPE_THRESHOLD = 60;
/** Accumulated trackpad deltaX before a wheel gesture triggers navigation. */
const WHEEL_THRESHOLD = 60;
/** Minimum gap between wheel-triggered navigations. */
const WHEEL_COOLDOWN_MS = 750;
const AUTO_ROTATE_MS = 6500;

/**
 * Per-slot 3D placement. Side-card geometry (shift, rotation, depth, scale)
 * lives in CSS custom properties on `.carousel-slot` so a media query can
 * flatten the effect on small screens without any JS resize listeners.
 */
function slotStyle(offset: number, reduced: boolean): React.CSSProperties {
  if (Math.abs(offset) > 1) {
    // Off-stage (the 4th card, directly "behind"): fully faded, parked deep.
    return {
      transform: reduced
        ? 'translate(-50%, -50%) scale(0.9)'
        : 'translate(-50%, -50%) translate3d(0, 0, -260px) scale(0.72)',
      opacity: 0,
      filter: 'brightness(0.5) blur(3px)',
      zIndex: 0,
      pointerEvents: 'none',
    };
  }

  // `pointerEvents: auto` is explicit because the track is pointer-events:
  // none (its flat plane at z=0 would otherwise occlude, in 3D hit-testing,
  // the side cards parked at negative translateZ) and pointer-events inherits.
  if (offset === 0) {
    return {
      transform: 'translate(-50%, -50%) translate3d(0, 0, 0) rotateY(0deg) scale(1)',
      opacity: 1,
      filter: 'brightness(1) blur(0px)',
      zIndex: 30,
      pointerEvents: 'auto',
    };
  }

  const dir = offset < 0 ? -1 : 1;

  if (reduced) {
    // Reduced motion: plain slide + fade, no rotation or depth.
    return {
      transform: `translate(-50%, -50%) translate3d(${dir * 58}%, 0, 0) scale(0.9)`,
      opacity: 0.5,
      filter: 'brightness(0.75) blur(1.2px)',
      zIndex: 10,
      pointerEvents: 'auto',
    };
  }

  return {
    // Left card rotates +θ, right card −θ, so both face the center (coverflow).
    transform: `translate(-50%, -50%) translate3d(calc(${dir} * var(--side-x)), 0, var(--side-z)) rotateY(calc(${-dir} * var(--side-rot))) scale(var(--side-scale))`,
    opacity: 0.55,
    zIndex: 10,
    filter: 'brightness(0.75) blur(1.2px)',
    pointerEvents: 'auto',
  };
}

export function SubjectCarousel({ subjects, session, onLocked }: Props) {
  const count = subjects.length;
  const reduced = useReducedMotion() ?? false;

  const [rawIndex, setRawIndex] = useState(0);
  // Search can shrink the list under us; the modulo keeps the index valid.
  const active = count > 0 ? ((rawIndex % count) + count) % count : 0;

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);

  const pointerStart = useRef<number | null>(null);
  /** True once the current pointer gesture moved enough to be a drag, so the
   *  click that lands after release must not navigate or open a subject. */
  const movedRef = useRef(false);
  const wheelAcc = useRef(0);
  const wheelLockUntil = useRef(0);

  const goTo = useCallback(
    (i: number) => setRawIndex(((i % count) + count) % count),
    [count],
  );
  const prev = useCallback(() => goTo(active - 1), [goTo, active]);
  const next = useCallback(() => goTo(active + 1), [goTo, active]);

  // Auto rotation: one timeout per active card, so any manual navigation
  // (buttons, swipe, dots, keys) naturally restarts the wait.
  useEffect(() => {
    if (count < 2 || hovered || focused || dragging) return;
    const t = setTimeout(() => setRawIndex((v) => ((v + 1) % count + count) % count), AUTO_ROTATE_MS);
    return () => clearTimeout(t);
  }, [active, count, hovered, focused, dragging]);

  // --- Pointer drag / touch swipe --------------------------------------
  function onPointerDown(e: React.PointerEvent) {
    if (count < 2) return;
    pointerStart.current = e.clientX;
    movedRef.current = false;
    setDragging(true);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (pointerStart.current === null) return;
    const dx = e.clientX - pointerStart.current;
    if (Math.abs(dx) > 10) movedRef.current = true;
    setDragX(dx);
  }

  function endDrag() {
    if (pointerStart.current === null) return;
    const dx = dragX;
    pointerStart.current = null;
    setDragging(false);
    setDragX(0);
    if (dx <= -SWIPE_THRESHOLD) next();
    else if (dx >= SWIPE_THRESHOLD) prev();
  }

  // --- Trackpad horizontal swipe ----------------------------------------
  function onWheel(e: React.WheelEvent) {
    if (count < 2) return;
    // Only claim gestures that are clearly horizontal; vertical scroll passes through.
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    const now = Date.now();
    if (now < wheelLockUntil.current) return;

    // Reset accumulated delta if direction changes or if scroll stops/resets
    if (wheelAcc.current !== 0 && Math.sign(e.deltaX) !== Math.sign(wheelAcc.current)) {
      wheelAcc.current = 0;
    }

    wheelAcc.current += e.deltaX;
    if (Math.abs(wheelAcc.current) >= WHEEL_THRESHOLD) {
      wheelLockUntil.current = now + WHEEL_COOLDOWN_MS;
      if (wheelAcc.current > 0) next();
      else prev();
      wheelAcc.current = 0;
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (count < 2) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    }
  }

  // --- Active-card cursor tilt + spotlight -------------------------------
  // Sets the spotlight vars for every card; adds the subtle rotateX/rotateY
  // response (max ±2.5°) only on the centered card.
  function onSlotMouseMove(e: React.MouseEvent<HTMLDivElement>, isActive: boolean) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--mx', `${x}px`);
    el.style.setProperty('--my', `${y}px`);
    if (isActive && !reduced && !dragging) {
      const px = x / rect.width - 0.5;
      const py = y / rect.height - 0.5;
      el.style.transform = `rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`;
    }
  }

  function onSlotMouseLeave(e: React.MouseEvent<HTMLDivElement>) {
    e.currentTarget.style.transform = '';
  }

  if (count === 0) return null;

  const activeSubject = subjects[active];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Your subjects"
      tabIndex={0}
      className="relative rounded-2xl outline-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      onKeyDown={onKeyDown}
    >
      {/* Ambient light behind the active card — one muted radial layer per
          subject, cross-faded by opacity so the colour change animates. */}
      <div aria-hidden className="pointer-events-none absolute -inset-x-10 -inset-y-8">
        {subjects.map((s, i) => (
          <div
            key={s.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              opacity: i === active ? 1 : 0,
              background: `radial-gradient(closest-side at 50% 46%, rgb(${s.accent} / 0.07), transparent 72%)`,
            }}
          />
        ))}
      </div>

      {/* Screen-reader announcement of the centered subject */}
      <p className="sr-only" aria-live="polite">
        {activeSubject.code} {activeSubject.title}, subject {active + 1} of {count}
      </p>

      <div
        className="carousel-stage relative h-[460px] touch-pan-y select-none overflow-x-clip sm:h-[410px]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        onWheel={onWheel}
      >
        <div
          className="carousel-track pointer-events-none relative h-full"
          style={{
            transform: `translateX(${dragging ? dragX * 0.35 : 0}px)`,
            transition: dragging ? 'none' : undefined,
          }}
        >
          {subjects.map((subject, i) => {
            let rel = i - active;
            if (rel > count / 2) rel -= count;
            if (rel < -count / 2) rel += count;

            const isActive = rel === 0;
            const isHidden = Math.abs(rel) > 1;

            return (
              <div
                key={subject.id}
                className="carousel-slot absolute left-1/2 top-1/2 h-full w-[86%] sm:w-[58%]"
                style={slotStyle(rel, reduced)}
                aria-hidden={isHidden || undefined}
              >
                <div
                  className="carousel-tilt h-full"
                  onMouseMove={(e) => onSlotMouseMove(e, isActive)}
                  onMouseLeave={onSlotMouseLeave}
                >
                  <CarouselCard
                    subject={subject}
                    session={session}
                    isActive={isActive}
                    isHidden={isHidden}
                    onLocked={onLocked}
                    onFocusCard={() => goTo(i)}
                    movedRef={movedRef}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prev / next controls - placed outside carousel-stage to prevent overflow-x-clip from hiding them */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous subject"
            className="carousel-nav absolute left-2 md:-left-12 top-[230px] sm:top-[205px] z-40 -translate-y-1/2"
          >
            <ChevronLeft className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next subject"
            className="carousel-nav absolute right-2 md:-right-12 top-[230px] sm:top-[205px] z-40 -translate-y-1/2"
          >
            <ChevronRight className="h-[18px] w-[18px]" />
          </button>
        </>
      )}

      {/* Pagination dots */}
      {count > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2.5">
          {subjects.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to ${s.code} — ${s.title}`}
              aria-current={i === active ? 'true' : undefined}
              className="h-2 rounded-full transition-all duration-300"
              style={
                i === active
                  ? { width: 22, background: `rgb(${s.accent})` }
                  : { width: 8, background: 'rgba(148, 163, 184, 0.30)' }
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------- */

type CardProps = {
  subject: Subject;
  session: Session | null;
  isActive: boolean;
  isHidden: boolean;
  onLocked: (subject: Subject) => void;
  onFocusCard: () => void;
  movedRef: React.MutableRefObject<boolean>;
};

function getHostname(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname;
  } catch {
    return rawUrl;
  }
}

/**
 * One carousel panel. The centered card behaves exactly like the old grid
 * card (session-carrying link when signed in, sign-in prompt when not);
 * side cards are plain buttons that rotate themselves into the center.
 */
function CarouselCard({
  subject,
  session,
  isActive,
  isHidden,
  onLocked,
  onFocusCard,
  movedRef,
}: CardProps) {
  const Icon = subject.icon;
  const isAuthed = Boolean(session);
  const href = buildHandoffUrl(subject.url, session);
  const hostname = useMemo(() => getHostname(subject.url), [subject.url]);

  // Spring bounce when this card becomes the active (centered) card.
  // controls.set() snaps to start state instantly; controls.start() springs
  // to rest — the natural spring overshoot gives the bouncy feel.
  const controls = useAnimation();
  const wasActive = useRef(false);
  useEffect(() => {
    if (isActive && !wasActive.current) {
      // Snap to compressed/offset start state, then spring to rest
      controls.set({ scale: 0.93, y: 12 });
      controls.start({
        scale: 1,
        y: 0,
        transition: {
          type: 'spring',
          stiffness: 280,
          damping: 22,
          mass: 0.8,
        },
      });
    }
    wasActive.current = isActive;
  }, [isActive, controls]);

  const body = (
    <>
      <div className="note-card__spotlight pointer-events-none absolute inset-0" aria-hidden />
      <div className="note-card__rule pointer-events-none absolute inset-x-0 top-0 h-px" aria-hidden />

      <div className="relative flex h-full flex-col p-6 sm:p-9">
        {/* Top: icon + category badge */}
        <div className="flex items-start justify-between gap-4">
          <span className="note-card__icon flex h-12 w-12 items-center justify-center rounded-xl border">
            <Icon className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <span className="note-card__badge inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide">
            {subject.badge}
          </span>
        </div>

        {/* Middle: course code, title, description */}
        <div className="mt-6 sm:mt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {subject.code}
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {subject.title}
          </h3>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-[15px]">
            {subject.description}
          </p>
        </div>

        {/* Bottom: domain · auth state · external-link arrow */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/[0.06] pt-5">
          <span className="truncate text-xs text-slate-500">{hostname}</span>

          <span className="flex shrink-0 items-center gap-3">
            {isAuthed ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-2.5 py-1 text-[11px] font-medium text-emerald-200/90">
                <ShieldCheck className="h-3 w-3" />
                Session will carry over
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-slate-400">
                <KeyRound className="h-3 w-3" />
                Sign in required
              </span>
            )}
            <ArrowUpRight className="note-card__link-icon h-5 w-5" aria-hidden />
          </span>
        </div>
      </div>
    </>
  );

  const className = `note-card group block h-full w-full text-left ${
    isActive ? 'note-card--active' : ''
  }`;
  const style = { '--accent': subject.accent } as React.CSSProperties;
  const tabIndex = isHidden ? -1 : 0;

  // Shared spring wrapper — bounces in when card becomes active, no hover effect
  const wrapper = (children: React.ReactNode) => (
    <motion.div animate={controls} className="h-full w-full">
      {children}
    </motion.div>
  );

  if (!isActive) {
    // Side card: clicking it (without dragging) brings it to the center.
    return wrapper(
      <motion.button
        type="button"
        className={className}
        style={style}
        tabIndex={tabIndex}
        data-subject={subject.id}
        onClick={() => {
          if (movedRef.current) return;
          onFocusCard();
        }}
        aria-label={`Show ${subject.code} — ${subject.title}`}
      >
        {body}
      </motion.button>
    );
  }

  if (isAuthed) {
    // Centered + signed in: a plain link whose href already carries the
    // session, so middle-click and "open in new tab" keep working.
    return wrapper(
      <motion.a
        className={className}
        style={style}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        draggable={false}
        data-subject={subject.id}
        onClick={(e) => {
          if (movedRef.current) {
            e.preventDefault();
            return;
          }
          if (typeof window !== 'undefined' && (window as any).logStudyHistory) {
            (window as any).logStudyHistory(subject.id, subject.title, subject.url);
          }
        }}
      >
        {body}
      </motion.a>
    );
  }

  return wrapper(
    <motion.button
      type="button"
      className={className}
      style={style}
      data-subject={subject.id}
      onClick={() => {
        if (movedRef.current) return;
        onLocked(subject);
      }}
      aria-label={`${subject.code} ${subject.title} — sign in required`}
    >
      {body}
    </motion.button>
  );
}
