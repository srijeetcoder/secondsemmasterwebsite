'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, GraduationCap, Search, SearchX, X, BookOpen, FileText, ExternalLink } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { AuthModal } from '@/components/AuthModal';
import { BackgroundMesh } from '@/components/BackgroundMesh';
import { ProfileModal } from '@/components/ProfileModal';
import { SessionCard } from '@/components/SessionCard';
import { SubjectCarousel } from '@/components/SubjectCarousel';
import { UserMenu } from '@/components/UserMenu';
import { NoticeDropdown } from '@/components/NoticeDropdown';
import { SUBJECTS, filterSubjects, type Subject } from '@/lib/subjects';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { useAuth } from '@/lib/useAuth';
import { buildHandoffUrl } from '@/lib/handoff';
import { SEARCH_INDEX } from '@/lib/searchIndex';

/** `authError` is read server-side from ?auth_error= and passed down by app/page.tsx. */
export function HubClient({ authError }: { authError: string | null }) {
  const { supabase, session, user, loading } = useAuth();

  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [lockedSubject, setLockedSubject] = useState<Subject | null>(null);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
    await supabase?.auth.signOut();
  }

  return (
    <>
      <BackgroundMesh />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-5 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8">
        {/* MAKAUT Notices Ticker */}
        <div className="mb-4 sm:mb-5 w-full">
          <NoticeDropdown notices={notices} />
        </div>
        {/* Spacer to prevent page jump when header docks fixed */}
        <motion.div
          animate={{ height: isScrolled ? 64 : 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="overflow-hidden"
        />

        <motion.header
          layout
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className={`navbar z-50 flex items-center shadow-2xl backdrop-blur-xl border transform-gpu ${
            isScrolled
              ? 'fixed top-3 left-3 sm:top-4 sm:left-4 md:left-8 py-1.5 px-2.5 rounded-xl gap-2.5 bg-[#0D0F10]/95 border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
              : 'relative w-full py-3 px-3 sm:py-3.5 sm:px-5 rounded-2xl justify-between gap-3 sm:gap-4 bg-[#0D0F10]/40 border-white/[0.06]'
          }`}
          style={{ maxWidth: isScrolled ? 'min(92vw, 480px)' : '100%' }}
        >
          {/* Logo & Brand — visible at top, removed when converged */}
          <AnimatePresence>
            {!isScrolled && (
              <motion.div
                key="brand-logo"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-2 sm:gap-2.5 shrink-0 overflow-hidden"
              >
                <span className="flex items-center justify-center rounded-xl border border-[#4AA6A8]/25 bg-[#4AA6A8]/10 h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                  <GraduationCap className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-[#4AA6A8]" />
                </span>
                <span className="hidden xs:block whitespace-nowrap text-sm font-semibold tracking-tight text-[#E8E8E5]">
                  MAKAUT BUSTERS
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search container */}
          {session ? (
            <motion.div
              layout
              className="relative flex items-center min-w-0 flex-1 mx-1.5 sm:mx-2.5"
            >
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 sm:left-3.5 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setDropdownOpen(true); }}
                  onFocus={() => setDropdownOpen(true)}
                  onBlur={() => {
                    setTimeout(() => {
                      setDropdownOpen(false);
                    }, 200);
                  }}
                  placeholder={isScrolled ? "Search…" : "Search subjects, topics…"}
                  aria-label="Search subjects"
                  className="search-input w-full rounded-xl py-1.5 sm:py-2 pl-8 sm:pl-9 pr-7 text-xs sm:text-sm focus:outline-none bg-white/[0.04] border border-white/10 text-[#E8E8E5] transition focus:border-[#4AA6A8]/40 focus:bg-white/[0.06]"
                />
                {query && (
                  <button
                    onClick={() => { setQuery(''); setDropdownOpen(false); }}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#626766] transition hover:bg-white/5 hover:text-[#929694] touch-manipulation"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Autocomplete dropdown */}
              {dropdownOpen && recommendations.length > 0 && (
                <div className={`absolute z-50 rounded-xl border border-white/10 bg-[#0D0F10]/98 backdrop-blur-xl p-1.5 shadow-2xl max-h-[60vh] overflow-y-auto flex flex-col gap-0.5 ${
                  isScrolled
                    ? 'left-0 top-[calc(100%+8px)] w-[min(280px,calc(100vw-2rem))]'
                    : 'left-0 right-0 top-[calc(100%+8px)]'
                }`}>
                  {recommendations.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.url}
                      target={item.url.startsWith('http') ? '_blank' : undefined}
                      rel={item.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                      onClick={() => setDropdownOpen(false)}
                      className="w-full flex items-center justify-between text-left px-3 py-2 rounded-lg hover:bg-white/5 transition duration-150 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.type === 'subject' && <GraduationCap className="h-4 w-4 text-[#4AA6A8] shrink-0" />}
                        {item.type === 'notice' && <FileText className="h-4 w-4 text-[#A58A55] shrink-0" />}
                        {item.type === 'topic' && <BookOpen className="h-4 w-4 text-[#827A9B] shrink-0" />}
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-slate-200 group-hover:text-[#4AA6A8] transition truncate">{item.label}</span>
                          {item.snippet && (
                            <span className="text-[10px] text-slate-400 truncate mt-0.5 leading-none">{item.snippet}</span>
                          )}
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
            </motion.div>
          ) : (
            <div className="flex-1" />
          )}

          {/* User menu */}
          <div className="shrink-0 flex items-center">
            <UserMenu
              user={user}
              loading={loading}
              isScrolled={isScrolled}
              onSignIn={() => openAuth()}
              onSignOut={signOut}
              onOpenProfile={() => setProfileOpen(true)}
            />
          </div>
        </motion.header>

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

            <div className="mt-5 sm:mt-6 flex justify-center">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-[#E8E8E5] drop-shadow-sm select-none">
                MAKAUT BUSTERS
              </h1>
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

        <footer className="mt-10 flex flex-col items-center gap-1.5 text-center px-4">
          <p className="text-[11px] sm:text-xs text-[#626766]">
            MAKAUT BUSTERS · single sign-on across four notes sites
          </p>
          <p className="text-[10px] sm:text-[11px] text-[#626766]">
            Sessions are issued and validated by Supabase Auth.
          </p>
          <p className="mt-3 text-[11px] sm:text-xs text-slate-400 flex items-center justify-center gap-1 font-mono flex-wrap">
            Made with <span className="text-rose-500">❤️</span> by{' '}
            <a
              href="https://github.com/srijeetcoder"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-300 hover:text-cyan-400 underline underline-offset-4 transition"
            >
              srijeetcoder
            </a>
          </p>
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
    </>
  );
}
