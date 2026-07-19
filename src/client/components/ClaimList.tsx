import { useMemo, useState } from "react";

import type { AuditStatus, ClaimAudit } from "../../shared/evidence.js";

interface ClaimListProps {
  claims: ClaimAudit[];
  selectedId: string;
  auditMode: boolean;
  onSelect: (claimId: string) => void;
}

type Filter = "all" | AuditStatus;

const STATUS_MARK: Record<AuditStatus, string> = {
  proven: "✓",
  partial: "◐",
  unsupported: "×",
};

export function ClaimList({
  claims,
  selectedId,
  auditMode,
  onSelect,
}: ClaimListProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const visibleClaims = useMemo(
    () => claims.filter((claim) => filter === "all" || claim.status === filter),
    [claims, filter],
  );

  return (
    <section className="claim-index" aria-labelledby="claim-index-title">
      <div className="claim-index-heading">
        <div>
          <p className="section-label">Claim inventory</p>
          <h2 id="claim-index-title">What the build says it can do</h2>
        </div>
        <span className="claim-count">{claims.length} claims</span>
      </div>

      <div className="claim-filters" aria-label="Filter claims">
        {(["all", "proven", "partial", "unsupported"] as Filter[]).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
          >
            {item === "all" ? "All" : item[0]?.toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      <div className="claim-list">
        {visibleClaims.map((claim, index) => (
          <button
            key={claim.id}
            className={`claim-row status-${claim.status}${
              claim.id === selectedId ? " is-selected" : ""
            }${auditMode && claim.status === "unsupported" ? " is-audit-flagged" : ""}`}
            type="button"
            aria-label={claim.title}
            aria-current={claim.id === selectedId ? "true" : undefined}
            onClick={() => onSelect(claim.id)}
          >
            <span className="claim-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="claim-row-copy">
              <strong>{claim.title}</strong>
              <small>
                {claim.scoring === "excluded-control"
                  ? "excluded audit control"
                  : `${claim.importance} claim`}
              </small>
            </span>
            <span className="claim-status">
              <span aria-hidden="true">{STATUS_MARK[claim.status]}</span>
              {claim.status}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
