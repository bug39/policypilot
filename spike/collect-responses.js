import 'dotenv/config';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const APP_ID = process.env.ALGOLIA_APP_ID;
const API_KEY = process.env.ALGOLIA_SEARCH_API_KEY;
const AGENT_ID = process.env.ALGOLIA_AGENT_ID;

if (!APP_ID || !API_KEY || !AGENT_ID) {
  console.error('Missing required env vars: ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY, ALGOLIA_AGENT_ID');
  process.exit(1);
}

const ENDPOINT = `https://${APP_ID}.algolia.net/agent-studio/1/agents/${AGENT_ID}/completions?compatibilityMode=ai-sdk-5`;

const scenarios = [
  {
    name: 'Scenario 1 (Warranty Override)',
    filename: 'scenario-1-warranty.xml',
    ticket: `Subject: REFUND REQUEST - Order #48291\nCustomer: Jamie Chen | Product: Pro-Treadmill X500 | Purchased: 12/22/2025\n\n"I've been using this treadmill for about 6 weeks and the motor just completely stopped working mid-run. I almost fell off. This is a $2,000 machine and I expect better. I want a full refund."`,
  },
  {
    name: 'Scenario 2 (Hygiene Block)',
    filename: 'scenario-2-hygiene.xml',
    ticket: `Subject: Return Request - Order #51847\nCustomer: Alex Rivera | Product: SoundPro Wireless Earbuds | Purchased: 01/28/2026\n\n"These earbuds don't fit my ears well. I've tried all the tip sizes but they keep falling out during my runs. I'd like to return them for a refund."`,
  },
  {
    name: 'Scenario 3 (Damage Override)',
    filename: 'scenario-3-damage.xml',
    ticket: `Subject: DAMAGED SHIPMENT - Order #49103\nCustomer: Morgan Taylor | Product: Alpine Pro Hiking Boots | Purchased: 12/28/2025\n\n"My package arrived completely crushed and the boots inside are scuffed and the sole is partially detached. I contacted the carrier the same day. This was over a month ago and I've been going back and forth with your team. I want this resolved."`,
  },
  {
    name: 'Scenario 4 (Clean Approval)',
    filename: 'scenario-4-clean.xml',
    ticket: `Subject: Return - Order #52201\nCustomer: Sam Park | Product: TrailBlazer Daypack | Purchased: 01/27/2026\n\n"This backpack is smaller than I expected from the photos. Never used it, still has tags. Can I return it?"`,
  },
];

async function sendAndCollect(ticket) {
  const body = {
    messages: [
      {
        role: 'user',
        parts: [{ type: 'text', text: ticket }],
      },
    ],
  };

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Algolia-Application-Id': APP_ID,
      'X-Algolia-API-Key': API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API returned ${res.status}: ${errText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let collectedText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const dataStr = line.slice(6).trim();
      if (!dataStr || dataStr === '[DONE]') continue;

      try {
        const data = JSON.parse(dataStr);
        if (data.type === 'text-delta' && data.delta) {
          collectedText += data.delta;
        }
      } catch {
        // Skip non-JSON data lines
      }
    }
  }

  // Process any remaining buffer
  if (buffer && buffer.startsWith('data: ')) {
    const dataStr = buffer.slice(6).trim();
    if (dataStr && dataStr !== '[DONE]') {
      try {
        const data = JSON.parse(dataStr);
        if (data.type === 'text-delta' && data.delta) {
          collectedText += data.delta;
        }
      } catch {
        // Skip
      }
    }
  }

  return collectedText;
}

async function main() {
  const outputDir = join(ROOT, 'src', 'data', 'sample-responses');

  for (const scenario of scenarios) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Sending: ${scenario.name}`);
    console.log('='.repeat(60));

    const startTime = Date.now();

    try {
      const response = await sendAndCollect(scenario.ticket);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log(`Response received in ${elapsed}s (${response.length} chars)`);

      // Extract just the XML if there's preamble text
      const xmlMatch = response.match(/<analysis>[\s\S]*<\/analysis>/);
      const xmlContent = xmlMatch ? xmlMatch[0] : response;

      const outPath = join(outputDir, scenario.filename);
      writeFileSync(outPath, xmlContent, 'utf-8');
      console.log(`Saved to: ${outPath}`);

      // Show verdict
      const verdictMatch = xmlContent.match(/<verdict>(.*?)<\/verdict>/);
      if (verdictMatch) {
        console.log(`Verdict: ${verdictMatch[1]}`);
      }

      // Show first 300 chars preview
      console.log(`Preview: ${xmlContent.substring(0, 300)}...`);
    } catch (err) {
      console.error(`FAILED: ${err.message}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('All scenarios complete.');
  console.log('='.repeat(60));
}

main();
