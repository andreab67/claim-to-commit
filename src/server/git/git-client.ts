import { execFile } from "node:child_process";
import { stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { PublicError } from "../errors.js";

const execFileAsync = promisify(execFile);

export interface GitCommit {
  sha: string;
  subject: string;
  authoredAt: string;
  files: string[];
}

export interface GitRepository {
  rootPath: string;
  branch: string;
  revision: string;
  commits: GitCommit[];
}

export async function inspectRepository(
  requestedPath: string,
): Promise<GitRepository> {
  const repositoryPath = path.resolve(requestedPath);

  try {
    const details = await stat(repositoryPath);
    if (!details.isDirectory()) {
      throw new PublicError(
        "PATH_NOT_DIRECTORY",
        "The selected path is not a directory.",
        "Choose the root directory of a local Git repository.",
      );
    }
  } catch (error) {
    if (error instanceof PublicError) throw error;
    throw new PublicError(
      "PATH_NOT_FOUND",
      "The selected repository path could not be found.",
      "Check the local path and try the scan again.",
      404,
    );
  }

  let rootPath: string;
  try {
    rootPath = (
      await runGit(repositoryPath, ["rev-parse", "--show-toplevel"])
    ).trim();
  } catch (error) {
    if (isCommandNotFound(error)) {
      throw new PublicError(
        "GIT_NOT_FOUND",
        "Git is not available on this machine.",
        "Install Git to run live scans, or use the bundled demonstration.",
        503,
      );
    }
    throw new PublicError(
      "NOT_A_GIT_REPOSITORY",
      "The selected directory is not inside a Git repository.",
      "Choose a Git worktree root or use the bundled demonstration.",
    );
  }

  const normalizedRoot = path.resolve(rootPath);
  const [branchOutput, revisionOutput, logOutput] = await Promise.all([
    runGit(normalizedRoot, ["branch", "--show-current"]),
    runGit(normalizedRoot, ["rev-parse", "HEAD"]),
    runGit(normalizedRoot, [
      "log",
      "-n",
      "100",
      "--format=%H%x1f%s%x1f%aI",
    ]),
  ]);

  const commitRows = logOutput
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [sha = "", subject = "", authoredAt = ""] = line.split("\u001f");
      return { sha, subject, authoredAt };
    });

  const commits = await Promise.all(
    commitRows.map(async (commit) => ({
      ...commit,
      files: normalizeGitPaths(
        await runGit(normalizedRoot, [
          "diff-tree",
          "--root",
          "--no-commit-id",
          "--name-only",
          "-r",
          commit.sha,
        ]),
      ),
    })),
  );

  return {
    rootPath: normalizedRoot,
    branch: branchOutput.trim() || "detached",
    revision: revisionOutput.trim(),
    commits,
  };
}

export function findCommit(
  repository: GitRepository,
  reference: string,
): GitCommit | undefined {
  const resolvedReference = reference === "HEAD" ? repository.revision : reference;
  return repository.commits.find((commit) =>
    commit.sha.toLowerCase().startsWith(resolvedReference.toLowerCase()),
  );
}

async function runGit(cwd: string, args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", args, {
      cwd,
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 4 * 1024 * 1024,
    });
    return stdout;
  } catch (error) {
    throw error;
  }
}

function normalizeGitPaths(output: string): string[] {
  return output
    .split(/\r?\n/)
    .map((file) => file.trim().replaceAll("\\", "/"))
    .filter(Boolean);
}

function isCommandNotFound(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}
