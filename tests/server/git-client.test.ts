import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { PublicError } from "../../src/server/errors.js";
import { inspectRepository } from "../../src/server/git/git-client.js";
import { createGitFixture, type GitFixture } from "../helpers/git-fixture.js";

const cleanups: Array<() => Promise<void>> = [];

afterEach(async () => {
  await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
});

describe("inspectRepository", () => {
  it("returns branch, full revision, commits, and changed files", async () => {
    const fixture = await createGitFixture();
    cleanups.push(fixture.cleanup);

    const repository = await inspectRepository(fixture.path);

    expect(repository.rootPath).toBe(path.resolve(fixture.path));
    expect(repository.branch).toBe("main");
    expect(repository.revision).toBe(fixture.headCommit);
    expect(repository.commits).toHaveLength(2);
    expect(repository.commits[0]).toMatchObject({
      sha: fixture.headCommit,
      subject: "test: prove deterministic audit",
      files: ["tests/audit.test.ts"],
    });
    expect(repository.commits[1]).toMatchObject({
      sha: fixture.firstCommit,
      subject: "feat: add deterministic audit",
      files: ["src/audit.ts"],
    });
  });

  it("rejects a directory that is not a Git repository", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "not-a-git-repo-"));
    cleanups.push(() => rm(directory, { recursive: true, force: true }));

    await expect(inspectRepository(directory)).rejects.toMatchObject<PublicError>({
      code: "NOT_A_GIT_REPOSITORY",
    });
  });
});
