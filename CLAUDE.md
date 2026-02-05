# PolicyPilot

Deadline: **February 8, 2026 at 11:59 PM PST**

## Session Protocol

1. Read `claude-progress.txt` — what's done, what's next
2. Read `features.json` — pick the lowest `"passes": false` feature
3. Work one feature at a time. Follow its verification steps. Do not skip steps.
4. After completing a feature: set `"passes": true`, git commit with feature ID (e.g., "F08: Next.js scaffolding")
5. At session end: append to `claude-progress.txt` what you did, decisions made, and what's next

## Critical Rules

- Never modify `features.json` except flipping `passes` to `true`
- Never add a chat widget or conversational UI (non-conversational track)
- Never expose API keys client-side — all Agent Studio calls go through `/api/analyze` server-side proxy
- No stretch goals until all 23 MVP features pass

## Commands

```bash
./init.sh              # Boot dev environment, show feature progress
npm run dev            # Start Next.js dev server (localhost:3000)
npx tsc --noEmit       # Type check
npm test               # Run parser tests
```

## Code Style

- TypeScript strict mode, no `any` types
- React functional components with hooks
- Tailwind CSS for all styling, no CSS modules or inline styles
- Imports: use `@/` path alias for src/ directory

## Project Docs

- @SPEC.md — full architecture, UX design, data model, record schema, XML output format
- @features.json — 23 features across 6 phases with verification steps
