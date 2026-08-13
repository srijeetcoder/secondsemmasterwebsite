'use client';

import { useReducedMotion, motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ExternalLink, 
  X,
  FileText,
  Calendar,
  Download,
  Eye,
  RefreshCw
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
    transform: `translate(-50%, -50%) translate3d(calc(${dir} * var(--side-x, 60%)), 0, var(--side-z, -140px)) rotateY(calc(${-dir} * var(--side-rot, 14deg))) scale(var(--side-scale, 0.84))`,
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
  const [viewerMode, setViewerMode] = useState<'google' | 'direct'>('google');

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
      title: "Publication of Results of the Even Semester Examinations 2025-26",
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
      setViewerMode('google');
      setExpandedNotice(displayNotices[idx]);
    } else {
      goTo(idx);
    }
  };

  const getViewerUrl = (notice: Notice, mode: 'google' | 'direct') => {
    if (mode === 'google') {
      return `https://docs.google.com/gview?url=${encodeURIComponent(notice.link)}&embedded=true`;
    }
    return `${notice.link}#toolbar=1`;
  };

  return (
    <div className="w-full">
      {/* Collapsed Ticker Bar */}
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ scale: 1.003 }}
        whileTap={{ scale: 0.995 }}
        transition={{ type: 'spring', stiffness: 380, damping: 20 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass-weak border border-amber-500/15 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-amber-500/[0.04] hover:border-amber-500/30 transition-all duration-300 select-none shadow-lg"
      >
        <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0 mr-2">
          <span className="flex h-2.5 w-2.5 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-400 shrink-0 flex items-center gap-1.5">
            MAKAUT Notice Center
          </span>
          <span className="text-white/20 shrink-0">|</span>
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentCollapsedIndex}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs sm:text-sm font-medium text-slate-200 flex items-center gap-2 overflow-hidden flex-1 min-w-0"
            >
              <span className="text-[#4AA6A8] font-mono text-[10px] sm:text-xs font-bold shrink-0 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                {formatDate(activeCollapsedNotice.published_at)}
              </span>
              <span className="truncate flex-1 min-w-0 text-slate-100">{activeCollapsedNotice.title}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:inline text-[11px] font-mono text-slate-400 font-medium">
            {!isOpen && formatShortDate(activeCollapsedNotice.published_at)}
          </span>
          <motion.button 
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18 }}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 transition hover:bg-amber-500/25 border border-amber-500/20"
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
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{
              type: 'spring',
              stiffness: 280,
              damping: 24
            }}
            className="overflow-hidden w-full"
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
              className="w-full glass-strong border border-white/[0.08] rounded-2xl p-4 sm:p-6 mt-3 bg-[#0C0E10]/95 backdrop-blur-md shadow-2xl relative outline-none"
            >
              
              {/* Coverflow Stage */}
              <div
                className="carousel-stage relative h-[320px] sm:h-[350px] touch-pan-y select-none overflow-x-clip w-full mt-1"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerLeave={endDrag}
                onPointerCancel={endDrag}
                onWheel={onWheel}
              >
                <div
                  className="carousel-track pointer-events-none relative h-full w-full"
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
                        key={(notice.id || notice.link) + '-' + i}
                        className="carousel-slot absolute left-1/2 top-1/2 h-full w-[88%] sm:w-[460px] max-w-[92vw]"
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
                    className="absolute left-3 sm:left-5 top-1/2 z-40 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#0D0F10]/80 text-slate-300 hover:text-white hover:border-[#4AA6A8]/60 hover:bg-[#4AA6A8]/10 transition shadow-lg backdrop-blur-sm"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next notice"
                    className="absolute right-3 sm:right-5 top-1/2 z-40 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#0D0F10]/80 text-slate-300 hover:text-white hover:border-[#4AA6A8]/60 hover:bg-[#4AA6A8]/10 transition shadow-lg backdrop-blur-sm"
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
                          ? { width: 22, background: '#4AA6A8' }
                          : { width: 6, background: 'rgba(255, 255, 255, 0.2)' }
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal (Click-to-Expand Full Document Viewer) */}
      <AnimatePresence>
        {expandedNotice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-lg"
            onClick={() => setExpandedNotice(null)}
          >
            {/* Modal Body Container */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="w-full max-w-4xl max-h-[92vh] bg-[#0E1113] border border-white/15 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 relative overflow-hidden backdrop-blur-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Header with Title & Date */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-[#4AA6A8] tracking-widest uppercase bg-[#4AA6A8]/10 border border-[#4AA6A8]/30 px-2 py-0.5 rounded">
                      MAKAUT OFFICIAL NOTICE
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-amber-400" />
                      {new Date(expandedNotice.published_at).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold text-white leading-snug">
                    {expandedNotice.title}
                  </h3>
                </div>
                
                {/* Actions & Viewer Mode Switcher */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 mr-1">
                    <button
                      onClick={() => { setViewerMode('google'); setIframeLoading(true); }}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                        viewerMode === 'google' ? 'bg-[#4AA6A8] text-black font-semibold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Google Viewer
                    </button>
                    <button
                      onClick={() => { setViewerMode('direct'); setIframeLoading(true); }}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                        viewerMode === 'direct' ? 'bg-[#4AA6A8] text-black font-semibold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Direct PDF
                    </button>
                  </div>

                  {expandedNotice.link && (
                    <>
                      <a
                        href={expandedNotice.link}
                        download
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-amber-400 hover:bg-white/10 hover:border-amber-500/40 transition"
                        title="Download PDF document"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <a
                        href={expandedNotice.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-[#4AA6A8] hover:bg-white/10 hover:border-[#4AA6A8]/40 transition"
                        title="Open original notice in new tab"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </>
                  )}
                  <button 
                    onClick={() => setExpandedNotice(null)}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-red-500/40 transition"
                    aria-label="Close details"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* PDF Document Viewer Container */}
              <div className="relative w-full h-[60vh] sm:h-[65vh] rounded-xl border border-white/10 bg-black/40 overflow-hidden flex items-center justify-center">
                {iframeLoading && (
                  <div className="absolute inset-0 bg-[#0E1113]/90 flex flex-col items-center justify-center gap-3 z-20">
                    <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-[#4AA6A8]"></div>
                    <span className="text-xs text-slate-300 font-medium animate-pulse">Rendering Notice PDF...</span>
                  </div>
                )}
                
                {/* Embedded PDF iframe using Google Docs Viewer / Direct Stream */}
                {expandedNotice.link && (
                  <iframe
                    key={viewerMode + '-' + expandedNotice.link}
                    src={getViewerUrl(expandedNotice, viewerMode)}
                    className="w-full h-full border-0 bg-white rounded-xl"
                    onLoad={() => setIframeLoading(false)}
                    title={expandedNotice.title}
                  />
                )}
              </div>

              {/* Bottom Fallback Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 pt-1">
                <span>Not loading cleanly on your browser?</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setViewerMode(viewerMode === 'google' ? 'direct' : 'google')}
                    className="text-[#4AA6A8] hover:underline flex items-center gap-1 font-medium"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Switch to {viewerMode === 'google' ? 'Direct Stream' : 'Google Viewer'}
                  </button>
                  <span className="text-white/20">•</span>
                  <a
                    href={expandedNotice.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open PDF Directly
                  </a>
                </div>
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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isActive && !wasActive.current) {
      controls.set({ scale: 0.95, y: 6 });
      controls.start({
        scale: 1,
        y: 0,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 24,
          mass: 0.8,
        },
      });
    }
    wasActive.current = isActive;
  }, [isActive, controls]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (e) {
      return '';
    }
  };

  return (
    <motion.div animate={controls} className="h-full w-full transform-gpu">
      <div
        className="carousel-tilt h-full cursor-pointer group"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        {/* Sleek Dark Glass Document Card */}
        <div className={`relative h-full w-full rounded-2xl border bg-[#0E1113] shadow-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between ${
          isActive 
            ? 'border-[#4AA6A8]/50 shadow-[0_0_30px_rgba(74,166,168,0.15)]' 
            : 'border-white/10 opacity-60 hover:opacity-85'
        }`}>

          {/* Embedded Document Preview Layer */}
          {notice.link ? (
            <div className="w-full h-full pointer-events-none select-none z-0 overflow-hidden absolute inset-0 bg-[#0E1113]">
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(notice.link)}&embedded=true`}
                className={`w-full h-full border-0 bg-white transition-opacity duration-500 ${loaded ? 'opacity-90' : 'opacity-20'}`}
                title={notice.title}
                loading="lazy"
                onLoad={() => setLoaded(true)}
              />
            </div>
          ) : null}

          {/* Top Header Badge */}
          <div className="flex items-center justify-between gap-2 p-4 z-10 pointer-events-none">
            <div className="flex items-center gap-1.5 bg-[#0D0F10]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4AA6A8] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4AA6A8]"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4AA6A8]">
                MAKAUT NOTICE
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-200 bg-[#0D0F10]/85 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg">
              <Calendar className="h-3 w-3 text-amber-400" />
              <span>{formatDate(notice.published_at)}</span>
            </div>
          </div>

          {/* Title & Action Banner Overlay at Bottom */}
          <div className="bg-gradient-to-t from-[#090B0C] via-[#090B0C]/90 to-transparent p-4 pt-12 z-10 flex flex-col justify-end pointer-events-none">
            <h5 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2 mb-2">
              {notice.title}
            </h5>
            
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-[11px] text-slate-400 font-medium">
                {isActive ? "Click card to expand view" : "Click to select"}
              </span>
              <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                View Notice
              </span>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
