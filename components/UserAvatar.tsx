'use client';

import type { User } from '@supabase/supabase-js';

export function displayName(user: User): string {
  const meta = user.user_metadata ?? {};
  return (meta.full_name as string) || (meta.name as string) || user.email?.split('@')[0] || 'Student';
}

export function avatarUrl(user: User): string | null {
  const meta = user.user_metadata ?? {};
  return (meta.avatar_url as string) || (meta.picture as string) || null;
}

/** Round avatar with a ring; falls back to the first letter when there is no image. */
export function UserAvatar({ user, size = 36 }: { user: User; size?: number }) {
  const src = avatarUrl(user);
  const initial = displayName(user).charAt(0).toUpperCase();

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- external avatar hosts, no optimisation needed
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className="rounded-full object-cover ring-1 ring-white/15"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      aria-hidden
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/85 to-blue-500/85 font-semibold text-[#05121F] ring-1 ring-white/15"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initial}
    </div>
  );
}
