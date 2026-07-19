import type {
  ClaimAudit,
  RepositoryAudit,
} from "../../shared/evidence.js";
import { IMPORTANCE_WEIGHTS } from "../../shared/status.js";

type RepositoryAuditInput = Omit<
  RepositoryAudit,
  "score" | "formula" | "counts"
> & { claims: ClaimAudit[] };

export function auditRepository(input: RepositoryAuditInput): RepositoryAudit {
  const totalWeight = input.claims.reduce(
    (sum, claim) => sum + IMPORTANCE_WEIGHTS[claim.importance],
    0,
  );
  const provenWeight = input.claims.reduce(
    (sum, claim) =>
      sum + (claim.status === "proven" ? IMPORTANCE_WEIGHTS[claim.importance] : 0),
    0,
  );
  const score = totalWeight === 0 ? 0 : Math.round((provenWeight / totalWeight) * 100);

  return {
    ...input,
    score,
    formula: `${provenWeight} proven weight ÷ ${totalWeight} total weight × 100`,
    counts: {
      proven: input.claims.filter((claim) => claim.status === "proven").length,
      partial: input.claims.filter((claim) => claim.status === "partial").length,
      unsupported: input.claims.filter((claim) => claim.status === "unsupported")
        .length,
    },
  };
}
