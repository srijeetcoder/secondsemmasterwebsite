'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExternalLink, 
  Sparkles, 
  GraduationCap, 
  MapPin, 
  FileCode2, 
  Maximize2,
  ChevronDown
} from 'lucide-react';

interface AboutDeveloperProps {
  onExpand?: () => void;
  isExpanded?: boolean;
}

export function AboutDeveloper({ onExpand, isExpanded = false }: AboutDeveloperProps) {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 250);
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsHovered(false);
    if (onExpand) {
      onExpand();
    }
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Link / Badge */}
      <button
        type="button"
        onClick={handleTriggerClick}
        className="group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono text-slate-300 bg-white/[0.04] hover:bg-white/[0.09] border border-white/15 hover:border-[#4AA6A8]/60 shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 cursor-pointer backdrop-blur-xl"
        aria-label="About srijeetcoder"
        title="Hover to preview · Click to expand full profile"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4AA6A8] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4AA6A8]"></span>
        </span>
        <span className="text-slate-400 group-hover:text-slate-200 transition-colors">
          About
        </span>
        <span className="font-semibold text-white group-hover:text-[#4AA6A8] transition-colors underline decoration-[#4AA6A8]/30 underline-offset-4">
          srijeetcoder
        </span>
        <Maximize2 className="h-3 w-3 text-slate-500 group-hover:text-[#4AA6A8] transition-colors ml-0.5" />
      </button>

      {/* GitHub-Inspired Ultra-Glassy Popover Card (On Hover) */}
      <AnimatePresence>
        {isHovered && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3.5 z-50 w-[460px] sm:w-[540px] max-w-[94vw] pointer-events-auto"
          >
            {/* Main Luminous Frosted Glass Card Container */}
            <div className="relative rounded-3xl border border-white/20 bg-white/[0.04] shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_30px_rgba(74,166,168,0.18),inset_0_1px_0_0_rgba(255,255,255,0.15)] backdrop-blur-2xl overflow-hidden flex flex-col">
              
              {/* Subtle ambient lighting */}
              <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-[#4AA6A8]/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-purple-500/15 blur-3xl" />

              {/* ── 1. GitHub Profile Cover Banner (Glassy) ── */}
              <div className="relative h-24 sm:h-28 w-full bg-white/[0.03] p-3 sm:p-4 flex items-start justify-between border-b border-white/10 overflow-hidden backdrop-blur-md">
                {/* Pattern overlay */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.25) 1px, transparent 1px)',
                    backgroundSize: '16px 16px'
                  }}
                />

                {/* Status chip */}
                <div className="relative z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/15 text-[10px] font-mono text-emerald-400 backdrop-blur-md shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Building MAKAUT Study Ecosystem</span>
                </div>

                {/* GitHub Follow Link */}
                <a
                  href="https://github.com/srijeetcoder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 inline-flex items-center gap-1.5 text-xs font-mono text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 rounded-lg transition backdrop-blur-md shadow-sm"
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>@srijeetcoder</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </div>

              {/* ── 2. Profile Header with Concentric Animated Rings ── */}
              <div className="px-5 pt-0 pb-4 relative">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-3">
                  
                  {/* Concentric Animated Color-Changing Rings & Profile Avatar */}
                  <div className="relative flex items-center justify-center h-24 w-24 sm:h-28 sm:w-28 shrink-0">
                    {/* Ring 3 (Outer) */}
                    <div className="absolute inset-0 rounded-full border border-dashed animate-dev-ring-3 opacity-85" />
                    {/* Ring 2 (Middle) */}
                    <div className="absolute inset-2 rounded-full border-2 animate-dev-ring-2 opacity-95" />
                    {/* Ring 1 (Inner) */}
                    <div className="absolute inset-4 rounded-full border-2 animate-dev-ring-1 opacity-100" />
                    {/* Ambient Glow */}
                    <div className="absolute inset-5 rounded-full bg-gradient-to-tr from-[#4AA6A8]/45 via-purple-500/30 to-pink-500/40 animate-pulse blur-[3px]" />

                    {/* Profile Picture */}
                    <div className="relative h-16 w-16 sm:h-18 sm:w-18 rounded-full overflow-hidden border-2 border-white/80 shadow-2xl bg-black/40 z-10">
                      <img
                        src="https://github.com/srijeetcoder.png"
                        alt="Srijeet Chatterjee"
                        className="h-full w-full object-cover grayscale contrast-110 hover:grayscale-0 transition-all duration-300"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          if (target.parentElement) {
                            target.parentElement.innerHTML = '<div class="h-full w-full flex items-center justify-center bg-gradient-to-tr from-[#4AA6A8] to-purple-600 font-bold text-white text-base">SC</div>';
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Profile Identification */}
                  <div className="flex-1 min-w-0 sm:pb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        Srijeet Chatterjee
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-[#4AA6A8]/20 border border-[#4AA6A8]/40 text-[10px] font-mono text-[#4AA6A8] font-semibold">
                        Author &amp; Lead
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-300 mt-0.5">
                      srijeetcoder · Full-Stack Developer
                    </p>
                  </div>
                </div>

                {/* Profile Meta Details Bar (Glassy) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-200 bg-white/[0.04] border border-white/15 p-2.5 rounded-xl backdrop-blur-md shadow-sm">
                  <div className="flex items-center gap-2 truncate">
                    <GraduationCap className="h-3.5 w-3.5 text-[#4AA6A8] shrink-0" />
                    <span className="truncate">2nd Year B.Tech CSE @ TMSL</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                    <span>Kolkata, West Bengal, India</span>
                  </div>
                </div>

                {/* ── 3. Section: README.md (Glassy Markdown Card) ── */}
                <div className="mt-3.5 rounded-2xl border border-white/15 bg-white/[0.03] shadow-inner overflow-hidden backdrop-blur-md">
                  
                  {/* File Header Bar */}
                  <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/10 bg-white/[0.04]">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                      <FileCode2 className="h-3.5 w-3.5 text-[#4AA6A8]" />
                      <span className="font-semibold text-white">README.md</span>
                      <span className="text-[10px] text-slate-400 font-normal">about-developer</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-300 bg-white/10 px-2 py-0.5 rounded border border-white/15">
                      Markdown
                    </span>
                  </div>

                  {/* README Body Content */}
                  <div className="p-3.5 sm:p-4 text-left">
                    <p className="text-xs sm:text-[13px] leading-relaxed text-slate-100 font-normal tracking-normal selection:bg-[#4AA6A8]/30">
                      Hello, I am Srijeet Chatterjee a Second year student at Techno Main Salt Lake, Kolkata pursuing B.Tech in Computer Science &amp; Engineering. I made this project to help students enrolled in colleges under MAKAUT to study. Previously I made the individual website....
                    </p>
                  </div>
                </div>

                {/* ── 4. Click-to-Expand Prompt Button (Glassy) ── */}
                <button
                  type="button"
                  onClick={handleTriggerClick}
                  className="mt-3.5 w-full py-2.5 px-4 rounded-xl border border-[#4AA6A8]/40 bg-[#4AA6A8]/20 hover:bg-[#4AA6A8]/30 text-[#4AA6A8] hover:text-white transition flex items-center justify-center gap-2 text-xs font-mono font-medium cursor-pointer shadow-md backdrop-blur-md"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Click to Expand Full Developer Page</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Pointer arrow downward towards the button */}
            <div className="flex justify-center -mt-px">
              <div className="h-2.5 w-3.5 bg-white/[0.04] border-b border-r border-white/20 rotate-45 -translate-y-1 backdrop-blur-2xl" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
