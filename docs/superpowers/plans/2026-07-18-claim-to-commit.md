# Claim to Commit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and submit a polished local developer tool that converts explicit product claims into a deterministic, inspectable chain of repository evidence.

**Architecture:** A single Node.js project serves a React/Vite client from an Express API. Read-only adapters inspect Git and repository artifacts, a deterministic audit engine scores claims, and SQLite caches immutable scan results. A bundled scan fixture guarantees the judge-facing story works immediately, while the live scanner proves the same workflow against the product's own repository.

**Tech Stack:** Node.js 22+, TypeScript, React, Vite, Express, better-sqlite3, Zod, Git CLI, Vitest, Testing Library, Supertest, plain CSS and SVG.

**Execution mode:** Inline execution in this Codex session. The competition requires the majority of the core functionality to be built in the submitted session, so no subagent or separate-session implementation is permitted.

---

## File Map

### Project tooling

- `package.json`: scripts, production dependencies, and development dependencies.
- `package-lock.json`: reproducible dependency graph.
- `tsconfig.json`: shared strict TypeScript options.
- `tsconfig.server.json`: server build boundary.
- `vite.config.ts`: client build and `/api` development proxy.
- `vitest.config.ts`: Node and browser-like test projects.
- `index.html`: Vite document shell.
- `.gitignore`: dependencies, compiled output, and local scan data.
- `.env.example`: optional local port and data-directory placeholders only.
- `scripts/dev.mjs`: cross-platform concurrent development launcher.
- `scripts/demo.mjs`: one-command dependency install, build, and start path.

### Shared evidence model

- `src/shared/evidence.ts`: manifest and audit result TypeScript types.
- `src/shared/schema.ts`: Zod evidence-manifest validation.
- `src/shared/status.ts`: status labels, ordering, and presentation-safe helpers.

### Server

- `src/server/index.ts`: localhost server entrypoint and shutdown handling.
- `src/server/app.ts`: Express application composition and static client hosting.
- `src/server/config.ts`: port, repository root, and data path resolution.
- `src/server/errors.ts`: typed public errors and safe serialization.
- `src/server/git/git-client.ts`: read-only Git command adapter.
- `src/server/manifest/load-manifest.ts`: evidence manifest loading and validation.
- `src/server/evidence/decision-validator.ts`: `DECISIONS.md` ID lookup.
- `src/server/evidence/test-validator.ts`: machine-readable test result lookup.
- `src/server/evidence/file-validator.ts`: changed-file and screenshot checks.
- `src/server/evidence/validate-evidence.ts`: evidence-type dispatcher.
- `src/server/audit/audit-claim.ts`: deterministic claim scoring and findings.
- `src/server/audit/audit-repository.ts`: weighted repository score.
- `src/server/scan/scan-repository.ts`: live scan orchestration.
- `src/server/store/scan-store.ts`: SQLite schema and scan persistence.
- `src/server/routes/scans.ts`: live scan and recent-scan routes.
- `src/server/routes/demo.ts`: bundled fixture route.

### Client

- `src/client/main.tsx`: React entrypoint.
- `src/client/App.tsx`: prepared demo and live-scan application state.
- `src/client/api.ts`: typed HTTP client.
- `src/client/components/Header.tsx`: product identity and audit-mode control.
- `src/client/components/RepositoryHero.tsx`: repository context and score.
- `src/client/components/Scorecard.tsx`: status totals and formula disclosure.
- `src/client/components/ClaimList.tsx`: filterable claim inventory.
- `src/client/components/EvidenceChain.tsx`: semantic SVG/CSS provenance chain.
- `src/client/components/ClaimInspector.tsx`: evidence details and findings.
- `src/client/components/ScanForm.tsx`: local path scan flow.
- `src/client/components/EmptyState.tsx`: actionable failure and opt-in states.
- `src/client/styles/tokens.css`: palette, typography, spacing, and motion tokens.
- `src/client/styles/app.css`: responsive workbench layout and components.

### Evidence and demo artifacts

- `.claim-to-commit/evidence.json`: self-audit manifest.
- `DECISIONS.md`: stable human product decisions.
- `artifacts/test-results.json`: committed validation summary for self-audit.
- `fixtures/demo-scan.json`: deterministic precomputed judge demo.
- `fixtures/demo-screenshot.svg`: original, trademark-free visual evidence fixture.

### Tests

- `tests/shared/schema.test.ts`: manifest contract.
- `tests/server/git-client.test.ts`: fixture-repository Git behavior.
- `tests/server/validate-evidence.test.ts`: evidence resolution.
- `tests/server/audit-claim.test.ts`: status boundaries and explanations.
- `tests/server/audit-repository.test.ts`: weighted score.
- `tests/server/api.test.ts`: bundled demo and live API behavior.
- `tests/client/App.test.tsx`: judge-visible interaction and Audit Mode.
- `tests/helpers/git-fixture.ts`: deterministic temporary Git repository.

### Submission

- `README.md`: product, audience, setup, test steps, architecture, and Codex build history.
- `DEMO.md`: exact sub-three-minute recording script.
- `DESCRIPTION.md`: Devpost description under 300 words.
- `SUBMISSION-CHECKLIST.md`: requirement-to-evidence map and manual actions.

---

### Task 1: Runnable strict TypeScript foundation

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `tsconfig.json`
- Create: `tsconfig.server.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `index.html`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `scripts/dev.mjs`
- Create: `src/server/index.ts`
- Create: `src/server/app.ts`
- Create: `src/client/main.tsx`
- Create: `src/client/App.tsx`
- Create: `src/client/styles/tokens.css`
- Create: `src/client/styles/app.css`
- Test: `tests/server/api.test.ts`

- [ ] **Step 1: Define the initial dependency budget**

Use only the dependencies authorized by the design: React, Express, better-sqlite3, Zod, Vite, TypeScript/tsx, Vitest, Testing Library, jsdom, and Supertest. Define scripts `dev`, `build`, `start`, `test`, `test:run`, `typecheck`, and `check`.

- [ ] **Step 2: Write the failing health-route test**

```ts
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/server/app.js";

describe("GET /api/health", () => {
  it("reports a ready local service", async () => {
    const response = await request(createApp()).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", service: "claim-to-commit" });
  });
});
```

- [ ] **Step 3: Verify the test fails for the missing app**

Run: `npm install && npm run test:run -- tests/server/api.test.ts`  
Expected: FAIL because `src/server/app.ts` does not exist.

- [ ] **Step 4: Implement the smallest Express app and React shell**

`createApp()` returns an Express instance with JSON parsing and the health route. The React shell renders the name, tagline, and a loading message. The production server binds to `127.0.0.1`, handles `SIGINT`/`SIGTERM`, and serves `dist/client` after the later build task.

- [ ] **Step 5: Add strict project configuration and cross-platform dev launcher**

The TypeScript configuration enables `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, and NodeNext module resolution. `scripts/dev.mjs` spawns `tsx watch src/server/index.ts` and `vite` without shell string interpolation and terminates both children on exit.

- [ ] **Step 6: Verify the runnable checkpoint**

Run: `npm run check`  
Expected: the health test passes, TypeScript reports no errors, and both production builds complete.

- [ ] **Step 7: Commit the foundation**

```powershell
git add -- package.json package-lock.json tsconfig.json tsconfig.server.json vite.config.ts vitest.config.ts index.html .gitignore .env.example scripts src tests/server/api.test.ts
git commit -m "chore: scaffold runnable evidence workbench"
git push
```

---

### Task 2: Evidence manifest contract

**Files:**
- Create: `src/shared/evidence.ts`
- Create: `src/shared/schema.ts`
- Create: `src/shared/status.ts`
- Create: `src/server/errors.ts`
- Create: `src/server/manifest/load-manifest.ts`
- Test: `tests/shared/schema.test.ts`

- [ ] **Step 1: Write failing manifest tests**

Cover one valid project with a headline user-visible claim and all six evidence types. Reject duplicate IDs, absolute artifact paths, `..` path traversal, unknown evidence types, invalid importance, and empty claims.

```ts
expect(() => parseEvidenceManifest(validManifest)).not.toThrow();
expect(() => parseEvidenceManifest({ ...validManifest, claims: [] })).toThrow(
  /at least one claim/i,
);
```

- [ ] **Step 2: Verify schema tests fail**

Run: `npm run test:run -- tests/shared/schema.test.ts`  
Expected: FAIL because `parseEvidenceManifest` is missing.

- [ ] **Step 3: Define stable evidence and audit types**

Define `EvidenceManifest`, `Claim`, `EvidenceReference`, `ResolvedEvidence`, `Finding`, `ClaimAudit`, `RepositoryAudit`, `AuditStatus`, and `ClaimImportance`. Evidence references use a discriminated `type` field. Audit results contain only JSON-serializable values.

- [ ] **Step 4: Implement schema validation and safe loading**

Use Zod discriminated unions and refinements for unique IDs and relative paths. `loadManifest(repositoryPath)` reads only `.claim-to-commit/evidence.json`, reports missing manifests as public error code `MANIFEST_NOT_FOUND`, and maps invalid JSON/schema errors to `MANIFEST_INVALID` without exposing stack traces.

- [ ] **Step 5: Run focused and full checks**

Run: `npm run test:run -- tests/shared/schema.test.ts && npm run check`  
Expected: all tests, type checks, and builds pass.

- [ ] **Step 6: Commit the evidence contract**

```powershell
git add -- src/shared src/server/errors.ts src/server/manifest tests/shared
git commit -m "feat: define explicit repository evidence contract"
git push
```

---

### Task 3: Read-only Git and evidence validation

**Files:**
- Create: `src/server/git/git-client.ts`
- Create: `src/server/evidence/decision-validator.ts`
- Create: `src/server/evidence/test-validator.ts`
- Create: `src/server/evidence/file-validator.ts`
- Create: `src/server/evidence/validate-evidence.ts`
- Create: `tests/helpers/git-fixture.ts`
- Test: `tests/server/git-client.test.ts`
- Test: `tests/server/validate-evidence.test.ts`

- [ ] **Step 1: Write failing Git adapter tests**

Create a temporary repository with fixed author identity and two commits. Assert that `inspectRepository(path)` returns the full HEAD SHA, branch, commit subjects, and normalized changed-file paths. Assert that a non-repository produces `NOT_A_GIT_REPOSITORY`.

- [ ] **Step 2: Run the Git test and observe failure**

Run: `npm run test:run -- tests/server/git-client.test.ts`  
Expected: FAIL because the Git adapter is missing.

- [ ] **Step 3: Implement safe Git execution**

Use `execFile("git", args, { cwd })`, never a shell command string. Resolve the requested path, confirm it is a directory, verify `git rev-parse --is-inside-work-tree`, and parse delimiter-separated log output. All operations are read only.

- [ ] **Step 4: Write failing evidence-resolution tests**

Exercise valid and missing decision IDs, commit SHAs, changed files, passing/failing test artifacts, screenshots, and session checkpoints. Each result must preserve the evidence ID, type, resolution state, label, metadata, and a stable finding code when invalid.

- [ ] **Step 5: Implement the evidence dispatcher**

`validateEvidence(context, reference)` delegates by evidence type. Paths are joined only after relative-path validation and must remain inside the repository. A missing artifact invalidates that item but does not throw or stop the remaining claim audit.

- [ ] **Step 6: Verify deterministic behavior**

Run: `npm run test:run -- tests/server/git-client.test.ts tests/server/validate-evidence.test.ts && npm run check`  
Expected: all focused tests and the complete check pass.

- [ ] **Step 7: Commit the live evidence readers**

```powershell
git add -- src/server/git src/server/evidence tests/helpers tests/server/git-client.test.ts tests/server/validate-evidence.test.ts
git commit -m "feat: resolve Git and repository evidence safely"
git push
```

---

### Task 4: Deterministic audit engine, SQLite cache, and scan API

**Files:**
- Create: `src/server/audit/audit-claim.ts`
- Create: `src/server/audit/audit-repository.ts`
- Create: `src/server/scan/scan-repository.ts`
- Create: `src/server/store/scan-store.ts`
- Create: `src/server/routes/scans.ts`
- Create: `src/server/routes/demo.ts`
- Create: `src/server/config.ts`
- Modify: `src/server/app.ts`
- Test: `tests/server/audit-claim.test.ts`
- Test: `tests/server/audit-repository.test.ts`
- Modify: `tests/server/api.test.ts`

- [ ] **Step 1: Write failing claim-status tests**

Assert `proven` for a valid commit, changed file, passing test, and required screenshot; `partial` when implementation exists but validation is missing; and `unsupported` when no implementation commit resolves. Assert exact finding codes including `TEST_MISSING`, `SCREENSHOT_MISSING`, and `IMPLEMENTATION_UNPROVEN`.

- [ ] **Step 2: Implement claim scoring**

Keep status computation as a pure function. User-visible claims require a screenshot; every proven claim requires a commit, changed file, and passing test. Invalid optional evidence creates a finding but does not lower a claim whose required evidence is complete.

- [ ] **Step 3: Write and implement weighted repository scoring**

Use weights `headline = 3`, `major = 2`, `supporting = 1`. Score is `round(provenWeight / totalWeight * 100)`. Return status counts and the public formula string so the client never reimplements audit logic.

- [ ] **Step 4: Write failing API tests**

Test `GET /api/demo`, `POST /api/scans` with a fixture path, `GET /api/scans/:id`, an inaccessible path, a non-Git directory, and a malformed manifest. Public error responses have `{ error: { code, message, guidance } }` and no stack trace.

- [ ] **Step 5: Implement scan orchestration and SQLite cache**

Create tables `scans(id, repository_path, revision, created_at, score, payload_json)` and an index on `(repository_path, revision)`. The store persists immutable audit JSON. The scanner loads the manifest, inspects Git, resolves evidence, audits claims, and writes one scan transaction.

- [ ] **Step 6: Implement API routes**

`GET /api/demo` loads the committed fixture, `POST /api/scans` performs a live scan, `GET /api/scans` lists recent summaries, and `GET /api/scans/:id` returns the full immutable result. Unknown scan IDs return `SCAN_NOT_FOUND`.

- [ ] **Step 7: Verify the API checkpoint**

Run: `npm run test:run -- tests/server && npm run check`  
Expected: the prepared API returns proven, partial, and unsupported claims; all checks pass.

- [ ] **Step 8: Commit the working evidence engine**

```powershell
git add -- src/server tests/server
git commit -m "feat: audit claims with transparent evidence rules"
git push
```

---

### Task 5: Seeded story and human decision ledger

**Files:**
- Create: `DECISIONS.md`
- Create: `fixtures/demo-scan.json`
- Create: `fixtures/demo-screenshot.svg`
- Create: `.claim-to-commit/evidence.json`
- Create: `artifacts/test-results.json`
- Test: `tests/server/demo-fixture.test.ts`

- [ ] **Step 1: Write fixture contract tests**

Parse `fixtures/demo-scan.json` as `RepositoryAudit`. Require at least one claim in each status, one headline proven claim with all six evidence types, one explicitly labeled demonstration claim with `unsupported` status, score formula metadata, and no absolute local paths.

- [ ] **Step 2: Create the original bundled demo evidence**

The fixture tells one coherent story: “Deterministic claim auditing” is proven; “Repository scanning” is proven; “Reviewer-ready visual chain” is partial until the UI artifact exists; “Automatic semantic evidence inference” is the clearly labeled unsupported demonstration claim. Use only original SVG geometry and text.

- [ ] **Step 3: Record stable human decisions**

`DECISIONS.md` records `DEC-001` explicit evidence over semantic guessing, `DEC-002` local-only read access, `DEC-003` deterministic scoring, `DEC-004` self-auditing demo, and any deadline cuts with date, context, choice, and consequence.

- [ ] **Step 4: Add the initial self-audit manifest**

Reference actual commits from Tasks 1-4, decision IDs, committed test summary, and fixture screenshot. Do not invent evidence. Claims without complete evidence remain partial until later commits supply it.

- [ ] **Step 5: Verify and commit the prepared dataset**

Run: `npm run test:run -- tests/server/demo-fixture.test.ts && npm run check`  
Expected: fixture contract and all project checks pass.

```powershell
git add -- DECISIONS.md fixtures .claim-to-commit artifacts tests/server/demo-fixture.test.ts
git commit -m "feat: seed an honest claim audit story"
git push
```

---

### Task 6: Complete judge-visible workbench

**Files:**
- Create: `src/client/api.ts`
- Create: `src/client/components/Header.tsx`
- Create: `src/client/components/RepositoryHero.tsx`
- Create: `src/client/components/Scorecard.tsx`
- Create: `src/client/components/ClaimList.tsx`
- Create: `src/client/components/EvidenceChain.tsx`
- Create: `src/client/components/ClaimInspector.tsx`
- Create: `src/client/components/ScanForm.tsx`
- Create: `src/client/components/EmptyState.tsx`
- Modify: `src/client/App.tsx`
- Modify: `src/client/styles/tokens.css`
- Modify: `src/client/styles/app.css`
- Test: `tests/client/App.test.tsx`

- [ ] **Step 1: Write the failing wow-moment test**

Mock `GET /api/demo`. Assert the repository scorecard and claims render, selecting the headline claim reveals decision/session/commit/file/test/screenshot nodes, and toggling Audit Mode gives the unsupported claim an alert treatment with its missing-evidence explanation.

- [ ] **Step 2: Build the typed demo loading flow**

The app loads the bundled demo by default, preserves selection while toggling Audit Mode, and exposes a live-scan form as a secondary action. Loading failures render a retry button and concise guidance.

- [ ] **Step 3: Build the evidence workbench**

Implement a two-column desktop composition: repository narrative and claim list on the left, selected-claim evidence on the right. Evidence nodes use ordered semantic markup connected by CSS/SVG, with visible type labels and resolvable metadata. The unsupported demonstration claim must be unmistakably intentional.

- [ ] **Step 4: Apply the visual system**

Use warm paper `#f4f0e8`, ink `#172126`, muted slate `#5f6b70`, proof green `#18794e`, warning amber `#a15c00`, and audit red `#b42318`. Use system sans typography plus a system monospace stack for evidence. Add restrained entry motion disabled under `prefers-reduced-motion`.

- [ ] **Step 5: Make status accessible**

Every status has icon, label, and text explanation; focus is visible; Audit Mode is a real pressed toggle; filters are keyboard-operable; headings follow a logical hierarchy; mobile stacks the evidence chain vertically.

- [ ] **Step 6: Verify the visible product**

Run: `npm run test:run -- tests/client/App.test.tsx && npm run check`  
Expected: the complete demo interaction passes with no TypeScript or build failures.

- [ ] **Step 7: Commit the wow moment**

```powershell
git add -- src/client tests/client
git commit -m "feat: reveal claim provenance in an audit workbench"
git push
```

---

### Task 7: One-command demo, live self-audit, and resilience

**Files:**
- Create: `scripts/demo.mjs`
- Modify: `package.json`
- Modify: `src/server/app.ts`
- Modify: `.claim-to-commit/evidence.json`
- Modify: `artifacts/test-results.json`
- Modify: `DECISIONS.md`
- Test: `tests/server/self-audit.test.ts`

- [ ] **Step 1: Write the self-audit regression**

Run a scan against the project root and assert the headline claim resolves an actual Git commit, changed file, passing test artifact, and screenshot. Assert the semantic-inference demonstration remains unsupported.

- [ ] **Step 2: Implement the one-command launcher**

`npm run demo` invokes `scripts/demo.mjs`. The script checks Node 22+, runs `npm ci` only when dependencies are missing, builds only when compiled output is absent or older than source metadata, and starts the localhost server. Child processes use argument arrays and inherit stdio. It prints the exact local URL and stop instruction.

- [ ] **Step 3: Serve the built client and protect local boundaries**

Express serves `dist/client`, uses a same-origin fallback for non-API routes, limits JSON request size, binds only to `127.0.0.1`, and sanitizes all public errors. The live scanner never mutates a target repository.

- [ ] **Step 4: Update only truthful self-evidence**

Replace commit references with the actual SHAs produced by completed slices, regenerate `artifacts/test-results.json` from the full test run, and point the user-visible claim to the committed screenshot artifact. Do not mark the final visual claim proven until its screenshot exists.

- [ ] **Step 5: Verify the resilient checkpoint**

Run: `npm run check`  
Expected: tests, type checks, and production build pass.

Run: `npm run demo`  
Expected: one command prepares and starts the app at a printed localhost URL; the bundled demo loads immediately.

- [ ] **Step 6: Commit the complete application**

```powershell
git add -- scripts/demo.mjs package.json src/server .claim-to-commit artifacts DECISIONS.md tests/server/self-audit.test.ts
git commit -m "feat: run and self-audit from one command"
git push
```

---

### Task 8: Submission package and fresh-clone proof

**Files:**
- Create: `README.md`
- Create: `DEMO.md`
- Create: `DESCRIPTION.md`
- Create: `SUBMISSION-CHECKLIST.md`
- Create: `docs/screenshots/claim-audit.png`
- Create: `docs/screenshots/evidence-chain.png`
- Modify: `.claim-to-commit/evidence.json`
- Modify: `artifacts/test-results.json`

- [ ] **Step 1: Capture the two judge-critical screenshots**

Capture one complete scorecard/Audit Mode view and one headline evidence-chain detail at a desktop viewport. Include no browser extensions, secrets, third-party logos, or unrelated desktop content.

- [ ] **Step 2: Write the evidence-first README**

Include the problem and audience, what the product does, one-command setup/run, exact seeded judge steps, test commands, evidence contract example, architecture, privacy model, limitations, and a “How Codex built this” section referencing actual commits and the user's product decisions.

- [ ] **Step 3: Write the timed demo script**

Use exact timestamps and clicks: 0:00 problem/audience hook, 0:20 prepared scorecard, 0:45 headline chain, 1:35 Audit Mode unsupported reveal, 2:05 live self-scan, 2:20 Codex/GPT-5.6 build evidence, and 2:50 close. Document the app state and window preparation required before recording.

- [ ] **Step 4: Write the Devpost description**

Keep `DESCRIPTION.md` at or below 300 words. State the audience, problem, deterministic evidence approach, features, local privacy, self-referential demo, and the distinction between explicit provenance and generated summaries.

- [ ] **Step 5: Map submission requirements**

`SUBMISSION-CHECKLIST.md` maps track fit, working implementation, complete experience, real audience/problem, originality, Codex usage, public repository, public video, description, setup, test steps, seed data, secrets, license, and `/feedback` Session ID. Only YouTube upload, repository visibility confirmation, Devpost form entry, and Session ID remain unchecked manual actions.

- [ ] **Step 6: Update the truthful final evidence**

Point screenshot evidence to the captured PNGs, record the full passing validation summary, and rescan the repository. Confirm that no claim is marked proven without resolving every required artifact.

- [ ] **Step 7: Verify from a clean clone**

Clone the GitLab repository into a new temporary directory outside the working tree. Run `npm run demo`, execute the documented judge path, and run `npm run check`. Confirm no ignored local cache or untracked file is required. Remove only the explicitly resolved temporary clone after verification.

- [ ] **Step 8: Audit secrets and submission completeness**

Run: `git grep -n -I -E "(sk-[A-Za-z0-9]|BEGIN (RSA|OPENSSH|EC) PRIVATE KEY|password[[:space:]]*=|api[_-]?key[[:space:]]*=)"`  
Expected: no secret values.

Run: `npm run check && git status --short`  
Expected: all checks pass; only intentional submission artifacts are uncommitted before the final commit.

- [ ] **Step 9: Commit and push the submission package**

```powershell
git add -- README.md DEMO.md DESCRIPTION.md SUBMISSION-CHECKLIST.md docs/screenshots .claim-to-commit artifacts/test-results.json
git commit -m "docs: package Claim to Commit for Build Week"
git push
```

- [ ] **Step 10: Confirm final repository state**

Run: `git status --short --branch`  
Expected: `main` tracks `origin/main` with a clean worktree.

Run: `git log --oneline --decorate -10`  
Expected: the design, plan, vertical-slice, and submission commits are visible inside the competition window.

---

## Plan Self-Review

- The plan covers every included product capability and all four required submission documents.
- Runtime boundaries remain local and read only; no paid service, authentication, or out-of-scope feature appears.
- The bundled fixture guarantees the story without rebuilding, while the live self-scan demonstrates real Git evidence.
- Type names and status values remain consistent: `proven`, `partial`, and `unsupported`.
- Every implementation task ends with focused validation, a runnable project, a descriptive commit, and a push.
- Submission packaging begins as a required slice rather than optional cleanup.
