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
      title: "New Notice From MAKAUT - Semester 2 Exam Form Fill-up & Routine Published",
      published_at: new Date().toISOString(),
      link: "https://makautexams.net"
    },
    {
      id: 'default-2',
      title: "MAKAUT Direct Decentralized Admission Notice (2024-25)",
      published_at: new Date(Date.now() - 86400000).toISOString(),
      link: "https://makautwb.ac.in"
    },
    {
      id: 'default-3',
      title: "Notification Regarding Caution Money Refund to Passed-Out Students",
      published_at: new Date(Date.now() - 172800000).toISOString(),
      link: "https://makautwb.ac.in"
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
            <div className="glass-strong border border-white/[0.06] rounded-xl p-5 mt-2 bg-[#0D0F10]/95 backdrop-blur-md shadow-2xl relative">
              
              {/* Carousel Panel with PDF inline preview */}
              <div className="flex flex-col lg:flex-row items-stretch justify-between gap-6 min-h-[450px]">
                
                {/* Notice Info Card */}
                <div className="flex-[4] flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium">
                      <Calendar className="h-3.5 w-3.5 text-[#4AA6A8]" />
                      <span>Published on: {new Date(activeCarouselNotice.published_at).toLocaleDateString(undefined, { 
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                      })}</span>
                      <span className="text-white/10">|</span>
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-mono text-[9px]">
                        {currentCarouselIndex + 1} of {displayNotices.length}
                      </span>
                    </div>

                    <motion.h4 
                      key={currentCarouselIndex}
                      initial={{ x: 15, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.25 }}
                      className="text-base font-semibold text-[#E8E8E5] leading-relaxed"
                    >
                      {activeCarouselNotice.title}
                    </motion.h4>
                    
                    {activeCarouselNotice.link && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <a
                          href={activeCarouselNotice.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-bold text-xs text-[#4AA6A8] hover:text-[#5bc1c3] transition underline underline-offset-4"
                        >
                          Open in New Tab
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </motion.div>
                    )}
                  </div>

                  {/* Navigation Controls */}
                  {displayNotices.length > 1 && (
                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={handlePrev}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-slate-400 transition hover:bg-white/5 hover:text-white hover:border-[#4AA6A8]/50"
                        aria-label="Previous notice"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-slate-400 transition hover:bg-white/5 hover:text-white hover:border-[#4AA6A8]/50"
                        aria-label="Next notice"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* PDF Viewer */}
                <div className="flex-[8] min-h-[350px] lg:min-h-[450px] relative rounded-xl border border-white/10 bg-white/[0.01] overflow-hidden flex flex-col justify-center items-center shadow-inner">
                  {/* Glassy Loading Overlay */}
                  {iframeLoading && (
                    <div className="absolute inset-0 bg-[#0D0F10]/85 flex flex-col items-center justify-center gap-3 z-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4AA6A8]"></div>
                      <span className="text-xs text-slate-400 font-medium">Loading Notice Document...</span>
                    </div>
                  )}

                  {/* Mobile PDF Fallback */}
                  <div className="block lg:hidden w-full p-6 text-center z-0">
                    <p className="text-sm text-slate-400 mb-3">Notice PDF previews are best viewed on desktop screens.</p>
                    <a
                      href={activeCarouselNotice.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4AA6A8] text-black font-bold text-xs hover:bg-[#5bc1c3] transition"
                    >
                      Download / Open PDF
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  {/* Desktop Inline PDF Viewer */}
                  {activeCarouselNotice.link && (
                    <iframe
                      src={`${activeCarouselNotice.link}#toolbar=0&navpanes=0&scrollbar=0`}
                      className="hidden lg:block w-full h-full min-h-[450px] border-0 rounded-xl"
                      onLoad={() => setIframeLoading(false)}
                      title={activeCarouselNotice.title}
                    />
                  )}
                </div>
              </div>

              {/* Dots Indicator */}
              {displayNotices.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-4 pt-4 border-t border-white/[0.04]">
                  {displayNotices.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentCarouselIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentCarouselIndex ? 'w-5 bg-[#4AA6A8]' : 'w-1.5 bg-white/20 hover:bg-white/40'
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
