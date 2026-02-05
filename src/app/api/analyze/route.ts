import { NextRequest, NextResponse } from "next/server";

const APP_ID = process.env.ALGOLIA_APP_ID;
const API_KEY = process.env.ALGOLIA_SEARCH_API_KEY;
const AGENT_ID = process.env.ALGOLIA_AGENT_ID;

const TIMEOUT_MS = 30_000;

export async function POST(request: NextRequest) {
  if (!APP_ID || !API_KEY || !AGENT_ID) {
    return NextResponse.json(
      { error: "Server misconfigured: missing Algolia credentials" },
      { status: 500 },
    );
  }

  let body: { ticketText?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { ticketText } = body;
  if (!ticketText || typeof ticketText !== "string" || !ticketText.trim()) {
    return NextResponse.json(
      { error: "Missing or empty ticketText field" },
      { status: 400 },
    );
  }

  const url = `https://${APP_ID}.algolia.net/agent-studio/1/agents/${AGENT_ID}/completions?compatibilityMode=ai-sdk-5`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Algolia-Application-Id": APP_ID,
        "X-Algolia-API-Key": API_KEY,
      },
      body: JSON.stringify({
        messages: [
          { role: "user", parts: [{ type: "text", text: ticketText }] },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Agent Studio error:", response.status, errorText);
      return NextResponse.json(
        { error: `Agent Studio returned ${response.status}` },
        { status: 500 },
      );
    }

    // Parse SSE stream to extract text content
    const rawText = await response.text();
    const lines = rawText.split("\n").filter((l) => l.startsWith("data: "));

    let assembledText = "";
    for (const line of lines) {
      try {
        const event = JSON.parse(line.replace("data: ", ""));
        if (event.type === "text-delta" && event.delta) {
          assembledText += event.delta;
        }
      } catch {
        // Skip non-JSON lines (e.g., [DONE])
      }
    }

    if (!assembledText) {
      return NextResponse.json(
        { error: "No text content in agent response" },
        { status: 500 },
      );
    }

    return NextResponse.json({ rawXml: assembledText });
  } catch (err: unknown) {
    clearTimeout(timeout);

    if (err instanceof DOMException && err.name === "AbortError") {
      return NextResponse.json({ error: "timeout" }, { status: 504 });
    }

    console.error("Analyze route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
