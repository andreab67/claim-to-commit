# Devpost description draft

**Track: Developer Tools**

Claim to Commit is a local evidence workbench for engineering leads, hackathon reviewers, and teams evaluating AI-assisted software. Today, a polished product claim can appear faster than a reviewer can connect it to the decision, agent work, implementation, test, and visible result. Transcripts and diffs show activity; they do not provide a product-level chain of custody.

Repositories opt in with a strict evidence manifest. Claim to Commit resolves each declared chain—human decision → Codex session → commit → changed file → passing test → screenshot—and grades the claim as proven, partial, or unsupported. Its weighted proof score is deterministic and fully disclosed: there is no hidden model call or opaque confidence score.

The three-minute wow moment is Claim to Commit auditing its own Build Week repository at 100% shipped-claim coverage. A real headline feature expands into six verified artifacts. Then Audit Mode exposes an explicit negative control—“perfectly infers evidence relationships”—as unsupported because it has no attributable implementation or passing test. Confident prose becomes visibly red with exact remediation guidance, while the formula discloses that the control is excluded from shipped scope.

The tool is complete and local-first: read-only Git inspection, safe repository-relative paths, immutable SQLite scan history, a bundled zero-setup audit, live self-scan, responsive React workbench, and 39 automated tests. It requires no account, API key, paid service, or repository upload.

The project was built from an empty repository in one primary Codex session using GPT-5.6. Codex accelerated the product contract, schema, Git adapters, deterministic audit engine, test suite, interface, browser verification, and submission assets. I made the central product and design decisions: the real reviewer audience, explicit evidence over semantic guessing, local-only architecture, public scoring rules, Audit Mode reveal, and disciplined scope.
