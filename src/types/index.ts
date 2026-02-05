export interface PolicyRecord {
  objectID: string;
  policy_id: string;
  policy_name: string;
  clause_id: string;
  clause_title: string;
  text: string;
  policy_type:
    | "return"
    | "warranty"
    | "hygiene"
    | "shipping"
    | "exchange"
    | "refund";
  policy_layer: 1 | 2 | 3 | 4;
  applies_to: string;
  product_tags: string[];
  conditions: string[];
  effect: string;
  priority: number;
  specificity_score: number;
  effective_date: number;
  expiry_date: number | null;
}

export interface ParsedPolicy {
  clauseId: string;
  policyName: string;
  applies: boolean;
  effect: string;
  reason: string;
}

export interface ParsedVerdict {
  verdict: "APPROVED" | "DENIED" | "ESCALATE";
  verdictType: string;
  summary: string;
  policies: ParsedPolicy[];
  conflict: {
    exists: boolean;
    description: string;
  };
  resolution: {
    winningPolicy: string;
    ruleApplied: string;
  } | null;
  recommendedAction: string;
}

export interface DemoTicket {
  id: string;
  subject: string;
  customer: string;
  product: string;
  purchaseDate: string;
  message: string;
}

export type AnalysisState =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "timeout"
  | "parseFail";
