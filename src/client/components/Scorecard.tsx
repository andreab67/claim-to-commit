import type { RepositoryAudit } from "../../shared/evidence.js";

interface ScorecardProps {
  audit: RepositoryAudit;
}

export function Scorecard({ audit }: ScorecardProps) {
  const scoredClaims = audit.claims.filter(
    (claim) => claim.scoring !== "excluded-control",
  );
  const scoredProven = scoredClaims.filter(
    (claim) => claim.status === "proven",
  ).length;
  const excludedControlCount = audit.claims.length - scoredClaims.length;

  return (
    <section className="scorecard" aria-labelledby="proof-score-title">
      <div className="scorecard-heading">
        <div>
          <p className="section-label">Weighted proof coverage</p>
          <h2 id="proof-score-title">
            <span className="score-number">{audit.score}</span>
            <span className="score-symbol">%</span>
          </h2>
        </div>
        <div className="score-seal" aria-hidden="true">
          <span>Evidence</span>
          <strong>{scoredProven}/{scoredClaims.length}</strong>
          <span>shipped claims proven</span>
        </div>
      </div>

      <progress
        className="score-track"
        aria-label="Weighted proof coverage"
        value={audit.score}
        max="100"
      >
        {audit.score}%
      </progress>

      <dl className="status-totals">
        <div className="status-total status-proven">
          <dt><span aria-hidden="true">✓</span> Proven</dt>
          <dd>{audit.counts.proven}</dd>
        </div>
        <div className="status-total status-partial">
          <dt><span aria-hidden="true">◐</span> Partial</dt>
          <dd>{audit.counts.partial}</dd>
        </div>
        <div className="status-total status-unsupported">
          <dt><span aria-hidden="true">×</span> Unsupported</dt>
          <dd>{audit.counts.unsupported}</dd>
        </div>
      </dl>

      {excludedControlCount > 0 ? (
        <p className="score-exclusion-note">
          {excludedControlCount} audit control{excludedControlCount === 1 ? "" : "s"} excluded
        </p>
      ) : null}

      <details className="formula-disclosure">
        <summary>How this score is calculated</summary>
        <p>
          {audit.formula}. Headline claims weigh 3, major claims 2, and supporting
          claims 1. Declared audit controls remain visible but never enter the score.
        </p>
      </details>
    </section>
  );
}
