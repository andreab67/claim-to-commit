import { readFile } from "node:fs/promises";
import path from "node:path";

import type {
  DecisionEvidenceReference,
  ResolvedEvidence,
} from "../../shared/evidence.js";
import { missingEvidence, resolvedEvidence } from "./evidence-result.js";

export async function validateDecision(
  repositoryPath: string,
  reference: DecisionEvidenceReference,
): Promise<ResolvedEvidence> {
  try {
    const decisions = await readFile(
      path.join(repositoryPath, "DECISIONS.md"),
      "utf8",
    );
    const escapedId = reference.decisionId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const heading = new RegExp(`^#{2,6}\\s+${escapedId}(?=[:\\s-]|$)`, "im");

    if (!heading.test(decisions)) {
      return missingEvidence(
        reference,
        "DECISION_MISSING",
        `${reference.decisionId} was not found in DECISIONS.md.`,
      );
    }

    return resolvedEvidence(
      reference,
      `${reference.decisionId} is recorded in DECISIONS.md.`,
      { decisionId: reference.decisionId, path: "DECISIONS.md" },
    );
  } catch {
    return missingEvidence(
      reference,
      "DECISION_LEDGER_MISSING",
      "DECISIONS.md is missing or unreadable.",
    );
  }
}
