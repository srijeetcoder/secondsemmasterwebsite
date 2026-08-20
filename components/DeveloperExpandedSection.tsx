'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExternalLink, 
  Sparkles, 
  GraduationCap, 
  MapPin, 
  FileCode2, 
  BookOpen, 
  Terminal,
  Code2,
  ChevronUp,
  Cpu,
  Layers,
  Globe2,
  Heart
} from 'lucide-react';
import { SUBJECTS } from '@/lib/subjects';

interface DeveloperExpandedSectionProps {
  open: boolean;
  onClose: () => void;
}

export function DeveloperExpandedSection({ open, onClose }: DeveloperExpandedSectionProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.section
          id="about-developer-section"
          initial={{ opacity: 0, height: 0, scale: 0.98 }}
          animate={{ opacity: 1, height: 'auto', scale: 1 }}
          exit={{ opacity: 0, height: 0, scale: 0.98 }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="mt-12 overflow-hidden"
        >
          {/* Main Container Ultra Glassy Frosted Glass */}
          <div className="relative rounded-3xl border border-white/15 bg-white/[0.035] shadow-[0_24px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(74,166,168,0.15),inset_0_1px_0_0_rgba(255,255,255,0.1)] backdrop-blur-2xl p-5 sm:p-8 overflow-hidden">
            
            {/* Background subtle ambient lighting */}
            <div className="pointer-events-none absolute -top-32 -left-32 h-64 w-64 rounded-full bg-[#4AA6A8]/20 blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-purple-500/15 blur-3xl" />
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-cyan-500/10 blur-[100px]" />

            {/* Top Bar with Section Title & Collapse Button */}
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6 relative z-10">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4AA6A8] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4AA6A8]"></span>
                </span>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#4AA6A8]">
                  About the Developer
                </span>
                <span className="text-white/20">|</span>
                <span className="text-xs text-slate-300 font-mono hidden sm:inline">
                  srijeetcoder · Creator &amp; Maintainer
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-300 hover:text-white bg-white/5 hover:bg-white/15 border border-white/15 hover:border-red-500/40 transition cursor-pointer backdrop-blur-md shadow-sm"
                aria-label="Collapse developer section"
              >
                <span>Collapse</span>
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Hero Profile Banner (Frosted Glass) */}
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-white/[0.03] p-5 sm:p-6 mb-6 backdrop-blur-xl shadow-inner">
              {/* Dot pattern */}
              <div 
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: 'radial-gradient(rgba(255,255,255,0.25) 1px, transparent 1px)',
                  backgroundSize: '18px 18px'
                }}
              />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 text-center sm:text-left">
                  
                  {/* Concentric Animated Color-Changing Rings & Profile Avatar */}
                  <div className="relative flex items-center justify-center h-28 w-28 sm:h-32 sm:w-32 shrink-0">
                    {/* Ring 3 (Outer) */}
                    <div className="absolute inset-0 rounded-full border border-dashed animate-dev-ring-3 opacity-85" />
                    {/* Ring 2 (Middle) */}
                    <div className="absolute inset-2.5 rounded-full border-2 animate-dev-ring-2 opacity-95" />
                    {/* Ring 1 (Inner) */}
                    <div className="absolute inset-5 rounded-full border-2 animate-dev-ring-1 opacity-100" />
                    {/* Ambient Glow */}
                    <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-[#4AA6A8]/45 via-purple-500/30 to-pink-500/40 animate-pulse blur-[3px]" />

                    {/* Profile Picture */}
                    <div className="relative h-18 w-18 sm:h-20 sm:w-20 rounded-full overflow-hidden border-2 border-white/80 shadow-2xl bg-black/40 z-10">
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

                  {/* Name & Academic Meta */}
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1">
                      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        Srijeet Chatterjee
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#4AA6A8]/20 border border-[#4AA6A8]/40 text-xs font-mono text-[#4AA6A8] font-semibold">
                        @srijeetcoder
                      </span>
                    </div>

                    <p className="text-sm text-slate-200 font-medium mb-2 flex items-center justify-center sm:justify-start gap-2">
                      <GraduationCap className="h-4 w-4 text-[#4AA6A8]" />
                      <span>2nd Year B.Tech in Computer Science &amp; Engineering</span>
                    </p>

                    <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-mono text-slate-300 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-rose-400" />
                        Techno Main Salt Lake, Kolkata
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        MAKAUT BUSTERS Lead
                      </span>
                    </div>
                  </div>
                </div>

                {/* GitHub Action Button */}
                <div className="flex justify-center md:justify-end">
                  <a
                    href="https://github.com/srijeetcoder"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-medium text-white shadow-lg backdrop-blur-md hover:border-[#4AA6A8]/60 transition duration-300"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span>View GitHub Profile</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                  </a>
                </div>
              </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* Column 1 & 2: README.md / Bio story (Glassy) */}
              <div className="lg:col-span-2 flex flex-col gap-5">
                
                {/* README Markdown Card (Glassy) */}
                <div className="rounded-2xl border border-white/15 bg-white/[0.03] shadow-inner overflow-hidden flex-1 backdrop-blur-xl">
                  
                  {/* Markdown File Header */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/[0.03]">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                      <FileCode2 className="h-4 w-4 text-[#4AA6A8]" />
                      <span className="font-semibold text-white">README.md</span>
                      <span className="text-[11px] text-slate-400">about-developer</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#4AA6A8] bg-[#4AA6A8]/15 border border-[#4AA6A8]/30 px-2 py-0.5 rounded">
                      Markdown Preview
                    </span>
                  </div>

                  {/* Markdown Body */}
                  <div className="p-5 sm:p-6 text-left space-y-4">
                    <p className="text-sm sm:text-base leading-relaxed text-slate-100 font-normal selection:bg-[#4AA6A8]/30">
                      Hello, I am Srijeet Chatterjee a Second year student at Techno Main Salt Lake, Kolkata pursuing B.Tech in Computer Science &amp; Engineering. I made this project to help students enrolled in colleges under MAKAUT to study. Previously I made the individual website....
                    </p>

                    <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] text-xs sm:text-sm text-amber-200 leading-relaxed font-sans backdrop-blur-sm">
                      💡 <strong>Mission:</strong> To streamline study material, university notice tracking, and notes discovery across MAKAUT engineering branches through unified Single Sign-On and responsive portals.
                    </div>
                  </div>
                </div>

                {/* Ecosystem Portals Grid (Glassy) */}
                <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-4 sm:p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                      <Layers className="h-4 w-4 text-[#4AA6A8]" />
                      Study Portals in the Ecosystem
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">4 Child Websites</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SUBJECTS.map((sub) => (
                      <div 
                        key={sub.id} 
                        className="p-3 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-3 hover:border-white/25 transition backdrop-blur-sm"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-[#4AA6A8] bg-white/10 px-1.5 py-0.5 rounded border border-white/10">
                              {sub.code}
                            </span>
                            <span className="text-xs font-medium text-white truncate">
                              {sub.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono truncate block mt-0.5">
                            {sub.url.replace('https://', '')}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10 shrink-0">
                          {sub.semester}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Column 3: Tech Stack & Creator Meta (Glassy) */}
              <div className="flex flex-col gap-5">
                
                {/* Tech Stack */}
                <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-5 backdrop-blur-xl">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-3.5 flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-purple-400" />
                    Technology &amp; Architecture
                  </h3>

                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/15 text-slate-200">Next.js 15</span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/15 text-slate-200">TypeScript</span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/15 text-slate-200">TailwindCSS</span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/15 text-slate-200">Framer Motion</span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/15 text-slate-200">Supabase Auth</span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/15 text-slate-200">PostgreSQL</span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/15 text-slate-200">Vercel Edge</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400 leading-relaxed">
                    Designed for fast cross-domain token handoff with zero cookie leakage and seamless study history synchronization.
                  </div>
                </div>

                {/* Department & College Card */}
                <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-5 flex-1 flex flex-col justify-between backdrop-blur-xl">
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-2 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-amber-400" />
                      Academic Institute
                    </h3>
                    <p className="text-xs text-white font-semibold leading-snug">
                      Techno Main Salt Lake
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Department of Computer Science &amp; Engineering
                    </p>
                    <p className="text-[11px] font-mono text-[#4AA6A8] mt-1">
                      Kolkata, West Bengal
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Year: 2025–26</span>
                    <span className="text-white/80">B.Tech CSE</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Collapse Bar */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Code2 className="h-4 w-4 text-[#4AA6A8]" />
                <span>Made for MAKAUT Students with passion</span>
              </span>

              <button
                type="button"
                onClick={onClose}
                className="text-slate-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
              >
                <span>Back to Top / Close</span>
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
