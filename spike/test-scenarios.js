/**
 * Test Agent Studio responses for all 4 demo scenarios.
 * Used for F05, F06, and F07 validation.
 *
 * Usage:
 *   node spike/test-scenarios.js [scenario_number] [runs]
 *   node spike/test-scenarios.js 1       # Test scenario 1 once
 *   node spike/test-scenarios.js 1 3     # Test scenario 1 three times
 *   node spike/test-scenarios.js all     # Test all scenarios once
 *   node spike/test-scenarios.js all 5   # Test all scenarios 5 times each (F07)
 */
import 'dotenv/config';
import { parseVerdictXml } from './parse-xml.js';

const APP_ID = process.env.ALGOLIA_APP_ID;
const API_KEY = process.env.ALGOLIA_SEARCH_API_KEY;
const AGENT_ID = process.env.ALGOLIA_AGENT_ID;

const SCENARIOS = {
  1: {
    name: 'Warranty Override (Treadmill)',
    expectedVerdict: 'APPROVED',
    mustFind: ['WAR-3.1'],
    mustConflict: true,
    ticket: `Subject: REFUND REQUEST - Order #48291
Customer: Jamie Chen | Product: Pro-Treadmill X500 | Purchased: 12/22/2025

"I've been using this treadmill for about 6 weeks and the motor just completely stopped working mid-run. I almost fell off. This is a $2,000 machine and I expect better. I want a full refund."`,
  },
  2: {
    name: 'Hygiene Block (Earbuds)',
    expectedVerdict: 'DENIED',
    mustFind: ['HYG-4.1'],
    mustConflict: true,
    ticket: `Subject: Return Request - Order #51847
Customer: Alex Rivera | Product: SoundPro Wireless Earbuds | Purchased: 01/28/2026

"These earbuds don't fit my ears well. I've tried all the tip sizes but they keep falling out during my runs. I'd like to return them for a refund."`,
  },
  3: {
    name: 'Damage Override (Hiking Boots)',
    expectedVerdict: 'APPROVED',
    mustFind: ['DMG-4.1'],
    mustConflict: true,
    ticket: `Subject: DAMAGED SHIPMENT - Order #49103
Customer: Morgan Taylor | Product: Alpine Pro Hiking Boots | Purchased: 12/28/2025

"My package arrived completely crushed and the boots inside are scuffed and the sole is partially detached. I contacted the carrier the same day. This was over a month ago and I've been going back and forth with your team. I want this resolved."`,
  },
  4: {
    name: 'Clean Approval (Backpack)',
    expectedVerdict: 'APPROVED',
    mustFind: ['RET-1.1'],
    mustConflict: false,
    ticket: `Subject: Return - Order #52201
Customer: Sam Park | Product: TrailBlazer Daypack | Purchased: 01/27/2026

"This backpack is smaller than I expected from the photos. Never used it, still has tags. Can I return it?"`,
  },
};

const KNOWN_CLAUSE_IDS = [
  'RET-1.1', 'RET-1.2', 'RET-1.3', 'EXC-1.1', 'REF-1.1', 'SHP-1.1',
  'WAR-2.1', 'WAR-2.2', 'WAR-2.3', 'WAR-2.4', 'WAR-2.5', 'RET-2.1',
  'WAR-3.1', 'WAR-3.2', 'WAR-3.3', 'WAR-3.4', 'WAR-3.5',
  'HYG-4.1', 'HYG-4.2', 'DMG-4.1', 'DMG-4.2', 'DEF-4.1', 'RCL-4.1',
  'LOY-1.1', 'HOL-1.1', 'BLK-1.1',
];

async function sendQuery(ticket) {
  const url = `https://${APP_ID}.algolia.net/agent-studio/1/agents/${AGENT_ID}/completions?compatibilityMode=ai-sdk-5`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Algolia-Application-Id': APP_ID,
      'X-Algolia-API-Key': API_KEY,
    },
    body: JSON.stringify({
      messages: [{ role: 'user', parts: [{ type: 'text', text: ticket }] }]
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${await response.text()}`);
  }

  const rawText = await response.text();
  const events = rawText.split('\n').filter(line => line.startsWith('data: '));

  let fullText = '';
  const toolCalls = [];

  for (const event of events) {
    try {
      const json = JSON.parse(event.replace('data: ', ''));
      if (json.type === 'text-delta' && json.delta) {
        fullText += json.delta;
      }
      if (json.type === 'tool-input-available') {
        toolCalls.push({
          toolName: json.toolName,
          query: json.input?.query,
          filters: json.input?.facet_filters || json.input?.filters,
        });
      }
    } catch (e) { /* skip */ }
  }

  return { fullText, toolCalls };
}

function evaluateResult(scenario, parsed, toolCalls) {
  const checks = [];

  // Verdict check
  const verdictOk = parsed.verdict === scenario.expectedVerdict;
  checks.push({ name: 'Verdict', pass: verdictOk, detail: `expected=${scenario.expectedVerdict}, got=${parsed.verdict}` });

  // Must-find clause_ids
  for (const cid of scenario.mustFind) {
    const found = parsed.policies.some(p => p.clauseId === cid);
    checks.push({ name: `Cites ${cid}`, pass: found, detail: found ? 'found' : 'MISSING' });
  }

  // Conflict detection
  if (scenario.mustConflict) {
    checks.push({ name: 'Conflict detected', pass: parsed.conflict.exists, detail: parsed.conflict.exists ? 'yes' : 'NO' });
  } else {
    checks.push({ name: 'No false conflict', pass: !parsed.conflict.exists, detail: parsed.conflict.exists ? 'SPURIOUS CONFLICT' : 'clean' });
  }

  // No hallucinated clause_ids
  const hallucinated = parsed.policies.map(p => p.clauseId).filter(id => id && !KNOWN_CLAUSE_IDS.includes(id));
  checks.push({ name: 'No hallucination', pass: hallucinated.length === 0, detail: hallucinated.length ? hallucinated.join(',') : 'clean' });

  // XML parsed
  checks.push({ name: 'XML parsed', pass: true, detail: 'ok' });

  return checks;
}

async function testScenario(num, run) {
  const scenario = SCENARIOS[num];
  const prefix = run !== undefined ? `  S${num} Run ${run}: ` : `  S${num}: `;

  try {
    const { fullText, toolCalls } = await sendQuery(scenario.ticket);
    const parsed = parseVerdictXml(fullText);

    if (!parsed) {
      console.log(`${prefix}❌ XML PARSE FAILED`);
      console.log(`     Raw (first 300): ${fullText.substring(0, 300)}`);
      return { pass: false, verdict: 'PARSE_FAIL' };
    }

    const checks = evaluateResult(scenario, parsed, toolCalls);
    const allPass = checks.every(c => c.pass);
    const icon = allPass ? '✅' : '❌';

    console.log(`${prefix}${icon} verdict=${parsed.verdict} | ${checks.map(c => `${c.name}:${c.pass ? '✓' : '✗'}`).join(' | ')}`);

    if (!allPass) {
      for (const c of checks.filter(c => !c.pass)) {
        console.log(`     FAIL: ${c.name} — ${c.detail}`);
      }
      console.log(`     Searches: ${toolCalls.map(tc => `"${tc.query}"${tc.filters ? ` [filters: ${JSON.stringify(tc.filters)}]` : ''}`).join(', ')}`);
    }

    return { pass: allPass, verdict: parsed.verdict, parsed };
  } catch (err) {
    console.log(`${prefix}❌ ERROR: ${err.message}`);
    return { pass: false, verdict: 'ERROR' };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const scenarioArg = args[0] || 'all';
  const runs = parseInt(args[1] || '1', 10);

  const scenarioNums = scenarioArg === 'all' ? [1, 2, 3, 4] : [parseInt(scenarioArg)];

  console.log(`=== Testing Scenario(s): ${scenarioArg} | Runs: ${runs} ===\n`);

  const results = {};

  for (const num of scenarioNums) {
    const scenario = SCENARIOS[num];
    if (!scenario) {
      console.log(`Unknown scenario: ${num}`);
      continue;
    }

    console.log(`Scenario ${num}: ${scenario.name} (expected: ${scenario.expectedVerdict})`);
    results[num] = [];

    for (let r = 1; r <= runs; r++) {
      const result = await testScenario(num, runs > 1 ? r : undefined);
      results[num].push(result);
    }
    console.log('');
  }

  // Summary
  console.log('=== SUMMARY ===');
  for (const [num, runResults] of Object.entries(results)) {
    const passCount = runResults.filter(r => r.pass).length;
    const total = runResults.length;
    const verdicts = runResults.map(r => r.verdict).join(', ');
    const icon = passCount === total ? '✅' : '❌';
    console.log(`  S${num}: ${icon} ${passCount}/${total} passed (verdicts: ${verdicts})`);
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
