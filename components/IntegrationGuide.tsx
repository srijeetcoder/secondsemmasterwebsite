'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { CodeBlock } from './CodeBlock';

const ENV_SNIPPET = `# .env.local  (hub AND every child notes site — identical values)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key`;

const CHILD_SNIPPET = `// Child notes site — run this once, as early as possible on load.
// No database, no user table, no auth UI needed on this site.
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function adoptSessionFromHub() {
  // The hub puts tokens in the URL hash by default, query string optionally.
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const query = new URLSearchParams(window.location.search);

  const access_token = hash.get('access_token') ?? query.get('access_token');
  const refresh_token = hash.get('refresh_token') ?? query.get('refresh_token');

  if (access_token && refresh_token) {
    // Supabase verifies the JWT against the same project, then stores and
    // auto-refreshes it locally. The user is now signed in on this site.
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });

    // Scrub the tokens out of the address bar and browser history.
    window.history.replaceState({}, document.title, window.location.pathname);

    if (error) console.error('Handoff failed:', error.message);
  }

  const { data } = await supabase.auth.getUser();
  return data.user; // null => bounce them back to the hub to sign in
}`;

const REDIRECT_SNIPPET = `Supabase Dashboard -> Authentication -> URL Configuration

Site URL:
  https://<your-hub-domain>

Redirect URLs (add every one of these):
  http://localhost:3000/auth/callback
  https://<your-hub-domain>/auth/callback
  https://cnotesbycsrijeet.vercel.app
  https://chem-notes-nhm8.vercel.app
  https://pracchem.vercel.app
  https://mathsnotesbysrijeet.vercel.app`;

const STEPS = [
  {
    n: '01',
    title: 'Configure Supabase credentials',
    body: (
      <>
        <p className="mb-3 text-sm leading-relaxed text-slate-400">
          Grab the <span className="text-slate-200">Project URL</span> and{' '}
          <span className="text-slate-200">anon public</span> key from{' '}
          <span className="text-slate-200">Supabase → Settings → API</span>, then drop them into{' '}
          <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-cyan-300">
            .env.local
          </code>{' '}
          at the project root. Restart <code className="font-mono text-[12px]">npm run dev</code>{' '}
          afterwards — Next.js only inlines env vars at boot.
        </p>
        <CodeBlock code={ENV_SNIPPET} label=".env.local" />
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Use the <span className="text-slate-200">same two values</span> on all four notes sites.
          That shared project is the whole trick: one user table, one session, five front-ends.
          Never expose the <code className="font-mono text-[12px]">service_role</code> key in a{' '}
          <code className="font-mono text-[12px]">NEXT_PUBLIC_</code> variable.
        </p>
      </>
    ),
  },
  {
    n: '02',
    title: 'Whitelist the redirect URLs',
    body: (
      <>
        <p className="mb-3 text-sm leading-relaxed text-slate-400">
          Supabase refuses to redirect anywhere it does not recognise, so register the hub callback
          and all four destination sites.
        </p>
        <CodeBlock code={REDIRECT_SNIPPET} label="Supabase dashboard" />
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          For Google sign-in, also enable the Google provider under{' '}
          <span className="text-slate-200">Authentication → Providers</span> and paste your OAuth
          client ID and secret from the Google Cloud console.
        </p>
      </>
    ),
  },
  {
    n: '03',
    title: 'Consume the session on each child site',
    body: (
      <>
        <p className="mb-3 text-sm leading-relaxed text-slate-400">
          When a card is clicked, the hub appends{' '}
          <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-cyan-300">
            #access_token=…&amp;refresh_token=…
          </code>{' '}
          to the destination URL. The child site hands those two tokens to{' '}
          <code className="font-mono text-[12px]">setSession()</code> and is instantly
          authenticated — Supabase validates the JWT and takes over refreshing it.
        </p>
        <CodeBlock code={CHILD_SNIPPET} label="lib/adopt-session.ts" />
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          The hash fragment is used rather than a query string because fragments are never sent to
          the server, keeping tokens out of server and proxy logs. The snippet reads both, so you
          can flip <code className="font-mono text-[12px]">HANDOFF_MODE</code> in{' '}
          <code className="font-mono text-[12px]">lib/handoff.ts</code> to{' '}
          <code className="font-mono text-[12px]">&apos;query&apos;</code> without touching the child
          sites.
        </p>
      </>
    ),
  },
];

export function IntegrationGuide() {
  const [open, setOpen] = useState(false);

  return (
    <section className="glass overflow-hidden rounded-2xl">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.02] sm:px-6"
      >
        <div className="flex items-center gap-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
            <BookOpen className="h-[18px] w-[18px] text-slate-300" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-white">Developer integration guide</h2>
            <p className="mt-0.5 text-sm text-slate-400">
              Wire up Supabase and teach the child sites to accept the shared session.
            </p>
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-7 border-t border-white/[0.06] px-5 py-6 sm:px-6">
              {STEPS.map((step) => (
                <div key={step.n} className="flex gap-4">
                  <span className="mt-0.5 font-mono text-xs font-semibold text-cyan-400/70">
                    {step.n}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-2 text-sm font-semibold text-white">{step.title}</h3>
                    {step.body}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
