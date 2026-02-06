"use client";

import type { ParsedPolicy } from "@/types";

interface PolicyCardsProps {
  policies: ParsedPolicy[];
  winningPolicyId: string | null;
}

export function PolicyCards({ policies, winningPolicyId }: PolicyCardsProps) {
  return (
    <div className="space-y-2.5 animate-fade-in-up stagger-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 px-1">
        Policies Evaluated
      </h3>
      {policies.map((policy, i) => {
        const isWinner = policy.clauseId === winningPolicyId;
        const applies = policy.applies;

        return (
          <div
            key={`${policy.clauseId}-${i}`}
            className={`
              rounded-lg border p-4 transition-all
              ${
                isWinner
                  ? "bg-emerald-500/5 border-emerald-500/25 shadow-[0_0_12px_rgba(52,211,153,0.04)]"
                  : applies
                    ? "bg-slate-800/30 border-slate-600/30"
                    : "bg-slate-800/15 border-slate-700/20"
              }
            `}
          >
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Clause ID badge */}
              <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded bg-slate-700/50 text-gray-300">
                {policy.clauseId}
              </span>

              {/* Policy name */}
              <span
                className={`text-sm font-medium ${applies ? "text-gray-200" : "text-gray-500"}`}
              >
                {policy.policyName}
              </span>

              {/* Status indicators */}
              <div className="ml-auto flex items-center gap-2">
                {isWinner && (
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Prevails
                  </span>
                )}
                {applies ? (
                  <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    Applies
                  </span>
                ) : (
                  <span className="text-gray-600 text-xs font-medium flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Overridden
                  </span>
                )}
              </div>
            </div>

            {/* Effect + Reason */}
            {policy.effect && (
              <p className={`mt-2 text-[11px] font-mono ${applies ? "text-gray-500" : "text-gray-700"}`}>
                {policy.effect}
              </p>
            )}
            <p
              className={`mt-1.5 text-xs leading-relaxed ${applies ? "text-gray-400" : "text-gray-600"}`}
            >
              {policy.reason}
            </p>
          </div>
        );
      })}
    </div>
  );
}
