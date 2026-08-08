'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ExternalLink, Megaphone } from 'lucide-react';
import { useEffect, useState } from 'react';

type Notice = {
  id: string;
  title: string;
  published_at: string;
  link: string;
};

type Props = {
  notices: Notice[];
};

export function NoticeDropdown({ notices }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentCollapsedIndex, setCurrentCollapsedIndex] = useState(0);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

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

  // Rotate through notices in collapsed view
  useEffect(() => {
    if (isOpen || displayNotices.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentCollapsedIndex((prev) => (prev + 1) % displayNotices.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isOpen, displayNotices.length]);

  const activeCollapsedNotice = displayNotices[currentCollapsedIndex];

  const handleNext = () => {
    setCurrentCarouselIndex((prev) => (prev + 1) % displayNotices.length);
  };

  const handlePrev = () => {
    setCurrentCarouselIndex((prev) => (prev - 1 + displayNotices.length) % displayNotices.length);
  };

  const activeCarouselNotice = displayNotices[currentCarouselIndex];

  const [iframeLoading, setIframeLoading] = useState(true);

  // Reset loading spinner whenever active notice link changes
  useEffect(() => {
    setIframeLoading(true);
  }, [activeCarouselNotice.link]);

  return (
    <div className="w-full select-none mb-6">
      {/* Collapsed Top Banner */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="group relative cursor-pointer overflow-hidden rounded-xl border border-amber-500/20 bg-amber-500/[0.03] px-4 py-3 text-xs flex flex-row items-center justify-between gap-3 text-amber-200/90 shadow-sm transition hover:bg-amber-500/[0.06] hover:border-amber-500/30"
      >
        {/* Border Glow Accents */}
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-500 to-amber-600" />
        
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <Megaphone className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] shrink-0">MAKAUT Notice:</span>
          
          <div className="relative h-5 overflow-hidden flex-1">
            <AnimatePresence mode="wait">
              {!isOpen && (
                <motion.div
                  key={currentCollapsedIndex}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="font-medium truncate pr-4 text-slate-200 group-hover:text-amber-100"
                >
                  {activeCollapsedNotice.title}
                </motion.div>
              )}
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-semibold text-amber-400 tracking-wide"
                >
                  Notice Center (Showing {displayNotices.length} Updates)
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] text-amber-500/60 font-mono hidden md:inline">
            {!isOpen && new Date(activeCollapsedNotice.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
          <button 
            className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-400 transition hover:bg-amber-500/25"
            aria-label={isOpen ? "Collapse notices" : "Expand notices"}
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Carousel Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="glass-strong border border-white/[0.06] rounded-2xl p-4 mt-2 bg-[#0D0F10]/95 backdrop-blur-md shadow-2xl relative overflow-hidden group/notice-viewer transition-all duration-300 hover:border-[#4AA6A8]/30 hover:shadow-[0_0_30px_rgba(74,166,168,0.1)]">
              
              {/* Sliding Title Header at the top (Fades in & slides down on hover) */}
              <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-[#0D0F10]/95 via-[#0D0F10]/70 to-transparent px-6 pb-8 pt-5 z-20 transition-all duration-300 opacity-0 -translate-y-2 pointer-events-none group-hover/notice-viewer:opacity-100 group-hover/notice-viewer:translate-y-0 flex flex-col gap-1.5">
                <span className="text-[#4AA6A8] text-[9px] font-mono font-bold tracking-widest uppercase">
                  Published: {new Date(activeCarouselNotice.published_at).toLocaleDateString(undefined, { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                  })} | Notice {currentCarouselIndex + 1} of {displayNotices.length}
                </span>
                <h4 className="text-sm font-semibold text-[#E8E8E5] tracking-wide leading-relaxed truncate max-w-[90%]">
                  {activeCarouselNotice.title}
                </h4>
              </div>

              {/* Floating Side Navigation Controls (Only shown on hover) */}
              {displayNotices.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-6 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#0D0F10]/60 text-slate-300 backdrop-blur-md hover:bg-[#4AA6A8]/20 hover:text-white hover:border-[#4AA6A8]/45 transition opacity-0 group-hover/notice-viewer:opacity-100 duration-300 shadow-lg"
                    aria-label="Previous notice"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-6 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#0D0F10]/60 text-slate-300 backdrop-blur-md hover:bg-[#4AA6A8]/20 hover:text-white hover:border-[#4AA6A8]/45 transition opacity-0 group-hover/notice-viewer:opacity-100 duration-300 shadow-lg"
                    aria-label="Next notice"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* PDF Viewer Container */}
              <div className="relative min-h-[300px] lg:min-h-[550px] w-full rounded-xl overflow-hidden flex flex-col justify-center items-center shadow-inner">
                {/* Glassy Loading Overlay */}
                {iframeLoading && (
                  <div className="absolute inset-0 bg-[#0D0F10]/85 flex flex-col items-center justify-center gap-3 z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4AA6A8]"></div>
                    <span className="text-xs text-slate-400 font-medium animate-pulse">Loading Notice Document...</span>
                  </div>
                )}

                {/* Mobile Fallback View (PDFs can't be rendered inline on mobile) */}
                <div className="block lg:hidden w-full p-8 text-center z-0">
                  <span className="text-[10px] text-amber-500/60 font-mono mb-2 block uppercase tracking-wider">
                    {new Date(activeCarouselNotice.published_at).toLocaleDateString(undefined, { 
                      month: 'short', day: 'numeric', year: 'numeric' 
                    })}
                  </span>
                  <h4 className="text-sm font-semibold text-[#E8E8E5] leading-relaxed mb-5 max-w-md mx-auto">
                    {activeCarouselNotice.title}
                  </h4>
                  <a
                    href={activeCarouselNotice.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#4AA6A8] text-black font-bold text-xs hover:bg-[#5bc1c3] transition shadow-lg"
                  >
                    Download / Open PDF
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                {/* Desktop Embedded PDF Viewer (Zooms on container hover) */}
                {activeCarouselNotice.link && (
                  <div className="hidden lg:block w-full h-[550px] transition-transform duration-500 ease-out group-hover/notice-viewer:scale-[1.018] z-0 border border-white/5 rounded-xl overflow-hidden">
                    <iframe
                      src={`${activeCarouselNotice.link}#toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-full h-full border-0"
                      onLoad={() => setIframeLoading(false)}
                      title={activeCarouselNotice.title}
                    />
                  </div>
                )}
              </div>

              {/* Dots Pagination Indicator (Shown on hover) */}
              {displayNotices.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 opacity-0 group-hover/notice-viewer:opacity-100 transition-opacity duration-300 pointer-events-none">
                  {displayNotices.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentCarouselIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 pointer-events-auto ${
                        idx === currentCarouselIndex ? 'w-5 bg-[#4AA6A8]' : 'w-1.5 bg-white/25 hover:bg-white/50'
                      }`}
                      aria-label={`Go to notice ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
