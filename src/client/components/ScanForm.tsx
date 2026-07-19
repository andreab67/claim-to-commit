import { useState, type FormEvent } from "react";

interface ScanFormProps {
  busy: boolean;
  onSubmit: (repositoryPath: string) => Promise<void>;
  onClose: () => void;
}

export function ScanForm({ busy, onSubmit, onClose }: ScanFormProps) {
  const [repositoryPath, setRepositoryPath] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!repositoryPath.trim()) return;
    await onSubmit(repositoryPath.trim());
  }

  return (
    <section className="scan-drawer" aria-labelledby="scan-title">
      <div>
        <p className="section-label">Live inspection</p>
        <h2 id="scan-title">Scan a local evidence contract</h2>
        <p>
          Nothing leaves this machine. Git operations are read only and the selected
          repository is never modified.
        </p>
      </div>
      <form onSubmit={(event) => void handleSubmit(event)}>
        <label htmlFor="repository-path">Repository path</label>
        <div className="scan-input-row">
          <input
            id="repository-path"
            type="text"
            value={repositoryPath}
            onChange={(event) => setRepositoryPath(event.target.value)}
            placeholder="C:\projects\your-repository"
            autoComplete="off"
          />
          <button type="submit" disabled={busy || !repositoryPath.trim()}>
            {busy ? "Scanning…" : "Run evidence scan"}
          </button>
          <button className="button-quiet" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </form>
    </section>
  );
}
