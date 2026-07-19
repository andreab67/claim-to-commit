import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface GitFixture {
  path: string;
  firstCommit: string;
  headCommit: string;
  cleanup: () => Promise<void>;
}

export async function createGitFixture(): Promise<GitFixture> {
  const fixturePath = await mkdtemp(path.join(tmpdir(), "claim-to-commit-"));
  const git = (...args: string[]) =>
    execFileAsync("git", args, {
      cwd: fixturePath,
      env: {
        ...process.env,
        GIT_AUTHOR_DATE: "2026-07-18T17:00:00-06:00",
        GIT_COMMITTER_DATE: "2026-07-18T17:00:00-06:00",
      },
    });

  await git("init", "-b", "main");
  await git("config", "user.name", "Claim to Commit Fixture");
  await git("config", "user.email", "fixture@example.invalid");

  await mkdir(path.join(fixturePath, "src"), { recursive: true });
  await writeFile(
    path.join(fixturePath, "src", "audit.ts"),
    "export const audit = () => 'proven';\n",
  );
  await git("add", "src/audit.ts");
  await git("commit", "-m", "feat: add deterministic audit");
  const { stdout: firstCommitOutput } = await git("rev-parse", "HEAD");

  await mkdir(path.join(fixturePath, "tests"), { recursive: true });
  await writeFile(
    path.join(fixturePath, "tests", "audit.test.ts"),
    "export const passed = true;\n",
  );
  await git("add", "tests/audit.test.ts");
  await git("commit", "-m", "test: prove deterministic audit");
  const { stdout: headCommitOutput } = await git("rev-parse", "HEAD");

  return {
    path: fixturePath,
    firstCommit: firstCommitOutput.trim(),
    headCommit: headCommitOutput.trim(),
    cleanup: () => rm(fixturePath, { recursive: true, force: true }),
  };
}
