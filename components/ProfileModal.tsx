'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Save,
  Trash2,
  Upload,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
  "Haldia Institute of Technology (HIT Haldia)",
  "Kalyani Government Engineering College (KGEC)",
  "Jalpaiguri Government Engineering College (JGEC)",
  "Government College of Engineering and Leather Technology (GCELT)",
  "Government College of Engineering and Ceramic Technology (GCECT)",
  "RCC Institute of Information Technology (RCCIIT)",
  "Narula Institute of Technology (NIT Agarpara)",
  "MCKV Institute of Engineering (MCKVIE)",
  "Asansol Engineering College (AEC)",
  "Meghnad Saha Institute of Technology (MSIT)",
  "Academy of Technology (AOT)",
  "Techno International New Town (TINT)",
  "St. Thomas' College of Engineering and Technology (STCET)",
  "B.P. Poddar Institute of Management and Technology (BPPIMT)",
  "Other MAKAUT Affiliated College"
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

  const [newAvatar, setNewAvatar] = useState<string | null | undefined>(undefined);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !user) return;

    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch Profile
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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [supabase, user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    setAvatarLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const size = 150; // 150x150 is optimal size for user avatars
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setError('Failed to process image.');
            setAvatarLoading(false);
            return;
          }

          // Center crop to square aspect ratio
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setNewAvatar(dataUrl);
        } catch (err) {
          setError('Error processing image.');
        } finally {
          setAvatarLoading(false);
        }
      };
      img.onerror = () => {
        setError('Failed to load image.');
        setAvatarLoading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setError('Failed to read file.');
      setAvatarLoading(false);
    };
    reader.readAsDataURL(file);
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !user) return;

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      // 1. Update Profile in DB
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

      // 2. Save Custom Profile Picture to User Metadata if changed
      if (newAvatar !== undefined) {
        const { error: authErr } = await supabase.auth.updateUser({
          data: { avatar_url: newAvatar }
        });
        if (authErr) throw authErr;
        setNewAvatar(undefined);
      }

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

  const currentAvatarSrc = newAvatar !== undefined ? newAvatar : (user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null);
  const initial = (fullName || displayName(user)).charAt(0).toUpperCase() || 'S';

  function displayName(userObj: User | null): string {
    if (!userObj) return 'Student';
    const meta = userObj.user_metadata ?? {};
    return (meta.full_name as string) || (meta.name as string) || userObj.email?.split('@')[0] || 'Student';
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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Profile Picture & Display Details */}
          <div className="md:col-span-4 flex flex-col items-center text-center p-5 rounded-2xl border border-white/5 bg-white/[0.01]">
            <div className="relative group w-32 h-32 mb-4 shrink-0">
              {currentAvatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentAvatarSrc}
                  alt="Profile Avatar"
                  className="w-full h-full rounded-full object-cover border-2 border-[#4AA6A8]/45 shadow-lg transition-transform group-hover:scale-[1.02]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/85 to-blue-500/85 text-4xl font-semibold text-[#05121F] border-2 border-white/10 shadow-lg transition-transform group-hover:scale-[1.02]">
                  {initial}
                </div>
              )}

              {/* Hover overlay trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white cursor-pointer border border-white/10"
              >
                <Camera className="h-6 w-6 mb-1 text-slate-200" />
                <span className="text-[10px] font-medium tracking-wide text-slate-200">Change Photo</span>
              </button>
            </div>

            {/* Upload Buttons */}
            <div className="flex flex-col gap-2 w-full max-w-[180px]">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] py-1.5 px-3 text-xs font-semibold text-slate-200 transition hover:bg-white/5 hover:border-white/20 disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5 text-[#4AA6A8]" />
                Upload Image
              </button>
              
              {currentAvatarSrc && (
                <button
                  type="button"
                  onClick={() => setNewAvatar(null)}
                  className="text-xs font-medium text-rose-450 hover:text-rose-400 transition py-0.5"
                >
                  Remove Image
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Read-Only display info */}
            <div className="mt-5 w-full border-t border-white/[0.05] pt-4 text-left">
              <h4 className="text-[11px] font-medium text-[#929694] uppercase tracking-wider">Full Name</h4>
              <p className="text-sm font-semibold text-slate-200 truncate mt-0.5 leading-snug">{fullName || 'Student'}</p>
              
              <h4 className="text-[11px] font-medium text-[#929694] uppercase tracking-wider mt-3.5">Email Address</h4>
              <p className="text-sm font-medium text-slate-400 truncate mt-0.5 leading-snug">{email}</p>
            </div>
          </div>

          {/* Right Column: Editable details */}
          <div className="md:col-span-8 space-y-4">
            <h3 className="text-sm font-semibold tracking-tight text-white mb-1">
              Personal Details
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
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

              <div className="pt-2">
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
              </div>
            </form>
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
