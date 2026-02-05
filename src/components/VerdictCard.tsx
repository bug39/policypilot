"use client";

import type { ParsedVerdict } from "@/types";

const VERDICT_STYLES = {
  APPROVED: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-300 ring-emerald-500/30",
    glow: "shadow-[0_0_20px_rgba(52,211,153,0.08)]",
  },
  DENIED: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    badge: "bg-red-500/20 text-red-300 ring-red-500/30",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.08)]",
  },
  ESCALATE: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-300 ring-amber-500/30",
    glow: "shadow-[0_0_20px_rgba(251,191,36,0.08)]",
  },
} as const;

function formatVerdictType(vt: string): string {
  return vt
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface VerdictCardProps {
  verdict: ParsedVerdict;
}

export function VerdictCard({ verdict }: VerdictCardProps) {
  const style = VERDICT_STYLES[verdict.verdict];

  return (
    <div
      className={`
        rounded-xl border p-5
        ${style.bg} ${style.border} ${style.glow}
        animate-fade-in-up
      `}
    >
      <div className="flex items-center gap-3">
        <span
          className={`
            inline-flex items-center px-3 py-1 rounded-md
            text-sm font-semibold font-mono tracking-wider
            ring-1 ring-inset
            ${style.badge}
          `}
        >
          {verdict.verdict}
        </span>
        <span className="text-sm text-gray-400">
          {formatVerdictType(verdict.verdictType)}
        </span>
      </div>

      <p className={`mt-3.5 text-[15px] leading-relaxed ${style.text}`}>
        {verdict.summary}
      </p>

      {verdict.recommendedAction && (
        <div className="mt-4 pt-3.5 border-t border-slate-700/30">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1.5">
            Recommended Action
          </p>
          <p className="text-sm text-gray-300 leading-relaxed">
            {verdict.recommendedAction}
          </p>
        </div>
      )}
    </div>
  );
}
