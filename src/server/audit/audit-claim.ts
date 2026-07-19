import type {
  Claim,
  ClaimAudit,
  EvidenceType,
  Finding,
  ResolvedEvidence,
} from "../../shared/evidence.js";

const GUIDANCE: Record<string, string> = {
  COMMIT_MISSING: "Reference an implementation commit that exists in this repository.",
  FILE_MISSING: "Reference a changed implementation file that exists in the repository.",
  TEST_MISSING: "Declare a machine-readable passing test result for this claim.",
  SCREENSHOT_MISSING: "Add a repository screenshot that visibly demonstrates this claim.",
  IMPLEMENTATION_UNPROVEN:
    "Connect the claim to a resolvable implementation commit before presenting it as delivered.",
  TEST_FAILED: "Run the declared validation command and record a passing result.",
};

export function auditClaim(
  claim: Claim,
  evidence: ResolvedEvidence[],
): ClaimAudit {
  const findings = evidence
    .filter((item) => item.resolution !== "resolved")
    .map(toFinding);

  const hasCommit = hasResolved(evidence, "commit");
  const hasFile = hasResolved(evidence, "file");
  const hasTest = hasResolved(evidence, "test");
  const hasScreenshot = hasResolved(evidence, "screenshot");

  if (!hasCommit) {
    addFinding(findings, {
      code: "IMPLEMENTATION_UNPROVEN",
      severity: "error",
      message: "No implementation commit proves this claim.",
      guidance: GUIDANCE.IMPLEMENTATION_UNPROVEN ?? "Reference implementation evidence.",
    });
  }
  if (!hasFile) {
    addFinding(findings, missingTypeFinding("file", "FILE_MISSING"));
  }
  if (!hasTest) {
    addFinding(findings, missingTypeFinding("test", "TEST_MISSING"));
  }
  if (claim.userVisible && !hasScreenshot) {
    addFinding(findings, missingTypeFinding("screenshot", "SCREENSHOT_MISSING"));
  }

  const requiredEvidenceInvalid = evidence.some(
    (item) => item.required && item.resolution !== "resolved",
  );
  const validationComplete =
    hasCommit && hasFile && hasTest && (!claim.userVisible || hasScreenshot);

  const status = !hasCommit
    ? "unsupported"
    : validationComplete && !requiredEvidenceInvalid
      ? "proven"
      : "partial";

  return {
    id: claim.id,
    title: claim.title,
    description: claim.description,
    importance: claim.importance,
    userVisible: claim.userVisible,
    scoring: claim.scoring ?? "included",
    status,
    evidence,
    findings,
  };
}

function hasResolved(
  evidence: ResolvedEvidence[],
  type: EvidenceType,
): boolean {
  return evidence.some(
    (item) => item.type === type && item.resolution === "resolved",
  );
}

function toFinding(evidence: ResolvedEvidence): Finding {
  const code =
    typeof evidence.metadata.findingCode === "string"
      ? evidence.metadata.findingCode
      : "EVIDENCE_UNRESOLVED";
  return {
    code,
    severity: evidence.required ? "error" : "info",
    message: evidence.detail,
    guidance:
      GUIDANCE[code] ?? "Correct or remove this evidence reference, then scan again.",
    evidenceId: evidence.id,
  };
}

function missingTypeFinding(type: EvidenceType, code: string): Finding {
  return {
    code,
    severity: "error",
    message: `No resolved ${type} evidence supports this claim.`,
    guidance: GUIDANCE[code] ?? `Add resolved ${type} evidence.`,
  };
}

function addFinding(findings: Finding[], finding: Finding): void {
  if (!findings.some((item) => item.code === finding.code)) {
    findings.push(finding);
  }
}
