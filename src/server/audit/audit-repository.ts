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
  const scoredClaims = input.claims.filter(
    (claim) => claim.scoring !== "excluded-control",
  );
  const excludedControlCount = input.claims.length - scoredClaims.length;
  const totalWeight = scoredClaims.reduce(
    (sum, claim) => sum + IMPORTANCE_WEIGHTS[claim.importance],
    0,
  );
  const provenWeight = scoredClaims.reduce(
    (sum, claim) =>
      sum + (claim.status === "proven" ? IMPORTANCE_WEIGHTS[claim.importance] : 0),
    0,
  );
  const score = totalWeight === 0 ? 0 : Math.round((provenWeight / totalWeight) * 100);

  return {
    ...input,
    score,
    formula: `${provenWeight} proven weight ÷ ${totalWeight} ${
      excludedControlCount === 0 ? "total weight" : "scored weight"
    } × 100${
      excludedControlCount === 0
        ? ""
        : ` · ${excludedControlCount} audit control${excludedControlCount === 1 ? "" : "s"} excluded`
    }`,
    counts: {
      proven: input.claims.filter((claim) => claim.status === "proven").length,
      partial: input.claims.filter((claim) => claim.status === "partial").length,
      unsupported: input.claims.filter((claim) => claim.status === "unsupported")
        .length,
    },
  };
}
