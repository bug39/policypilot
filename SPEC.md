# PolicyPilot — Project Specification

## Overview

PolicyPilot is an intelligent compliance decision engine that transforms customer support from "dumb keyword search" to "nuanced policy enforcement." It retrieves specific, often-conflicting policy clauses (e.g., General Returns vs. Specific Manufacturer Warranties) and performs **conflict resolution** to provide a legally grounded, customer-centric decision.

**Hackathon:** Algolia Agent Studio Challenge (ends Feb 8, 2026)
**Track:** Consumer-Facing Non-Conversational Experiences
**Prize:** $750 per winner, 2 winners per track

---

## Track Justification: Why "Non-Conversational"

The non-conversational track is less competitive and PolicyPilot fits it as a **proactive workflow enhancement**:

- The primary UX is NOT a chatbot. It is a decision engine embedded in a support agent's workflow.
- A support agent selects/receives a ticket → the system **proactively** analyzes it and surfaces a structured verdict with full reasoning.
- No back-and-forth dialogue is required. The agent doesn't ask clarifying questions.
- Follow-up chat is available but secondary and collapsed by default.
- This directly mirrors the hackathon's own example: "Solution suggestions from a knowledge base during support ticket submission."

---

## Judging Criteria & How We Score

| Criterion | Our Strategy | Risk Level |
|---|---|---|
| **Use of underlying technology** | Agent Studio orchestrates multi-step retrieval + conflict resolution. Algolia Search tools query policy indices with filters and custom ranking. | Low — clean architecture |
| **Usability and UX** | Two-panel dashboard: ticket queue → proactive verdict with policy comparison cards. 60-second judge experience. | Medium — depends on execution |
| **Originality and Creativity** | No other submission does conflict resolution between contradictory policies. Closest competitor (Ethics Guardian) audits against frameworks independently. | Low — genuinely novel |

---

## Competitive Landscape (as of Feb 5, 2026)

~15+ submissions already posted. Key findings:

- **~25% are shopping assistants** (ShopMate, Personal Stylist, Deal Agent Forge) — the crowded lane
- **Ethics Guardian** — closest competitor. Audits against GDPR/NIST/ISO but does NOT resolve contradictions between policies.
- **The Refusal Engine** — binary safe/unsafe gate for cloud configs. No nuanced reasoning.
- **Recall Radar** — product recall detection. Different domain entirely.
- **No project detects and resolves contradictions between conflicting policies.**

Previous hackathon winners (MCP Challenge) were all non-obvious use cases: Pokemon battle strategy, automated doc detection, custom client. Shopping assistants did not win.

---

## Architecture

### What lives where

| Component | Runs in Agent Studio | Runs in our code |
|---|---|---|
| Policy retrieval from Algolia index | ✅ (Algolia Search tool) | |
| Multi-step search (general → specific) | ✅ (agent loop) | |
| Conflict detection + resolution | ✅ (LLM reasoning) | |
| Structured output formatting | ✅ (system prompt) | |
| Parsing structured output into UI | | ✅ (frontend) |
| Rendering verdict + reasoning panels | | ✅ (frontend) |
| Ticket intake / demo ticket queue | | ✅ (frontend) |

### Tech Stack

- **Search & Retrieval:** Algolia Agent Studio + Algolia Search (keyword + filters + custom ranking)
- **Agent Orchestration:** Algolia Agent Studio `/completions` API
- **LLM:** Bring-your-own via Agent Studio (Gemini 1.5 Flash or GPT-4o — TBD during spike)
- **Frontend:** Next.js + React + Tailwind CSS
- **Deployment:** Vercel

### Key Technical Decisions

- **No NeuralSearch** — not available on free tier, and policy retrieval benefits more from precise structured filtering than fuzzy semantic matching anyway.
- **Clause-level records** — policies are split into individual clause records (not monolithic documents) to stay under the 10KB free-tier record limit.
- **Custom ranking** — `priority` and `specificity_score` attributes ensure the most specific, highest-authority policy floats to the top.
- **Structured text output** — system prompt instructs the agent to output in a parseable structured format (sections like `RETRIEVED POLICIES:`, `CONFLICT DETECTED:`, etc.) that the frontend parses into UI components.

---

## Algolia Free Tier Constraints

| Resource | Limit | Impact |
|---|---|---|
| Records | 1,000,000 | No issue (~30 records) |
| Search requests | 10,000/month (~333/day) | Tight — ~66 demo interactions/day at 5 queries each. Avoid waste during dev. |
| Record size | 10 KB per record | Must split policies into clause-level records |
| Indices | 10 | Plenty |
| Rules per index | 3 | Use custom ranking instead of rules for most logic |
| NeuralSearch | NOT included | Use keyword search + filters |

---

## UX Design

### Two-Panel Layout

```
┌──────────────────┬─────────────────────────────────┐
│                  │                                 │
│  TICKET QUEUE    │  ✅ APPROVED — Warranty Claim    │
│                  │                                 │
│  ▶ Treadmill     │  "The Pro-Treadmill 2-year      │
│    motor failure │  motor warranty (Clause 14.b)    │
│                  │  overrides the 30-day return     │
│  ▷ Earbuds       │  window for mechanical defects." │
│    return        │                                 │
│                  │  ┌─ Policies Retrieved ────────┐ │
│  ▷ Crushed       │  │ General Return Policy  ❌    │ │
│    package       │  │ 30-day window — DENIED      │ │
│                  │  │                             │ │
│  ▷ Simple        │  │ Pro-Treadmill Warranty ✅    │ │
│    return        │  │ 2yr motor — APPROVED        │ │
│                  │  ├─ Conflict Resolution ───────┤ │
│                  │  │ Product-specific warranty   │ │
│                  │  │ overrides general return    │ │
│                  │  │ window per Clause 14.b      │ │
│                  │  └─────────────────────────────┘ │
│                  │                                 │
│                  │  [▸ Ask PolicyPilot a follow-up] │
│                  │                                 │
└──────────────────┴─────────────────────────────────┘
```

### Key UX Principles

- **Proactive, not conversational** — clicking a ticket immediately triggers analysis. No "send" button, no typing indicator, no chat thread.
- **Structured output, not chat bubbles** — verdict is rendered as cards and panels, not a message.
- **Policy comparison is the hero** — side-by-side conflicting policies with visual win/lose indicators IS the differentiator.
- **60-second judge experience** — pre-loaded demo tickets, instant results, clear visual hierarchy.

---

## Demo Scenarios

### Fictional Company: "Apex Gear"
A retailer selling electronics, fitness equipment, audio gear, and outdoor equipment. Complex enough to have layered policies.

### Policy Taxonomy (4 layers)

| Layer | Example | Applies To |
|---|---|---|
| **Store-wide** | General Return Policy (30 days) | Everything |
| **Category** | Electronics Warranty (1 year) | All electronics |
| **Product-specific** | Pro-Treadmill Motor Warranty (2 years) | One product |
| **Situational** | Shipping Damage Override, Hygiene Exception | Triggered by conditions |

**Conflict resolution rule:** More specific policy wins, unless a situational policy applies.

### The Four Scenarios

#### 1. Warranty Override (APPROVED)
**Ticket:**
> Subject: REFUND REQUEST - Order #48291
> Customer: Jamie Chen | Product: Pro-Treadmill X500 | Purchased: 12/22/2025
>
> "I've been using this treadmill for about 6 weeks and the motor just completely stopped working mid-run. I almost fell off. This is a $2,000 machine and I expect better. I want a full refund."

**Conflict:** General return policy (30 days → DENIED) vs. Pro-Treadmill motor warranty (2 years → APPROVED)
**Resolution:** Product-specific warranty overrides general return window for mechanical defects. Approve warranty claim, cite Clause 14.b.
**Why it's impressive:** Shows the agent is smarter than a "30-day return window" bot.

#### 2. Hygiene Block (DENIED)
**Ticket:**
> Subject: Return Request - Order #51847
> Customer: Alex Rivera | Product: SoundPro Wireless Earbuds | Purchased: 01/28/2026
>
> "These earbuds don't fit my ears well. I've tried all the tip sizes but they keep falling out during my runs. I'd like to return them for a refund."

**Conflict:** General return policy (30 days, within window → APPROVED) vs. Hygiene policy (opened personal audio → DENIED)
**Resolution:** Hygiene exception overrides general return for opened in-ear audio products. Deny return, explain why, suggest exchange.
**Why it's impressive:** Shows the agent enforces *restrictions* too, not just approvals.

#### 3. Damage Override (APPROVED)
**Ticket:**
> Subject: DAMAGED SHIPMENT - Order #49103
> Customer: Morgan Taylor | Product: Alpine Pro Hiking Boots | Purchased: 12/28/2025
>
> "My package arrived completely crushed and the boots inside are scuffed and the sole is partially detached. I contacted the carrier the same day. This was over a month ago and I've been going back and forth with your team. I want this resolved."

**Conflict:** General return policy (30 days → DENIED, 39 days since purchase) vs. Shipping damage policy (48hr carrier report overrides return window)
**Resolution:** Shipping damage override applies — customer reported within 48 hours of delivery. Approve replacement/refund despite expired return window.
**Why it's impressive:** Shows time-sensitive situational logic.

#### 4. Clean Approval (APPROVED)
**Ticket:**
> Subject: Return - Order #52201
> Customer: Sam Park | Product: TrailBlazer Daypack | Purchased: 01/27/2026
>
> "This backpack is smaller than I expected from the photos. Never used it, still has tags. Can I return it?"

**Conflict:** None — within 30 days, unopened/unused, no exceptions apply.
**Resolution:** Standard return approved under general policy.
**Why it's impressive:** Baseline contrast. Shows the system doesn't over-complicate simple cases.

### Data Volume

~20-30 clause-level records total:
- 5-6 general store policies (returns, exchanges, refunds, shipping)
- 4-5 category warranties (electronics, fitness, outdoor, audio)
- 4-5 product-specific warranties (Pro-Treadmill, SoundPro earbuds, etc.)
- 4-5 situational overrides (hygiene, shipping damage, recall, defective items)
- A few "red herring" policies (retrievable but irrelevant — tests that the agent doesn't get confused)

---

## Scope: MVP vs. Stretch

### MVP (must ship)

1. **4 pre-loaded demo tickets** — the four scenarios above. Click to analyze. No custom input.
2. **Proactive verdict display** — structured output: verdict (APPROVED/DENIED), explanation, cited clauses. NOT chat bubbles.
3. **Policy comparison cards** — show the 2-3 retrieved policies with visual indicators (which one won, which was overridden).
4. **Working Agent Studio integration** — `/completions` API, real retrieval, real reasoning.
5. **Deployed to a live URL** on Vercel.

### Stretch (only if MVP is solid by end of Day 2)

6. Custom ticket input — paste your own ticket text.
7. Follow-up chat — collapsed InstantSearch chat widget for "dig deeper."
8. Action buttons — "Approve Claim" / "Escalate" using client-side tools (can be mocked).
9. Animation — progressive reveal of reasoning steps.

### Cut entirely

- Email draft generation
- Ticket queue/management features
- Agent-side escalation workflows
- Multiple LLM provider comparison

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Reasoning trace is opaque** — API doesn't expose tool calls | Medium-High | High — lose key differentiator | Use structured text output in system prompt (approach B). Validate during spike. |
| **Multi-step retrieval fails** — agent only makes one search call | Medium | High — can't demonstrate conflict detection | Design system prompt to explicitly instruct multi-step. Fallback: broad query + custom ranking returns all relevant policies in one shot. |
| **Demo unreliability** — LLM gives different verdicts across runs | Medium | High — judges see inconsistent results | Temperature=0, constrained system prompt, test each scenario 10+ times. |
| **"Proactive" framing challenged** — judges see it as a chatbot | Low-Medium | Medium — wrong track, weaker positioning | Pre-loaded tickets, auto-analysis on click, structured output (not chat bubbles), no clarifying questions. |
| **Free tier search limit hit** — 10K requests/month | Low | Medium — demo stops working | Monitor usage, avoid waste during dev, cache responses if needed. |
| **Time** — 3 days for data + agent + UI + deploy | High | High — incomplete submission | Ruthless MVP scope. Simple CSS. Deploy to Vercel early. |

---

## Day 0 Spike: Validation Checklist

The spike is a go/no-go gate. We must validate these before committing to the build:

### Critical (project-killers if false)

- [ ] **Agent Studio accessible on Free Build plan** — can we create and publish an agent?
- [ ] **Multi-step retrieval works** — can the agent make multiple Algolia Search calls in one reasoning chain?
- [ ] **Response structure is inspectable** — can we see tool calls / reasoning steps in the `/completions` response? If not, does structured text output (system prompt approach) parse reliably?
- [ ] **System prompt protocol is followed** — does the agent consistently follow the conflict-resolution protocol across 5+ test runs?

### Important (affects scope)

- [ ] **Client-side tools work** — can we define `approve_claim` / `escalate` actions?
- [ ] **InstantSearch chat widget** — how customizable? Worth integrating for stretch goal?
- [ ] **Streaming response granularity** — do we get incremental reasoning steps?

### Spike Deliverable

A bare-bones script that:
1. Pushes 5-6 test policy records to an Algolia index
2. Creates an Agent Studio agent with a conflict-resolution system prompt
3. Sends the "Pro-Treadmill motor failure at 45 days" query via `/completions`
4. Logs the full response including any tool calls and reasoning steps

If this works end-to-end → green light to build.

---

## Timeline

| Day | Focus | Deliverable |
|---|---|---|
| **Day 0 (Feb 5)** | Spike — validate Agent Studio, test multi-step retrieval, test response structure | Go/no-go decision, architecture locked |
| **Day 1 (Feb 6)** | Data + Agent — create full policy dataset, configure Agent Studio agent, tune system prompt until all 4 scenarios work reliably | Working agent that nails all 4 demo scenarios via API |
| **Day 2 (Feb 7)** | Frontend — two-panel layout, ticket queue, verdict display, policy comparison cards, connect to live agent | Working UI connected to live agent |
| **Day 3 (Feb 8)** | Deploy + polish + stretch goals + write dev.to submission post | Live URL + submission posted |
