import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { inspectRepository } from "../../src/server/git/git-client.js";
import { validateEvidence } from "../../src/server/evidence/validate-evidence.js";
import type {
  EvidenceManifest,
  EvidenceReference,
} from "../../src/shared/evidence.js";
import { createGitFixture, type GitFixture } from "../helpers/git-fixture.js";

let fixture: GitFixture;
let manifest: EvidenceManifest;

beforeEach(async () => {
  fixture = await createGitFixture();
  await mkdir(path.join(fixture.path, "artifacts"), { recursive: true });
  await mkdir(path.join(fixture.path, "fixtures"), { recursive: true });
  await writeFile(
    path.join(fixture.path, "DECISIONS.md"),
    "# Decisions\n\n## DEC-001: Prefer explicit evidence\n\nEvidence is declared.\n",
  );
  await writeFile(
    path.join(fixture.path, "artifacts", "test-results.json"),
    JSON.stringify({
      schemaVersion: 1,
      generatedAt: "2026-07-18T23:00:00.000Z",
      status: "passed",
      summary: { total: 1, passed: 1, failed: 0 },
      tests: [{ id: "test-audit", status: "passed" }],
    }),
  );
  await writeFile(
    path.join(fixture.path, "fixtures", "audit.svg"),
    "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>",
  );

  manifest = {
    schemaVersion: 1,
    project: { name: "Fixture", description: "Evidence fixture" },
    sessions: [
      {
        id: "session-core",
        label: "Core session",
        summary: "Implemented the engine.",
        reference: "session://core",
      },
    ],
    tests: [
      {
        id: "test-audit",
        command: "npm test",
        resultPath: "artifacts/test-results.json",
      },
    ],
    claims: [],
  };
});

afterEach(async () => fixture.cleanup());

async function resolve(reference: EvidenceReference) {
  const repository = await inspectRepository(fixture.path);
  return validateEvidence(
    { repositoryPath: fixture.path, repository, manifest },
    reference,
  );
}

describe("validateEvidence", () => {
  it.each<[string, EvidenceReference]>([
    [
      "decision",
      {
        id: "decision",
        type: "decision",
        decisionId: "DEC-001",
        label: "Explicit evidence",
      },
    ],
    [
      "session",
      {
        id: "session",
        type: "session",
        sessionId: "session-core",
        label: "Core session",
      },
    ],
    [
      "commit",
      {
        id: "commit",
        type: "commit",
        sha: "HEAD",
        label: "Latest commit",
      } as EvidenceReference,
    ],
    [
      "file",
      {
        id: "file",
        type: "file",
        path: "tests/audit.test.ts",
        commit: "HEAD",
        label: "Audit test",
      } as EvidenceReference,
    ],
    [
      "test",
      {
        id: "test",
        type: "test",
        testId: "test-audit",
        label: "Passing audit test",
      },
    ],
    [
      "screenshot",
      {
        id: "screenshot",
        type: "screenshot",
        path: "fixtures/audit.svg",
        label: "Audit screenshot",
        caption: "The audit chain",
      },
    ],
  ])("resolves %s evidence", async (_type, reference) => {
    await expect(resolve(reference)).resolves.toMatchObject({
      id: reference.id,
      type: reference.type,
      resolution: "resolved",
      required: true,
    });
  });

  it("marks a missing decision without aborting the audit", async () => {
    const result = await resolve({
      id: "missing-decision",
      type: "decision",
      decisionId: "DEC-999",
      label: "Missing decision",
    });

    expect(result).toMatchObject({
      resolution: "missing",
      metadata: { findingCode: "DECISION_MISSING" },
    });
  });

  it("marks a failing test artifact invalid", async () => {
    await writeFile(
      path.join(fixture.path, "artifacts", "test-results.json"),
      JSON.stringify({
        schemaVersion: 1,
        status: "failed",
        tests: [{ id: "test-audit", status: "failed" }],
      }),
    );

    const result = await resolve({
      id: "test",
      type: "test",
      testId: "test-audit",
      label: "Audit test",
    });

    expect(result).toMatchObject({
      resolution: "invalid",
      metadata: { findingCode: "TEST_FAILED" },
    });
  });
});
