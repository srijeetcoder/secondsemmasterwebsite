'use client';

import { useReducedMotion, motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown, 
  ExternalLink, 
  X,
  FileText
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Notice {
  id?: string;
  title: string;
  link: string;
  published_at: string;
}

const SWIPE_THRESHOLD = 50;
const WHEEL_THRESHOLD = 50;
const WHEEL_COOLDOWN_MS = 750;
const AUTO_ROTATE_MS = 6000;

function slotStyle(offset: number, reduced: boolean): React.CSSProperties {
  if (Math.abs(offset) > 1) {
    return {
      transform: reduced
        ? 'translate(-50%, -50%) scale(0.9)'
        : 'translate(-50%, -50%) translate3d(0, 0, -240px) scale(0.75)',
      opacity: 0,
      filter: 'brightness(0.4) blur(3px)',
      zIndex: 0,
      pointerEvents: 'none',
    };
  }

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
    return {
      transform: `translate(-50%, -50%) translate3d(${dir * 54}%, 0, 0) scale(0.9)`,
      opacity: 0.5,
      filter: 'brightness(0.7) blur(1.2px)',
      zIndex: 10,
      pointerEvents: 'auto',
    };
  }

  return {
    transform: `translate(-50%, -50%) translate3d(calc(${dir} * var(--side-x)), 0, var(--side-z)) rotateY(calc(${-dir} * var(--side-rot))) scale(var(--side-scale))`,
    opacity: 0.6,
    zIndex: 10,
    filter: 'brightness(0.75) blur(1px)',
    pointerEvents: 'auto',
  };
}

export function NoticeDropdown({ notices }: { notices: Notice[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentCollapsedIndex, setCurrentCollapsedIndex] = useState(0);
  const [rawIndex, setRawIndex] = useState(0);
  const [expandedNotice, setExpandedNotice] = useState<Notice | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (e) {
      return '';
    }
  };

  const formatShortDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[d.getMonth()];
      const day = d.getDate();
      return `${month} ${day}`;
    } catch (e) {
      return '';
    }
  };

  // Fallback default notices if none exist in the database yet
  const displayNotices = notices.length > 0 ? notices : [
    {
      id: 'default-1',
      title: "Academic Council Election Notice",
      published_at: new Date().toISOString(),
      link: "https://makautwb.ac.in/datas/users/0-noti_aca_cncil_elect26.pdf"
    },
    {
      id: 'default-2',
      title: "Notice for B.Tech Decentralized Admission In-House (2024-25)",
      published_at: new Date(Date.now() - 86400000).toISOString(),
      link: "https://makautwb.ac.in/datas/users/0-direc_adm_centra_inhouse24.pdf"
    },
    {
      id: 'default-3',
      title: "Notification Regarding Refund of Caution Money to Students",
      published_at: new Date(Date.now() - 172800000).toISOString(),
      link: "https://makautwb.ac.in/datas/users/0-affiliacollege_refund_caution_money24.pdf"
    }
  ];

  const count = displayNotices.length;
  const active = count > 0 ? ((rawIndex % count) + count) % count : 0;
  const activeCollapsedNotice = displayNotices[currentCollapsedIndex] || displayNotices[0];
  const activeCarouselNotice = displayNotices[active];

  // Rotate through notices in collapsed view
  useEffect(() => {
    if (isOpen || count < 2) return;
    const interval = setInterval(() => {
      setCurrentCollapsedIndex((prev) => (prev + 1) % count);
    }, 4500);
    return () => clearInterval(interval);
  }, [isOpen, count]);

  // Synchronize index when expanding
  useEffect(() => {
    if (isOpen) {
      setRawIndex(currentCollapsedIndex);
    } else {
      setCurrentCollapsedIndex(active);
    }
  }, [isOpen]);

  // Coverflow Carousel Math & Swiping States
  const reduced = useReducedMotion() ?? false;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);

  const pointerStart = useRef<number | null>(null);
  const movedRef = useRef(false);
  const wheelAcc = useRef(0);
  const wheelLockUntil = useRef(0);

  const goTo = useCallback(
    (i: number) => setRawIndex(((i % count) + count) % count),
    [count],
  );
  const prev = useCallback(() => goTo(active - 1), [goTo, active]);
  const next = useCallback(() => goTo(active + 1), [goTo, active]);

  // Auto rotation inside the carousel when expanded
  useEffect(() => {
    if (count < 2 || !isOpen || hovered || focused || dragging || expandedNotice) return;
    const t = setTimeout(() => setRawIndex((v) => ((v + 1) % count + count) % count), AUTO_ROTATE_MS);
    return () => {
      clearTimeout(t);
    };
  }, [active, count, hovered, focused, dragging, isOpen, expandedNotice]);

  // Handle pointer swiping
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

  // Release swipe
  function endDrag() {
    if (pointerStart.current === null) return;
    const dx = dragX;
    pointerStart.current = null;
    setDragging(false);
    setDragX(0);
    if (dx <= -SWIPE_THRESHOLD) next();
    else if (dx >= SWIPE_THRESHOLD) prev();
  }

  // Handle wheel scrolling (horizontal gestures)
  function onWheel(e: React.WheelEvent) {
    if (count < 2) return;
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    const now = Date.now();
    if (now < wheelLockUntil.current) return;

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

  // Handle arrow key navigation
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

  // 3D Card Hover-Tilt Effect
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
      el.style.transform = `rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg)`;
    }
  }

  function onSlotMouseLeave(e: React.MouseEvent<HTMLDivElement>) {
    e.currentTarget.style.transform = '';
  }

  // Card click triggers selection or opens dynamic lightbox
  const handleCardClick = (idx: number) => {
    if (movedRef.current) return; // Prevent clicking during a drag gesture
    if (idx === active) {
      setIframeLoading(true);
      setExpandedNotice(displayNotices[idx]);
    } else {
      goTo(idx);
    }
  };

  return (
    <div className="w-full">
      {/* Collapsed Ticker Bar */}
      <motion.div
        initial={{ y: -24, opacity: 0, scale: 0.92 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.008 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 380, damping: 14, mass: 0.8 }}
        onClick={() => setIsOpen(!isOpen)}
        className="glass-weak border border-amber-500/10 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-amber-500/[0.03] hover:border-amber-500/20 transition-colors duration-300 select-none"
      >
        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-500/90 whitespace-nowrap">
            MAKAUT Notice Center
          </span>
          <span className="text-white/20">|</span>
          
          <AnimatePresence mode="wait">
            <motion.span 
              key={currentCollapsedIndex}
              initial={{ y: 14, opacity: 0, scale: 0.88 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -14, opacity: 0, scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 480, damping: 18, mass: 0.6 }}
              className="text-xs sm:text-sm font-medium text-slate-300 pr-4 flex items-center gap-1.5 overflow-hidden"
            >
              <span className="text-[#4AA6A8] font-mono text-[10px] sm:text-xs font-bold shrink-0 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                {formatDate(activeCollapsedNotice.published_at)}
              </span>
              <span className="truncate">{activeCollapsedNotice.title}</span>
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-[10px] font-mono text-slate-500">
            {!isOpen && formatShortDate(activeCollapsedNotice.published_at)}
          </span>
          <motion.button 
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 14, mass: 0.8 }}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-400 transition hover:bg-amber-500/25"
            aria-label={isOpen ? "Collapse notices" : "Expand notices"}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Expanded Coverflow Carousel Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -12, scale: 0.97 }}
            animate={{ height: 'auto', opacity: 1, y: 0, scale: 1 }}
            exit={{ height: 0, opacity: 0, y: -12, scale: 0.97 }}
            transition={{
              type: 'spring',
              stiffness: 280,
              damping: 22,
              mass: 0.8
            }}
            className="overflow-hidden"
          >
            <div 
              role="region"
              aria-label="Notices coverflow"
              tabIndex={0}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              onFocusCapture={() => setFocused(true)}
              onBlurCapture={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
              }}
              onKeyDown={onKeyDown}
              className="glass-strong border border-white/[0.06] rounded-2xl p-4 mt-3 bg-[#0D0F10]/95 backdrop-blur-md shadow-2xl relative outline-none"
            >
              
              {/* Coverflow Stage */}
              <div
                className="carousel-stage relative h-[380px] touch-pan-y select-none overflow-x-clip sm:h-[340px] mt-2"
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
                  {displayNotices.map((notice, i) => {
                    let rel = i - active;
                    if (rel > count / 2) rel -= count;
                    if (rel < -count / 2) rel += count;

                    const isActive = rel === 0;
                    const isHidden = Math.abs(rel) > 1;

                    return (
                      <div
                        key={notice.link + '-' + i}
                        className="carousel-slot absolute left-1/2 top-1/2 h-full w-[86%] sm:w-[50%]"
                        style={slotStyle(rel, reduced)}
                        aria-hidden={isHidden || undefined}
                      >
                        <NoticeCarouselCard
                          notice={notice}
                          isActive={isActive}
                          isHidden={isHidden}
                          onClick={() => handleCardClick(i)}
                          onMouseMove={(e) => onSlotMouseMove(e, isActive)}
                          onMouseLeave={onSlotMouseLeave}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Prev / Next Chevrons outside track */}
              {count > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Previous notice"
                    className="absolute left-4 top-1/2 z-40 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#0D0F10]/60 text-slate-400 hover:text-white hover:border-[#4AA6A8]/40 hover:bg-white/5 transition"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next notice"
                    className="absolute right-4 top-1/2 z-40 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#0D0F10]/60 text-slate-400 hover:text-white hover:border-[#4AA6A8]/40 hover:bg-white/5 transition"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Pagination indicators */}
              {count > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  {displayNotices.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Go to notice ${i + 1}`}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={
                        i === active
                          ? { width: 18, background: '#4AA6A8' }
                          : { width: 6, background: 'rgba(255, 255, 255, 0.15)' }
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal (Click-to-Expand Zoom View) */}
      <AnimatePresence>
        {expandedNotice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 bg-black/30 backdrop-blur-md"
            onClick={() => setExpandedNotice(null)}
          >
            {/* Modal Body Container: Compact sizing & Glassy background */}
            <motion.div
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="w-full max-w-3xl bg-[#0D0F10]/40 border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()} // Stop propagation to prevent closing
            >
              
              {/* Transparent Surrounding Grid Header with Heading at the top */}
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono font-bold text-[#4AA6A8] tracking-widest uppercase">
                    PUBLISHED ON {new Date(expandedNotice.published_at).toLocaleDateString(undefined, {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-1 leading-relaxed">
                    {expandedNotice.title}
                  </h3>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {expandedNotice.link && (
                    <a
                      href={expandedNotice.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-[#4AA6A8] hover:bg-white/10 hover:border-[#4AA6A8]/40 transition"
                      title="Open notice in a new tab"
                    >
                      <ExternalLink className="h-4.5 w-4.5" />
                    </a>
                  )}
                  <button 
                    onClick={() => setExpandedNotice(null)}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-red-500/40 transition"
                    aria-label="Close details"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Large Zoomed PDF Viewer with Transparent Surrounding */}
              <div className="relative w-full h-[50vh] sm:h-[55vh] rounded-xl border border-white/10 bg-black/25 overflow-hidden flex items-center justify-center">
                {iframeLoading && (
                  <div className="absolute inset-0 bg-[#0D0F10]/80 flex flex-col items-center justify-center gap-3 z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4AA6A8]"></div>
                    <span className="text-xs text-slate-400 font-medium animate-pulse">Loading Notice Document...</span>
                  </div>
                )}
                
                {/* Embedded PDF iframe */}
                {expandedNotice.link && (
                  <iframe
                    src={`${expandedNotice.link}#toolbar=0&navpanes=0`}
                    className="w-full h-full border-0 bg-transparent rounded-xl"
                    onLoad={() => setIframeLoading(false)}
                    title={expandedNotice.title}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface NoticeCarouselCardProps {
  notice: Notice;
  isActive: boolean;
  isHidden: boolean;
  onClick: () => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => void;
}

function NoticeCarouselCard({
  notice,
  isActive,
  isHidden,
  onClick,
  onMouseMove,
  onMouseLeave,
}: NoticeCarouselCardProps) {
  const controls = useAnimation();
  const wasActive = useRef(false);

  useEffect(() => {
    if (isActive && !wasActive.current) {
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

  return (
    <motion.div animate={controls} className="h-full w-full">
      <div
        className="carousel-tilt h-full cursor-pointer"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        {/* Mini Glassy PDF Card */}
        <div className={`relative h-full w-full rounded-2xl border bg-white/[0.01] shadow-xl overflow-hidden transition-all duration-300 flex flex-col justify-center items-center ${
          isActive 
            ? 'border-white/20 hover:border-[#4AA6A8]/40 shadow-[0_0_25px_rgba(74,166,168,0.06)]' 
            : 'border-white/5 opacity-40 hover:opacity-60'
        }`}>
          {/* PDF Preview Frame (Pointer events disabled in slider to allow dragging) */}
          {notice.link ? (
            <div className="w-full h-full pointer-events-none select-none z-0 rounded-2xl overflow-hidden">
              <iframe
                src={`${notice.link}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full border-0 scale-[1.01]"
                title={notice.title}
                loading="lazy"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 p-6 text-slate-500">
              <FileText className="h-10 w-10 text-white/25" />
              <span className="text-xs">No PDF link available</span>
            </div>
          )}

          {/* Active Card Click-to-Expand Indicator Overlay */}
          {isActive && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-5 opacity-0 hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
              <span className="text-[10px] font-bold text-[#4AA6A8] tracking-widest uppercase mb-0.5">
                Click to Open Notice
              </span>
              <h5 className="text-xs font-semibold text-white truncate max-w-full">
                {notice.title}
              </h5>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

