'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  GraduationCap,
  History,
  Loader2,
  Save,
  Trash2,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import type { SupabaseClient, User } from '@supabase/supabase-js';

type Props = {
  open: boolean;
  onClose: () => void;
  user: User | null;
  supabase: SupabaseClient | null;
  onSignOut: () => void;
};

type Profile = {
  full_name: string;
  email: string;
  dob: string;
  college: string;
  year: string;
  semester: string;
};

type StudyLog = {
  id: string;
  subject_id: string;
  subject_title: string;
  topic_title: string | null;
  url: string;
  timestamp: string;
};

const COLLEGES = [
  "Maulana Abul Kalam Azad University of Technology (MAKAUT)",
  "Heritage Institute of Technology (HIT)",
  "Institute of Engineering and Management (IEM)",
  "Techno Main Salt Lake (TMSL)",
  "Netaji Subhash Engineering College (NSEC)",
  "Jadavpur University (JU)",
  "Calcutta University (CU)",
  "Haldia Institute of Technology (HIT Haldia)",
  "Kalyani Government Engineering College (KGEC)",
  "Jalpaiguri Government Engineering College (JGEC)",
  "Massachusetts Institute of Technology (MIT), USA",
  "Stanford University, USA",
  "Harvard University, USA",
  "California Institute of Technology (Caltech), USA",
  "University of Oxford, UK",
  "University of Cambridge, UK",
  "Imperial College London, UK",
  "ETH Zurich, Switzerland",
  "National University of Singapore (NUS)",
  "Nanyang Technological University (NTU), Singapore",
  "University of Toronto, Canada",
  "Tsinghua University, China",
  "Peking University, China",
  "University of Tokyo, Japan",
  "Indian Institute of Technology Kharagpur (IIT KGP)",
  "Indian Institute of Technology Bombay (IIT B)",
  "Indian Institute of Technology Delhi (IIT D)",
  "Other College / University"
];

export function ProfileModal({ open, onClose, user, supabase, onSignOut }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#090A0B]/80 backdrop-blur-sm"
          />
          <ProfilePanel
            user={user}
            supabase={supabase}
            onClose={onClose}
            onSignOut={onSignOut}
          />
        </div>
      )}
    </AnimatePresence>
  );
}

function ProfilePanel({
  user,
  supabase,
  onClose,
  onSignOut,
}: Omit<Props, 'open'>) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [college, setCollege] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');

  const [history, setHistory] = useState<StudyLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !user) return;

    const loadProfileAndHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch Profile
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileErr) throw profileErr;

        if (profile) {
          setFullName(profile.full_name || user.user_metadata?.full_name || '');
          setEmail(profile.email || user.email || '');
          setDob(profile.dob || '');
          setCollege(profile.college || '');
          setYear(profile.year || '');
          setSemester(profile.semester || '');
        } else {
          // Fallback if profile row wasn't triggered
          setFullName(user.user_metadata?.full_name || '');
          setEmail(user.email || '');
        }

        // 2. Fetch Study History
        const { data: historyData, error: historyErr } = await supabase
          .from('study_history')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });

        if (historyErr) {
          console.error('[profile] Failed to load study history:', historyErr);
        } else if (historyData) {
          setHistory(historyData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };

    loadProfileAndHistory();
  }, [supabase, user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !user) return;

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          dob: dob || null,
          college,
          year,
          semester,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateErr) throw updateErr;

      setNotice('Profile updated successfully.');
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!supabase || !user) return;

    setDeleting(true);
    setError(null);

    try {
      const { error: deleteErr } = await supabase.rpc('delete_user_account');
      if (deleteErr) throw deleteErr;

      onSignOut();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (loading) {
    return (
      <div className="glass-strong relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#4AA6A8]" />
        <span className="mt-4 text-sm text-[#929694] font-medium tracking-wide">Loading Profile...</span>
      </div>
    );
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="User Profile"
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className="glass-strong relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl max-h-[90vh] flex flex-col"
    >
      {/* Top Hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-[#242728]" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-2">
          <UserIcon className="h-5 w-5 text-[#4AA6A8]" />
          <h2 className="text-lg font-semibold tracking-tight text-[#E8E8E5]">Your Profile</h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close profile dialog"
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content scroll container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-400/25 bg-rose-500/[0.08] px-3.5 py-2.5 text-sm text-rose-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="flex items-start gap-2 rounded-xl border border-[#6D9B82]/25 bg-[#6D9B82]/[0.08] px-3.5 py-2.5 text-sm text-[#6D9B82]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Edit Profile Form */}
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-white mb-4 flex items-center gap-1.5">
              <span>Personal Details</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#929694]">
                  Full Name (Read-only)
                </label>
                <input
                  type="text"
                  disabled
                  value={fullName}
                  className="search-input w-full rounded-xl py-2.5 px-3 text-sm bg-white/[0.02] border border-white/5 text-slate-450 cursor-not-allowed opacity-60"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#929694]">
                  Email address (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="search-input w-full rounded-xl py-2.5 px-3 text-sm bg-white/[0.02] border border-white/5 text-slate-450 cursor-not-allowed opacity-60"
                />
              </div>

              <div>
                <label htmlFor="prof-dob" className="mb-1.5 block text-xs font-medium text-[#929694]">
                  Date of Birth
                </label>
                <input
                  id="prof-dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="search-input w-full rounded-xl py-2.5 px-3 text-sm focus:outline-none [color-scheme:dark]"
                />
              </div>

              <div>
                <label htmlFor="prof-college" className="mb-1.5 block text-xs font-medium text-[#929694]">
                  College / University
                </label>
                <select
                  id="prof-college"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="search-input w-full rounded-xl py-2.5 px-3 text-sm focus:outline-none bg-[#0D0F10] border border-white/10 text-slate-200"
                >
                  <option value="">Select your college</option>
                  {COLLEGES.map((clg) => (
                    <option key={clg} value={clg}>{clg}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="prof-year" className="mb-1.5 block text-xs font-medium text-[#929694]">
                    Year
                  </label>
                  <select
                    id="prof-year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="search-input w-full rounded-xl py-2.5 px-3 text-sm focus:outline-none bg-[#0D0F10] border border-white/10 text-slate-200"
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="prof-semester" className="mb-1.5 block text-xs font-medium text-[#929694]">
                    Semester
                  </label>
                  <select
                    id="prof-semester"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="search-input w-full rounded-xl py-2.5 px-3 text-sm focus:outline-none bg-[#0D0F10] border border-white/10 text-slate-200"
                  >
                    <option value="">Select Sem</option>
                    {Array.from({ length: 8 }, (_, i) => (
                      <option key={i + 1} value={`Semester ${i + 1}`}>{`Semester ${i + 1}`}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-contrast flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </button>
            </form>
          </div>

          {/* Study History Timeline */}
          <div className="flex flex-col h-full min-h-[300px]">
            <h3 className="text-sm font-semibold tracking-tight text-white mb-4 flex items-center gap-1.5">
              <History className="h-4 w-4 text-[#4AA6A8]" />
              <span>Recent Study Activity</span>
            </h3>

            <div className="flex-1 glass rounded-xl overflow-hidden flex flex-col p-4">
              {history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <BookOpen className="h-8 w-8 text-slate-600 mb-2" />
                  <p className="text-xs font-medium text-slate-400">No notes studied yet</p>
                  <p className="text-[11px] text-slate-500 mt-1">Open subject links on the hub to view notes and build your history log.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[360px] pr-1.5 custom-scrollbar">
                  {history.map((log) => {
                    const date = new Date(log.timestamp);
                    return (
                      <div key={log.id} className="relative pl-4 border-l border-white/10 group">
                        <div className="absolute -left-1 top-1.5 h-2 w-2 rounded-full bg-[#4AA6A8] transition-transform group-hover:scale-125" />
                        <div className="text-[13px] font-semibold text-slate-200">
                          {log.topic_title ? (
                            <>
                              Studied <span className="text-[#4AA6A8]">{log.topic_title}</span>
                              <span className="text-slate-500 text-xs font-normal block mt-0.5">
                                in {log.subject_title}
                              </span>
                            </>
                          ) : (
                            <>
                              Visited <span className="text-slate-100">{log.subject_title}</span>
                            </>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-1">
                          {date.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Footer Panel */}
      <div className="border-t border-white/[0.06] bg-[#0E1011]/45 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Danger Zone</h4>
          <p className="text-[11px] text-[#929694] mt-0.5 leading-relaxed">
            Deleting your account will permanently wipe all bookmarks, study notes, quiz history, and progress records.
          </p>
        </div>

        <div>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Account
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
                )}
                Confirm Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
