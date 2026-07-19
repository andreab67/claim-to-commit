# OpenAI Build Week submission checklist

Deadline: **Tuesday, July 21, 2026 at 5:00 PM Pacific Time**. Internal ship target: **2:00 PM Pacific Time or earlier**.

Official reference: [OpenAI Build Week FAQ](https://openai.devpost.com/details/faqs). Code-owned requirements are already checked; remaining open boxes require the entrant's account, recording, or final form submission.

## Eligibility and track

- [x] Working project built during the submission window — dated history begins at `f4f278a` and progresses through runnable vertical slices.
- [x] Chosen track is **Developer Tools** — stated in `DESCRIPTION.md` and throughout `README.md`.
- [x] Real audience and problem are specific — engineering leads, hackathon reviewers, and teams validating AI-assisted work; see README **The problem and the audience**.
- [x] Codex use is meaningful — core product specification, implementation, tests, UI, verification, and submission package were built in this primary session.
- [x] GPT-5.6 use is meaningful and honestly described — used through Codex as the coding/reasoning model, not presented as a runtime API; see README **How Codex built this**.
- [x] English-only repository and submission drafts.

## Working project and repository

- [x] MIT license exists at `LICENSE`.
- [x] One-command fresh-clone path is `npm run demo`.
- [x] Locked dependency graph exists at `package-lock.json`.
- [x] Seed data exists at `fixtures/demo-scan.json` and loads automatically.
- [x] Exact judge clicks, inputs, and expected results are in README **Judge test path**.
- [x] Developer Tool installation instructions and prerequisites are in README **Quick start**.
- [x] Supported platforms are disclosed in README **Supported platforms**.
- [x] Judges can understand/test without implementing anything: committed screenshots, bundled seed audit, one-command local demo, and automated verification are included.
- [x] Architecture and deterministic status rules are documented.
- [x] No account, test credential, paid service, or secret is needed.
- [x] `.env.example` contains placeholders/options only; `.env` and local data are ignored.
- [x] Original icon is normalized at `public/icon.png`; demo assets use no third-party trademarks or stock art.
- [x] Public GitHub repository is live at `https://github.com/andreab67/claim-to-commit`; the private GitLab repository remains a build mirror.
- [x] Anonymous HTTP checks returned 200 for the public repository and raw README, including the screenshot reference.

## README requirement map

- [x] What the project does — README opening and **What it does**.
- [x] Problem and audience case — README **The problem and the audience**.
- [x] Install and one-command run — README **Quick start — one command**.
- [x] Sample/seed data — README **Judge test path** and `fixtures/demo-scan.json`.
- [x] Clear test guidance — three manual tests plus `npm run check`.
- [x] Architecture overview — README **Architecture**.
- [x] Codex acceleration — README **How Codex built this**, tied to real commits.
- [x] Human product, engineering, and design decisions — README and `DECISIONS.md`.
- [x] GPT-5.6 role — README **How Codex built this**.
- [x] Third-party/open-source disclosure — README **Third-party work and license**.

## Public demo video

- [x] Timed script under three minutes exists in `DEMO.md`.
- [x] Script starts with audience/problem, demonstrates the wow moment by 0:20, covers Codex/GPT-5.6 at 2:20, and closes at 2:50.
- [x] Exact clicks and pre-recording app state are documented.
- [x] Script explicitly avoids copyrighted music, trademarks, secrets, and unrelated notifications.
- [ ] Record the working product with clear English voiceover.
- [ ] Confirm final duration is 3:00 or less and audio is intelligible.
- [ ] Confirm the video explicitly covers what was built, how Codex was used, how GPT-5.6 was used, and which decisions were human.
- [ ] Upload to YouTube as **Public** (not unlisted/private) and paste the URL into Devpost.
- [ ] Watch the public upload from beginning to end in a logged-out/private browser.

## Devpost fields

- [x] Text description draft is at `DESCRIPTION.md` and is under 300 words.
- [x] Feature/functionality summary is included in that draft.
- [x] Public repository URL is known: `https://github.com/andreab67/claim-to-commit`.
- [ ] Select **Developer Tools** as the single track.
- [ ] Paste the final text from `DESCRIPTION.md` into the Devpost description field.
- [ ] Add the public YouTube URL.
- [ ] Add the accessible public GitHub repository URL.
- [ ] Add the two strongest screenshots: `docs/screenshots/evidence-chain.png` first and `docs/screenshots/claim-audit.png` second.
- [ ] Run `/feedback` in **this primary Codex session**, copy the generated Session ID, and paste it into the required Devpost field.
- [ ] Review entrant/profile/team fields for accuracy.
- [ ] Preview every Devpost section and test every link before submitting.
- [ ] Submit by **Tuesday, July 21, 2026 at 2:00 PM PT**, preserving the three-hour safety margin.
- [ ] Save the Devpost confirmation page/email and take a final submission screenshot.

## Final technical gate

- [x] Current checkpoint passes 9 test files / 39 tests, type-checks, and builds.
- [x] Production smoke test returns HTTP 200, health `ok`, bundled score 70, and five claims.
- [x] Fresh-clone verification passed: first-command install/build/start, HTTP 200, bundled 70% audit, live 90% self-audit, 9 test files / 39 tests, type-check, production build, and clean Git status.
- [x] Final secret scan found no credential/private-key patterns, no environment files are tracked, and `npm audit --omit=dev` reports zero vulnerabilities; confirm the post-push Git status in the handoff.
