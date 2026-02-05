# Project Idea: PolicyPilot - The Conflict-Resolving Compliance Agent

## 1. Overview
PolicyPilot is an intelligent "Automated Compliance Officer" that transforms customer support from "dumb keyword search" to "nuanced policy enforcement." 

Most AI agents hallucinate rules or follow simple "if/else" logic. PolicyPilot uses Algolia Agent Studio to retrieve specific, often-conflicting policy clauses (e.g., General Returns vs. Specific Manufacturer Warranties) and performs **Conflict Resolution** to provide a legally grounded and customer-centric decision.

## 2. The "Magic" Demo Scenario
*   **Customer Input:** "I bought a Pro-Treadmill 45 days ago. The motor just stopped working. I want a refund."
*   **The "Dumb" Bot Response:** "Sorry, our return policy is 30 days. Request denied."
*   **PolicyPilot Logic:**
    1.  **Retrieves** General Return Policy (30 days).
    2.  **Retrieves** specific "Pro-Treadmill Warranty" (2-year motor coverage).
    3.  **Resolves conflict:** Recognizes the warranty overrides the return window for mechanical failures.
    4.  **Action:** Approves a warranty claim and drafts a response citing Clause 14.b.

## 3. Tech Stack
*   **Search & Retrieval:** Algolia Agent Studio + Vector Search (The "Source of Truth").
*   **Agent Logic:** Node.js + LLM (Gemini 1.5 Flash or GPT-4o).
*   **Frontend:** React + Tailwind CSS (The "Compliance Dashboard").
*   **UI Components:** Algolia InstantSearch (for visualizing the retrieval step).

## 4. Why it wins the Algolia Hackathon
1.  **Addresses "Non-Conversational" Track:** It acts as a proactive decision-engine within a support workflow.
2.  **Solves the Hallucination Problem:** By grounding the agent in Algolia-retrieved documents, we ensure 100% policy compliance.
3.  **Visualizes the Invisible:** The dashboard will show the *reasoning*—comparing conflicting policies side-by-side—which makes for a powerful demo.

## 5. 3-Day Execution Plan
*   **Day 1 (Data):** Create `policies.json` with nuanced edge-cases and index them in Algolia.
*   **Day 2 (Agent):** Build the "Reasoning Engine" that takes ticket text, queries Algolia, and performs the LLM conflict resolution.
*   **Day 3 (UI/UX):** Build the "Compliance Dashboard" to show the Input -> Retrieval -> Reasoning -> Verdict flow.

## 6. Edge Cases for Demo
*   **The "Hygiene" Case:** Attempting to return opened headphones (Policy: Strictly forbidden for hygiene).
*   **The "Shipping Damage" Case:** Return window passed, but customer reported damage within 48 hours of delivery (Policy: Damage reports override return windows).
*   **The "Standard Return":** Simple case within the 30-day window.
