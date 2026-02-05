import type { ParsedVerdict } from "@/types";

export const mockVerdicts: Record<string, ParsedVerdict> = {
  "ticket-1": {
    verdict: "APPROVED",
    verdictType: "warranty_claim",
    summary:
      "The customer's request for a refund due to a defective motor is approved, as the motor failure falls under the Pro-Treadmill X500 2-Year Motor Warranty, overriding the expired 30-day return window.",
    policies: [
      {
        clauseId: "RET-1.1",
        policyName: "General Return Policy",
        applies: false,
        effect: "return_denied",
        reason:
          "The purchase was made 6 weeks ago, which is outside the 30-day standard return window.",
      },
      {
        clauseId: "WAR-3.1",
        policyName: "Pro-Treadmill X500 Motor Warranty",
        applies: true,
        effect: "warranty_approved",
        reason:
          "The motor failed within approximately 6 weeks of purchase, which is within the 2-year motor warranty period.",
      },
      {
        clauseId: "DEF-4.1",
        policyName: "Defective Item Override Policy",
        applies: true,
        effect: "return_approved",
        reason:
          "The motor stopped working, indicating a potential defect, which overrides the standard return window if confirmed.",
      },
    ],
    conflict: {
      exists: true,
      description:
        "The General Return Policy (RET-1.1) would deny the return due to being outside the 30-day window, while the Pro-Treadmill X500 Motor Warranty (WAR-3.1) and the Defective Item Override Policy (DEF-4.1) would approve a resolution due to a product defect.",
    },
    resolution: {
      winningPolicy: "WAR-3.1",
      ruleApplied:
        "The product-specific motor warranty (policy_layer 3) overrides the general return policy (policy_layer 1) for motor-related mechanical defects per Clause 14.b.",
    },
    recommendedAction:
      "Arrange for the Pro-Treadmill X500 to be inspected by Apex Gear's quality team to confirm the motor defect. Upon confirmation, process a full refund or offer a motor replacement under warranty.",
  },

  "ticket-2": {
    verdict: "DENIED",
    verdictType: "hygiene_exception",
    summary:
      "The return request for the SoundPro Wireless Earbuds is denied due to hygiene reasons, as the product is an opened in-ear audio item.",
    policies: [
      {
        clauseId: "RET-1.1",
        policyName: "General Return Policy",
        applies: false,
        effect: "return_denied",
        reason:
          "While within the 30-day return window, the earbuds have been opened and used, so the general return policy's time-based eligibility is overridden by the hygiene exception.",
      },
      {
        clauseId: "HYG-4.1",
        policyName: "Hygiene Exception Policy",
        applies: true,
        effect: "return_denied",
        reason:
          "The SoundPro Wireless Earbuds are an in-ear audio product and have been opened, making them ineligible for return due to hygiene reasons.",
      },
      {
        clauseId: "WAR-3.3",
        policyName: "SoundPro Wireless Earbuds Warranty",
        applies: false,
        effect: "warranty_approved",
        reason:
          "The customer's issue is related to fit, not an electronic defect covered by this warranty.",
      },
    ],
    conflict: {
      exists: true,
      description:
        "The General Return Policy (RET-1.1) would, based on its time condition, potentially allow a return within 30 days, but the Hygiene Exception Policy (HYG-4.1) specifically denies returns for opened in-ear audio products.",
    },
    resolution: {
      winningPolicy: "HYG-4.1",
      ruleApplied:
        "Situational overrides (policy_layer 4) always take precedence over general policies (policy_layer 1) when their conditions are met. HYG-4.1 is a layer 4 policy and applies directly to this situation.",
    },
    recommendedAction:
      "Inform the customer that their return request is denied due to the hygiene policy for opened in-ear audio products. Suggest they may exchange for the same product if a manufacturing defect is confirmed.",
  },

  "ticket-3": {
    verdict: "APPROVED",
    verdictType: "damage_claim",
    summary:
      "The return is approved because the product arrived damaged due to shipping and the customer reported the damage to the carrier on the same day, overriding the standard return window.",
    policies: [
      {
        clauseId: "RET-1.1",
        policyName: "General Return Policy",
        applies: false,
        effect: "return_denied",
        reason:
          "The purchase date of 12/28/2025 is more than 30 days ago, making the standard return window expired.",
      },
      {
        clauseId: "DMG-4.1",
        policyName: "Shipping Damage Override Policy",
        applies: true,
        effect: "return_approved",
        reason:
          "The package arrived crushed and the customer reported the shipping damage to the carrier the same day, fulfilling the 48-hour reporting requirement.",
      },
      {
        clauseId: "WAR-3.4",
        policyName: "Alpine Pro Hiking Boots Warranty",
        applies: true,
        effect: "warranty_approved",
        reason:
          "The partially detached sole could be considered a manufacturing defect covered by the 1-year warranty, but the shipping damage override is more directly applicable.",
      },
    ],
    conflict: {
      exists: true,
      description:
        "The General Return Policy (RET-1.1) would deny the return due to being outside the 30-day window, but the Shipping Damage Override Policy (DMG-4.1) approves the return because the damage was reported to the carrier within 48 hours.",
    },
    resolution: {
      winningPolicy: "DMG-4.1",
      ruleApplied:
        "The Shipping Damage Override Policy (DMG-4.1) is a situational override (policy_layer 4), which takes precedence over the General Return Policy (policy_layer 1).",
    },
    recommendedAction:
      "Process a full refund or replacement for the Alpine Pro Hiking Boots as per the Shipping Damage Override Policy. Ensure documentation of the carrier damage report is obtained from the customer.",
  },

  "ticket-4": {
    verdict: "APPROVED",
    verdictType: "standard_return",
    summary:
      "The customer's return request for the TrailBlazer Daypack is approved as it is within the 30-day return window and the item is in original condition with tags.",
    policies: [
      {
        clauseId: "RET-1.1",
        policyName: "General Return Policy",
        applies: true,
        effect: "return_approved",
        reason:
          "The purchase date of 01/27/2026 is within the 30-day return window, and the item is in its original condition with tags.",
      },
      {
        clauseId: "WAR-3.5",
        policyName: "TrailBlazer Daypack Warranty",
        applies: false,
        effect: "warranty_approved",
        reason:
          "The customer's issue is not a zipper defect, so this warranty does not apply.",
      },
    ],
    conflict: {
      exists: false,
      description: "No conflict detected.",
    },
    resolution: {
      winningPolicy: "RET-1.1",
      ruleApplied:
        "No conflict resolution was needed as only one policy directly applied to the return request.",
    },
    recommendedAction:
      "Provide the customer with instructions for returning the TrailBlazer Daypack for a full refund, ensuring it remains in its original condition with tags.",
  },
};
