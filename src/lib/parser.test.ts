import { describe, it, expect } from "vitest";
import { parseVerdictResponse } from "./parser";
import { readFileSync } from "fs";
import path from "path";

// Load real sample responses for testing
const sampleDir = path.resolve(__dirname, "../data/sample-responses");
const scenario1Xml = readFileSync(
  path.join(sampleDir, "scenario-1-warranty.xml"),
  "utf-8",
);
const scenario4Xml = readFileSync(
  path.join(sampleDir, "scenario-4-clean.xml"),
  "utf-8",
);

describe("parseVerdictResponse", () => {
  it("parses Scenario 1 XML (APPROVED, conflict, multiple policies)", () => {
    const result = parseVerdictResponse(scenario1Xml);
    expect(result).not.toBeNull();
    expect(result!.verdict).toBe("APPROVED");
    expect(result!.verdictType).toBe("warranty_claim");
    expect(result!.summary).toBeTruthy();
    expect(result!.policies.length).toBeGreaterThanOrEqual(2);
    expect(result!.conflict.exists).toBe(true);
    expect(result!.conflict.description).toBeTruthy();
    expect(result!.resolution).not.toBeNull();
    expect(result!.recommendedAction).toBeTruthy();

    // Check specific policies
    const war31 = result!.policies.find((p) => p.clauseId === "WAR-3.1");
    expect(war31).toBeDefined();
    expect(war31!.applies).toBe(true);

    const ret11 = result!.policies.find((p) => p.clauseId === "RET-1.1");
    expect(ret11).toBeDefined();
    expect(ret11!.applies).toBe(false);
  });

  it("parses Scenario 4 XML (APPROVED, no conflict, single applicable policy)", () => {
    const result = parseVerdictResponse(scenario4Xml);
    expect(result).not.toBeNull();
    expect(result!.verdict).toBe("APPROVED");
    expect(result!.verdictType).toBe("standard_return");
    expect(result!.conflict.exists).toBe(false);
    expect(result!.resolution).not.toBeNull();
    expect(result!.resolution!.winningPolicy).toBe("RET-1.1");

    const ret11 = result!.policies.find((p) => p.clauseId === "RET-1.1");
    expect(ret11).toBeDefined();
    expect(ret11!.applies).toBe(true);
  });

  it("returns null for malformed XML (missing closing tags)", () => {
    const malformed = `<analysis>
      <verdict>APPROVED
      <summary>Missing closing tags everywhere`;
    const result = parseVerdictResponse(malformed);
    expect(result).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseVerdictResponse("")).toBeNull();
  });

  it("returns null for null/undefined input", () => {
    expect(parseVerdictResponse(null as unknown as string)).toBeNull();
    expect(parseVerdictResponse(undefined as unknown as string)).toBeNull();
  });

  it("handles XML with extra whitespace and newlines", () => {
    const spacey = `

      <analysis>

        <verdict>  DENIED  </verdict>
        <verdict_type>  hygiene_exception  </verdict_type>
        <summary>  Denied due to hygiene.  </summary>

        <policies>
          <policy>
            <clause_id>  HYG-4.1  </clause_id>
            <policy_name>  Hygiene Exception Policy  </policy_name>
            <applies>  true  </applies>
            <effect>  return_denied  </effect>
            <reason>  Opened in-ear product.  </reason>
          </policy>
        </policies>

        <conflict>
          <exists>  true  </exists>
          <description>  General vs hygiene.  </description>
        </conflict>

        <resolution>
          <winning_policy>  HYG-4.1  </winning_policy>
          <rule_applied>  Layer 4 wins.  </rule_applied>
        </resolution>

        <recommended_action>  Inform customer.  </recommended_action>
      </analysis>

    `;
    const result = parseVerdictResponse(spacey);
    expect(result).not.toBeNull();
    expect(result!.verdict).toBe("DENIED");
    expect(result!.policies[0].clauseId).toBe("HYG-4.1");
    expect(result!.conflict.exists).toBe(true);
  });

  it("handles LLM preamble text before <analysis> tag", () => {
    const withPreamble = `Here is my analysis of the support ticket:

I've reviewed the relevant policies and here is my structured output:

<analysis>
  <verdict>APPROVED</verdict>
  <verdict_type>standard_return</verdict_type>
  <summary>Return approved within 30-day window.</summary>
  <policies>
    <policy>
      <clause_id>RET-1.1</clause_id>
      <policy_name>General Return Policy</policy_name>
      <applies>true</applies>
      <effect>return_approved</effect>
      <reason>Within 30 days, original condition.</reason>
    </policy>
  </policies>
  <conflict>
    <exists>false</exists>
    <description>No conflict detected.</description>
  </conflict>
  <resolution>
    <winning_policy>RET-1.1</winning_policy>
    <rule_applied>No conflict resolution needed.</rule_applied>
  </resolution>
  <recommended_action>Process the return.</recommended_action>
</analysis>

Some trailing text here too.`;

    const result = parseVerdictResponse(withPreamble);
    expect(result).not.toBeNull();
    expect(result!.verdict).toBe("APPROVED");
    expect(result!.policies[0].clauseId).toBe("RET-1.1");
  });

  it("handles special characters in policy text (<, >, &)", () => {
    const withSpecial = `<analysis>
  <verdict>ESCALATE</verdict>
  <verdict_type>escalation</verdict_type>
  <summary>Items valued at &gt; $500 &amp; marked as &lt;special&gt; require manager review.</summary>
  <policies>
    <policy>
      <clause_id>RET-1.1</clause_id>
      <policy_name>General Return Policy</policy_name>
      <applies>true</applies>
      <effect>return_approved</effect>
      <reason>Customer wants to return item worth &gt; $1000.</reason>
    </policy>
  </policies>
  <conflict>
    <exists>false</exists>
    <description>No conflict &amp; no issues.</description>
  </conflict>
  <resolution>
    <winning_policy>RET-1.1</winning_policy>
    <rule_applied>Standard policy with &lt;no&gt; overrides.</rule_applied>
  </resolution>
  <recommended_action>Escalate for &amp; review.</recommended_action>
</analysis>`;

    const result = parseVerdictResponse(withSpecial);
    expect(result).not.toBeNull();
    expect(result!.verdict).toBe("ESCALATE");
    expect(result!.summary).toContain("&gt;");
    expect(result!.policies[0].reason).toContain("&gt;");
  });

  it("returns null for invalid verdict value", () => {
    const invalid = `<analysis>
  <verdict>MAYBE</verdict>
  <verdict_type>unknown</verdict_type>
  <summary>Not sure.</summary>
  <policies></policies>
  <conflict><exists>false</exists><description>None.</description></conflict>
  <resolution><winning_policy>N/A</winning_policy><rule_applied>N/A</rule_applied></resolution>
  <recommended_action>N/A</recommended_action>
</analysis>`;
    expect(parseVerdictResponse(invalid)).toBeNull();
  });

  it("handles response with no policies gracefully", () => {
    const noPolicies = `<analysis>
  <verdict>ESCALATE</verdict>
  <verdict_type>escalation</verdict_type>
  <summary>No relevant policies found.</summary>
  <policies></policies>
  <conflict>
    <exists>false</exists>
    <description>No policies to conflict.</description>
  </conflict>
  <resolution>
    <winning_policy></winning_policy>
    <rule_applied>No policies found, escalating.</rule_applied>
  </resolution>
  <recommended_action>Escalate to supervisor.</recommended_action>
</analysis>`;

    const result = parseVerdictResponse(noPolicies);
    expect(result).not.toBeNull();
    expect(result!.verdict).toBe("ESCALATE");
    expect(result!.policies).toHaveLength(0);
  });
});
