import type { RepositoryAudit } from "../../shared/evidence.js";

interface RepositoryHeroProps {
  audit: RepositoryAudit;
}

export function RepositoryHero({ audit }: RepositoryHeroProps) {
  const shortRevision = audit.repository.revision.slice(0, 8);

  return (
    <section className="repository-hero" aria-labelledby="repository-title">
      <div className="repository-intro">
        <p className="kicker">
          {audit.source === "bundled" ? "Prepared evidence snapshot" : "Live repository scan"}
        </p>
        <h1 id="repository-title">Can this build prove what it claims?</h1>
        <p className="repository-description">{audit.project.description}</p>
      </div>

      <dl className="repository-meta" aria-label="Repository metadata">
        <div>
          <dt>Repository</dt>
          <dd>{audit.project.name}</dd>
        </div>
        <div>
          <dt>Branch</dt>
          <dd>{audit.repository.branch}</dd>
        </div>
        <div>
          <dt>Revision</dt>
          <dd>{shortRevision}</dd>
        </div>
      </dl>
    </section>
  );
}
