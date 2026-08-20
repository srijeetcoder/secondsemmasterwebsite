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

                {/* Social Actions Buttons */}
                <div className="flex flex-wrap items-center justify-center md:justify-end gap-2">
                  <a
                    href="https://github.com/srijeetcoder"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono text-white shadow-md backdrop-blur-md hover:border-[#4AA6A8]/60 transition"
                  >
                    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span>GitHub</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>

                  <a
                    href="https://www.linkedin.com/in/csrijeet-coding"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0A66C2]/20 hover:bg-[#0A66C2]/35 border border-[#0A66C2]/40 text-xs font-mono text-cyan-200 shadow-md backdrop-blur-md hover:border-[#0A66C2] transition"
                  >
                    <svg className="h-3.5 w-3.5 fill-current text-[#0A66C2]" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28" />
                    </svg>
                    <span>LinkedIn</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>

                  <a
                    href="https://www.instagram.com/_.srijeet_/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-amber-500/15 hover:from-purple-500/25 hover:to-pink-500/25 border border-pink-500/30 text-xs font-mono text-pink-200 shadow-md backdrop-blur-md hover:border-pink-500/60 transition"
                  >
                    <svg className="h-3.5 w-3.5 fill-current text-pink-400" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span>Instagram</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
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
                  <div className="p-5 sm:p-6 text-left space-y-4 max-h-[500px] overflow-y-auto pr-3">
                    <div>
                      <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                        <span>👋 About Me</span>
                      </h3>
                      <p className="text-xs sm:text-sm leading-relaxed text-slate-200">
                        Hello, I am <strong>Srijeet Chatterjee</strong>, a second year B.Tech student in Computer Science and Engineering at Techno Main Salt Lake, Kolkata.
                      </p>
                      <p className="text-xs sm:text-sm leading-relaxed text-slate-200 mt-2">
                        I built <strong>MAKAUT BUSTERS</strong> as a student-focused ecosystem for organizing study materials, university information, notes, practical resources, and academic references for students under MAKAUT.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-500/[0.06] text-xs sm:text-sm text-cyan-200 leading-relaxed font-sans backdrop-blur-sm">
                      🎯 <strong>The Goal:</strong> Make academic resources easier to find, easier to understand, and easier to access for all engineering students.
                    </div>

                    <div className="border-t border-white/10 pt-3">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2">
                        About MAKAUT BUSTERS
                      </h4>
                      <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
                        MAKAUT BUSTERS is a collection of interconnected academic websites designed around different subjects and study requirements. Instead of placing every subject into one large application, each subject has its own focused study portal. The portals share a common authentication and session system, allowing students to move between them without repeatedly signing in.
                      </p>
                    </div>

                    <div className="border-t border-white/10 pt-3">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2">
                        Why I Built This
                      </h4>
                      <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
                        Students often spend more time searching for the right material than studying it. University syllabi, classroom notes, PDFs, practical records, previous questions, and external resources are often scattered across different platforms. MAKAUT BUSTERS brings these resources into a structured environment built specifically around the academic requirements of MAKAUT students.
                      </p>
                    </div>

                    <div className="border-t border-white/10 pt-3">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2">
                        Design &amp; Philosophy
                      </h4>
                      <ul className="text-xs text-slate-300 space-y-1.5 font-sans">
                        <li className="flex items-start gap-2">
                          <span className="text-[#4AA6A8] font-bold">•</span>
                          <span><strong>Less Searching:</strong> Spend less time looking for material and more time studying it.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#4AA6A8] font-bold">•</span>
                          <span><strong>Clear Organization:</strong> Predictable syllabus navigation and topic structures.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#4AA6A8] font-bold">•</span>
                          <span><strong>Practical Technology:</strong> Cross-domain SSO, Realtime active session security, and responsive UI.</span>
                        </li>
                      </ul>
                    </div>

                    <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Study. Practice. Build. Repeat.</span>
                      <span className="text-[#4AA6A8]">@srijeetcoder</span>
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
                          {sub.badge}
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
