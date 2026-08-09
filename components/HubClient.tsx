'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { 
  AlertTriangle, 
  GraduationCap, 
  Search, 
  SearchX, 
  X, 
  BookOpen, 
  FileText, 
  ExternalLink,
  BookOpenCheck,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  FlaskConical,
  LogOut,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { AuthModal } from '@/components/AuthModal';
import { BackgroundMesh } from '@/components/BackgroundMesh';
import { ProfileModal } from '@/components/ProfileModal';
import { SubjectCarousel } from '@/components/SubjectCarousel';
import { UserMenu } from '@/components/UserMenu';
import { NoticeDropdown } from '@/components/NoticeDropdown';
import { SUBJECTS, filterSubjects, type Subject } from '@/lib/subjects';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { useAuth } from '@/lib/useAuth';
import { buildHandoffUrl } from '@/lib/handoff';
import { SEARCH_INDEX } from '@/lib/searchIndex';

export function HubClient({ authError }: { authError: string | null }) {
  const { supabase, session, user, loading } = useAuth();

  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [lockedSubject, setLockedSubject] = useState<Subject | null>(null);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const results = useMemo(() => filterSubjects(SUBJECTS, query), [query]);

  // Autocomplete search suggestions redirecting to the exact URL
  const recommendations = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const list: { type: 'subject' | 'notice' | 'topic'; label: string; sublabel?: string; url: string; snippet?: string }[] = [];

    // 1. Match subjects
    for (const sub of SUBJECTS) {
      if (sub.title.toLowerCase().includes(q) || sub.code.toLowerCase().includes(q)) {
        list.push({
          type: 'subject',
          label: `${sub.code} — ${sub.title}`,
          sublabel: 'Subject Portal',
          url: buildHandoffUrl(sub.url, session)
        });
      }
    }

    // 2. Match notices
    for (const notice of notices) {
      if (notice.title.toLowerCase().includes(q)) {
        list.push({
          type: 'notice',
          label: notice.title,
          sublabel: 'Notice Board',
          url: notice.url || 'https://www.makautexam.net/'
        });
      }
    }

    // 3. Match topics (exact results redirecting to exact URLs)
    for (const item of SEARCH_INDEX) {
      const matchesKeyword = item.keywords.some(k => k.includes(q)) || item.title.toLowerCase().includes(q);
      if (matchesKeyword) {
        let displayCategory = 'Lecture';
        if (item.category === 'practical') displayCategory = 'Practical';
        else if (item.category === 'solved-problem') displayCategory = 'Solved Problem';
        else if (item.category === 'viva') displayCategory = 'Viva Prep';

        list.push({
          type: 'topic',
          label: item.title,
          sublabel: `${item.subjectCode} · ${displayCategory}`,
          url: buildHandoffUrl(item.url, session),
          snippet: item.snippet
        });
      }
    }

    return list.slice(0, 8); // Limit to top 8 items
  }, [query, notices, session]);

  const showModal = modalOpen && !session;
  const visibleError = errorDismissed ? null : authError;

  // Redirect back to target child website upon successful login
  useEffect(() => {
    if (session) {
      const params = new URLSearchParams(window.location.search);
      const nextUrl = params.get('next');
      if (nextUrl) {
        const destination = buildHandoffUrl(nextUrl, session);
        window.location.replace(destination);
      }
    }
  }, [session]);

  // Fetch recent notices
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch('/api/notices');
        if (!res.ok) throw new Error('Failed to fetch notices');
        const data = await res.json();
        if (data && data.notices) {
          setNotices(data.notices);
        }
      } catch (err) {
        console.error('[notices] Error fetching MAKAUT notices:', err);
      }
    };
    fetchNotices();
  }, []);

  // Study log history registry helper
  useEffect(() => {
    if (!supabase || !user) return;
    (window as any).logStudyHistory = async (subjectId: string, subjectTitle: string, url: string, topicTitle?: string) => {
      try {
        const { error } = await supabase
          .from('study_history')
          .insert({
            user_id: user.id,
            subject_id: subjectId,
            subject_title: subjectTitle,
            topic_title: topicTitle || null,
            url: url,
            timestamp: new Date().toISOString()
          });
        if (error) console.error('[history] Error logging study history:', error);
      } catch (err) {
        console.error('[history] Failed to log study history:', err);
      }
    };
    return () => {
      delete (window as any).logStudyHistory;
    };
  }, [supabase, user]);

  function openAuth(subject?: Subject) {
    setLockedSubject(subject ?? null);
    setModalOpen(true);
  }

  function closeAuth() {
    setModalOpen(false);
    setLockedSubject(null);
  }

  async function signOut() {
    closeAuth();
    await supabase?.auth.signOut();
  }

  return (
    <>
      <BackgroundMesh />

      {/* ---------------------------------------------------------------
       * Header: Compact Sticky Floating Navigation Bar
       * ------------------------------------------------------------- */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4">
        <header className="mx-auto max-w-5xl rounded-full border border-slate-800/80 bg-[#071019]/80 backdrop-blur-md px-6 py-2 flex items-center justify-between shadow-lg">
          {/* Left: Logo */}
          <a href="#hero" className="flex items-center gap-2 text-cyan-400 font-bold tracking-tight text-sm">
            <GraduationCap className="h-5 w-5" />
            <span className="text-[#F5F7FA] font-sans">NotesHub</span>
          </a>

          {/* Center: Search & Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <a href="#subjects" className="hover:text-cyan-400 transition-colors">Subjects</a>
              <a href="#notes" className="hover:text-cyan-400 transition-colors">Notes</a>
              <a href="#pyqs" className="hover:text-cyan-400 transition-colors">PYQs</a>
              <a href="#practicals" className="hover:text-cyan-400 transition-colors">Practicals</a>
              <a href="#progress" className="hover:text-cyan-400 transition-colors">Progress</a>
            </nav>

            {/* Embedded Search input if authenticated */}
            {session && (
              <div className="relative w-48">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setDropdownOpen(true);
                  }}
                  onFocus={() => setDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                  placeholder="Search subjects, notes..."
                  className="w-full bg-[#101C27] border border-slate-800/70 rounded-full py-1 pl-8 pr-4 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
                />
                
                {/* Autocomplete suggestions relative overlay */}
                {dropdownOpen && recommendations.length > 0 && (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-xl border border-slate-800 bg-[#071019]/95 backdrop-blur-xl p-1.5 shadow-2xl max-h-[250px] overflow-y-auto flex flex-col gap-0.5">
                    {recommendations.map((item, idx) => (
                      <a
                        key={idx}
                        href={item.url}
                        target={item.url.startsWith('http') ? '_blank' : undefined}
                        rel={item.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        onClick={() => setDropdownOpen(false)}
                        className="w-full flex flex-col px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition duration-150 group text-left"
                      >
                        <span className="text-[10px] font-bold text-slate-200 truncate group-hover:text-cyan-400 transition">
                          {item.label}
                        </span>
                        <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">
                          {item.sublabel}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center gap-3">
            <UserMenu
              user={user}
              loading={loading}
              onSignIn={() => openAuth()}
              onSignOut={signOut}
              onOpenProfile={() => setProfileOpen(true)}
            />
          </div>
        </header>
      </div>

      {/* Main Container */}
      <main className="w-full">
        {/* Banner Alert Zone */}
        <div className="max-w-5xl mx-auto px-5 pt-20">
          {/* notices dropdown zone */}
          <div className="mt-4">
            <NoticeDropdown notices={notices} />
          </div>

          {!isSupabaseConfigured && (
            <div className="supabase-warning mt-4 flex items-start gap-3 rounded-2xl px-5 py-4 bg-amber-950/20 border border-amber-500/30">
              <AlertTriangle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-amber-500" />
              <div className="text-xs">
                <p className="font-bold text-amber-400">Supabase is not configured yet</p>
                <p className="mt-1 leading-relaxed text-slate-400">
                  Create a <code className="rounded bg-black/25 px-1.5 py-0.5 font-mono text-[10px] text-amber-200">.env.local</code> file with variables to activate logins.
                </p>
              </div>
            </div>
          )}

          <AnimatePresence>
            {visibleError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 px-5 py-4"
              >
                <AlertTriangle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-rose-400" />
                <p className="flex-1 text-xs text-rose-200">Sign-in failed: {visibleError}</p>
                <button
                  onClick={() => setErrorDismissed(true)}
                  aria-label="Dismiss error"
                  className="rounded-md p-1 text-rose-400 hover:bg-white/5 hover:text-rose-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ---------------------------------------------------------------
         * Section 1: Hero (Dark cinematic workspace)
         * ------------------------------------------------------------- */}
        <section id="hero" className="relative min-h-[90vh] flex flex-col items-center justify-center pt-28 pb-20 overflow-hidden bg-grid-pattern bg-[#071019]">
          {/* Ambient Lighting */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none animate-slow-pulse" />
          <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-teal-500/5 rounded-full blur-[110px] pointer-events-none" />

          <div className="relative z-10 text-center max-w-3xl px-5 flex flex-col items-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-950/20 px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Second Semester
            </span>

            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight text-[#F5F7FA] max-w-2xl font-sans">
              Your semester.<br />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500 bg-clip-text text-transparent">
                One focused workspace.
              </span>
            </h1>

            <p className="mt-6 text-slate-400 text-sm md:text-base max-w-lg leading-relaxed">
              Notes, previous year questions, practicals, resources, and progress tracking in one place.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a href="#subjects" className="px-6 py-3 rounded-full font-bold text-xs bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/15">
                Explore Subjects
              </a>
              <a href="#notes" className="px-6 py-3 rounded-full font-bold text-xs bg-[#101C27] border border-slate-800 text-slate-200 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95">
                Open Notes
              </a>
            </div>
          </div>

          {/* Futuristic OS Widgets Connections */}
          <div className="relative mt-12 w-full max-w-4xl px-5 h-[260px] flex items-center justify-center pointer-events-none">
            {/* SVGs for connector wires */}
            <svg className="absolute inset-0 w-full h-full text-cyan-500/20" xmlns="http://www.w3.org/2000/svg">
              <path d="M 120 50 Q 300 80 480 40 T 800 80" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <path d="M 480 40 L 220 180 M 480 40 L 680 180" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>

            {/* Widget: CGPA */}
            <div className="absolute top-[20px] left-[5%] md:left-[10%] p-4 rounded-xl border border-slate-800/80 bg-[#101C27]/70 backdrop-blur-md shadow-lg flex flex-col items-center min-w-[100px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CGPA</span>
              <span className="text-2xl font-bold text-cyan-400 mt-1">8.66</span>
            </div>

            {/* Widget: Semester Progress */}
            <div className="absolute top-[50px] left-[35%] md:left-[40%] p-4 rounded-xl border border-slate-800/80 bg-[#101C27]/70 backdrop-blur-md shadow-lg flex flex-col items-center min-w-[150px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Semester Progress</span>
              <span className="text-3xl font-extrabold text-[#F5F7FA] mt-1">78%</span>
              <div className="w-full bg-slate-800 h-1 rounded-full mt-2.5 overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: '78%' }} />
              </div>
            </div>

            {/* Widget: Topics */}
            <div className="absolute top-[20px] right-[5%] md:right-[10%] p-4 rounded-xl border border-slate-800/80 bg-[#101C27]/70 backdrop-blur-md shadow-lg flex flex-col items-center min-w-[120px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Topics Mastered</span>
              <span className="text-2xl font-bold text-teal-400 mt-1">64 / 82</span>
            </div>

            {/* Widget: PYQs */}
            <div className="absolute bottom-[20px] left-[15%] md:left-[22%] p-3.5 rounded-xl border border-slate-850 bg-[#101C27]/70 backdrop-blur-md shadow-lg flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <BookOpenCheck className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-500 uppercase">PYQs Solved</span>
                <span className="text-xs font-bold text-slate-200">184 Solves</span>
              </div>
            </div>

            {/* Widget: Next Exam */}
            <div className="absolute bottom-[20px] right-[15%] md:right-[22%] p-3.5 rounded-xl border border-slate-850 bg-[#101C27]/70 backdrop-blur-md shadow-lg flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <Calendar className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">Next Exam</span>
                <span className="text-xs font-bold text-slate-200">Engineering Chemistry</span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------
         * Section 2: Light Student Section (Off-white clean aesthetics)
         * ------------------------------------------------------------- */}
        <section className="py-28 px-5 bg-[#F5F7FA] text-slate-900 bg-grid-pattern-light border-t border-slate-200">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-950 font-sans">
              Everyone studies differently.
            </h2>
            <p className="mt-4 text-slate-500 text-sm md:text-base max-w-md mx-auto leading-relaxed">
              Build your semester around the subjects and resources you need.
            </p>

            <div className="mt-20 grid grid-cols-2 md:grid-cols-5 gap-8">
              {[
                { title: 'Mathematics II', code: 'BSM 201', desc: 'Linear Algebra, ODEs, Complex analysis.', progress: '85%', color: 'border-indigo-500/40 bg-indigo-50/20' },
                { title: 'Engineering Chemistry', code: 'BSCH 201', desc: 'Molecular binding, spectroscopy, chemical bonding.', progress: '72%', color: 'border-emerald-500/40 bg-emerald-50/20' },
                { title: 'Basic CS & Programming', code: 'ESCS 201', desc: 'Python programming, structure, algorithms.', progress: '94%', color: 'border-cyan-500/40 bg-cyan-50/20' },
                { title: 'Physics II', code: 'BSPH 201', desc: 'Electromagnetism, optics, quantum theory.', progress: '0%', color: 'border-slate-300 bg-slate-50/20' },
                { title: 'Chemistry Laboratory', code: 'BSCH 291', desc: 'Practical manuals, titrations, observations.', progress: '80%', color: 'border-amber-500/40 bg-amber-50/20' }
              ].map((sub, idx) => (
                <div key={idx} className="flex flex-col items-center text-center group">
                  <div className={`w-20 h-20 rounded-full border-2 ${sub.color} p-1 flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-sm bg-white`}>
                    <div className="w-full h-full rounded-full bg-slate-100/50 flex flex-col items-center justify-center font-bold text-xs text-slate-800">
                      <span>{sub.code.split(' ')[0]}</span>
                      <span className="text-[9px] text-slate-400">{sub.code.split(' ')[1]}</span>
                    </div>
                  </div>
                  <h3 className="mt-4 font-bold text-xs text-slate-900 group-hover:text-cyan-600 transition-colors">{sub.title}</h3>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{sub.code} · {sub.progress} Done</span>
                  <p className="mt-2 text-[11px] text-slate-500 leading-relaxed max-w-[140px]">{sub.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------
         * Section 3: Dark Subjects Carousel
         * ------------------------------------------------------------- */}
        <section id="subjects" className="py-28 px-5 bg-[#071019] overflow-hidden border-t border-slate-900">
          <div className="max-w-5xl mx-auto">
            <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#F5F7FA] font-sans">
                  Everything for every subject.
                </h2>
                <p className="mt-3 text-slate-450 text-sm max-w-sm">
                  Programming lecture notes, algorithms, code snippets, important questions, and practice problems.
                </p>
              </div>
              
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  {results.length} of {SUBJECTS.length} Subjects Active
                </span>
              </div>
            </div>

            {results.length > 0 ? (
              <SubjectCarousel subjects={results} session={session} onLocked={openAuth} />
            ) : (
              <div className="flex flex-col items-center rounded-2xl border border-slate-800 bg-[#101C27]/40 p-12 text-center">
                <SearchX className="h-8 w-8 text-slate-600" />
                <p className="mt-4 text-sm font-semibold text-slate-355">
                  No subjects match &ldquo;{query}&rdquo;
                </p>
                <button
                  onClick={() => setQuery('')}
                  className="mt-4 bg-cyan-500 text-slate-950 px-4 py-1.5 rounded-full font-bold text-xs hover:bg-cyan-400 transition-colors"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ---------------------------------------------------------------
         * Section 4: Dark Notes (Asymmetric notes mockup)
         * ------------------------------------------------------------- */}
        <section id="notes" className="py-28 px-5 bg-[#0B1520] border-t border-slate-900">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            {/* Left Mock Notebook Interface */}
            <div className="md:col-span-7 rounded-2xl border border-slate-800 bg-[#071019] shadow-2xl overflow-hidden flex flex-col h-[360px]">
              {/* Header bar */}
              <div className="border-b border-slate-850 px-4 py-3 flex items-center justify-between bg-[#101C27]/40">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500/80" />
                  <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                  <span className="text-[10px] font-mono text-slate-500 ml-4">Unit 1 / Intro_to_Programming.md</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded uppercase">Preview</span>
                </div>
              </div>

              {/* Sidebar + Main notes view */}
              <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-36 border-r border-slate-850 bg-[#071019] p-3 hidden sm:flex flex-col gap-1.5 text-[10px] font-semibold text-slate-500">
                  <span className="text-[9px] text-slate-650 font-bold uppercase tracking-wider mb-1">Outline</span>
                  <div className="text-cyan-400 bg-cyan-500/5 px-2 py-1 rounded">1. Variables</div>
                  <div className="px-2 py-1 hover:text-slate-300 cursor-pointer">2. Data Types</div>
                  <div className="px-2 py-1 hover:text-slate-300 cursor-pointer">3. Operators</div>
                  <div className="px-2 py-1 hover:text-slate-300 cursor-pointer">4. Control Flow</div>
                </div>

                {/* Content Panel */}
                <div className="flex-1 p-5 overflow-y-auto font-sans text-xs text-slate-300 space-y-4">
                  <h3 className="text-xs font-bold text-slate-100 border-b border-slate-850 pb-2">1. Variables and Scope</h3>
                  <p className="leading-relaxed">
                    A <strong>variable</strong> is a named location in memory used to store data. In Python, variables are dynamically typed and do not need declaration.
                  </p>
                  <pre className="bg-[#101C27]/50 border border-slate-850 p-3 rounded-lg font-mono text-[10px] text-cyan-300 leading-normal">
                    {`# Declaring variables
student_gpa = 8.66
completed_topics = 64

def check_progress():
    global completed_topics
    return "On track!" if completed_topics > 50 else "Need focus"`}
                  </pre>
                  <p className="text-[10px] text-slate-400">
                    💡 <em>Note: Always use descriptive variable names to improve code readability.</em>
                  </p>
                </div>
              </div>
            </div>

            {/* Right side Info text */}
            <div className="md:col-span-5 flex flex-col items-start">
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-3">Structured Learning</span>
              <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#F5F7FA] leading-tight font-sans">
                Study without searching.
              </h3>
              <p className="mt-4 text-slate-400 text-sm leading-relaxed">
                Our notes are carefully organized by subject, unit, and exact syllabus topics. Jump straight to equations, definitions, or code snippets with a structured navigation panel.
              </p>
              
              <button 
                onClick={() => {
                  const firstSub = SUBJECTS[0];
                  if (session) {
                    window.open(buildHandoffUrl(firstSub.url, session), '_blank');
                  } else {
                    openAuth(firstSub);
                  }
                }}
                className="mt-8 px-5 py-2.5 rounded-full font-bold text-xs bg-[#101C27] border border-slate-800 text-slate-200 hover:bg-slate-850 transition-all flex items-center gap-2 group hover:scale-105 active:scale-95"
              >
                Open Notes
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              </button>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------
         * Section 5: Dark PYQs (Categorized exams)
         * ------------------------------------------------------------- */}
        <section id="pyqs" className="py-28 px-5 bg-[#071019] border-t border-slate-950">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            {/* Left side text */}
            <div className="md:col-span-5 flex flex-col items-start order-2 md:order-1">
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-3">Exam Preparation</span>
              <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#F5F7FA] leading-tight font-sans">
                Prepare with questions that matter.
              </h3>
              <p className="mt-4 text-slate-400 text-sm leading-relaxed">
                Master the exams by practicing previous years' questions categorized by topic frequency, marks weighting, and difficulty.
              </p>
              
              <button 
                onClick={() => {
                  const firstSub = SUBJECTS[0];
                  if (session) {
                    window.open(buildHandoffUrl(firstSub.url, session), '_blank');
                  } else {
                    openAuth(firstSub);
                  }
                }}
                className="mt-8 px-5 py-2.5 rounded-full font-bold text-xs bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/10 hover:scale-105 active:scale-95"
              >
                Practice PYQs
              </button>
            </div>

            {/* Right side Mock PYQ List */}
            <div className="md:col-span-7 rounded-2xl border border-slate-800 bg-[#101C27]/40 backdrop-blur-md shadow-2xl p-5 space-y-4 order-1 md:order-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">MAKAUT PYQs</span>
                  <span className="text-[10px] bg-slate-850 text-slate-450 px-2 py-0.5 rounded font-bold">BSC 201</span>
                </div>
                <div className="flex gap-1.5">
                  {['2025', '2024', '2023', '2022'].map((yr, idx) => (
                    <span key={idx} className={`text-[10px] px-2 py-0.5 rounded font-semibold ${idx === 0 ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-900 text-slate-500'}`}>{yr}</span>
                  ))}
                </div>
              </div>

              {/* Mock PYQ cards */}
              {[
                { question: "Derive the characteristic equation and verify Cayley-Hamilton theorem for the matrix A.", marks: "8 Marks", unit: "Unit 2: Linear Algebra", diff: "Medium" },
                { question: "Define Bayes Theorem and calculate conditional probability of error in transmission.", marks: "5 Marks", unit: "Unit 4: Probability", diff: "Hard" },
                { question: "Compare list vs tuple in Python with respect to mutability, syntax, and performance.", marks: "5 Marks", unit: "Unit 1: Python Basics", diff: "Easy" }
              ].map((pyq, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-850 bg-[#071019]/60 flex flex-col gap-2">
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">{pyq.question}</p>
                  <div className="flex items-center justify-between text-[10px] mt-1">
                    <span className="text-slate-500 font-semibold">{pyq.unit}</span>
                    <div className="flex gap-2 items-center">
                      <span className="text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded">{pyq.marks}</span>
                      <span className="text-slate-450 bg-slate-850 px-2 py-0.5 rounded">{pyq.diff}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------
         * Section 6: Blue Progress (Strong navy background)
         * ------------------------------------------------------------- */}
        <section id="progress" className="py-28 px-5 bg-[#0B2035] text-slate-200 border-t border-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center">
              <span className="text-[9px] font-bold text-cyan-300 uppercase tracking-widest">Academic Dashboard</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-3 text-white font-sans">
                Know exactly where you stand.
              </h2>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Visualizations */}
              <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Line Chart Card */}
                <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md flex flex-col">
                  <span className="text-[10px] font-bold text-cyan-300 uppercase">GPA Trend</span>
                  <div className="h-[120px] w-full mt-4 flex items-end justify-between relative">
                    <svg className="absolute inset-0 w-full h-full text-cyan-450" viewBox="0 0 100 50">
                      <path d="M 10 40 Q 30 20 50 25 T 90 10" fill="none" stroke="currentColor" strokeWidth="2" />
                      <circle cx="90" cy="10" r="3" fill="#22D3EE" />
                    </svg>
                    {['SEM 1', 'SEM 2 (Est.)'].map((sem, idx) => (
                      <span key={idx} className="text-[9px] font-mono text-slate-300 z-10">{sem}</span>
                    ))}
                  </div>
                </div>

                {/* Circular Progress Card */}
                <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-between">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold text-cyan-300 uppercase">Syllabus Completion</span>
                    <span className="text-3xl font-black text-white mt-2">78%</span>
                    <span className="text-[9px] text-slate-300 mt-1">64 of 82 topics</span>
                  </div>

                  {/* Circular progress circle */}
                  <div className="relative w-16 h-16 shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-white/10" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-cyan-450" strokeDasharray="78, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Stats Counters */}
              <div className="md:col-span-5 grid grid-cols-2 gap-4 text-left">
                {[
                  { label: "CGPA", value: "8.66", sub: "First Semester" },
                  { label: "Semester Progress", value: "78%", sub: "Completed" },
                  { label: "Subjects Tracked", value: "4 / 5", sub: "Active" },
                  { label: "Study Streak", value: "12 Days", sub: "Streak Active" }
                ].map((stat, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <span className="text-[9px] font-bold text-slate-300 uppercase">{stat.label}</span>
                    <div className="text-2xl font-bold text-white mt-1">{stat.value}</div>
                    <span className="text-[9px] text-slate-300 mt-0.5 block">{stat.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------
         * Section 7: Dark Practicals (Futuristic laboratory console)
         * ------------------------------------------------------------- */}
        <section id="practicals" className="py-28 px-5 bg-[#071019] border-t border-slate-950">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">Lab Practical Manuals</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-3 text-[#F5F7FA] font-sans">
                Never enter a practical unprepared.
              </h2>
            </div>

            {/* Console Frame */}
            <div className="rounded-2xl border border-slate-800 bg-[#101C27]/40 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto md:h-[480px]">
              {/* Experiments list / Left sidebar */}
              <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-[#071019]/60 p-4 flex flex-col gap-2 text-left">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Select Experiment</span>
                {[
                  { title: "Mohr's Method", code: "Argentometry" },
                  { title: "Conductometric Titration", code: "Conductometry" },
                  { title: "pH Metric Titration", code: "pH Metry" },
                  { title: "UV-Vis Spectroscopy", code: "Spectrophotometry" },
                  { title: "Acid Value of Oils", code: "Oil Analysis" }
                ].map((exp, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${idx === 0 ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-900/40 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200'}`}>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{exp.title}</span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500">{exp.code}</span>
                    </div>
                    <FlaskConical className="w-3.5 h-3.5 shrink-0" />
                  </div>
                ))}
              </div>

              {/* Console content panel */}
              <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto text-left">
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-extrabold text-slate-100 text-sm">Mohr's Argentometric Titration</h3>
                    <span className="text-[8px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full uppercase">Active Console</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl border border-slate-850 bg-[#071019]/60">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Chemical Formula</span>
                      <p className="text-xs font-mono text-cyan-300 mt-1 font-bold">Ag⁺ + Cl⁻ → AgCl↓ (White)</p>
                      <p className="text-xs font-mono text-rose-350 mt-0.5 font-bold">2Ag⁺ + CrO₄²⁻ → Ag₂CrO₄↓ (Red)</p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-850 bg-[#071019]/60">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Primary Indicator</span>
                      <p className="text-xs text-slate-250 mt-1 font-bold">Potassium Chromate (K₂CrO₄)</p>
                      <p className="text-[9px] text-slate-500">Color change: Yellow to brick red precipitate</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Experiment Summary</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Used to estimate chloride ion concentration in a water sample using a standard Silver Nitrate (AgNO₃) solution. The titration must be carried out in a neutral/near-neutral pH range (6.5 to 8).
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800 flex flex-wrap justify-between items-center gap-4">
                  <span className="text-[9px] text-slate-500">Manual ID: BSCH-291-EXP-02</span>
                  <button 
                    onClick={() => {
                      const labSub = SUBJECTS.find(s => s.id === 'bsch-291') || SUBJECTS[2];
                      if (session) {
                        window.open(buildHandoffUrl(labSub.url, session), '_blank');
                      } else {
                        openAuth(labSub);
                      }
                    }}
                    className="bg-[#101C27] hover:bg-slate-800 border border-slate-800 text-slate-205 px-4 py-1.5 rounded-full font-bold text-xs transition-colors"
                  >
                    View Experiment Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------
         * Section 8: Dark Exam Preparation (Preparation timeline)
         * ------------------------------------------------------------- */}
        <section className="py-28 px-5 bg-[#0B1520] border-t border-slate-950">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">Exam Planner</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-3 text-[#F5F7FA] font-sans">
                Your next exam, clearly planned.
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#071019]/60 p-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-xl">
              {/* Left Column */}
              <div className="md:col-span-4 p-5 rounded-xl border border-slate-850 bg-[#101C27]/50 flex flex-col justify-between h-[180px] text-left">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-rose-450 uppercase tracking-wider">Engineering Chemistry</span>
                  <span className="text-xl font-extrabold text-slate-100 mt-1">18 AUGUST</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-white">21 Days</span>
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">Remaining</span>
                </div>
              </div>

              {/* Right Column */}
              <div className="md:col-span-8 space-y-6 text-left">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Syllabus Covered</span>
                    <div className="text-lg font-bold text-[#F5F7FA] mt-1">72%</div>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">PYQs Solved</span>
                    <div className="text-lg font-bold text-cyan-400 mt-1">42 Questions</div>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Important Topics</span>
                    <div className="text-lg font-bold text-teal-400 mt-1">8 Topics</div>
                  </div>
                </div>

                {/* Preparation progress */}
                <div className="space-y-3">
                  <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                    <span>Preparation Stage</span>
                    <span className="text-cyan-400">Step 3 of 5</span>
                  </div>
                  
                  <div className="relative flex justify-between">
                    <div className="absolute top-1.5 left-0 right-0 h-0.5 bg-slate-800 -z-10" />
                    <div className="absolute top-1.5 left-0 w-1/2 h-0.5 bg-cyan-500 -z-10" />

                    {['Syllabus', 'Revision', 'PYQs', 'Mock Test', 'Final Review'].map((stg, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1.5">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 ${idx < 2 ? 'bg-cyan-500 border-cyan-400' : idx === 2 ? 'bg-[#071019] border-cyan-400' : 'bg-slate-900 border-slate-800'}`} />
                        <span className={`text-[9px] font-bold ${idx <= 2 ? 'text-slate-200' : 'text-slate-500'}`}>{stg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------
         * Section 9: Dark Productivity (Weekly planner)
         * ------------------------------------------------------------- */}
        <section className="py-28 px-5 bg-[#071019] border-t border-slate-950">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">Study Planner</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-3 text-[#F5F7FA] font-sans">
                Stay focused throughout the semester.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left">
              {/* Stats Column */}
              <div className="md:col-span-4 flex flex-col gap-4">
                <div className="p-4 rounded-xl border border-slate-850 bg-[#101C27]/50 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Weekly Study Time</span>
                    <span className="text-base font-bold text-slate-200">14h 32m</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-850 bg-[#101C27]/50 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Topics Completed</span>
                    <span className="text-base font-bold text-slate-200">23 Completed</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-850 bg-[#101C27]/50 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Current Streak</span>
                    <span className="text-base font-bold text-slate-200">12 Days</span>
                  </div>
                </div>
              </div>

              {/* Weekly Planner Grid */}
              <div className="md:col-span-8 rounded-2xl border border-slate-800 bg-[#101C27]/30 p-5 space-y-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Weekly Tracker</span>
                <div className="grid grid-cols-5 gap-3.5">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-500">{day.substring(0, 3)}</span>
                      <div className="w-full flex flex-col gap-1">
                        {[
                          idx % 2 === 0 ? 'bg-cyan-500/20 border-cyan-500/25' : 'bg-slate-900/60 border-slate-850',
                          idx % 3 === 0 ? 'bg-teal-500/20 border-teal-500/25' : 'bg-slate-900/60 border-slate-850',
                          idx % 4 === 0 ? 'bg-cyan-500/20 border-cyan-500/25' : 'bg-slate-900/60 border-slate-850'
                        ].map((bgClass, bIdx) => (
                          <div key={bIdx} className={`h-8 rounded-md border ${bgClass}`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------
         * Section 10: Light Semester Report (Visualizations)
         * ------------------------------------------------------------- */}
        <section className="py-28 px-5 bg-[#F5F7FA] text-slate-900 bg-grid-pattern-light border-t border-slate-200">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-950 font-sans">
              See how far you've come.
            </h2>
            <p className="mt-4 text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
              Your semester metrics, study ratios, materials covered, and GPA history calculated in real-time.
            </p>

            <div className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-6">
              {[
                { label: "Semester GPA", value: "8.66" },
                { label: "Completed Subjects", value: "5" },
                { label: "Notes Studied", value: "126 Files" },
                { label: "PYQs Solved", value: "184 Solves" },
                { label: "Study Hours", value: "142 Hours" }
              ].map((rpt, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-md">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{rpt.label}</span>
                  <div className="text-2xl font-black text-slate-950 mt-2">{rpt.value}</div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setProfileOpen(true)}
              className="mt-10 px-6 py-3 rounded-full font-bold text-xs bg-slate-950 hover:bg-slate-900 text-white transition-all shadow-md hover:scale-105 active:scale-95"
            >
              View Semester Report
            </button>
          </div>
        </section>

        {/* ---------------------------------------------------------------
         * Section 11: Final CTA (Dark glowing branding)
         * ------------------------------------------------------------- */}
        <section className="py-32 px-5 bg-[#071019] relative overflow-hidden border-t border-slate-950 flex flex-col items-center justify-center text-center">
          {/* Logo backdrop */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.02] text-cyan-400 scale-[2.2] select-none">
            <GraduationCap className="w-96 h-96 blur-[1px]" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />

          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#F5F7FA] font-sans">
              Ready to take control of your semester?
            </h2>
            <p className="mt-4 text-slate-450 text-sm leading-relaxed">
              Everything you need to study, prepare, and track your progress.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a href="#hero" className="px-6 py-3 rounded-full font-bold text-xs bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/15">
                Open NotesHub
              </a>
              <a href="#subjects" className="px-6 py-3 rounded-full font-bold text-xs bg-[#101C27] border border-slate-800 text-slate-205 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95">
                Explore Subjects
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ---------------------------------------------------------------
       * Footer: Sleek Minimal Dark Footer
       * ------------------------------------------------------------- */}
      <footer className="bg-[#050B10] border-t border-slate-950 py-16 px-5 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
          <div className="flex flex-col gap-3">
            <span className="font-bold text-slate-300 text-sm">NotesHub</span>
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-[160px]">
              Your semester, organized. Single sign-on across notes portals.
            </p>
          </div>
          
          <div className="flex flex-col gap-2.5">
            <span className="font-bold text-slate-300">Portals</span>
            <a href="#subjects" className="hover:text-cyan-400 transition-colors">Subjects</a>
            <a href="#notes" className="hover:text-cyan-400 transition-colors">Notes</a>
            <a href="#pyqs" className="hover:text-cyan-400 transition-colors">PYQs</a>
            <a href="#practicals" className="hover:text-cyan-400 transition-colors">Practicals</a>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="font-bold text-slate-300">Resources</span>
            <span className="text-slate-600">Study Materials</span>
            <span className="text-slate-600">Question Papers</span>
            <span className="text-slate-600">Lab Manuals</span>
            <span className="text-slate-600">Exam Preparation</span>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="font-bold text-slate-300">Account</span>
            <button onClick={() => setProfileOpen(true)} className="text-left hover:text-cyan-400 transition-colors">Profile</button>
            <button onClick={session ? signOut : () => openAuth()} className="text-left hover:text-cyan-400 transition-colors">
              {session ? 'Sign Out' : 'Sign In'}
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-12 pt-6 border-t border-slate-900/60 flex items-center justify-between text-[11px] text-slate-600">
          <span>© 2026 NotesHub. All rights reserved.</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Single Sign-On Active
          </span>
        </div>
      </footer>

      {/* Auth & Profile Modals */}
      <AuthModal
        open={showModal}
        onClose={closeAuth}
        supabase={supabase}
        reason={lockedSubject ? `${lockedSubject.code} — ${lockedSubject.title}` : null}
      />

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        supabase={supabase}
        onSignOut={signOut}
      />
    </>
  );
}
