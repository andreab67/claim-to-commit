export function App() {
  return (
    <main className="shell">
      <header className="brand-bar">
        <a className="brand" href="/" aria-label="Claim to Commit home">
          <img className="brand-mark" src="/icon.png" alt="" width="42" height="42" />
          <span>Claim to Commit</span>
        </a>
        <span className="local-badge">Local evidence only</span>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">Repository evidence workbench</p>
        <h1 id="page-title">Every software claim should be traceable.</h1>
        <p className="lede">
          Connect product decisions to commits, changed files, tests, and visual
          proof—then expose the claims that evidence cannot support.
        </p>
        <div className="loading-card" role="status">
          <span className="pulse" aria-hidden="true" />
          Preparing the first evidence audit…
        </div>
      </section>
    </main>
  );
}
