import request from "supertest";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { createApp } from "../../src/server/app.js";
import { createScanStore } from "../../src/server/store/scan-store.js";
import type { RepositoryAudit } from "../../src/shared/evidence.js";
import { createGitFixture, type GitFixture } from "../helpers/git-fixture.js";

const cleanups: Array<() => Promise<void> | void> = [];

afterEach(async () => {
  await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
});

const demoAudit: RepositoryAudit = {
  scanId: "demo",
  scannedAt: "2026-07-18T23:00:00.000Z",
  source: "bundled",
  project: { name: "Demo", description: "Bundled audit" },
  repository: { displayPath: "claim-to-commit", branch: "main", revision: "abc1234" },
  score: 50,
  formula: "1 proven weight ÷ 2 total weight × 100",
  counts: { proven: 1, partial: 0, unsupported: 1 },
  claims: [],
};

describe("GET /api/health", () => {
  it("reports a ready local service", async () => {
    const response = await request(createApp()).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "claim-to-commit",
    });
  });
});

describe("scan API", () => {
  it("returns the bundled audit without running Git", async () => {
    const store = createScanStore(":memory:");
    cleanups.push(() => store.close());

    const response = await request(createApp({ store, demoAudit })).get("/api/demo");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(demoAudit);
  });

  it("serves the built client without turning unknown API routes into HTML", async () => {
    const clientDist = await mkdtemp(path.join(tmpdir(), "claim-client-"));
    cleanups.push(() => rm(clientDist, { recursive: true, force: true }));
    await writeFile(
      path.join(clientDist, "index.html"),
      "<!doctype html><title>Production client</title><div id=\"root\"></div>",
    );
    const store = createScanStore(":memory:");
    cleanups.push(() => store.close());
    const app = createApp({ store, demoAudit, clientDist });

    const clientResponse = await request(app).get("/");
    expect(clientResponse.status).toBe(200);
    expect(clientResponse.text).toContain("Production client");

    const apiResponse = await request(app).get("/api/does-not-exist");
    expect(apiResponse.status).toBe(404);
    expect(apiResponse.headers["content-type"]).not.toContain("text/html");
  });

  it("scans and retrieves a repository audit", async () => {
    const fixture = await createAuditableFixture();
    cleanups.push(fixture.cleanup);
    const store = createScanStore(":memory:");
    cleanups.push(() => store.close());
    const app = createApp({ store, demoAudit });

    const scanResponse = await request(app)
      .post("/api/scans")
      .send({ path: fixture.path });

    expect(scanResponse.status).toBe(201);
    expect(scanResponse.body).toMatchObject({
      source: "live",
      project: { name: "Auditable fixture" },
      counts: { proven: 1, partial: 0, unsupported: 1 },
    });
    expect(scanResponse.body.claims).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "claim-proven", status: "proven" }),
        expect.objectContaining({ id: "claim-unsupported", status: "unsupported" }),
      ]),
    );

    const storedResponse = await request(app).get(
      `/api/scans/${scanResponse.body.scanId as string}`,
    );
    expect(storedResponse.status).toBe(200);
    expect(storedResponse.body).toEqual(scanResponse.body);
  });

  it("returns a safe typed error for a non-Git path", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "not-git-api-"));
    cleanups.push(() => rm(directory, { recursive: true, force: true }));
    const store = createScanStore(":memory:");
    cleanups.push(() => store.close());

    const response = await request(createApp({ store, demoAudit }))
      .post("/api/scans")
      .send({ path: directory });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: "NOT_A_GIT_REPOSITORY",
        message: "The selected directory is not inside a Git repository.",
        guidance: "Choose a Git worktree root or use the bundled demonstration.",
      },
    });
    expect(JSON.stringify(response.body)).not.toContain("stack");
  });

  it("rejects an inaccessible path and a malformed manifest", async () => {
    const store = createScanStore(":memory:");
    cleanups.push(() => store.close());
    const app = createApp({ store, demoAudit });

    const missingResponse = await request(app)
      .post("/api/scans")
      .send({ path: path.join(tmpdir(), "does-not-exist-claim-to-commit") });
    expect(missingResponse.status).toBe(404);
    expect(missingResponse.body.error.code).toBe("PATH_NOT_FOUND");

    const fixture = await createGitFixture();
    cleanups.push(fixture.cleanup);
    await mkdir(path.join(fixture.path, ".claim-to-commit"));
    await writeFile(
      path.join(fixture.path, ".claim-to-commit", "evidence.json"),
      "{ definitely-not-json",
    );
    const malformedResponse = await request(app)
      .post("/api/scans")
      .send({ path: fixture.path });
    expect(malformedResponse.status).toBe(400);
    expect(malformedResponse.body.error.code).toBe("MANIFEST_INVALID");
  });
});

async function createAuditableFixture(): Promise<GitFixture> {
  const fixture = await createGitFixture();
  await mkdir(path.join(fixture.path, ".claim-to-commit"), { recursive: true });
  await mkdir(path.join(fixture.path, "artifacts"), { recursive: true });
  await mkdir(path.join(fixture.path, "fixtures"), { recursive: true });
  await writeFile(
    path.join(fixture.path, "DECISIONS.md"),
    "# Decisions\n\n## DEC-001: Explicit evidence\n",
  );
  await writeFile(
    path.join(fixture.path, "artifacts", "test-results.json"),
    JSON.stringify({
      schemaVersion: 1,
      status: "passed",
      tests: [{ id: "audit-tests", status: "passed" }],
    }),
  );
  await writeFile(
    path.join(fixture.path, "fixtures", "audit.svg"),
    "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>",
  );
  await writeFile(
    path.join(fixture.path, ".claim-to-commit", "evidence.json"),
    JSON.stringify({
      schemaVersion: 1,
      project: {
        name: "Auditable fixture",
        description: "A fixture with one proven and one unsupported claim.",
      },
      sessions: [
        {
          id: "session-core",
          label: "Core session",
          summary: "Built the audit engine.",
          reference: "session://fixture/core",
        },
      ],
      tests: [
        {
          id: "audit-tests",
          command: "npm test",
          resultPath: "artifacts/test-results.json",
        },
      ],
      claims: [
        {
          id: "claim-proven",
          title: "Runs deterministic tests",
          description: "The fixture has implementation and validation evidence.",
          importance: "headline",
          userVisible: true,
          evidence: [
            {
              id: "commit",
              type: "commit",
              sha: fixture.headCommit,
              label: "Test commit",
            },
            {
              id: "file",
              type: "file",
              path: "tests/audit.test.ts",
              commit: fixture.headCommit,
              label: "Audit test",
            },
            {
              id: "test",
              type: "test",
              testId: "audit-tests",
              label: "Passing tests",
            },
            {
              id: "screenshot",
              type: "screenshot",
              path: "fixtures/audit.svg",
              label: "Audit visual",
              caption: "Visible audit proof",
            },
          ],
        },
        {
          id: "claim-unsupported",
          title: "Infers evidence automatically",
          description: "A deliberately unsupported demonstration claim.",
          importance: "supporting",
          userVisible: false,
          evidence: [
            {
              id: "missing-commit",
              type: "commit",
              sha: "0000000000000000000000000000000000000000",
              label: "Missing implementation",
            },
          ],
        },
      ],
    }),
  );
  return fixture;
}
