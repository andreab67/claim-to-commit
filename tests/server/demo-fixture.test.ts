import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import type { RepositoryAudit } from "../../src/shared/evidence.js";
import { parseEvidenceManifest } from "../../src/shared/schema.js";

const projectRoot = process.cwd();

describe("bundled demo evidence", () => {
  it("contains a complete honest judge story", async () => {
    const audit = JSON.parse(
      await readFile(path.join(projectRoot, "fixtures", "demo-scan.json"), "utf8"),
    ) as RepositoryAudit;

    expect(audit).toMatchObject({
      scanId: "demo-claim-to-commit",
      source: "bundled",
      score: 70,
      counts: { proven: 3, partial: 1, unsupported: 1 },
    });
    expect(audit.formula).toBe("7 proven weight ÷ 10 total weight × 100");

    const headline = audit.claims.find(
      (claim) => claim.id === "deterministic-audit",
    );
    expect(headline).toMatchObject({ importance: "headline", status: "proven" });
    expect(headline?.evidence.map((evidence) => evidence.type)).toEqual([
      "decision",
      "session",
      "commit",
      "file",
      "test",
      "screenshot",
    ]);
    expect(headline?.evidence.every((evidence) => evidence.resolution === "resolved"))
      .toBe(true);

    const unsupported = audit.claims.find(
      (claim) => claim.id === "semantic-inference",
    );
    expect(unsupported).toMatchObject({ status: "unsupported" });
    expect(unsupported?.description).toMatch(/deliberately unsupported/i);
    expect(unsupported?.findings.map((finding) => finding.code)).toContain(
      "IMPLEMENTATION_UNPROVEN",
    );

    const serialized = JSON.stringify(audit);
    expect(serialized).not.toMatch(/"[A-Za-z]:[\\/]/);
    expect(serialized).not.toContain(projectRoot.replaceAll("\\", "/"));
  });

  it("keeps the live self-audit manifest valid", async () => {
    const manifest = JSON.parse(
      await readFile(
        path.join(projectRoot, ".claim-to-commit", "evidence.json"),
        "utf8",
      ),
    ) as unknown;

    const parsed = parseEvidenceManifest(manifest);
    expect(parsed.project.name).toBe("Claim to Commit");
    expect(parsed.claims).toHaveLength(5);
  });
});
