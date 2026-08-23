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

                {/* Social Links Bar */}
                <div className="relative z-10 flex items-center gap-1.5 flex-wrap">
                  <a
                    href="https://github.com/srijeetcoder"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-white bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 py-1 rounded-lg transition backdrop-blur-md shadow-sm"
                  >
                    <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span>GitHub</span>
                  </a>

                  <a
                    href="https://www.linkedin.com/in/csrijeet-coding"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-200 bg-[#0A66C2]/20 hover:bg-[#0A66C2]/35 border border-[#0A66C2]/40 px-2.5 py-1 rounded-lg transition backdrop-blur-md shadow-sm"
                  >
                    <svg className="h-3 w-3 fill-current text-[#0A66C2]" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28" />
                    </svg>
                    <span>LinkedIn</span>
                  </a>

                  <a
                    href="https://www.instagram.com/_.srijeet_/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-pink-200 bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 px-2.5 py-1 rounded-lg transition backdrop-blur-md shadow-sm"
                  >
                    <svg className="h-3 w-3 fill-current text-pink-400" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span>Instagram</span>
                  </a>
                </div>
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
                  <div className="p-3.5 sm:p-4 text-left space-y-2">
                    <p className="text-xs sm:text-[13px] leading-relaxed text-slate-100 font-normal selection:bg-[#4AA6A8]/30">
                      Hello, I am <strong>Srijeet Chatterjee</strong>, a 2nd year B.Tech student in Computer Science and Engineering at Techno Main Salt Lake, Kolkata.
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      I built <strong>Notes4BtechCSE (N4BC)</strong> as a student-focused study ecosystem with single sign-on across dedicated portals for programming, chemistry, and mathematics.
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
