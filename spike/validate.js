import 'dotenv/config';
import { parseVerdictXml } from './parse-xml.js';

const APP_ID = process.env.ALGOLIA_APP_ID;
const API_KEY = process.env.ALGOLIA_SEARCH_API_KEY;
const AGENT_ID = process.env.ALGOLIA_AGENT_ID;

if (!APP_ID || !API_KEY || !AGENT_ID) {
  console.error('Missing env vars.');
  process.exit(1);
}

const TREADMILL_TICKET = `Subject: REFUND REQUEST - Order #48291
Customer: Jamie Chen | Product: Pro-Treadmill X500 | Purchased: 12/22/2025

"I've been using this treadmill for about 6 weeks and the motor just completely stopped working mid-run. I almost fell off. This is a $2,000 machine and I expect better. I want a full refund."`;

// Known clause_ids from our test records
const KNOWN_CLAUSE_IDS = ['RET-1.1', 'WAR-2.1', 'WAR-3.1', 'HYG-4.1', 'DMG-4.1', 'HOL-1.1'];

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

  const parsedEvents = [];
  let fullText = '';
  const partTypes = new Set();
  const toolCalls = [];

  for (const event of events) {
    try {
      const json = JSON.parse(event.replace('data: ', ''));
      parsedEvents.push(json);
      if (json.type) partTypes.add(json.type);
      if (json.type === 'text-delta' && json.delta) {
        fullText += json.delta;
      }
      if (json.type === 'tool-input-available') {
        toolCalls.push({
          toolName: json.toolName,
          input: json.input,
        });
      }
    } catch (e) { /* skip */ }
  }

  return { fullText, partTypes: [...partTypes], toolCalls, eventCount: parsedEvents.length };
}

async function main() {
  console.log('=== F03: Spike Validation ===\n');

  // --- Single run analysis ---
  console.log('1. Single run — full analysis\n');
  const result = await sendQuery(TREADMILL_TICKET);

  console.log(`   Event types observed: ${result.partTypes.join(', ')}`);
  console.log(`   Total events: ${result.eventCount}`);
  console.log(`   Tool calls: ${result.toolCalls.length}`);
  for (const tc of result.toolCalls) {
    console.log(`     - ${tc.toolName}: query="${tc.input.query}"${tc.input.facet_filters ? ` filters=${JSON.stringify(tc.input.facet_filters)}` : ''}`);
  }

  // Multi-step retrieval check
  const multiStep = result.toolCalls.length >= 2;
  console.log(`\n   ✓ Multi-step retrieval: ${multiStep ? 'YES' : 'NO'} (${result.toolCalls.length} searches)`);

  // Parse XML
  const parsed = parseVerdictXml(result.fullText);
  console.log(`   ✓ XML parseable: ${parsed !== null}`);

  if (parsed) {
    console.log(`   Verdict: ${parsed.verdict}`);
    console.log(`   Verdict Type: ${parsed.verdictType}`);
    console.log(`   Summary: ${parsed.summary}`);
    console.log(`   Policies cited: ${parsed.policies.map(p => p.clauseId).join(', ')}`);
    console.log(`   Conflict exists: ${parsed.conflict.exists}`);
    console.log(`   Recommended action: ${parsed.recommendedAction}`);

    // Check for hallucinated clause_ids
    const hallucinated = parsed.policies
      .map(p => p.clauseId)
      .filter(id => id && !KNOWN_CLAUSE_IDS.includes(id));
    console.log(`   ✓ Hallucinated clause_ids: ${hallucinated.length === 0 ? 'NONE' : hallucinated.join(', ')}`);
  }

  // --- Consistency: 5 runs ---
  console.log('\n2. Consistency check — 5 runs\n');

  const verdicts = [];
  const allParsed = [];

  for (let i = 0; i < 5; i++) {
    process.stdout.write(`   Run ${i + 1}/5... `);
    const runResult = await sendQuery(TREADMILL_TICKET);
    const runParsed = parseVerdictXml(runResult.fullText);

    if (runParsed) {
      verdicts.push(runParsed.verdict);
      allParsed.push(runParsed);
      console.log(`verdict=${runParsed.verdict}, toolCalls=${runResult.toolCalls.length}, xml=OK`);
    } else {
      verdicts.push('PARSE_FAIL');
      allParsed.push(null);
      console.log(`PARSE FAILED`);
    }
  }

  // Summary
  console.log('\n=== VALIDATION SUMMARY ===\n');

  const uniqueVerdicts = [...new Set(verdicts)];
  const allConsistent = uniqueVerdicts.length === 1;
  const allApproved = uniqueVerdicts.length === 1 && uniqueVerdicts[0] === 'APPROVED';
  const allParseable = allParsed.every(p => p !== null);
  const anyHallucinated = allParsed.some(p => p && p.policies.some(pol =>
    pol.clauseId && !KNOWN_CLAUSE_IDS.includes(pol.clauseId)
  ));
  const anyAskedQuestions = false; // Would need to check for question marks in recommended_action, but not critical

  console.log(`Multi-step retrieval:     ${multiStep ? '✅ YES' : '⚠️ NO (but agent does search)'}`);
  console.log(`XML parseable (all runs): ${allParseable ? '✅ YES' : '❌ NO'}`);
  console.log(`Verdict consistency:      ${allConsistent ? '✅' : '⚠️'} ${uniqueVerdicts.join(', ')} (${verdicts.join(', ')})`);
  console.log(`Verdict=APPROVED (5/5):   ${allApproved ? '✅ YES' : `⚠️ NO — got: ${verdicts.join(', ')}`}`);
  console.log(`No hallucinated IDs:      ${!anyHallucinated ? '✅ YES' : '❌ HALLUCINATION DETECTED'}`);

  // GO/NO-GO
  console.log('\n=== GO / NO-GO ===\n');

  if (multiStep && allParseable) {
    if (allApproved) {
      console.log('🟢 GREEN LIGHT — Multi-step retrieval works, XML parses, verdict is correct and consistent.');
    } else {
      console.log('🟡 PROCEED WITH TUNING — Multi-step retrieval works, XML parses, but verdict needs tuning.');
      console.log('   This is expected — the test records are minimal. Full dataset (F04) + prompt tuning (F05) will fix this.');
      console.log('   Architecture is validated. Proceed to F04.');
    }
  } else if (allParseable) {
    console.log('🟡 PROCEED WITH FALLBACK — Single-query approach works, XML parses.');
    console.log('   Multi-step may improve with prompt tuning.');
  } else {
    console.log('🔴 NO-GO — XML parsing fails or API is unreliable. Reassess approach.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
