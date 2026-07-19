import { useEffect, useMemo, useState } from "react";

import type { RepositoryAudit } from "../shared/evidence.js";
import { ApiError, loadDemo, scanLocalRepository } from "./api";
import { ClaimInspector } from "./components/ClaimInspector";
import { ClaimList } from "./components/ClaimList";
import { EmptyState } from "./components/EmptyState";
import { Header } from "./components/Header";
import { RepositoryHero } from "./components/RepositoryHero";
import { ScanForm } from "./components/ScanForm";
import { Scorecard } from "./components/Scorecard";

interface LoadError {
  message: string;
  guidance?: string;
}

export function App() {
  const [audit, setAudit] = useState<RepositoryAudit>();
  const [selectedId, setSelectedId] = useState("");
  const [auditMode, setAuditMode] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<LoadError>();

  async function openDemo() {
    setBusy(true);
    setError(undefined);
    try {
      const nextAudit = await loadDemo();
      setAudit(nextAudit);
      setSelectedId(nextAudit.claims[0]?.id ?? "");
    } catch (caught) {
      setError(toLoadError(caught));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void openDemo();
  }, []);

  const selectedClaim = useMemo(
    () =>
      audit?.claims.find((claim) => claim.id === selectedId) ?? audit?.claims[0],
    [audit, selectedId],
  );

  async function runScan(repositoryPath: string) {
    setBusy(true);
    setError(undefined);
    try {
      const nextAudit = await scanLocalRepository(repositoryPath);
      setAudit(nextAudit);
      setSelectedId(nextAudit.claims[0]?.id ?? "");
      setShowScan(false);
    } catch (caught) {
      setError(toLoadError(caught));
    } finally {
      setBusy(false);
    }
  }

  if (busy && !audit) {
    return (
      <main className="loading-screen">
        <img src="/icon.png" alt="" width="72" height="72" />
        <p className="section-label">Preparing evidence</p>
        <h1>Following the claim trail…</h1>
        <div className="loading-rule" aria-hidden="true"><span /></div>
      </main>
    );
  }

  if (error && !audit) {
    return (
      <main className="shell">
        <EmptyState
          title="The evidence snapshot could not be opened."
          message={error.message}
          {...(error.guidance ? { guidance: error.guidance } : {})}
          onRetry={() => void openDemo()}
        />
      </main>
    );
  }

  if (!audit || !selectedClaim) return null;

  return (
    <div className={`app${auditMode ? " audit-mode" : ""}`}>
      <div className="shell">
        <Header auditMode={auditMode} onToggleAudit={() => setAuditMode(!auditMode)} />
        <RepositoryHero audit={audit} />

        <div className="workbench-toolbar">
          <p>
            <span className="live-dot" aria-hidden="true" />
            {audit.source === "bundled" ? "Reproducible bundled snapshot" : "Fresh local scan"}
          </p>
          <button type="button" onClick={() => setShowScan(!showScan)}>
            Scan a local repository
          </button>
        </div>

        {showScan ? (
          <ScanForm
            busy={busy}
            onSubmit={runScan}
            onClose={() => setShowScan(false)}
          />
        ) : null}

        {error ? (
          <div className="inline-error" role="alert">
            <strong>{error.message}</strong>
            {error.guidance ? <span>{error.guidance}</span> : null}
          </div>
        ) : null}

        <div className="workbench">
          <aside className="workbench-sidebar">
            <Scorecard audit={audit} />
            <ClaimList
              claims={audit.claims}
              selectedId={selectedClaim.id}
              auditMode={auditMode}
              onSelect={setSelectedId}
            />
          </aside>
          <ClaimInspector claim={selectedClaim} auditMode={auditMode} />
        </div>

        <footer className="site-footer">
          <p>Every score is reproducible. Every link is inspectable.</p>
          <p>No model call · No upload · No hidden confidence score</p>
        </footer>
      </div>
    </div>
  );
}

function toLoadError(caught: unknown): LoadError {
  if (caught instanceof ApiError) {
    return { message: caught.message, guidance: caught.guidance };
  }
  return {
    message: "Claim to Commit could not read that evidence.",
    guidance: "Try again or return to the bundled demonstration.",
  };
}
