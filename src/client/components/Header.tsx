interface HeaderProps {
  auditMode: boolean;
  onToggleAudit: () => void;
}

export function Header({ auditMode, onToggleAudit }: HeaderProps) {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Claim to Commit home">
        <img className="brand-mark" src="/icon.png" alt="" width="46" height="46" />
        <span className="brand-copy">
          <strong>Claim to Commit</strong>
          <small>Repository evidence workbench</small>
        </span>
      </a>

      <div className="header-actions">
        <span className="local-badge">
          <span aria-hidden="true">●</span> Local only
        </span>
        <button
          className={`audit-toggle${auditMode ? " is-active" : ""}`}
          type="button"
          aria-pressed={auditMode}
          onClick={onToggleAudit}
        >
          <span className="audit-toggle-icon" aria-hidden="true">
            {auditMode ? "×" : "⌁"}
          </span>
          {auditMode ? "Disable Audit Mode" : "Enable Audit Mode"}
        </button>
      </div>
    </header>
  );
}
