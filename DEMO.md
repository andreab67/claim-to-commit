# Claim to Commit — video script

Target runtime: **2:55**. The video must be public on YouTube, three minutes or under, in English, and include audible narration. Do not add copyrighted music.

## Prepare before recording

1. Use a 1440 × 900 or larger desktop and set browser zoom to 90% so the score, claim list, and inspector are visible together.
2. In `C:\Users\andreab\claim-to-commit`, run `npm run demo` and wait for **Claim to Commit is ready**.
3. Open `http://127.0.0.1:8787`, wait for the bundled snapshot, and leave the first claim selected.
4. Copy `C:\Users\andreab\claim-to-commit` to the clipboard for the live self-scan.
5. Keep a second terminal ready at the repository root with this command typed but not run: `git log --oneline --reverse`.
6. Close notifications, hide bookmarks and unrelated tabs, confirm the microphone meter moves, and make one silent rehearsal under 2:55.

## 0:00–0:20 — hook: the review problem

**Screen:** Start on the full Claim to Commit workbench. Keep the 100% proof score, **4/4 shipped claims proven** seal, and claim inventory visible.

**Narration:**

> AI-assisted software can produce a polished claim faster than a reviewer can verify it. Engineering leads and hackathon judges still have to connect that claim to the decision, agent work, code, test, and visual result. Claim to Commit turns those scattered artifacts into one inspectable chain of custody.

## 0:20–0:55 — wow moment, part one: trace a real claim

**Clicks:**

1. Click **Claims are graded by transparent deterministic rules** if it is not already selected.
2. Slowly scroll the right panel through Decision, Session, Commit, File, Test, and Screenshot.
3. Pause on the green sentence **Every required artifact resolved. This claim is defensible.**

**Narration:**

> This headline claim is proven because all six declared artifacts resolve. The decision is recorded, the Codex session is named, the real commit exists, the file is attributable to it, the test result passed, and the visual artifact is present. There is no model-generated confidence score. The same repository revision and manifest always produce the same verdict.

## 0:55–1:25 — wow moment, part two: audit the unsupported boast

**Clicks:**

1. Scroll to the top.
2. Click **Enable Audit Mode**.
3. Click **Automatically infers evidence relationships with perfect accuracy**.
4. Pause on the **excluded audit control** label, the red **Confident prose is not proof** verdict, and `IMPLEMENTATION_UNPROVEN`.

**Narration:**

> Now I turn on Audit Mode and select an impressive-sounding negative control. It turns red immediately. Claim to Commit found no attributable implementation or passing test. The control stays visible, but the score remains one hundred percent because it was never presented as shipped scope. Instead of hiding uncertainty, the tool discloses the exclusion and tells the reviewer exactly what would make the claim defensible.

## 1:25–2:05 — live self-audit

**Clicks:**

1. Click **Scan a local repository**.
2. Paste `C:\Users\andreab\claim-to-commit` into **Repository path**.
3. Click **Run evidence scan**.
4. When **Fresh local scan** appears, point to the 100% score and **1 audit control excluded** disclosure.
5. Select **Reviewers can inspect a complete visual evidence chain** and briefly show its verified screenshot node.

**Narration:**

> This is not only a prepared mock. I am scanning this project's own Git repository. Inspection stays local and read only. The live revision scores one hundred percent: all four capabilities we shipped are proven, including this interface and screenshot, while the deliberately unbuilt semantic-inference control remains unsupported and explicitly excluded. The product demonstrates its own evidence standard.

## 2:05–2:20 — explain the practical workflow

**Clicks:** Expand **How this score is calculated**, then return to the claim list.

**Narration:**

> A team opts in with one strict JSON manifest. Shipped claims have public weights, negative controls require an explicit exclusion, scan results are stored locally, and unsafe paths are rejected. No account, API key, hosted service, or repository upload is required.

## 2:20–2:50 — how Codex and GPT-5.6 built it

**Screen:** Switch to the prepared terminal and run `git log --oneline --reverse`. Let the nine descriptive commits remain visible.

**Narration:**

> I built the core in this primary Codex session with GPT-5.6. Codex converted my product decision—explicit evidence, never guessed links—into the schema, safe Git adapters, deterministic audit engine, SQLite API, React workbench, tests, and submission assets. I steered the audience, local-only architecture, scoring policy, visual direction, Audit Mode reveal, and scope cuts. The dated vertical-slice commits show a runnable progression from contract to evidence engine to complete product.

## 2:50–2:55 — close

**Screen:** Return to the red unsupported verdict or end on `docs/screenshots/claim-audit.png`.

**Narration:**

> Claim to Commit: confident prose is not proof. Trace every claim to the commit.

## Recording acceptance check

- [ ] Runtime is 3:00 or less; target is 2:55.
- [ ] Voiceover is audible and English.
- [ ] The working product, evidence-chain wow moment, and Audit Mode reveal are visible.
- [ ] Codex workflow, GPT-5.6 use, and human decisions are named specifically.
- [ ] No secrets, personal notifications, third-party trademarks, or copyrighted music appear.
- [ ] Final upload is a **public** YouTube video.
