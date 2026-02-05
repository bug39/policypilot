"use client";

interface AlgoliaAttributionProps {
  analysisTimeMs?: number | null;
}

export function AlgoliaAttribution({
  analysisTimeMs,
}: AlgoliaAttributionProps) {
  return (
    <div className="flex items-center justify-between px-1 py-2">
      {analysisTimeMs != null ? (
        <p className="text-[11px] text-gray-600">
          Analysis completed in{" "}
          <span className="text-gray-500 font-mono">
            {(analysisTimeMs / 1000).toFixed(1)}s
          </span>
        </p>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
        <span>Powered by</span>
        <span className="font-semibold text-gray-500">
          Algolia Agent Studio
        </span>
      </div>
    </div>
  );
}
