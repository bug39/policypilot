import 'dotenv/config';

const APP_ID = process.env.ALGOLIA_APP_ID;
const API_KEY = process.env.ALGOLIA_SEARCH_API_KEY;
const AGENT_ID = process.env.ALGOLIA_AGENT_ID;

if (!APP_ID || !API_KEY || !AGENT_ID) {
  console.error('Missing env vars. Need: ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY, ALGOLIA_AGENT_ID');
  console.error('Current values:', { APP_ID: !!APP_ID, API_KEY: !!API_KEY, AGENT_ID: !!AGENT_ID });
  process.exit(1);
}

const TREADMILL_TICKET = `Subject: REFUND REQUEST - Order #48291
Customer: Jamie Chen | Product: Pro-Treadmill X500 | Purchased: 12/22/2025

"I've been using this treadmill for about 6 weeks and the motor just completely stopped working mid-run. I almost fell off. This is a $2,000 machine and I expect better. I want a full refund."`;

async function main() {
  console.log('=== F02: Test Agent Studio /completions ===\n');
  console.log(`App ID: ${APP_ID}`);
  console.log(`Agent ID: ${AGENT_ID}`);
  console.log(`API Key: ${API_KEY.substring(0, 8)}...`);

  const url = `https://${APP_ID}.algolia.net/agent-studio/1/agents/${AGENT_ID}/completions?compatibilityMode=ai-sdk-5`;

  console.log(`\nURL: ${url}`);
  console.log('\nSending treadmill scenario...\n');

  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Algolia-Application-Id': APP_ID,
        'X-Algolia-API-Key': API_KEY,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            parts: [{ type: 'text', text: TREADMILL_TICKET }]
          }
        ]
      })
    });

    const elapsed = Date.now() - startTime;
    console.log(`Response status: ${response.status} (${elapsed}ms)`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      process.exit(1);
    }

    // Response is SSE stream — read as text and parse
    const rawText = await response.text();
    console.log('\n=== FULL RAW SSE RESPONSE ===');
    console.log(rawText);
    console.log(`\n(total length: ${rawText.length} chars)`);

    // Parse SSE events
    const events = rawText.split('\n').filter(line => line.startsWith('data: '));
    console.log(`\n=== PARSED ${events.length} SSE EVENTS ===`);

    const parsedEvents = [];
    let fullText = '';
    const partTypes = new Set();

    for (const event of events) {
      try {
        const json = JSON.parse(event.replace('data: ', ''));
        parsedEvents.push(json);

        // Track part types
        if (json.type) partTypes.add(json.type);

        // Collect text deltas
        if (json.type === 'text-delta' && json.delta) {
          fullText += json.delta;
        }
      } catch (e) {
        // Skip non-JSON lines
      }
    }

    console.log('Event types observed:', [...partTypes]);
    console.log(`\nFirst 5 events:`);
    for (const evt of parsedEvents.slice(0, 5)) {
      console.log(JSON.stringify(evt).substring(0, 200));
    }
    console.log(`\nLast 3 events:`);
    for (const evt of parsedEvents.slice(-3)) {
      console.log(JSON.stringify(evt).substring(0, 200));
    }

    // Show tool calls
    const toolCalls = parsedEvents.filter(e => e.type === 'tool-call' || e.type === 'tool_call');
    const toolResults = parsedEvents.filter(e => e.type === 'tool-result' || e.type === 'tool_result');
    console.log(`\n=== TOOL CALLS: ${toolCalls.length} ===`);
    for (const tc of toolCalls) {
      console.log(JSON.stringify(tc).substring(0, 300));
    }
    console.log(`\n=== TOOL RESULTS: ${toolResults.length} ===`);
    for (const tr of toolResults) {
      console.log(JSON.stringify(tr).substring(0, 500));
    }

    // Show assembled text
    console.log('\n=== ASSEMBLED TEXT ===');
    console.log(fullText || '(no text-delta events found)');

    // Check for XML output
    const textContent = fullText;
    if (textContent) {
      const hasAnalysis = textContent.includes('<analysis>');
      const hasVerdict = textContent.includes('<verdict>');
      console.log('\n=== XML CHECK ===');
      console.log(`Contains <analysis>: ${hasAnalysis}`);
      console.log(`Contains <verdict>: ${hasVerdict}`);
      if (hasVerdict) {
        const verdictMatch = textContent.match(/<verdict>(.*?)<\/verdict>/);
        console.log(`Verdict value: ${verdictMatch ? verdictMatch[1] : 'NOT FOUND'}`);
      }
    }

  } catch (err) {
    console.error('Request failed:', err.message);
    process.exit(1);
  }
}

function extractTextContent(data) {
  if (data.message?.content && typeof data.message.content === 'string') {
    return data.message.content;
  }
  if (data.message?.parts) {
    return data.message.parts
      .filter(p => p.type === 'text')
      .map(p => p.text)
      .join('\n');
  }
  // Try other common patterns
  if (typeof data.content === 'string') return data.content;
  if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
  return null;
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
