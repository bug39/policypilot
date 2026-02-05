"use client";

interface ErrorStateProps {
  type: "error" | "timeout" | "parseFail";
  rawResponse?: string | null;
  onRetry: () => void;
}

const ERROR_CONTENT = {
  error: {
    title: "Analysis Failed",
    message: "Something went wrong while analyzing this ticket. Please try again.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  timeout: {
    title: "Analysis Timed Out",
    message: "Analysis is taking longer than expected. Please try again.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  parseFail: {
    title: "Structured Parsing Failed",
    message: "The response could not be parsed into structured output. Showing raw response below.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
};

export function ErrorState({ type, rawResponse, onRetry }: ErrorStateProps) {
  const content = ERROR_CONTENT[type];
  const isWarning = type === "parseFail";

  return (
    <div className="animate-fade-in-up">
      <div
        className={`
          rounded-xl border p-5
          ${isWarning ? "bg-amber-500/5 border-amber-500/20" : "bg-red-500/5 border-red-500/20"}
        `}
      >
        <div className="flex items-start gap-3">
          <div className={isWarning ? "text-amber-400" : "text-red-400"}>
            {content.icon}
          </div>
          <div className="flex-1">
            <h3
              className={`text-sm font-semibold ${isWarning ? "text-amber-300" : "text-red-300"}`}
            >
              {content.title}
            </h3>
            <p className="mt-1 text-xs text-gray-400">{content.message}</p>
          </div>
          <button
            onClick={onRetry}
            className={`
              shrink-0 px-3 py-1.5 rounded-md text-xs font-medium
              transition-colors
              ${
                isWarning
                  ? "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                  : "bg-red-500/10 text-red-300 hover:bg-red-500/20"
              }
            `}
          >
            Retry
          </button>
        </div>
      </div>

      {type === "parseFail" && rawResponse && (
        <div className="mt-3 rounded-lg border border-slate-700/30 bg-slate-800/30 p-4 max-h-80 overflow-auto">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 mb-2">
            Raw Response
          </p>
          <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap break-words leading-relaxed">
            {rawResponse}
          </pre>
        </div>
      )}
    </div>
  );
}
