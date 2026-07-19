import { describe, expect, it } from "vitest";

import { auditClaim } from "../../src/server/audit/audit-claim.js";
import type {
  Claim,
  EvidenceType,
  ResolvedEvidence,
} from "../../src/shared/evidence.js";

const claim: Claim = {
  id: "claim-audit",
  title: "Audits claims",
  description: "Connects a claim to repository evidence.",
  importance: "headline",
  userVisible: true,
  evidence: [],
};

function evidence(
  type: EvidenceType,
  resolution: ResolvedEvidence["resolution"] = "resolved",
  findingCode?: string,
): ResolvedEvidence {
  return {
    id: `${type}-evidence`,
    type,
    label: `${type} evidence`,
    resolution,
    detail: `${type} ${resolution}`,
    required: true,
    metadata: findingCode ? { findingCode } : {},
  };
}

describe("auditClaim", () => {
  it("proves a user-visible claim with implementation, test, and screenshot", () => {
    const result = auditClaim(claim, [
      evidence("decision"),
      evidence("session"),
      evidence("commit"),
      evidence("file"),
      evidence("test"),
      evidence("screenshot"),
    ]);

    expect(result.status).toBe("proven");
    expect(result.findings).toEqual([]);
  });

  it("marks implementation without a passing test as partial", () => {
    const result = auditClaim(claim, [
      evidence("commit"),
      evidence("file"),
      evidence("screenshot"),
    ]);

    expect(result.status).toBe("partial");
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "TEST_MISSING" }),
    );
  });

  it("marks a claim without a valid implementation commit unsupported", () => {
    const result = auditClaim(claim, [
      evidence("commit", "missing", "COMMIT_MISSING"),
      evidence("file", "missing", "FILE_MISSING"),
      evidence("test"),
      evidence("screenshot"),
    ]);

    expect(result.status).toBe("unsupported");
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "IMPLEMENTATION_UNPROVEN" }),
    );
  });

  it("carries an excluded audit-control declaration into the result", () => {
    const result = auditClaim(
      { ...claim, scoring: "excluded-control" },
      [evidence("commit", "missing", "COMMIT_MISSING")],
    );

    expect(result).toMatchObject({
      status: "unsupported",
      scoring: "excluded-control",
    });
  });

  it("requires visual proof only for user-visible claims", () => {
    const invisibleClaim = { ...claim, userVisible: false };
    const evidenceSet = [evidence("commit"), evidence("file"), evidence("test")];

    expect(auditClaim(invisibleClaim, evidenceSet).status).toBe("proven");
    expect(auditClaim(claim, evidenceSet)).toMatchObject({
      status: "partial",
      findings: expect.arrayContaining([
        expect.objectContaining({ code: "SCREENSHOT_MISSING" }),
      ]),
    });
  });

  it("reports the stable code from invalid required evidence", () => {
    const result = auditClaim(claim, [
      evidence("commit"),
      evidence("file"),
      evidence("test", "invalid", "TEST_FAILED"),
      evidence("screenshot"),
    ]);

    expect(result.status).toBe("partial");
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "TEST_FAILED", evidenceId: "test-evidence" }),
    );
  });
});
