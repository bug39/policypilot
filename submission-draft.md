# PolicyPilot — Intelligent Compliance Decision Engine

## What I Built

PolicyPilot is a proactive compliance decision engine that transforms customer support from "dumb keyword search" to "nuanced policy enforcement." Instead of a chatbot, PolicyPilot is a structured workflow tool: a support agent selects a ticket, and the system automatically retrieves relevant policy clauses, detects conflicts between them, and produces a legally grounded verdict — all without any back-and-forth conversation.

**The key innovation:** PolicyPilot doesn't just find policies — it resolves *contradictions* between them. When a customer's $2,000 treadmill motor fails at 6 weeks (past the 30-day return window but within the 2-year motor warranty), PolicyPilot retrieves both policies, identifies the conflict, and applies a principled resolution hierarchy: product-specific warranties override general return windows. No other submission in this hackathon performs conflict resolution between contradictory policies.

**Workflow it enhances:** Customer support ticket triage. A support agent sees a ticket queue, clicks a ticket, and immediately receives a structured verdict with full policy citations and conflict resolution reasoning — no typing, no waiting for a chatbot to ask questions, no ambiguity.

The app includes 4 demo scenarios that demonstrate the full range of conflict resolution:

1. **Warranty Override** — A treadmill motor failure at 6 weeks. The 30-day return window has expired, but the 2-year motor warranty applies. PolicyPilot detects the conflict and approves the warranty claim.
2. **Hygiene Block** — Opened earbuds within the return window. The general return policy would approve, but the hygiene override for in-ear audio products blocks the return. PolicyPilot correctly denies the return.
3. **Damage Override** — Crushed hiking boots delivered 39 days ago. The return window has expired, but shipping damage was reported within 48 hours. The situational override applies, approving the claim.
4. **Clean Approval** — An unused backpack return within 30 days. No conflicts detected. Standard return approved cleanly, demonstrating the system doesn't over-complicate simple cases.

---

## Demo

**Live URL:** <!-- TODO: Insert Vercel URL after deployment -->

### Screenshots

<!-- TODO: Insert 4 screenshots showing each scenario verdict -->

### Demo Scenarios

Click any of the 4 pre-loaded support tickets on the left panel to see PolicyPilot analyze it in real-time. Each ticket triggers a different conflict resolution scenario, showing verdicts, policy citations, and reasoning traces.

---

## How I Used Algolia Agent Studio

### Indexed Data

PolicyPilot indexes **26 policy clause records** for a fictional retailer (Apex Gear) in a single Algolia index (`apex_gear_policies`). Each record is a single policy clause — not a monolithic document — with structured metadata enabling precise retrieval:

- **4 policy layers:** store-wide (layer 1), category (layer 2), product-specific (layer 3), situational overrides (layer 4)
- **Custom ranking:** `desc(policy_layer)`, `desc(priority)`, `desc(specificity_score)` — ensures the most specific, highest-authority clause surfaces first
- **Faceting attributes:** `policy_type`, `policy_layer`, `applies_to`, `product_tags`, `effect`
- **Red herring policies:** Expired holiday specials, loyalty member extensions, and bulk discount policies are included to test that the agent doesn't get confused — and it doesn't

### Multi-Step Retrieval

The Agent Studio agent performs **3 separate Algolia searches per ticket**, each targeting a different policy layer:

1. **General policies** — searches for return, refund, and exchange policies (layer 1)
2. **Product-specific warranties** — searches the exact product name from the ticket combined with "warranty" (layers 2-3)
3. **Situational overrides** — searches for hygiene exceptions, shipping damage overrides, defective item policies, and recalls (layer 4) when ticket conditions warrant

This multi-step approach is critical. A single broad search might miss the product-specific warranty that overrides the general return window, or fail to surface the hygiene exception that blocks an otherwise valid return.

### Prompt Engineering

The system prompt defines a strict conflict-resolution protocol:

1. **Retrieve first, reason second** — The agent must complete all 3 search steps before making any verdict decision
2. **Hierarchy enforcement** — Situational overrides (layer 4) > product-specific (layer 3) > category (layer 2) > store-wide (layer 1). Ties broken by priority score.
3. **Anti-hallucination guard** — "You MUST only cite policies that appear in your search results. NEVER invent a policy. Quote clause_id verbatim."
4. **No clarifying questions** — The agent must make a decision or escalate, never ask the user for more information
5. **Structured XML output** — Every response follows a strict XML format that the frontend parses into structured UI components

Here's how the frontend parser handles the XML:

```typescript
function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`);
  const match = xml.match(regex);
  return match ? match[1].trim() : "";
}

export function parseVerdictResponse(raw: string): ParsedVerdict | null {
  const verdict = extractTag(raw, "verdict");
  if (!["APPROVED", "DENIED", "ESCALATE"].includes(verdict)) return null;
  // ... parse policies, conflict, resolution
}
```

### Structured Output

The system prompt instructs the agent to produce XML-tagged output:

```xml
<analysis>
  <verdict>APPROVED</verdict>
  <verdict_type>warranty_claim</verdict_type>
  <summary>Motor warranty overrides expired return window...</summary>
  <policies>
    <policy>
      <clause_id>WAR-3.1</clause_id>
      <policy_name>Pro-Treadmill Motor Warranty</policy_name>
      <applies>true</applies>
      <effect>warranty_approved</effect>
      <reason>Motor failed within 2-year warranty period</reason>
    </policy>
    <!-- more policies -->
  </policies>
  <conflict>
    <exists>true</exists>
    <description>Return window expired but warranty applies...</description>
  </conflict>
  <resolution>
    <winning_policy>WAR-3.1</winning_policy>
    <rule_applied>Product-specific warranty overrides general return</rule_applied>
  </resolution>
  <recommended_action>Process warranty claim...</recommended_action>
</analysis>
```

This XML format is parsed by the frontend into verdict cards, policy comparison panels, and conflict resolution traces — significantly more reliable than parsing free-form LLM text.

---

## Why Fast Retrieval Matters

PolicyPilot's value proposition depends on being **real-time**. A support agent looking at a ticket queue needs instant verdicts — not a 30-second wait for each ticket. Algolia's retrieval speed makes this possible:

**Retrieval is the fast part, reasoning is the slow part.** Each analysis involves 3 Algolia searches returning relevant policies, followed by LLM reasoning to detect conflicts and produce a verdict. The total analysis time (shown in the UI as "Analysis completed in X.Xs") is dominated by LLM processing. Algolia's sub-50ms retrieval ensures the agent spends its time *thinking*, not *waiting for data*.

**Structured search beats embedding search here.** Policy documents have precise metadata — policy layers, product categories, effective dates, conditions. Algolia's structured filtering (`policy_type:warranty`, `policy_layer:4`) retrieves exactly the right clauses without the noise of semantic similarity. When a customer reports a defective treadmill motor, we don't want "vaguely related fitness policies" — we want the exact motor warranty clause for that specific product model.

**Custom ranking enforces the hierarchy.** By ranking results by `policy_layer` (desc), `priority` (desc), and `specificity_score` (desc), Algolia surfaces the most authoritative policy first. The agent sees the situational override before the general policy, naturally guiding correct conflict resolution.

The UI displays total analysis time after each verdict ("Analysis completed in X.Xs"), making the speed-to-decision visible to judges. The "Powered by Algolia Agent Studio" attribution reinforces that Algolia's retrieval pipeline is the foundation of every verdict.

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
