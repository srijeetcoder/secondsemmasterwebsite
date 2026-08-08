'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, GraduationCap, Search, SearchX, X } from 'lucide-react';
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

          <div className="relative flex-1 sm:mx-2">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by subject, course code, or topic…"
              aria-label="Search subjects"
              className="search-input w-full rounded-xl py-2.5 pl-10 pr-9 text-sm focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#626766] transition hover:bg-white/5 hover:text-[#929694]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
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
    </>
  );
}
