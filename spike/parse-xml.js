/**
 * Lightweight XML tag extractor for Agent Studio responses.
 * Not a full XML parser — extracts content between known tags via regex.
 */

/**
 * Extract content between XML tags. Returns null if tag not found.
 */
function extractTag(xml, tagName) {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`);
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Extract all occurrences of a repeating tag.
 */
function extractAllTags(xml, tagName) {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, 'g');
  const matches = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
}

/**
 * Parse the full XML response into a structured object.
 * Returns null if essential tags are missing.
 */
export function parseVerdictXml(xml) {
  if (!xml || typeof xml !== 'string') return null;

  const verdict = extractTag(xml, 'verdict');
  if (!verdict) return null;

  const verdictType = extractTag(xml, 'verdict_type');
  const summary = extractTag(xml, 'summary');
  const recommendedAction = extractTag(xml, 'recommended_action');

  // Parse policies
  const policyBlocks = extractAllTags(xml, 'policy');
  const policies = policyBlocks.map(block => ({
    clauseId: extractTag(block, 'clause_id'),
    policyName: extractTag(block, 'policy_name'),
    applies: extractTag(block, 'applies') === 'true',
    effect: extractTag(block, 'effect'),
    reason: extractTag(block, 'reason'),
  }));

  // Parse conflict
  const conflictBlock = extractTag(xml, 'conflict');
  const conflict = conflictBlock ? {
    exists: extractTag(conflictBlock, 'exists') === 'true',
    description: extractTag(conflictBlock, 'description'),
  } : { exists: false, description: null };

  // Parse resolution
  const resolutionBlock = extractTag(xml, 'resolution');
  const resolution = resolutionBlock ? {
    winningPolicy: extractTag(resolutionBlock, 'winning_policy'),
    ruleApplied: extractTag(resolutionBlock, 'rule_applied'),
  } : null;

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
