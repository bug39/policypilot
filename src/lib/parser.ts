import type { ParsedVerdict, ParsedPolicy } from "@/types";

function extractTag(xml: string, tagName: string): string | null {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`);
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

function extractAllTags(xml: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, "g");
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
}

function parsePolicy(block: string): ParsedPolicy {
  return {
    clauseId: extractTag(block, "clause_id") ?? "",
    policyName: extractTag(block, "policy_name") ?? "",
    applies: extractTag(block, "applies") === "true",
    effect: extractTag(block, "effect") ?? "",
    reason: extractTag(block, "reason") ?? "",
  };
}

/**
 * Parse an XML response from Agent Studio into a structured ParsedVerdict.
 * Returns null if the response is malformed or missing essential tags.
 * Never throws — all parsing failures return null.
 */
export function parseVerdictResponse(raw: string): ParsedVerdict | null {
  if (!raw || typeof raw !== "string") return null;

  // Extract the <analysis> block — handles LLM preamble text before it
  const analysisBlock = extractTag(raw, "analysis");
  const xml = analysisBlock ?? raw;

  const verdict = extractTag(xml, "verdict");
  if (!verdict) return null;

  if (
    verdict !== "APPROVED" &&
    verdict !== "DENIED" &&
    verdict !== "ESCALATE"
  ) {
    return null;
  }

  const verdictType = extractTag(xml, "verdict_type") ?? "";
  const summary = extractTag(xml, "summary") ?? "";
  const recommendedAction = extractTag(xml, "recommended_action") ?? "";

  // Parse policies
  const policyBlocks = extractAllTags(xml, "policy");
  const policies = policyBlocks.map(parsePolicy);

  // Parse conflict
  const conflictBlock = extractTag(xml, "conflict");
  const conflict = {
    exists: conflictBlock
      ? extractTag(conflictBlock, "exists") === "true"
      : false,
    description: conflictBlock
      ? extractTag(conflictBlock, "description") ?? ""
      : "",
  };

  // Parse resolution
  const resolutionBlock = extractTag(xml, "resolution");
  const resolution = resolutionBlock
    ? {
        winningPolicy: extractTag(resolutionBlock, "winning_policy") ?? "",
        ruleApplied: extractTag(resolutionBlock, "rule_applied") ?? "",
      }
    : null;

  return {
    verdict,
    verdictType,
    summary,
    policies,
    conflict,
    resolution,
    recommendedAction,
  };
}
