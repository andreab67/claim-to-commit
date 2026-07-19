import type { ClaimAudit } from "../../shared/evidence.js";
import { EvidenceChain } from "./EvidenceChain";

interface ClaimInspectorProps {
  claim: ClaimAudit;
  auditMode: boolean;
}

const STATUS_ICON: Record<ClaimAudit["status"], string> = {
  proven: "✓",
  partial: "◐",
  unsupported: "×",
};

export function ClaimInspector({ claim, auditMode }: ClaimInspectorProps) {
  return (
    <article className={`claim-inspector status-${claim.status}`}>
      <header className="inspector-header">
        <div className="claim-classification">
          <span>{claim.importance} claim</span>
          <span className="inspector-status">
            <span aria-hidden="true">{STATUS_ICON[claim.status]}</span>
            {claim.status}
          </span>
        </div>
        <h2>{claim.title}</h2>
        <p>{claim.description}</p>
      </header>

      {auditMode && claim.status === "unsupported" ? (
        <div className="audit-verdict" role="alert">
          <p className="audit-verdict-label">Audit verdict</p>
          <strong>Confident prose is not proof.</strong>
          <p>
            {claim.findings.find(
              (finding) => finding.code === "IMPLEMENTATION_UNPROVEN",
            )?.message ?? "The implementation evidence does not support this claim."}
          </p>
        </div>
      ) : null}

      <section className="chain-section" aria-labelledby="chain-title">
        <div className="chain-heading">
          <div>
            <p className="section-label">Chain of custody</p>
            <h3 id="chain-title">Trace the claim to its proof</h3>
          </div>
          <span>{claim.evidence.length} artifacts</span>
        </div>
        <EvidenceChain evidence={claim.evidence} auditMode={auditMode} />
      </section>

      {claim.findings.length > 0 ? (
        <section className="findings" aria-labelledby="findings-title">
          <div className="findings-heading">
            <p className="section-label">Open findings</p>
            <h3 id="findings-title">What would make this claim defensible</h3>
          </div>
          <ul>
            {claim.findings.map((finding) => (
              <li key={`${finding.code}-${finding.evidenceId ?? "claim"}`}>
                <code>{finding.code}</code>
                <div>
                  <strong>{finding.message}</strong>
                  <p>{finding.guidance}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="clean-verdict">
          <span aria-hidden="true">✓</span>
          Every required artifact resolved. This claim is defensible.
        </p>
      )}
    </article>
  );
}
