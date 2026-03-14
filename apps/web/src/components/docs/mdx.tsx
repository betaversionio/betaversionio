'use client';

import { type ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { Info, AlertTriangle, Lightbulb, Check, Copy } from 'lucide-react';

/* ─── Callout ────────────────────────────────────────────────── */

const calloutStyles = {
  info: { border: 'border-l-blue-500', icon: Info, bg: 'bg-blue-500/5' },
  warning: { border: 'border-l-amber-500', icon: AlertTriangle, bg: 'bg-amber-500/5' },
  tip: { border: 'border-l-emerald-500', icon: Lightbulb, bg: 'bg-emerald-500/5' },
};

interface CalloutProps {
  type?: keyof typeof calloutStyles;
  children: ReactNode;
}

export function Callout({ type = 'info', children }: CalloutProps) {
  const style = calloutStyles[type];
  const Icon = style.icon;

  return (
    <div className={cn('my-6 rounded-lg border border-l-4 p-4', style.border, style.bg)}>
      <div className="flex gap-3">
        <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <div className="text-sm leading-relaxed [&>p]:m-0">{children}</div>
      </div>
    </div>
  );
}

/* ─── CodeBlock ──────────────────────────────────────────────── */

interface CodeBlockProps {
  children: string;
  title?: string;
}

export function CodeBlock({ children, title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <figure className="group relative my-6 overflow-hidden rounded-lg border-0 bg-code text-code-foreground text-sm">
      {title && (
        <figcaption className="border-b border-border/30 px-4 py-2.5 font-mono text-sm text-code-foreground">
          {title}
        </figcaption>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={copy}
          className="absolute top-3 right-3 z-10 flex size-7 items-center justify-center rounded-md bg-code text-code-foreground opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-70"
          aria-label="Copy code"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
        <pre className="overflow-x-auto px-4 py-3.5 leading-relaxed">
          <code className="font-mono">{children}</code>
        </pre>
      </div>
    </figure>
  );
}

/* ─── DocTable ───────────────────────────────────────────────── */

export function DocTable({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 w-full overflow-y-auto rounded-lg border">
      <table className="relative w-full overflow-hidden border-none text-sm [&_tbody_tr:last-child]:border-b-0">
        {children}
      </table>
    </div>
  );
}
