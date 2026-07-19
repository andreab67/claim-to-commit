import type { RepositoryAudit } from "../../shared/evidence.js";

interface ScorecardProps {
  audit: RepositoryAudit;
}

export function Scorecard({ audit }: ScorecardProps) {
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
          <strong>{audit.counts.proven}/{audit.claims.length}</strong>
          <span>claims proven</span>
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

      <details className="formula-disclosure">
        <summary>How this score is calculated</summary>
        <p>{audit.formula}. Headline claims weigh 3, major claims 2, and supporting claims 1.</p>
      </details>
    </section>
  );
}
