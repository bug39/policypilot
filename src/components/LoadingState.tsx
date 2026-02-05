"use client";

export function LoadingState() {
  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Verdict skeleton */}
      <div className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-6">
        <div className="flex items-center gap-3">
          <div className="h-7 w-28 rounded-md bg-slate-700/60 animate-shimmer" />
          <div className="h-5 w-24 rounded bg-slate-700/40 animate-shimmer" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-4 w-full rounded bg-slate-700/30 animate-shimmer" />
          <div className="h-4 w-3/4 rounded bg-slate-700/30 animate-shimmer" />
        </div>
      </div>

      {/* Policy cards skeleton */}
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-700/30 bg-slate-800/20 p-4"
          >
            <div className="flex items-center gap-2">
              <div className="h-5 w-16 rounded bg-slate-700/50 animate-shimmer" />
              <div className="h-4 w-40 rounded bg-slate-700/30 animate-shimmer" />
            </div>
            <div className="mt-3 h-3 w-full rounded bg-slate-700/20 animate-shimmer" />
            <div className="mt-1.5 h-3 w-2/3 rounded bg-slate-700/20 animate-shimmer" />
          </div>
        ))}
      </div>

      {/* Conflict skeleton */}
      <div className="rounded-lg border border-slate-700/30 bg-slate-800/20 p-4">
        <div className="h-4 w-32 rounded bg-slate-700/40 animate-shimmer" />
        <div className="mt-3 h-3 w-full rounded bg-slate-700/20 animate-shimmer" />
      </div>

      {/* Status */}
      <div className="flex items-center justify-center gap-3 py-3">
        <div className="relative">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-accent/70" />
          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-accent animate-ping" />
        </div>
        <p className="text-sm text-gray-400">
          Analyzing ticket against policy database...
        </p>
      </div>
    </div>
  );
}
