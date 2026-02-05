# PolicyPilot — Project Specification

## Overview

PolicyPilot is an intelligent compliance decision engine that transforms customer support from "dumb keyword search" to "nuanced policy enforcement." It retrieves specific, often-conflicting policy clauses (e.g., General Returns vs. Specific Manufacturer Warranties) and performs **conflict resolution** to provide a legally grounded, customer-centric decision.

**Hackathon:** Algolia Agent Studio Challenge (ends Feb 8, 2026 at 11:59 PM PST)
**Track:** Consumer-Facing Non-Conversational Experiences
**Prize:** $750 per winner, 2 winners per track
**Winners announced:** February 28, 2026

---

## Submission Requirements (from dev.to template)

The dev.to submission post MUST include these four sections:

1. **What I Built:** Overview of the agent, what workflow it enhances, how it proactively assists users.
2. **Demo:** Link to deployed project + screenshots or video showing the solution in action.
3. **How I Used Algolia Agent Studio:** What data was indexed, how retrieval enhances the workflow, prompt engineering approach and details.
4. **Why Fast Retrieval Matters:** How Algolia's fast, contextual retrieval improved agent performance and UX.

### Additional submission rules
- Project must be deployed and functional at a live URL.
- If login required, provide testing credentials (ours will NOT require login).
- Team submissions allowed (up to 4 people).
- Can submit to multiple prompts.
- Must integrate Algolia Agent Studio.

### Judge-Facing Instructions (must be visible in the app)

The app must include onboarding/instructions for judges:
- Brief explanation of what PolicyPilot does (1-2 sentences).
- Clear guidance: "Click a ticket on the left to see PolicyPilot analyze it."
- Explanation of what the demo scenarios demonstrate (conflict resolution between policies).
- A "How It Works" section or tooltip explaining the Algolia Agent Studio pipeline.

---

## Track Justification: Why "Non-Conversational"

The non-conversational track is less competitive and PolicyPilot fits it as a **proactive workflow enhancement**:

- The primary UX is NOT a chatbot. It is a decision engine embedded in a support agent's workflow.
- A support agent selects/receives a ticket → the system **proactively** analyzes it and surfaces a structured verdict with full reasoning.
- No back-and-forth dialogue is required. The agent never asks clarifying questions.
- There is NO chat widget or conversational UI element. The entire interface is structured panels and cards.
- This directly mirrors the hackathon's own example: "Solution suggestions from a knowledge base during support ticket submission."

### Known risk

The Conversational track description explicitly mentions "customer support bots." PolicyPilot is a customer support *tool* but NOT a bot — it's a proactive decision engine for support *agents* (employees), not customers. The distinction must be clear in the submission post and in the UI (the user persona is a support agent looking at a ticket queue, not a customer chatting).

---

## Judging Criteria & How We Score

| Criterion | Our Strategy | Risk Level |
|---|---|---|
| **Use of underlying technology** | Agent Studio orchestrates multi-step retrieval + conflict resolution. Algolia Search tools with filters and custom ranking. UI shows Algolia retrieval time and policy source attribution. | Medium — must make Algolia's role visible |
| **Usability and UX** | Two-panel dashboard: ticket queue → proactive verdict with policy comparison cards. 60-second judge experience. Loading/error states for all async operations. | Medium — depends on execution |
| **Originality and Creativity** | No other submission does conflict resolution between contradictory policies. Closest competitor (Ethics Guardian) audits against frameworks independently. | Low — genuinely novel |

### Strengthening "Use of Technology" (audit finding)

The core value of PolicyPilot is in the LLM conflict resolution layer. A judge could argue "you could do this with any search engine." To counter this, the UI must make Algolia's contribution visible:

- **Show retrieval time** — e.g., "3 policies retrieved in 24ms" — directly addresses the submission template's "Why Fast Retrieval Matters" section.
- **Show search parameters** — display the filters/query used to find each policy (e.g., `product_categories:fitness AND policy_type:warranty`).
- **Algolia attribution** — "Powered by Algolia Agent Studio" badge.
- **Highlight custom ranking** — explain in the reasoning trace that policies are ranked by `policy_layer` and `priority`.

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
| Structured output formatting | ✅ (system prompt w/ XML tags) | |
| Parsing structured output into UI | | ✅ (frontend) |
| Rendering verdict + reasoning panels | | ✅ (frontend) |
| Ticket intake / demo ticket queue | | ✅ (frontend) |
| API route proxy to Agent Studio | | ✅ (Next.js API route) |

### Tech Stack

- **Search & Retrieval:** Algolia Agent Studio + Algolia Search (keyword + filters + custom ranking)
- **Agent Orchestration:** Algolia Agent Studio `/completions` API
- **LLM:** Algolia's free GPT-4.1 for development; paid OpenAI API key for production demo (~$2 budget)
- **Frontend:** Next.js + React + Tailwind CSS
- **AI SDK:** Vercel AI SDK with `compatibilityMode=ai-sdk-5` for streaming (if validated in spike)
- **Deployment:** Vercel

### Key Technical Decisions

- **No NeuralSearch** — not available on free tier, and policy retrieval benefits more from precise structured filtering than fuzzy semantic matching anyway.
- **Clause-level records** — policies are split into individual clause records (not monolithic documents) to stay under the 10KB free-tier record limit.
- **Custom ranking** — `policy_layer` (numeric 1-4) and `priority` attributes ensure the most specific, highest-authority policy floats to the top.
- **XML-tagged structured output** — system prompt instructs the agent to output using XML tags (`<verdict>`, `<policies>`, `<conflict>`, `<resolution>`) that the frontend parses reliably. XML is significantly more reliable than ad-hoc section headers for LLM output parsing.
- **Next.js API route proxy** — all `/completions` calls go through `/api/analyze` server-side. Keeps Algolia API key out of client-side JavaScript, avoids CORS ambiguity, allows rate limiting.
- **Temperature=0** — confirmed configurable via Agent Studio. Maximizes determinism for demo reliability.

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
| Agent Studio rate limit | 100 requests/min/app | Unlikely to hit during demo |

---

## Record Schema

Each policy clause is stored as a separate Algolia record:

```typescript
interface PolicyRecord {
  // Algolia required
  objectID: string;              // e.g., "ret-general-001"

  // Policy identity
  policy_id: string;             // Parent policy ID, e.g., "return-general"
  policy_name: string;           // Human-readable, e.g., "General Return Policy"
  clause_id: string;             // Specific clause, e.g., "RET-1.1"
  clause_title: string;          // e.g., "Standard Return Window"

  // The actual policy text
  text: string;                  // Full clause text

  // Classification
  policy_type: "return" | "warranty" | "hygiene" | "shipping" | "exchange" | "refund";
  policy_layer: 1 | 2 | 3 | 4;  // 1=store_wide, 2=category, 3=product_specific, 4=situational

  // Scope
  applies_to: string;            // "all", "electronics", "fitness", "Pro-Treadmill X500", etc.
  product_tags: string[];        // For multi-product applicability, e.g., ["fitness", "treadmills"]

  // Conditions
  conditions: string[];          // When clause activates, e.g., ["item_opened", "in_ear_audio"]
  effect: string;                // What happens, e.g., "return_denied", "warranty_approved"

  // Ranking
  priority: number;              // 1-100, higher = more authoritative
  specificity_score: number;     // 1-100, higher = more specific

  // Temporal
  effective_date: number;        // Unix timestamp
  expiry_date: number | null;    // Unix timestamp or null for no expiry
}
```

### Algolia Index Configuration

- **Index name:** `apex_gear_policies`
- **Searchable attributes** (ordered): `text`, `clause_title`, `policy_name`, `applies_to`, `conditions`
- **Attributes for faceting:** `policy_type`, `policy_layer`, `applies_to`, `product_tags`, `effect`
- **Custom ranking:** `desc(policy_layer)`, `desc(priority)`, `desc(specificity_score)`
- **Attribute for distinct:** `policy_id` (so multiple clauses from the same policy can be grouped)

### Red Herring Policies

These are included in the index to test that the agent doesn't get confused:

1. **Loyalty Member Extended Return** — 60-day return window for loyalty members only. Tests: does the agent check membership status? (None of our demo tickets involve loyalty members.)
2. **Holiday Season Special** — Extended returns for purchases made Nov 15 - Dec 31, 2024. Tests: does the agent check the `expiry_date`? (This policy has expired.)
3. **Bulk Order Discount Policy** — 15% discount on orders of 10+ units. Same category as some demo products but irrelevant to returns. Tests: does the agent filter by relevance?

---

## Structured Output Format

The system prompt instructs the agent to produce XML-tagged output. The frontend parses this into UI components.

### Expected output structure

```xml
<analysis>
  <verdict>APPROVED|DENIED|ESCALATE</verdict>
  <verdict_type>warranty_claim|standard_return|hygiene_exception|damage_claim|escalation</verdict_type>
  <summary>One-sentence plain English summary of the decision.</summary>

  <policies>
    <policy>
      <clause_id>RET-1.1</clause_id>
      <policy_name>General Return Policy</policy_name>
      <applies>true|false</applies>
      <effect>return_approved|return_denied|warranty_approved|...</effect>
      <reason>Brief explanation of why this policy applies or doesn't.</reason>
    </policy>
    <!-- Additional policies -->
  </policies>

  <conflict>
    <exists>true|false</exists>
    <description>Plain English description of the conflict, or "No conflict detected."</description>
  </conflict>

  <resolution>
    <winning_policy>clause_id of the policy that takes precedence</winning_policy>
    <rule_applied>e.g., "Product-specific warranty (layer 3) overrides store-wide return policy (layer 1) for mechanical defects."</rule_applied>
  </resolution>

  <recommended_action>Plain English next step for the support agent.</recommended_action>
</analysis>
```

### Parsing strategy

```typescript
interface ParsedVerdict {
  verdict: "APPROVED" | "DENIED" | "ESCALATE";
  verdictType: string;
  summary: string;
  policies: Array<{
    clauseId: string;
    policyName: string;
    applies: boolean;
    effect: string;
    reason: string;
  }>;
  conflict: {
    exists: boolean;
    description: string;
  };
  resolution: {
    winningPolicy: string;
    ruleApplied: string;
  } | null;
  recommendedAction: string;
}

// Parser: extract content between XML tags
// Fallback: if parsing fails, display raw text in a "Raw Response" panel with a yellow warning banner
// NEVER show a broken/empty UI
```

---

## System Prompt Requirements

The system prompt is the core artifact. It must be drafted during Day 0 and iterated throughout the project.

### Required behaviors

1. **Multi-step retrieval:** First search for policies matching the product/category. Then search for situational overrides (hygiene, damage, etc.) that may apply based on the ticket details.
2. **Conflict resolution hierarchy:** When policies conflict, apply this rule:
   - Rank all retrieved policies by `policy_layer` (1=store_wide, 2=category, 3=product_specific, 4=situational).
   - If a situational override (layer 4) applies, it wins.
   - Otherwise, the highest-layer policy wins.
   - If two policies are at the same layer, the one with the higher `priority` value wins.
3. **XML output format:** Always respond using the XML structure defined above.
4. **Anti-hallucination:** "You MUST only cite policies and clauses that appear in your search results. NEVER invent or assume the existence of a policy. Quote the `clause_id` field verbatim from search results. If you are uncertain whether a policy applies, say so."
5. **No clarifying questions:** Never ask the user for more information. Make a decision based on available data or output `<verdict>ESCALATE</verdict>` if insufficient.
6. **No-match fallback:** If no relevant policies are found, output `<verdict>ESCALATE</verdict>` with a summary explaining the case requires human review.
7. **N-way conflict handling:** If 3+ policies conflict, apply the hierarchy systematically — rank all by layer, then by priority, and resolve step by step.
8. **Cite specific clauses:** Reference `clause_id` values in explanations, not just policy names.

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
│                  │  ⚡ 3 policies retrieved in 24ms │
│                  │  Powered by Algolia Agent Studio │
│                  │                                 │
└──────────────────┴─────────────────────────────────┘
```

### Key UX Principles

- **Proactive, not conversational** — clicking a ticket immediately triggers analysis. No "send" button, no typing indicator, no chat thread.
- **Structured output, not chat bubbles** — verdict is rendered as cards and panels, not a message.
- **Policy comparison is the hero** — side-by-side conflicting policies with visual win/lose indicators IS the differentiator.
- **60-second judge experience** — pre-loaded demo tickets, instant results, clear visual hierarchy.
- **Algolia visibility** — retrieval time indicator, search parameter display, Algolia attribution badge.
- **Judge onboarding** — brief header text explaining what the tool does and how to use it.

### UI States (all required for MVP)

| State | What the user sees |
|---|---|
| **Empty** | Right panel shows instructions: "Select a ticket to analyze" with brief explanation of PolicyPilot. |
| **Loading** | Skeleton/shimmer UI + "Analyzing ticket against 28 policy clauses..." text. |
| **Success** | Verdict card + policy comparison cards + conflict resolution trace. |
| **Error** | Friendly error card: "Analysis failed. Click to retry." with a retry button. |
| **Timeout** (30s) | "Analysis is taking longer than expected. Click to retry." |
| **Parse failure** | Raw LLM response displayed in a formatted panel with yellow warning: "Structured parsing failed — showing raw response." |

---

## Demo Scenarios

### Fictional Company: "Apex Gear"
A retailer selling electronics, fitness equipment, audio gear, and outdoor equipment. Complex enough to have layered policies.

### Policy Taxonomy (4 layers)

| Layer | Value | Example | Applies To |
|---|---|---|---|
| **Store-wide** | 1 | General Return Policy (30 days) | Everything |
| **Category** | 2 | Electronics Warranty (1 year) | All electronics |
| **Product-specific** | 3 | Pro-Treadmill Motor Warranty (2 years) | One product |
| **Situational** | 4 | Shipping Damage Override, Hygiene Exception | Triggered by conditions |

**Conflict resolution rule:** Rank by `policy_layer` (higher wins). Ties broken by `priority` (higher wins). Situational overrides (layer 4) always take precedence when their conditions are met.

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

~25-35 clause-level records total:
- 5-6 general store policies (returns, exchanges, refunds, shipping)
- 4-5 category warranties (electronics, fitness, outdoor, audio)
- 4-5 product-specific warranties (Pro-Treadmill, SoundPro earbuds, etc.)
- 4-5 situational overrides (hygiene, shipping damage, recall, defective items)
- 3-4 red herring policies (loyalty member extension, expired holiday special, bulk order discount)

---

## Scope: MVP vs. Stretch

### MVP (must ship)

1. **4 pre-loaded demo tickets** — the four scenarios above. Click to analyze. No custom input.
2. **Proactive verdict display** — XML-parsed structured output: verdict (APPROVED/DENIED/ESCALATE), explanation, cited clauses. NOT chat bubbles.
3. **Policy comparison cards** — show the 2-3 retrieved policies with visual indicators (which one won, which was overridden).
4. **Working Agent Studio integration** — `/completions` API via Next.js API route proxy, real retrieval, real reasoning.
5. **Loading, error, and timeout states** — skeleton UI during loading, friendly error cards, 30s timeout with retry.
6. **Parse failure fallback** — raw response display if XML parsing fails.
7. **Algolia visibility** — retrieval time indicator, "Powered by Algolia Agent Studio" attribution.
8. **Judge onboarding text** — brief instructions visible in the app.
9. **Deployed to a live URL** on Vercel.

### Stretch (only if MVP is solid by end of Day 2)

10. Custom ticket input — paste your own ticket text.
11. Batch analysis — analyze multiple tickets simultaneously (reinforces non-conversational positioning).
12. Action buttons — "Approve Claim" / "Escalate" using client-side tools (can be mocked with toasts).
13. Animation — progressive reveal of reasoning steps using streaming.
14. "How It Works" expandable panel — step-by-step visual of the Agent Studio pipeline.

### Cut entirely

- ~~Follow-up chat / InstantSearch chat widget~~ (actively weakens non-conversational positioning)
- ~~Email draft generation~~
- ~~Ticket queue/management features~~
- ~~Agent-side escalation workflows~~
- ~~Multiple LLM provider comparison~~

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Reasoning trace is opaque** — API doesn't expose tool calls | Medium-High | High — lose key differentiator | Use XML-tagged structured output in system prompt. Validate during spike. |
| **Multi-step retrieval fails** — agent only makes one search call | Medium | High — can't demonstrate conflict detection | Design system prompt to explicitly instruct multi-step. Fallback: broad query + custom ranking returns all relevant policies in one shot. |
| **Demo unreliability** — LLM gives different verdicts across runs | Medium | High — judges see inconsistent results | Temperature=0, constrained system prompt with XML format, test each scenario 10+ times. |
| **XML parsing breaks** — LLM deviates from expected format | Medium | Medium — degraded but functional UI | Graceful fallback: display raw text in formatted panel with warning banner. |
| **LLM hallucination** — agent cites non-existent policies | Medium | High — undermines credibility | Anti-hallucination instruction in system prompt. `clause_id` must match index records. |
| **LLM rate limits during judging** — Gemini free tier is 5-15 RPM | Medium | High — demo breaks | Use paid OpenAI key for production (~$2). Algolia caches completions by default. |
| **"Proactive" framing challenged** — judges see it as a chatbot | Low-Medium | Medium — wrong track | No chat UI at all. Pre-loaded tickets, auto-analysis on click, structured panels. |
| **Free tier search limit hit** — 10K requests/month | Low | Medium — demo stops working | Monitor usage, avoid waste during dev, cache responses if needed. |
| **Time** — 3 days for data + agent + UI + deploy + submission post | High | High — incomplete submission | Ruthless MVP scope. Start submission post skeleton on Day 2 evening. |

---

## Day 0 Spike: Validation Checklist

The spike is a go/no-go gate. We must validate these before committing to the build.

### Critical (project-killers if false)

- [ ] **Agent Studio accessible on Free Build plan** — can we create and publish an agent?
- [ ] **Multi-step retrieval works** — can the agent make multiple Algolia Search calls in one reasoning chain? Test with a prompt that requires info from two separate filtered queries.
- [ ] **Response structure is inspectable** — can we see tool calls / reasoning steps in the `/completions` response? Log the FULL raw response object and document all observed `parts` types.
- [ ] **XML structured output works** — does the agent consistently produce valid XML tags when instructed via system prompt? Test across 5+ runs.
- [ ] **System prompt conflict-resolution protocol is followed** — does the agent consistently follow the protocol across 5+ test runs of the treadmill scenario?

### Important (affects scope)

- [ ] **Algolia's free GPT-4.1** — is it available in Agent Studio? What are its rate limits?
- [ ] **Vercel AI SDK compatibility** — does `compatibilityMode=ai-sdk-5` work for streaming?
- [ ] **Client-side tools work** — can we define `approve_claim` / `escalate` actions?
- [ ] **Streaming response granularity** — do we get incremental XML tags or only the full response?
- [ ] **CORS** — can the `/completions` endpoint be called from the browser, or must we proxy?

### Spike Deliverable

A bare-bones script that:
1. Pushes 5-6 test policy records to an Algolia index
2. Creates an Agent Studio agent with an XML-format conflict-resolution system prompt
3. Sends the "Pro-Treadmill motor failure at 45 days" query via `/completions`
4. Logs the FULL raw response including all `parts`, tool calls, and reasoning steps
5. Attempts to parse the XML output and logs success/failure

Additionally during the spike:
- Draft the full system prompt (first version).
- Draft the complete record schema as a TypeScript interface.
- Identify the LLM provider (try Algolia's free GPT-4.1 first).

If this works end-to-end → green light to build.

---

## Timeline

| Day | Focus | Deliverable |
|---|---|---|
| **Day 0 (Feb 5)** | Spike + system prompt draft + record schema | Go/no-go decision. Architecture locked. System prompt v1. Record schema finalized. |
| **Day 1 (Feb 6)** | Data + Agent — create full policy dataset, push to Algolia, configure Agent Studio, tune system prompt until all 4 scenarios produce correct XML output reliably | Working agent that nails all 4 demo scenarios via API. Start submission post skeleton (headings + motivation). |
| **Day 2 (Feb 7)** | Frontend — write XML parser FIRST with hardcoded test data. Then: two-panel layout, ticket queue, verdict display, policy comparison cards, loading/error states, API route proxy. Connect to live agent LAST. | Working UI connected to live agent. Fill in submission post technical details. |
| **Day 3 (Feb 8)** | Deploy to Vercel + bug fixes + visual polish + finish submission post (screenshots, demo link, architecture explanation) | Live URL + submission posted before 11:59 PM PST. |

### Timeline notes (from audit)
- Day 1 is ~9-13 hours of work. System prompt iteration is the biggest time sink — starting it in Day 0 is critical.
- Day 2: write the parser FIRST with mock data, build UI with mock data, connect live API last. This ensures a working (mock) demo even if live integration has issues.
- Day 3: the dev.to post is 2-3 hours of work. Do NOT attempt stretch goals unless MVP is deployed and stable by noon.
- Start the submission post skeleton on Day 1 evening (headings, structure, motivation) to avoid a Day 3 crunch.
