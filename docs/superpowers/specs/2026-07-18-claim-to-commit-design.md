# Claim to Commit: Product and Technical Design

**Date:** July 18, 2026  
**Track:** Developer Tools  
**Audience:** Engineering leads, reviewers of AI-assisted software, hackathon judges, and small teams adopting coding agents  
**Product promise:** Every software claim should be traceable to evidence.

## 1. Problem

AI coding agents can produce large diffs, polished summaries, and confident completion claims. Reviewers still have to reconstruct whether a feature was intentionally designed, actually committed, tested, and demonstrated. Git history answers what changed, test runners answer whether selected behavior passed, and session transcripts explain portions of the work, but none presents a coherent claim-to-evidence story.

Claim to Commit audits a local Git repository and turns its delivery history into an inspectable evidence map. It does not ask reviewers to trust a generated summary. It shows the artifacts behind each claim and flags the gaps.

## 2. Demo Story

The three-minute demonstration uses Claim to Commit's own repository.

1. The presenter opens a pre-scanned repository dashboard.
2. A scorecard shows proven, partial, and unsupported claims.
3. The presenter selects the headline claim: the product can trace a feature from a human decision through implementation and validation.
4. The interface expands a chain containing the decision, Codex session checkpoint, commit, changed files, automated test result, and screenshot.
5. The presenter enables Audit Mode.
6. An intentionally unsupported claim becomes red, and the inspector explains that it has no test or visual artifact.
7. The presenter closes on the product principle: confident prose is not proof; inspectable evidence is.

The unsupported claim is clearly labeled as a demonstration fixture. It is never presented as a real capability.

## 3. Product Scope

### Included

- Scan a local Git repository through a path entered by the user.
- Load a bundled demonstration repository without additional configuration.
- Read Git commits and changed-file metadata using the installed Git CLI.
- Read structured claims and evidence references from `.claim-to-commit/evidence.json`.
- Read human decisions from `DECISIONS.md` using stable decision identifiers.
- Validate referenced commits, files, tests, screenshots, and session checkpoints.
- Assign a deterministic status of `proven`, `partial`, or `unsupported`.
- Explain the status with positive evidence and concrete missing-evidence findings.
- Present a repository scorecard, claim inventory, and claim-level evidence chain.
- Cache completed scans locally in SQLite so the prepared demo opens immediately.
- Provide seeded data, exact judge test steps, automated tests, and a one-command demo launcher.

### Excluded

- Authentication, authorization, teams, and hosted accounts.
- Git hosting provider integrations or network access.
- Payments, subscriptions, telemetry, and analytics.
- Generative writing or an external model dependency at runtime.
- Parsing arbitrary Codex transcripts.
- Automatic semantic inference that silently links unrelated artifacts.
- Cloud deployment, repository mutation, or Git hooks.
- Dark mode, internationalization, and mobile-native applications.

## 4. Evidence Contract

Each repository opts in with `.claim-to-commit/evidence.json`. The manifest is explicit so results remain reproducible and understandable.

```json
{
  "schemaVersion": 1,
  "project": {
    "name": "Claim to Commit",
    "description": "A local evidence auditor for AI-assisted software"
  },
  "sessions": [],
  "tests": [],
  "claims": []
}
```

A claim has an ID, title, description, importance, and a collection of evidence references. Supported evidence types are:

- `decision`: a stable identifier in `DECISIONS.md`.
- `session`: a named build checkpoint with a non-secret session reference.
- `commit`: a Git commit SHA or unambiguous full reference.
- `file`: a repository-relative path, optionally attributed to a commit.
- `test`: a named command and machine-readable result artifact.
- `screenshot`: a repository-relative image path with a caption.

The manifest contains references, not copied proof. The scanner resolves each reference against the repository at scan time.

## 5. Scoring Rules

The scoring engine is deterministic and rule based.

### Proven

A claim is `proven` when all of the following are true:

- It resolves at least one implementation commit.
- At least one referenced changed file exists in that commit.
- A referenced automated test result exists and records a passing result.
- A screenshot exists when the claim is marked user-visible.
- Every required evidence reference resolves successfully.

### Partial

A claim is `partial` when implementation evidence exists but one or more required validation artifacts are absent or invalid. The result names every missing requirement.

### Unsupported

A claim is `unsupported` when it has no valid implementation commit or all supplied evidence references fail validation.

The repository score is the percentage of claims proven, weighted by importance: headline claims count three, major claims count two, and supporting claims count one. The interface always exposes this formula.

## 6. Architecture

Claim to Commit is a local Node.js application with a React client and an Express server.

### Client

- Repository landing and recent-scan selection.
- Scorecard with proven, partial, and unsupported totals.
- Claim inventory with status, importance, and filtering.
- Claim detail panel with a left-to-right evidence chain.
- Audit Mode that emphasizes gaps and remediation text.
- Empty, loading, malformed-manifest, missing-Git, and inaccessible-path states.

### Server

- `repository` adapter: normalizes and bounds repository paths.
- `git` adapter: runs read-only Git commands and converts output into typed records.
- `manifest` loader: parses and validates the evidence contract.
- `evidence` validators: resolve decisions, sessions, commits, files, tests, and screenshots.
- `audit` engine: applies deterministic claim rules and produces explanations.
- `scan` service: orchestrates adapters and writes an immutable scan result.
- `cache` store: persists recent scan summaries and full results in SQLite.
- HTTP API: starts scans, reads recent scans, and returns claim details.

### Storage

SQLite stores derived scan results only. The repository manifest and Git history remain the source of truth. Deleting the database cannot damage the audited repository; rescanning recreates all derived data.

## 7. Data Flow

1. The client sends a local repository path or bundled-demo identifier.
2. The server validates that the path exists, is a directory, and is a Git worktree.
3. The manifest loader parses `.claim-to-commit/evidence.json`.
4. The Git adapter collects repository identity, current revision, commits, and changed files.
5. Evidence validators resolve every declared reference without modifying the repository.
6. The audit engine scores claims and emits findings with stable codes and human-readable explanations.
7. The scan service stores the immutable result and returns its identifier.
8. The client renders the scorecard and evidence chain from that result.

## 8. User Experience

The visual language is an editorial audit workbench, not a generic analytics dashboard.

- Warm off-white background and ink-colored typography.
- Green, amber, and red reserved for evidence status.
- Strong typographic hierarchy with monospace metadata for commits, paths, and commands.
- Evidence nodes resemble review stamps connected by a visible provenance line.
- Audit Mode changes emphasis and annotations without changing the underlying result.
- All statuses use text and icons in addition to color.
- The primary desktop layout remains usable at tablet width; narrow layouts stack the chain vertically.

There is one main path through the product: choose repository, understand score, inspect claim, verify artifacts. No settings area or secondary application shell is required.

## 9. Failure Handling

Expected failures become typed findings or clear user-facing errors:

- Missing Git executable: show installation guidance and preserve the bundled cached demo.
- Path not found or inaccessible: reject the scan without leaking unrelated filesystem details.
- Directory is not a Git repository: explain the requirement and provide the bundled demo action.
- Manifest absent: show opt-in instructions and a copyable minimal example.
- Manifest malformed: report the JSON location and validation message.
- Commit not found: mark that evidence reference invalid; do not abort other validations.
- Missing file, test artifact, or screenshot: record a claim finding and continue.
- SQLite unavailable or corrupt: recreate derived storage and rescan; never alter source evidence.

## 10. Testing Strategy

- Unit tests for schema validation, path normalization, each evidence validator, weighting, and status boundaries.
- Integration tests against temporary Git fixture repositories with known commits and artifacts.
- API tests for successful scans and major error states.
- Client component tests for scorecards, status labels, filters, and evidence-chain rendering.
- A browser smoke test for the complete bundled-demo journey if it can be included without risking the deadline.
- Fresh-clone verification in a clean directory using the exact documented judge command.

The critical regression is deterministic: the same repository revision and manifest must produce the same audit result.

## 11. Vertical Slices and Commit Boundaries

### Slice 1: Evidence engine

Deliver a runnable server, schema, Git fixture, validators, scoring engine, API, and automated tests. The API must produce the prepared proven and unsupported claims before UI work begins.

### Slice 2: Judge-visible product

Deliver the repository dashboard, scorecard, claim inventory, claim detail view, evidence chain, and Audit Mode. The prepared three-minute wow moment must work end to end.

### Slice 3: Self-audit and resilience

Make Claim to Commit audit its own build evidence. Add recent-scan caching, one-command setup, error states, accessibility checks, and responsive polish.

### Slice 4: Submission package

Capture screenshots and complete `README.md`, `DEMO.md`, `DESCRIPTION.md`, and `SUBMISSION-CHECKLIST.md`. Verify a fresh clone and map every code-satisfiable requirement to evidence.

Each slice ends runnable, tested, committed, and pushed. If work within a slice exceeds approximately 45 focused minutes without producing a stable checkpoint, scope is reduced and the cut is recorded in `DECISIONS.md`.

## 12. Initial Dependencies

The approved initial dependency budget is:

- React and React DOM.
- Vite and its React integration.
- Express.
- TypeScript and Node/React type definitions.
- A widely supported SQLite driver.
- A small schema validator for untrusted manifest input.
- Vitest and minimal HTTP/client test utilities.

The evidence chain will use semantic HTML, CSS, and SVG before considering a graph library. Any dependency outside this initial set requires approval.

## 13. Security and Privacy

- The server binds to localhost by default.
- All Git operations are read only and use argument arrays rather than shell-built commands.
- Repository paths are normalized before access.
- The scanner reads only declared artifacts plus Git metadata required for the audit.
- No repository contents, paths, session identifiers, or scan results leave the local machine.
- Secrets are never required. Optional configuration is documented with placeholders in `.env.example`.

## 14. Completion Criteria

The build is submission-ready when:

- The app starts from a fresh clone using one documented command.
- Seed data is immediately available and the prepared wow moment works without rebuilding artifacts.
- A user can scan a valid local repository that follows the evidence contract.
- Proven, partial, and unsupported claims are calculated and explained correctly.
- Claim to Commit can display evidence from its own dated build history.
- Automated tests pass.
- The four submission documents exist and contain no unresolved code-owned checklist items.
- The public-facing repository contains no secrets or third-party copyrighted demo assets.
- Multiple descriptive commits inside the competition window demonstrate the vertical-slice build history.

## 15. Deadline Rule

Submission packaging begins no later than Monday, July 20, 2026 at 5:00 PM Pacific Time. Feature work stops early enough to produce a verified, documented submission at least three hours before the Tuesday, July 21, 2026 5:00 PM Pacific deadline.
