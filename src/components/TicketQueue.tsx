"use client";

import type { DemoTicket } from "@/types";

interface TicketQueueProps {
  tickets: DemoTicket[];
  selectedTicketId: string | null;
  onSelectTicket: (ticketId: string) => void;
  isAnalyzing: boolean;
}

export function TicketQueue({
  tickets,
  selectedTicketId,
  onSelectTicket,
  isAnalyzing,
}: TicketQueueProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-accent" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-gray-400">
            Ticket Queue
          </h2>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {tickets.length} open tickets
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {tickets.map((ticket) => {
          const isSelected = ticket.id === selectedTicketId;
          return (
            <button
              key={ticket.id}
              onClick={() => onSelectTicket(ticket.id)}
              disabled={isAnalyzing && isSelected}
              className={`
                w-full text-left rounded-lg p-3.5 transition-all duration-150
                border
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-accent/50 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-925
                ${
                  isSelected
                    ? "bg-slate-700/60 border-emerald-accent/40 shadow-[0_0_12px_rgba(52,211,153,0.06)]"
                    : "bg-slate-800/40 border-slate-700/30 hover:bg-slate-700/40 hover:border-slate-600/50"
                }
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <p
                  className={`text-sm font-medium leading-snug ${isSelected ? "text-gray-100" : "text-gray-300"}`}
                >
                  {ticket.subject}
                </p>
                {isSelected && (
                  <div className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-accent" />
                )}
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                <span>{ticket.customer}</span>
                <span className="text-gray-700">/</span>
                <span className="text-gray-400 font-mono text-[11px]">
                  {ticket.product}
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-gray-600">
                Purchased {ticket.purchaseDate}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
