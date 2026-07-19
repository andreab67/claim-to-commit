import type { RepositoryAudit } from "../shared/evidence.js";

interface ErrorEnvelope {
  error?: {
    code?: string;
    message?: string;
    guidance?: string;
  };
}

export class ApiError extends Error {
  readonly code: string;
  readonly guidance: string;

  constructor(code: string, message: string, guidance: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.guidance = guidance;
  }
}

export async function loadDemo(): Promise<RepositoryAudit> {
  return requestAudit("/api/demo");
}

export async function scanLocalRepository(
  repositoryPath: string,
): Promise<RepositoryAudit> {
  return requestAudit("/api/scans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: repositoryPath }),
  });
}

async function requestAudit(
  url: string,
  init?: RequestInit,
): Promise<RepositoryAudit> {
  const response = await fetch(url, init);
  const payload = (await response.json()) as RepositoryAudit | ErrorEnvelope;

  if (!response.ok) {
    const envelope = payload as ErrorEnvelope;
    throw new ApiError(
      envelope.error?.code ?? "REQUEST_FAILED",
      envelope.error?.message ?? "The evidence request failed.",
      envelope.error?.guidance ?? "Try again or open the bundled demonstration.",
    );
  }

  return payload as RepositoryAudit;
}
