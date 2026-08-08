'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, GraduationCap, Search, SearchX, X, Sparkles, ExternalLink, Tag, FileText } from 'lucide-react';
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

/** `authError` is read server-side from ?auth_error= and passed down by app/page.tsx. */
export function HubClient({ authError }: { authError: string | null }) {
  const { supabase, session, user, loading } = useAuth();

  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [lockedSubject, setLockedSubject] = useState<Subject | null>(null);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);

  // Search states
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<{ title: string; link: string; snippet: string }[]>([]);
  const [aiOverview, setAiOverview] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeSearchLink, setActiveSearchLink] = useState<string | null>(null);
  const [activeSearchTitle, setActiveSearchTitle] = useState<string>('');

  // Compute autocomplete search suggestions
  const recommendations = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const list: { type: 'subject' | 'topic' | 'notice' | 'web'; label: string; sublabel?: string; value: string; link?: string }[] = [];

    // 1. Match subjects
    for (const sub of SUBJECTS) {
      if (sub.title.toLowerCase().includes(q) || sub.code.toLowerCase().includes(q)) {
        list.push({
          type: 'subject',
          label: `${sub.code} — ${sub.title}`,
          sublabel: sub.badge,
          value: sub.title
        });
      }
    }

    // 2. Match topics (keywords from subjects)
    for (const sub of SUBJECTS) {
      for (const kw of sub.keywords) {
        if (kw.toLowerCase().includes(q) && !list.some(item => item.value.toLowerCase() === kw.toLowerCase())) {
          list.push({
            type: 'topic',
            label: kw,
            sublabel: `in ${sub.code}`,
            value: kw
          });
        }
      }
    }

    // 3. Match notices
    for (const notice of notices) {
      if (notice.title.toLowerCase().includes(q)) {
        list.push({
          type: 'notice',
          label: notice.title,
          sublabel: 'Notice Announcement',
          value: notice.title
        });
      }
    }

    // 4. Local AI Prompt Recommendation
    list.push({
      type: 'web',
      label: `Ask Local AI about "${query}"`,
      sublabel: 'Syllabus Assistant',
      value: query
    });

    return list.slice(0, 6); // Limit to top 6 items
  }, [query, notices]);

  const handleSelectRecommendation = (item: any) => {
    setQuery(item.value);
    setDropdownOpen(false);
  };

  // Fetch search results on query change with debounce
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setSearchResults([]);
      setAiOverview('');
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.results);
          setAiOverview(data.aiOverview);
        }
      } catch (err) {
        console.error('[search] Error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const results = useMemo(() => filterSubjects(SUBJECTS, query), [query]);

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

      <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-6 sm:px-8 sm:pt-8">
        {/* MAKAUT Notices Carousel Component */}
        <NoticeDropdown notices={notices} />

        {/* ---------------------------------------------------------------
         * Top bar: brand · search · auth control
         * ------------------------------------------------------------- */}
        <header className="navbar flex flex-col gap-4 rounded-2xl px-4 py-3.5 sm:flex-row sm:items-center sm:gap-5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#4AA6A8]/25 bg-[#4AA6A8]/10">
              <GraduationCap className="h-[18px] w-[18px] text-[#4AA6A8]" />
            </span>
            <span className="whitespace-nowrap text-sm font-semibold tracking-tight text-[#E8E8E5]">
              Notes Hub
            </span>
          </div>

          <div className="flex-1 sm:mx-2 flex flex-col gap-2 relative">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setDropdownOpen(true);
                }}
                onFocus={() => setDropdownOpen(true)}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setDropdownOpen(false);
                  }
                }}
                placeholder="Search by subject, course code, or topic…"
                aria-label="Search subjects"
                className="search-input w-full rounded-xl py-2.5 pl-10 pr-9 text-sm focus:outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    setDropdownOpen(false);
                  }}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#626766] transition hover:bg-white/5 hover:text-[#929694]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Autocomplete Recommendations Dropdown */}
              {dropdownOpen && recommendations.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-xl border border-white/10 bg-[#0D0F10]/95 backdrop-blur-xl p-1.5 shadow-2xl max-h-[300px] overflow-y-auto flex flex-col gap-0.5">
                  {recommendations.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={() => handleSelectRecommendation(item)}
                      className="w-full flex items-center justify-between text-left px-3 py-2 rounded-lg hover:bg-white/5 transition duration-150 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.type === 'subject' && <GraduationCap className="h-4 w-4 text-[#4AA6A8] shrink-0" />}
                        {item.type === 'topic' && <Tag className="h-3.5 w-3.5 text-[#827A9B] shrink-0" />}
                        {item.type === 'notice' && <FileText className="h-3.5 w-3.5 text-[#A58A55] shrink-0" />}
                        {item.type === 'web' && <Sparkles className="h-3.5 w-3.5 text-[#4AA6A8] shrink-0 group-hover:animate-pulse" />}
                        
                        <span className="text-xs font-medium text-slate-200 truncate group-hover:text-[#4AA6A8] transition">
                          {item.label}
                        </span>
                      </div>
                      {item.sublabel && (
                        <span className="text-[10px] text-slate-500 font-medium shrink-0 ml-2">
                          {item.sublabel}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <UserMenu
              user={user}
              loading={loading}
              onSignIn={() => openAuth()}
              onSignOut={signOut}
              onOpenProfile={() => setProfileOpen(true)}
            />
          </div>
        </header>

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
        <section className="pb-9 pt-14 text-center sm:pb-11 sm:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#242728] bg-[#0D0F10] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#929694]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4AA6A8] animate-pulse-ring" />
              Second Semester
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
              <span style={{ color: '#E8E8E5' }}>Semester 2 </span>
              <span style={{ color: '#B8B9B5' }}>Notes </span>
              <span style={{ color: '#4AA6A8' }}>Hub</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#929694] sm:text-lg">
              One portal for all your semester resources, powered by single sign-on.
            </p>
          </motion.div>
        </section>

        {/* ---------------------------------------------------------------
         * Search Results Overlay Section (Local Academic AI Assistant)
         * ------------------------------------------------------------- */}
        <AnimatePresence>
          {query.trim().length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="glass-strong border border-white/[0.06] rounded-2xl p-5 mb-6 bg-[#0D0F10]/95 backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col gap-4"
            >
              {/* Search Panel Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#4AA6A8]" />
                  <h3 className="text-sm font-semibold text-[#E8E8E5]">
                    Local Academic AI Assistant
                  </h3>
                </div>
                {searchLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-t border-b border-[#4AA6A8]" />
                )}
              </div>

              {/* Local AI Overview */}
              {aiOverview && (
                <div className="rounded-xl border border-[#4AA6A8]/20 bg-gradient-to-br from-[#4AA6A8]/5 via-[#827A9B]/5 to-transparent p-4 sm:p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#4AA6A8]/5 blur-2xl rounded-full" />
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#4AA6A8] to-[#827A9B] text-black shadow-md">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        Syllabus AI Assistant
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] font-mono text-slate-500 border border-white/10 uppercase">
                          Local LLM
                        </span>
                      </h4>
                      <div 
                        className="mt-2.5 text-sm text-slate-300 leading-relaxed space-y-2 search-ai-content" 
                        dangerouslySetInnerHTML={{ __html: aiOverview }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Organic Search Hits */}
              <div className="flex flex-col gap-3">
                {searchResults.length > 0 ? (
                  searchResults.map((result, idx) => (
                    <div key={idx} className="group/search-item flex flex-col gap-1 p-3 rounded-xl border border-white/[0.02] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/5 transition duration-200">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSearchLink(result.link);
                          setActiveSearchTitle(result.title);
                        }}
                        className="text-left text-sm font-semibold text-slate-200 hover:text-[#4AA6A8] hover:underline transition truncate flex items-center gap-1.5 w-full"
                      >
                        {result.title}
                        <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover/search-item:opacity-100 transition-opacity duration-200" />
                      </button>
                      <span className="text-[10px] text-slate-500 font-mono truncate max-w-full">
                        {result.link}
                      </span>
                      {result.snippet && (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                          {result.snippet}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  !searchLoading && (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      No results found on the notes sites. Try a different search term.
                    </div>
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------------------------------------------------------------
         * 3D subject carousel — the centerpiece, replacing the old 2x2 grid
         * ------------------------------------------------------------- */}
        <section className="mt-2">
          <div className="mb-4 flex items-baseline justify-between gap-4 px-1">
            <h2 className="text-sm font-semibold tracking-tight text-[#E8E8E5]">
              Your subjects
            </h2>
            <p className="text-xs text-[#626766]">
              {results.length} of {SUBJECTS.length}
              {query && ' matching'}
            </p>
          </div>

          {results.length > 0 ? (
            <SubjectCarousel subjects={results} session={session} onLocked={openAuth} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass flex flex-col items-center rounded-2xl px-6 py-14 text-center"
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
                className="btn-primary mt-5 rounded-lg px-4 py-2 text-sm"
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



        <footer className="mt-10 flex flex-col items-center gap-1.5 text-center">
          <p className="text-xs text-[#626766]">
            Semester 2 Notes Hub · single sign-on across four notes sites
          </p>
          <p className="text-[11px] text-[#626766]">
            Sessions are issued and validated by Supabase Auth.
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



       {/* Web Search Result Iframe Overlay (Glass Lightbox) */}
       <AnimatePresence>
        {activeSearchLink && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-md p-4 sm:p-6"
            onClick={() => setActiveSearchLink(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative flex h-[75vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0D0F10]/40 backdrop-blur-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header bar */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5 bg-black/25">
                <div className="flex flex-col min-w-0 pr-4">
                  <h3 className="truncate text-xs font-bold uppercase tracking-wider text-slate-400">
                    Web Preview
                  </h3>
                  <span className="truncate text-sm font-semibold text-[#E8E8E5] mt-0.5">
                    {activeSearchTitle}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={activeSearchLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-[#4AA6A8] transition hover:bg-white/10"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open Tab
                  </a>
                  <button
                    onClick={() => setActiveSearchLink(null)}
                    aria-label="Close preview"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-[#E8E8E5] transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Iframe body */}
              <div className="flex-1 bg-white relative">
                {/* Fallback note overlay in case iframe is blocked */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/90 text-slate-300 pointer-events-none z-0">
                  <ExternalLink className="h-8 w-8 text-[#4AA6A8] mb-3" />
                  <p className="text-sm font-medium text-white">Loading Web Page Preview</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-md">
                    If the page does not display, the destination website might have blocked embedded previews. Use the &quot;Open Tab&quot; button at the top to access it directly.
                  </p>
                </div>
                <iframe
                  src={activeSearchLink}
                  className="relative z-10 w-full h-full border-0 bg-white"
                  title="Web Page Preview"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
