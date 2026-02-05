"use client";

import type { ParsedVerdict } from "@/types";

interface ConflictTraceProps {
  conflict: ParsedVerdict["conflict"];
  resolution: ParsedVerdict["resolution"];
}

export function ConflictTrace({ conflict, resolution }: ConflictTraceProps) {
  if (!conflict.exists) {
    return (
      <div className="rounded-lg border border-slate-700/20 bg-slate-800/15 p-4 animate-fade-in-up stagger-3">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
          <span className="text-sm text-gray-500">
            No policy conflicts detected — standard policy applied
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 animate-fade-in-up stagger-3">
      <div className="flex items-center gap-2 mb-3">
        <svg
          className="w-4 h-4 text-amber-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
        <h3 className="text-sm font-semibold text-amber-300">
          Conflict Detected
        </h3>
      </div>

      <p className="text-xs text-amber-200/70 leading-relaxed">
        {conflict.description}
      </p>

      {resolution && (
        <div className="mt-3 pt-3 border-t border-amber-500/10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
              Resolution
            </span>
            {resolution.winningPolicy && (
              <span className="font-mono text-[11px] text-emerald-300/80 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                {resolution.winningPolicy}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            {resolution.ruleApplied}
          </p>
        </div>
      )}
    </div>
  );
}
