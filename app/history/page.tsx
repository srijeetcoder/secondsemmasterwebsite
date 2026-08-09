'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  ArrowLeft, 
  Trash2, 
  Clock, 
  BookOpen, 
  ExternalLink,
  Loader2,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { AuthModal } from '@/components/AuthModal';
import { BackgroundMesh } from '@/components/BackgroundMesh';

interface HistoryItem {
  id: number;
  subject_id: string;
  subject_title: string;
  topic_title: string | null;
  url: string;
  timestamp: string;
}

export default function HistoryPage() {
  const { supabase, session, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Fetch study history from Supabase
  const fetchHistory = async () => {
    if (!supabase || !user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('study_history')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching study history:', error);
      } else if (data) {
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to query history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchHistory();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  // Clear history function
  const handleClearHistory = async () => {
    if (!supabase || !user || !confirm('Are you sure you want to clear your study history?')) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('study_history')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting history:', error);
        alert('Failed to clear history. Please try again.');
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error('Failed to delete history:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Group history items by date string
  const groupedHistory = history.reduce((groups: { [key: string]: HistoryItem[] }, item) => {
    const date = new Date(item.timestamp).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {});

  return (
    <>
      <BackgroundMesh />
      
      <div className="mx-auto w-full max-w-4xl px-5 pb-20 pt-6 sm:px-8 sm:pt-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="navbar flex items-center justify-between rounded-2xl px-5 py-3.5 mb-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/')}
              className="p-2 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.09] hover:border-white/20 transition-all flex items-center justify-center text-slate-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10">
                <Clock className="h-4 w-4 text-cyan-400" />
              </span>
              <span className="text-sm font-semibold tracking-tight text-[#E8E8E5]">
                Study History Logs
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && history.length > 0 && (
              <button
                disabled={isDeleting}
                onClick={handleClearHistory}
                className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/30 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear Logs
              </button>
            )}
          </div>
        </header>

        {/* Loading State */}
        {(authLoading || loading) ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
            <p className="mt-4 text-sm text-slate-400">Loading your study logs...</p>
          </div>
        ) : !user ? (
          /* Locked State for Logged Out Users */
          <div className="flex-1 glass flex flex-col items-center justify-center rounded-2xl px-6 py-20 text-center max-w-lg mx-auto w-full my-auto">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/5 mb-4 text-cyan-400 animate-pulse">
              <GraduationCap className="h-6 w-6" />
            </span>
            <h2 className="text-base font-bold text-slate-100">Access Restricted</h2>
            <p className="mt-2 text-xs text-slate-400 max-w-sm leading-relaxed">
              Study history logging and retrieval requires a verified NotesHub account. Please sign in to view your learning analytics.
            </p>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="mt-6 bg-cyan-500 text-slate-950 px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-cyan-400 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/10"
            >
              Sign In to Account
            </button>
          </div>
        ) : history.length === 0 ? (
          /* Empty State */
          <div className="flex-1 glass flex flex-col items-center justify-center rounded-2xl px-6 py-20 text-center">
            <BookOpen className="h-8 w-8 text-slate-655" />
            <p className="mt-4 text-sm font-semibold text-slate-300">No study history recorded yet</p>
            <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
              Any topics, PYQs, or notes you open across subjects will be logged right here.
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 bg-cyan-500 text-slate-950 px-6 py-2 rounded-xl font-bold text-xs hover:bg-cyan-400 transition-all"
            >
              Explore Subjects
            </button>
          </div>
        ) : (
          /* History logs List grouped by Date */
          <div className="space-y-8 flex-1">
            {Object.entries(groupedHistory).map(([date, items]) => (
              <div key={date} className="space-y-3">
                <div className="flex items-center gap-2 px-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Calendar className="h-3.5 w-3.5 text-cyan-500" />
                  <span>{date}</span>
                </div>
                
                <div className="space-y-2">
                  {items.map((item) => (
                    <div 
                      key={item.id}
                      className="glass p-4 flex items-center justify-between gap-4 text-left transition-all"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            {item.subject_id}
                          </span>
                          <span className="text-xs font-semibold text-slate-200">
                            {item.subject_title}
                          </span>
                        </div>
                        {item.topic_title && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">
                            Focused Topic: <strong className="text-slate-300">{item.topic_title}</strong>
                          </p>
                        )}
                        <span className="text-[9px] text-slate-500 font-mono mt-1">
                          Opened at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <a 
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-white/[0.04] border border-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/20 text-slate-400 hover:text-cyan-400 transition-all flex items-center justify-center shrink-0"
                        title="Open document"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="mt-12 text-center">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1 font-mono">
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
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        supabase={supabase}
        reason="View study history logs"
      />
    </>
  );
}
