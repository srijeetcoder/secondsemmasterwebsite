'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, GraduationCap, Search, SearchX, X, BookOpen, FileText, ExternalLink, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { AuthModal } from '@/components/AuthModal';
import { BackgroundMesh } from '@/components/BackgroundMesh';
import { ProfileModal } from '@/components/ProfileModal';
import { SessionCard } from '@/components/SessionCard';
import { SubjectCarousel } from '@/components/SubjectCarousel';
import { UserMenu } from '@/components/UserMenu';
import { NoticeDropdown } from '@/components/NoticeDropdown';
import { AboutDeveloper } from '@/components/AboutDeveloper';
import { DeveloperExpandedSection } from '@/components/DeveloperExpandedSection';
import { SUBJECTS, filterSubjects, type Subject } from '@/lib/subjects';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { useAuth } from '@/lib/useAuth';
import { buildHandoffUrl } from '@/lib/handoff';
import { SEARCH_INDEX } from '@/lib/searchIndex';
import { setDevLogin } from '@/lib/useAuth';

/** Reads ?auth_error= from the URL client-side (compatible with static export). */
function HubClientInner() {
  const searchParams = useSearchParams();
  const authError = searchParams.get('auth_error');
  const { supabase, session, user, loading, sessionConflict, dismissConflict } = useAuth();

  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [lockedSubject, setLockedSubject] = useState<Subject | null>(null);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [devSectionOpen, setDevSectionOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string; type?: 'success' | 'info' } | null>(null);

  // Listen for global auth toasts (e.g. registration success)
  useEffect(() => {
    const handleToast = (e: any) => {
      if (e.detail) {
        setToast(e.detail);
        setTimeout(() => setToast(null), 4500);
      }
    };
    window.addEventListener('auth-toast', handleToast);
    return () => window.removeEventListener('auth-toast', handleToast);
  }, []);

  const handleToggleDevSection = () => {
    setDevSectionOpen((prev) => {
      const nextState = !prev;
      if (nextState) {
        setTimeout(() => {
          document.getElementById('about-developer-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }
      return nextState;
    });
  };

  // Hysteresis: engage at 50px, disengage at 30px — prevents rapid toggling
  // while the user hovers near the threshold, keeping the transition smooth.
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(prev => {
        if (!prev && window.scrollY > 50) return true;
        if (prev && window.scrollY < 30) return false;
        return prev;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const results = useMemo(() => filterSubjects(SUBJECTS, query), [query]);

  // Compute autocomplete search suggestions that redirect to the exact URL
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
          url: notice.link || notice.url || 'https://www.makautexam.net/'
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

  // Derived, not effect-driven: the moment a session lands (OAuth return, magic
  // link, another tab signing in) the dialog closes on its own — and because
  // AnimatePresence still sees the flip, the exit animation plays properly.
  const showModal = modalOpen && !session;
  const visibleError = errorDismissed ? null : authError;

  // Automatically redirect back to the target child website upon successful login
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

  // Fetch recent notices from our scraper API
  useEffect(() => {
    let isMounted = true;
    const fetchNotices = async () => {
      try {
        const res = await fetch('/api/notices');
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data && data.notices && data.notices.length > 0) {
          setNotices(data.notices);
        }
      } catch (err) {
        console.warn('[notices] Could not fetch live notices, using defaults:', err);
      }
    };
    fetchNotices();
    return () => {
      isMounted = false;
    };
  }, []);

  // Global logStudyHistory registry
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).logStudyHistory = async (subjectId: string, subjectTitle: string, url: string, topicTitle?: string) => {
        if (!supabase) return;
        try {
          const { error } = await supabase
            .from('study_history')
            .insert({
              user_id: user?.id,
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
    }
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
    if (process.env.NODE_ENV === 'development') setDevLogin(false);
    await supabase?.auth.signOut();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('auth-toast', {
          detail: {
            type: 'info',
            title: 'Signed Out',
            message: 'You have been safely signed out.',
          },
        })
      );
    }
  }

  return (
    <>
      <BackgroundMesh />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-5 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8">
        {/* MAKAUT Notices Ticker */}
        <div className="mb-4 sm:mb-5 w-full">
          <NoticeDropdown notices={notices} />
        </div>


        {/* ── Full-width header — fades out when scrolled (stays in flow so content never jumps) ── */}
        <AnimatePresence initial={false}>
          {!isScrolled && (
          <motion.header
            key="full-header"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full flex items-center justify-between gap-3 sm:gap-4 py-3 px-3 sm:py-3.5 sm:px-5 rounded-2xl navbar shadow-2xl backdrop-blur-xl border bg-[#0D0F10]/40 border-white/[0.06]"
        >
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] h-8 w-8 sm:h-9 sm:w-9 p-0.5 shadow-sm">
              <img
                src="/logo.png"
                alt="Notes4BtechCSE Logo"
                className="h-full w-full object-contain rounded-lg"
              />
            </div>
            <span className="hidden xs:block whitespace-nowrap text-sm font-semibold tracking-tight text-[#E8E8E5]">
              Notes4BtechCSE
            </span>
          </div>

          {/* Full search bar */}
          {session ? (
            <div className="relative flex items-center flex-1 mx-3">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 sm:left-3.5 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setDropdownOpen(true); }}
                  onFocus={() => setDropdownOpen(true)}
                  onBlur={() => { setTimeout(() => setDropdownOpen(false), 200); }}
                  placeholder="Search subjects, topics…"
                  aria-label="Search subjects"
                  className="search-input w-full rounded-xl py-1.5 sm:py-2 pl-8 sm:pl-9 pr-7 text-xs sm:text-sm focus:outline-none bg-white/[0.04] border border-white/10 text-[#E8E8E5] transition focus:border-[#4AA6A8]/40 focus:bg-white/[0.06]"
                />
                {query && (
                  <button onClick={() => { setQuery(''); setDropdownOpen(false); }} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#626766] transition hover:bg-white/5 hover:text-[#929694] touch-manipulation">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {dropdownOpen && recommendations.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-xl border border-white/10 bg-[#0D0F10]/98 backdrop-blur-xl p-1.5 shadow-2xl max-h-[60vh] overflow-y-auto flex flex-col gap-0.5">
                  {recommendations.map((item, idx) => (
                    <a key={idx} href={item.url} target={item.url.startsWith('http') ? '_blank' : undefined} rel={item.url.startsWith('http') ? 'noopener noreferrer' : undefined} onClick={() => setDropdownOpen(false)} className="w-full flex items-center justify-between text-left px-3 py-2 rounded-lg hover:bg-white/5 transition duration-150 group">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.type === 'subject' && <GraduationCap className="h-4 w-4 text-[#4AA6A8] shrink-0" />}
                        {item.type === 'notice' && <FileText className="h-4 w-4 text-[#A58A55] shrink-0" />}
                        {item.type === 'topic' && <BookOpen className="h-4 w-4 text-[#827A9B] shrink-0" />}
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-slate-200 group-hover:text-[#4AA6A8] transition truncate">{item.label}</span>
                          {item.snippet && <span className="text-[10px] text-slate-400 truncate mt-0.5 leading-none">{item.snippet}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className="hidden sm:inline text-[9px] font-mono text-slate-500 uppercase px-1 rounded bg-white/5 border border-white/5">{item.sublabel}</span>
                        {item.url.startsWith('http') && <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-[#4AA6A8] transition shrink-0" />}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ) : <div className="flex-1" />}

          {/* User menu */}
          <div className="shrink-0 flex items-center">
            <UserMenu user={user} loading={loading} isScrolled={false} onSignIn={() => openAuth()} onSignOut={signOut} onOpenProfile={() => setProfileOpen(true)} />
          </div>
          </motion.header>
          )}
        </AnimatePresence>

        {/* Placeholder keeps page layout stable when full header exits */}
        {isScrolled && <div className="w-full" style={{ height: 56 }} />}

        <AnimatePresence initial={false}>
          {isScrolled && (
          <motion.div
            key="compact-pill"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-3 left-3 sm:top-4 sm:left-4 z-50 flex items-center gap-2.5 py-1.5 px-2.5 rounded-xl navbar bg-[#0D0F10]/95 border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        >
          {/* Compact search: icon → expands on click */}
          {session && (
            <div className="relative flex items-center">
              <AnimatePresence initial={false} mode="wait">
                {searchExpanded ? (
                  <motion.div
                    key="compact-search-input"
                    initial={{ width: 36, opacity: 0 }}
                    animate={{ width: 'min(280px, calc(90vw - 80px))', opacity: 1 }}
                    exit={{ width: 36, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    className="relative"
                  >
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                    <input
                      type="search"
                      value={query}
                      autoFocus
                      onChange={(e) => { setQuery(e.target.value); setDropdownOpen(true); }}
                      onFocus={() => setDropdownOpen(true)}
                      onBlur={() => { setTimeout(() => { setDropdownOpen(false); if (!query) setSearchExpanded(false); }, 200); }}
                      placeholder="Search subjects, topics…"
                      aria-label="Search subjects"
                      className="search-input w-full rounded-xl py-1.5 pl-8 pr-7 text-xs focus:outline-none bg-white/[0.04] border border-white/10 text-[#E8E8E5] transition focus:border-[#4AA6A8]/40 focus:bg-white/[0.06]"
                    />
                    {query && (
                      <button onClick={() => { setQuery(''); setDropdownOpen(false); setSearchExpanded(false); }} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#626766] transition hover:bg-white/5 hover:text-[#929694] touch-manipulation">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <button
                    key="compact-search-icon"
                    type="button"
                    onClick={() => setSearchExpanded(true)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white hover:border-[#4AA6A8]/40 hover:bg-white/[0.08] transition shadow-md shrink-0 touch-manipulation"
                    title="Search subjects"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                )}
              </AnimatePresence>
              {/* Compact dropdown */}
              {dropdownOpen && recommendations.length > 0 && searchExpanded && (
                <div className="absolute left-0 top-[calc(100%+8px)] w-[min(280px,calc(100vw-2rem))] z-50 rounded-xl border border-white/10 bg-[#0D0F10]/98 backdrop-blur-xl p-1.5 shadow-2xl max-h-[60vh] overflow-y-auto flex flex-col gap-0.5">
                  {recommendations.map((item, idx) => (
                    <a key={idx} href={item.url} target={item.url.startsWith('http') ? '_blank' : undefined} rel={item.url.startsWith('http') ? 'noopener noreferrer' : undefined} onClick={() => setDropdownOpen(false)} className="w-full flex items-center justify-between text-left px-3 py-2 rounded-lg hover:bg-white/5 transition duration-150 group">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.type === 'subject' && <GraduationCap className="h-4 w-4 text-[#4AA6A8] shrink-0" />}
                        {item.type === 'notice' && <FileText className="h-4 w-4 text-[#A58A55] shrink-0" />}
                        {item.type === 'topic' && <BookOpen className="h-4 w-4 text-[#827A9B] shrink-0" />}
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-slate-200 group-hover:text-[#4AA6A8] transition truncate">{item.label}</span>
                          {item.snippet && <span className="text-[10px] text-slate-400 truncate mt-0.5 leading-none">{item.snippet}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className="hidden sm:inline text-[9px] font-mono text-slate-500 uppercase px-1 rounded bg-white/5 border border-white/5">{item.sublabel}</span>
                        {item.url.startsWith('http') && <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-[#4AA6A8] transition shrink-0" />}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* User menu */}
          <div className="shrink-0 flex items-center">
            <UserMenu user={user} loading={loading} isScrolled={true} onSignIn={() => openAuth()} onSignOut={signOut} onOpenProfile={() => setProfileOpen(true)} />
          </div>
          </motion.div>
          )}
        </AnimatePresence>

        {/* ---------------------------------------------------------------
         * Setup + error banners
         * ------------------------------------------------------------- */}
        {!isSupabaseConfigured && (
          <div className="supabase-warning mt-4 flex items-start gap-3 rounded-2xl px-5 py-4">
            <AlertTriangle className="mt-0.5 h-[18px] w-[18px] shrink-0" style={{ color: '#A58A55' }} />
            <div className="text-sm">
              <p className="font-semibold supabase-warning-heading">Supabase is not configured yet</p>
              <p className="mt-1 leading-relaxed supabase-warning-desc">
                Create a{' '}
                <code className="rounded bg-black/25 px-1.5 py-0.5 font-mono text-[12px] text-[#D8D2B8]">
                  .env.local
                </code>{' '}
                file with <code className="font-mono text-[12px] text-[#D8D2B8]">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
                <code className="font-mono text-[12px] text-[#D8D2B8]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, then
                restart the dev server. Everything below still renders — only sign-in is disabled.
                See the integration guide at the bottom of this page.
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
              className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-400/25 bg-rose-500/[0.08] px-5 py-4"
            >
              <AlertTriangle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-rose-300" />
              <p className="flex-1 text-sm text-rose-100">Sign-in failed: {visibleError}</p>
              <button
                onClick={() => setErrorDismissed(true)}
                aria-label="Dismiss error"
                className="rounded-md p-1 text-rose-300/70 transition hover:bg-white/5 hover:text-rose-200"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------------------------------------------------------------
         * Hero
         * ------------------------------------------------------------- */}
        <section className="pb-8 pt-10 text-center sm:pb-11 sm:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#242728] bg-[#0D0F10] px-3 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.14em] text-[#929694]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4AA6A8] animate-pulse-ring shrink-0" />
              Second Semester
            </span>

            <div className="mt-5 sm:mt-6 flex flex-col items-center justify-center">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-[#E8E8E5] drop-shadow-sm select-none">
                Notes4BtechCSE
              </h1>
              <span className="mt-1 text-xs sm:text-sm font-semibold tracking-wider text-[#4AA6A8] uppercase">
                (N4BC)
              </span>
            </div>

            <p className="mx-auto mt-4 sm:mt-5 max-w-xs xs:max-w-sm sm:max-w-xl text-sm sm:text-base leading-relaxed text-[#929694]">
              One portal for all your semester resources, powered by single sign-on.
            </p>
          </motion.div>
        </section>

        {/* ---------------------------------------------------------------
         * 3D subject carousel
         * ------------------------------------------------------------- */}
        <section className="mt-2">
          <div className="mb-3 sm:mb-4 flex items-baseline justify-between gap-4 px-1">
            <h2 className="text-sm font-semibold tracking-tight text-[#E8E8E5]">Your subjects</h2>
            <p className="text-xs text-[#626766] shrink-0">
              {results.length} of {SUBJECTS.length}{query && ' matching'}
            </p>
          </div>

          {results.length > 0 ? (
            <SubjectCarousel subjects={results} session={session} onLocked={openAuth} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass flex flex-col items-center rounded-2xl px-4 sm:px-6 py-12 sm:py-14 text-center"
            >
              <SearchX className="h-7 w-7 text-[#626766]" />
              <p className="mt-3.5 text-sm font-medium text-[#E8E8E5]">
                No subjects match &ldquo;{query}&rdquo;
              </p>
              <p className="mt-1 text-sm text-[#929694]">
                Try a course code like <span className="text-[#E8E8E5]">BSM 201</span>, or a topic
                like <span className="text-[#E8E8E5]">titration</span>.
              </p>
              <button
                onClick={() => setQuery('')}
                className="btn-primary mt-5 rounded-lg px-4 py-2 text-sm touch-manipulation"
              >
                Clear search
              </button>
            </motion.div>
          )}
        </section>

        {/* ---------------------------------------------------------------
         * Session status
         * ------------------------------------------------------------- */}
        <div className="mt-8">
          <SessionCard
            session={session}
            loading={loading}
            onSignIn={() => openAuth()}
            onSignOut={signOut}
          />
        </div>

        {/* ---------------------------------------------------------------
         * About the Developer Expanded In-Page Section
         * ------------------------------------------------------------- */}
        <DeveloperExpandedSection
          open={devSectionOpen}
          onClose={() => setDevSectionOpen(false)}
        />

        <footer className="mt-10 flex flex-col items-center gap-2 text-center px-4">
          <p className="text-[11px] sm:text-xs text-[#626766]">
            Notes4BtechCSE (N4BC) · single sign-on across four notes sites
          </p>
          <p className="text-[10px] sm:text-[11px] text-[#626766]">
            Sessions are issued and validated by Supabase Auth.
          </p>
          
          <AnimatePresence>
            {!devSectionOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="mt-3"
              >
                <AboutDeveloper 
                  onExpand={handleToggleDevSection}
                  isExpanded={devSectionOpen}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </footer>
      </div>

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

      {/* Concurrent Active Session Kickout Notice Modal */}
      <AnimatePresence>
        {sessionConflict && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-[#090A0B]/80 backdrop-blur-sm"
              onClick={dismissConflict}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Session Replaced"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="glass-strong relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0D0F10]/95 p-6 shadow-2xl backdrop-blur-2xl flex flex-col gap-5"
            >
              {/* Subtle top hairline glow */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4AA6A8]/40 to-transparent" />

              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-[#4AA6A8]">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-semibold tracking-tight text-[#E8E8E5]">
                      Session Replaced
                    </h2>
                    <p className="text-[11px] font-mono text-[#828886] mt-0.5">
                      Single Active Device Policy
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={dismissConflict}
                  aria-label="Close dialog"
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-slate-200 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <p className="text-xs sm:text-[13px] text-[#929694] leading-relaxed">
                Your account was authenticated from another device or browser session. To protect your account integrity, access on this device has been paused.
              </p>

              {/* Status Spec Box */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#828886]">
                  <span>Protection type</span>
                  <span className="font-mono text-slate-300">Single active token</span>
                </div>
                <div className="flex items-center justify-between text-[#828886]">
                  <span>Current device</span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-amber-400/90">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    Signed out locally
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={dismissConflict}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] px-4 py-2.5 text-xs font-medium text-[#929694] hover:text-[#E8E8E5] transition text-center cursor-pointer"
                >
                  Continue as Guest
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dismissConflict();
                    openAuth();
                  }}
                  className="flex-1 rounded-xl bg-[#4AA6A8] hover:bg-[#3d9193] text-[#090A0B] font-semibold text-xs py-2.5 px-4 transition text-center cursor-pointer shadow-lg shadow-[#4AA6A8]/15"
                >
                  Sign In on This Device
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Bottom Right Floating Notification Toast (Pure Transparent) ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24, x: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, x: 16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl border border-white/20 bg-transparent text-[#E8E8E5] max-w-sm w-[calc(100vw-3rem)] sm:w-auto shadow-none"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#4AA6A8]/40 bg-transparent text-[#4AA6A8]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-semibold text-[#E8E8E5] leading-tight drop-shadow-sm">{toast.title}</h4>
              <p className="text-[11px] sm:text-xs text-[#929694] mt-0.5 leading-snug drop-shadow-sm">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
              className="rounded-lg p-1.5 text-[#626766] hover:text-[#E8E8E5] bg-transparent transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function HubClient() {
  return (
    <Suspense>
      <HubClientInner />
    </Suspense>
  );
}
