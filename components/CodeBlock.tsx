'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked (insecure origin / permissions) — the code is still selectable.
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#242728] bg-[#0D0F10]">
      <div className="flex items-center justify-between border-b border-[#1C1F20] px-3.5 py-2">
        <span className="font-mono text-[11px] text-slate-500">{label ?? 'snippet'}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[12.5px] leading-relaxed">
        <code className="font-mono text-slate-300">{code}</code>
      </pre>
    </div>
  );
}
