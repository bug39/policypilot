# PolicyPilot — Intelligent Compliance Decision Engine

## What I Built

PolicyPilot is a proactive compliance decision engine that transforms customer support from "dumb keyword search" to "nuanced policy enforcement." Instead of a chatbot, PolicyPilot is a structured workflow tool: a support agent selects a ticket, and the system automatically retrieves relevant policy clauses, detects conflicts between them, and produces a legally grounded verdict — all without any back-and-forth conversation.

**The key innovation:** PolicyPilot doesn't just find policies — it resolves *contradictions* between them. When a customer's $2,000 treadmill motor fails at 6 weeks (past the 30-day return window but within the 2-year motor warranty), PolicyPilot retrieves both policies, identifies the conflict, and applies a principled resolution hierarchy: product-specific warranties override general return windows. No other submission in this hackathon performs conflict resolution between contradictory policies.

**Workflow it enhances:** Customer support ticket triage. A support agent sees a ticket queue, clicks a ticket, and immediately receives a structured verdict with full policy citations and conflict resolution reasoning — no typing, no waiting for a chatbot to ask questions, no ambiguity.

<!-- TODO: Add more detail about the 4 demo scenarios and what they demonstrate -->

---

## Demo

**Live URL:** <!-- TODO: Insert Vercel URL after F21 -->

**Screenshots:** <!-- TODO: Insert 4 screenshots after F22 -->

### Demo Scenarios

1. **Warranty Override** — Treadmill motor failure at 6 weeks. General return policy (30 days) conflicts with product-specific motor warranty (2 years). Verdict: APPROVED via warranty.
2. **Hygiene Block** — Opened earbuds return. General return policy (within 30 days) conflicts with hygiene override (opened in-ear products are final sale). Verdict: DENIED.
3. **Damage Override** — Crushed hiking boots delivered 39 days ago. General return policy (expired) conflicts with shipping damage override (reported to carrier within 48h). Verdict: APPROVED via damage override.
4. **Clean Approval** — Unused backpack return within 30 days. No conflicts. Standard return approved.

---

## How I Used Algolia Agent Studio

### Indexed Data

PolicyPilot indexes **26 policy clause records** for a fictional retailer (Apex Gear) in a single Algolia index (`apex_gear_policies`). Each record is a single policy clause with structured metadata:

- **4 policy layers:** store-wide (layer 1), category (layer 2), product-specific (layer 3), situational overrides (layer 4)
- **Custom ranking:** `desc(policy_layer)`, `desc(priority)`, `desc(specificity_score)` — ensures the most specific, highest-authority clause surfaces first
- **Faceting attributes:** `policy_type`, `policy_layer`, `applies_to`, `product_tags`, `effect`
- **Red herring policies:** Expired holiday specials, loyalty member extensions, and bulk discount policies test that the agent doesn't get confused

### Multi-Step Retrieval

The Agent Studio agent performs **3 separate Algolia searches per ticket:**
1. General policies (return, refund)
2. Product-specific or category warranties (using the exact product name from the ticket)
3. Situational overrides (hygiene, shipping damage, defective item — when conditions warrant)

### Prompt Engineering

<!-- TODO: Describe the system prompt approach, conflict resolution hierarchy, XML output format -->
<!-- TODO: Include a code snippet of the XML parser or system prompt excerpt -->

### Structured Output

The system prompt instructs the agent to produce XML-tagged output (`<analysis>`, `<verdict>`, `<policies>`, `<conflict>`, `<resolution>`) that the frontend parses into structured UI components. This is significantly more reliable than parsing free-form text.

---

## Why Fast Retrieval Matters

<!-- TODO: Explain how sub-50ms Algolia retrieval enables real-time policy analysis -->
<!-- TODO: Contrast with traditional database queries or embedding-based search -->
<!-- TODO: Mention retrieval time display in the UI -->

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
