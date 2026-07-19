import { randomUUID } from "node:crypto";

import type { RepositoryAudit } from "../../shared/evidence.js";
import { auditClaim } from "../audit/audit-claim.js";
import { auditRepository } from "../audit/audit-repository.js";
import { validateEvidenceCollection } from "../evidence/validate-evidence.js";
import { inspectRepository } from "../git/git-client.js";
import { loadManifest } from "../manifest/load-manifest.js";
import type { ScanStore } from "../store/scan-store.js";

export async function scanRepository(
  requestedPath: string,
  store: ScanStore,
): Promise<RepositoryAudit> {
  const repository = await inspectRepository(requestedPath);
  const manifest = await loadManifest(repository.rootPath);

  const claims = await Promise.all(
    manifest.claims.map(async (claim) => {
      const evidence = await validateEvidenceCollection(
        {
          repositoryPath: repository.rootPath,
          repository,
          manifest,
        },
        claim.evidence,
      );
      return auditClaim(claim, evidence);
    }),
  );

  const audit = auditRepository({
    scanId: randomUUID(),
    scannedAt: new Date().toISOString(),
    source: "live",
    project: manifest.project,
    repository: {
      displayPath: repository.rootPath,
      branch: repository.branch,
      revision: repository.revision,
    },
    claims,
  });

  store.save(audit, repository.rootPath);
  return audit;
}
