"use client";

import { useState, useCallback, useRef } from "react";
import type { AnalysisState, ParsedVerdict } from "@/types";
import { demoTickets } from "@/data/tickets";
import { parseVerdictResponse } from "@/lib/parser";
import { TicketQueue } from "@/components/TicketQueue";
import { LoadingState } from "@/components/LoadingState";
import { VerdictCard } from "@/components/VerdictCard";
import { PolicyCards } from "@/components/PolicyCards";
import { ConflictTrace } from "@/components/ConflictTrace";
import { ErrorState } from "@/components/ErrorState";
import { AlgoliaAttribution } from "@/components/AlgoliaAttribution";

export default function Home() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [analysisResult, setAnalysisResult] = useState<ParsedVerdict | null>(
    null,
  );
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [analysisTimeMs, setAnalysisTimeMs] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const analyzeTicket = useCallback(async (ticketId: string) => {
    const ticket = demoTickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    setAnalysisState("loading");
    setAnalysisResult(null);
    setRawResponse(null);
    setAnalysisTimeMs(null);
    startTimeRef.current = Date.now();

    const ticketText = `Subject: ${ticket.subject}\nCustomer: ${ticket.customer} | Product: ${ticket.product} | Purchased: ${ticket.purchaseDate}\n\n"${ticket.message}"`;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketText }),
      });

      const elapsed = Date.now() - startTimeRef.current;
      setAnalysisTimeMs(elapsed);

      if (res.status === 504) {
        setAnalysisState("timeout");
        return;
      }

      if (!res.ok) {
        setAnalysisState("error");
        return;
      }

      const data = await res.json();
      const xml = data.rawXml;
      setRawResponse(xml);

      const parsed = parseVerdictResponse(xml);
      if (!parsed) {
        setAnalysisState("parseFail");
        return;
      }

      setAnalysisResult(parsed);
      setAnalysisState("success");
    } catch {
      setAnalysisTimeMs(Date.now() - startTimeRef.current);
      setAnalysisState("error");
    }
  }, []);

  const handleSelectTicket = useCallback(
    (ticketId: string) => {
      setSelectedTicketId(ticketId);
      analyzeTicket(ticketId);
    },
    [analyzeTicket],
  );

  const handleRetry = useCallback(() => {
    if (selectedTicketId) {
      analyzeTicket(selectedTicketId);
    }
  }, [selectedTicketId, analyzeTicket]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Panel — Ticket Queue */}
      <aside className="w-80 shrink-0 border-r border-slate-700/40 bg-slate-875 flex flex-col">
        {/* App Header */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-emerald-accent"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
            <h1 className="text-lg font-bold tracking-tight text-gray-100">
              PolicyPilot
            </h1>
          </div>
          <p className="mt-0.5 text-[11px] text-gray-500">
            Compliance Decision Engine
          </p>
        </div>

        <TicketQueue
          tickets={demoTickets}
          selectedTicketId={selectedTicketId}
          onSelectTicket={handleSelectTicket}
          isAnalyzing={analysisState === "loading"}
        />
      </aside>

      {/* Right Panel — Analysis Display */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar with ticket context */}
        {selectedTicketId && (
          <div className="shrink-0 px-6 py-3 border-b border-slate-700/30 bg-slate-875/50">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">Analyzing:</span>
              <span className="text-sm font-medium text-gray-300">
                {demoTickets.find((t) => t.id === selectedTicketId)?.subject}
              </span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
            {/* Idle / Onboarding State */}
            {analysisState === "idle" && <OnboardingPanel />}

            {/* Loading State */}
            {analysisState === "loading" && <LoadingState />}

            {/* Success State */}
            {analysisState === "success" && analysisResult && (
              <>
                <VerdictCard verdict={analysisResult} />
                <PolicyCards
                  policies={analysisResult.policies}
                  winningPolicyId={
                    analysisResult.resolution?.winningPolicy ?? null
                  }
                />
                <ConflictTrace
                  conflict={analysisResult.conflict}
                  resolution={analysisResult.resolution}
                />
              </>
            )}

            {/* Error States */}
            {(analysisState === "error" ||
              analysisState === "timeout" ||
              analysisState === "parseFail") && (
              <ErrorState
                type={analysisState}
                rawResponse={rawResponse}
                onRetry={handleRetry}
              />
            )}
          </div>
        </div>

        {/* Footer with attribution */}
        <div className="shrink-0 px-6 py-2 border-t border-slate-700/20">
          <AlgoliaAttribution
            analysisTimeMs={
              analysisState === "success" ||
              analysisState === "error" ||
              analysisState === "timeout" ||
              analysisState === "parseFail"
                ? analysisTimeMs
                : null
            }
          />
        </div>
      </main>
    </div>
  );
}

function OnboardingPanel() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 animate-fade-in-up">
      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
        <svg
          className="w-6 h-6 text-emerald-accent"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-gray-200 mb-2">
        PolicyPilot Decision Engine
      </h2>
      <p className="text-sm text-gray-500 max-w-sm mb-8">
        Select a support ticket on the left to see PolicyPilot analyze it
        against the policy database and produce a structured compliance verdict.
      </p>

      <div className="w-full max-w-md space-y-3 text-left">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 px-1">
          How It Works
        </h3>
        {[
          {
            step: "1",
            title: "Multi-Step Retrieval",
            desc: "Algolia Agent Studio searches general policies, product warranties, and situational overrides",
          },
          {
            step: "2",
            title: "Conflict Detection",
            desc: "Identifies when policies at different layers produce contradictory outcomes",
          },
          {
            step: "3",
            title: "Resolution & Verdict",
            desc: "Applies a principled hierarchy — product-specific and situational policies override general ones",
          },
        ].map(({ step, title, desc }) => (
          <div
            key={step}
            className="flex items-start gap-3 rounded-lg border border-slate-700/20 bg-slate-800/20 p-3.5"
          >
            <span className="shrink-0 w-6 h-6 rounded-md bg-slate-700/50 flex items-center justify-center text-xs font-mono font-bold text-gray-400">
              {step}
            </span>
            <div>
              <p className="text-sm font-medium text-gray-300">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
