# PolicyPilot — Agent Operating Instructions

## Deadline: February 8, 2026 at 11:59 PM PST

## Session Start Protocol

Every session MUST begin with:
1. Read `claude-progress.txt` for context on what's been done and what's next.
2. Read `features.json` to identify the next incomplete feature (`"passes": false`).
3. Read `SPEC.md` if you need requirements detail for the current feature.
4. Run `./init.sh` to verify the dev environment (if project is scaffolded).

## How to Work

- **One feature at a time.** Pick the lowest-numbered feature with `"passes": false`. Complete it fully before moving to the next.
- **Follow the verification steps.** Each feature in `features.json` has explicit steps. Do them in order. Do not skip verification.
- **Commit after each feature.** Every completed feature gets its own git commit with a message referencing the feature ID (e.g., "F08: Next.js project scaffolding").
- **Update `features.json`** after completing a feature: change `"passes": false` to `"passes": true`.
- **Update `claude-progress.txt`** at the end of every session with: what was completed, decisions made, blockers encountered, and what the next session should do.

## What NOT to Do

- Do not add, remove, or redefine features in `features.json`. Only change the `passes` field.
- Do not work on stretch goals until ALL MVP features (F01-F23) pass.
- Do not add a chat widget or any conversational UI element (weakens non-conversational track positioning).
- Do not expose Algolia API keys in client-side code. All Agent Studio calls go through the Next.js API route proxy.

## Key Files

| File | Purpose | When to read |
|---|---|---|
| `SPEC.md` | Full project specification — architecture, UX, data model, requirements | When you need detail on what to build |
| `features.json` | Feature list with verification steps — the build contract | Every session start, after every feature |
| `claude-progress.txt` | Session handoff log — what's done, decisions, blockers | Every session start and end |
| `init.sh` | Dev environment boot script | Every session start |
| `system-prompt.md` | Agent Studio system prompt (created in F07) | When working on Agent Studio or prompt-related features |
| `submission-draft.md` | Dev.to submission post draft (started in F07) | When working on F23 |

## Architecture Quick Reference

- **Track:** Non-Conversational (proactive workflow enhancement for support agents)
- **Stack:** Algolia Agent Studio + Next.js + React + Tailwind + Vercel
- **API:** Frontend → `/api/analyze` (Next.js route) → Algolia `/completions` endpoint
- **Output:** Agent returns XML tags → frontend parser → structured UI components
- **LLM:** Temperature=0 for determinism. Free GPT-4.1 for dev, paid OpenAI for prod.

## Phase Targets

| Phase | Features | Target |
|---|---|---|
| spike | F01-F03 | Day 0 (Feb 5) |
| data | F04-F07 | Day 1 (Feb 6) |
| foundation | F08-F12 | Day 1 evening → Day 2 morning |
| ui | F13-F19 | Day 2 (Feb 7) |
| integration | F20 | Day 2 evening |
| ship | F21-F23 | Day 3 (Feb 8) |
