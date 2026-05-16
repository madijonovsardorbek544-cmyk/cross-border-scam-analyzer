# Full Technical Audit — Cross-Border Scam Safety

_Last updated: 2026-05-16_

## 1. Scope inspected

This audit inspected the runnable code and project assets, including `package.json`, `vite.config.ts`, `.github/workflows/deploy.yml`, `src/main.tsx`, `src/pages/*`, `src/components/*`, `src/lib/analyzer/*`, `src/lib/privacy/*`, `src/lib/feedback/*`, `src/evaluation/*`, `data/cases.json`, `data/officialResources.json`, `src/data/resourcePacks.ts`, `firestore.rules`, `README.md`, `SECURITY.md`, and existing `docs/*`.

## 2. Current architecture

- **Frontend:** React + Vite + TypeScript single-page app deployed to GitHub Pages with `base: /cross-border-scam-analyzer/`.
- **Routing:** Hash-based routing in `src/lib/routes.ts`; `src/main.tsx` normalizes known routes and falls back invalid hashes to `#home`.
- **Analyzer:** Local rule-based scoring in `src/lib/analyzer/*`, exposed through `src/analyzer.ts`. It reports risk indicators, risk areas, confidence, safe next steps, and verification scripts.
- **Privacy/reporting:** `src/lib/privacy/reportSchema.ts` creates redacted report payloads and saves local reports under `crossBorderScamSafety.reports.v1`.
- **Feedback:** `src/lib/feedback/feedbackSchema.ts` stores structured calibration feedback only under `crossBorderScamSafety.feedback.v1`; no raw message field is present.
- **Firebase:** Optional Firestore writes exist for redacted reports and anonymous feedback if environment variables are configured. Dashboard Firebase querying is intentionally not implemented.
- **Data/content:** Cases and resources are static JSON/TS data. Resource packs include review flags and cautionary source notes.
- **Evaluation:** `src/evaluation/examples.ts` contains 120 labeled examples; `src/evaluation/runEvaluation.ts` checks expected score ranges and expected tactic labels.
- **Tests:** Vitest covers analyzer, storage/privacy, evaluation, controlled-beta flows, and jsdom E2E-style user flows under `e2e/`.

## 3. What works

- Local analysis does not persist raw messages by default (`src/pages/Checker.tsx`, `src/components/ResultCard.tsx`).
- Redacted report flow warns about sensitive data, shows a redacted preview, requires consent, and stores redacted payloads only (`src/pages/ReportPage.tsx`, `src/lib/privacy/reportSchema.ts`).
- Feedback records are structured and schema-bound without raw/redacted message fields (`src/lib/feedback/feedbackSchema.ts`).
- Dashboard labels sample, local, and Firebase modes and does not pretend Firebase dashboard querying is connected (`src/pages/Dashboard.tsx`).
- Firestore rules deny public report reads and restrict report/feedback creates to allowlisted fields (`firestore.rules`).
- Direct hash routes work for `#checker`, `#cases`, `#report`, `#dashboard`, and `#eval` (`src/lib/routes.ts`, `src/main.tsx`).
- Invalid hash routes normalize to home instead of breaking the app (`src/main.tsx`).
- Evaluation benchmark includes general phishing and international-student scenarios, including legitimate and borderline examples (`src/evaluation/examples.ts`).

## 4. Misleading behavior found

### High priority

- **Firebase can be configured for writes, but dashboard reads are not implemented.** The dashboard must remain explicit that Firebase mode is a placeholder until authenticated, governed reads exist. File: `src/pages/Dashboard.tsx`.
- **Evaluation results can look like accuracy claims.** The eval dashboard now needs interpretation guardrails every time results are shown. File: `src/pages/EvalDashboard.tsx`.
- **Local reports can look like durable institutional records.** The report and dashboard copy must repeatedly state localStorage is browser-only, unencrypted, and not institutional storage. Files: `src/pages/ReportPage.tsx`, `src/pages/Dashboard.tsx`.

### Medium priority

- **Top-3 reasons can hide important indicators.** A bank/card example may show the highest-weight indicators while hiding click/card labels from the first view. Fixed by adding a visible detected-indicators/action-clarity section. File: `src/components/ResultCard.tsx`.
- **Case source labels need practical explanation.** “Synthetic/public/verified” can be misunderstood without a source-label explanation. Fixed in `src/pages/CaseLibrary.tsx`.

## 5. What can break

- **Browser-only storage:** Clearing site data, changing browsers/devices, private browsing, or quota issues can delete local reports/feedback. Files: `src/lib/privacy/reportSchema.ts`, `src/lib/feedback/feedbackSchema.ts`.
- **Redaction misses:** Best-effort regex redaction can miss unusual IDs, names, addresses, screenshots, documents, or multilingual personal data. Files: `src/lib/privacy/redaction.ts`, `src/redaction.ts`.
- **Rule coverage gaps:** Adversarial scams may avoid keywords; legitimate messages may contain deadlines/payment terms and score medium/high. Files: `src/lib/analyzer/rules.ts`, `src/lib/analyzer/analyzeMessage.ts`.
- **Firebase env drift:** If Firebase env variables are accidentally added, writes may occur, but dashboard governance remains incomplete. Files: `src/firebase.ts`, `src/pages/Dashboard.tsx`, `firestore.rules`.
- **GitHub Pages base path:** `vite.config.ts` assumes deployment under `/cross-border-scam-analyzer/`; forks or renamed repos must update base path.
- **Dependency availability:** Playwright could not be installed in this environment due registry 403, so E2E coverage is Vitest/jsdom rather than real-browser Playwright.

## 6. Privacy risks

### Critical before institution pilots

- No production retention/deletion workflow exists for Firebase reports.
- No authenticated institution workspace, admin audit log, or role-based dashboard query exists.
- No human-reviewed data-governance process exists for real-but-redacted examples.

### High

- localStorage is accessible to anyone using the same browser profile and is not encrypted.
- Redacted messages can still contain context that identifies a student if the user leaves unique details in the text.
- Feedback is structured, but small cohorts could still reveal sensitive trend information if exported carelessly.

### Medium

- Case/resource content is useful for training but not institution-verified official advice.
- GitHub issues/security reports must not include scam messages or personal documents.

## 7. Firebase risks

- Firestore rules are a good start, but emulator tests are mandatory before pilots.
- `reports` allows unauthenticated creates of redacted reports; this is acceptable only with abuse controls, quotas, and monitoring before production.
- `anonymousFeedback` allows public creates; abuse/rate limiting is not implemented.
- `pilotRequests` rejects obvious raw-message fields but `notes` could still include a pasted scam message by user behavior; UI/process must warn against this.
- Admin roles rely on custom claims that are not implemented in the app.

## 8. Dashboard limitations

- Sample mode is synthetic and not evidence of market traction or institution risk.
- Local mode reflects only the current browser and is not shared with counselors/institutions.
- Firebase mode is not connected to secure querying and must not be used for decisions.
- Report exports are decision-support summaries, not prevalence, accuracy, or fraud-confirmation reports.

## 9. Testing gaps

### Fixed/improved in this pass

- Added Vitest/jsdom E2E-style specs for home, checker, report, dashboard, cases, and eval flows.
- Expanded benchmark to 120 examples and tightened expected tactic/score assertions.
- Added `test:e2e` and `test:all` scripts.

### Remaining gaps

- Real-browser Playwright tests are still blocked by registry access to `@playwright/test`.
- Firebase emulator rules tests are not implemented yet.
- No accessibility automation yet.
- No mobile screenshot/visual regression testing yet.
- No production monitoring, analytics privacy review, or abuse/rate-limit tests.

## 10. UX gaps

- Mobile layout is generally responsive, but needs manual QA on small phones and long result pages.
- Error handling exists for local/Firebase report and feedback save paths, but there is no global error boundary.
- Loading states are basic for save/submit buttons only; no async dashboard loading exists because Firebase reads are not implemented.
- Empty states exist for cases and dashboard data, but manual QA should verify clarity.

## 11. Deployment risks

- GitHub Pages workflow now runs unit tests, the E2E-style flow script, and build; keep this gate intact as tests grow.
- Deployment assumes `main` branch and Pages configuration.
- No environment-specific Firebase safeguards exist in CI.
- `npm install` currently succeeds for existing dependencies, but Playwright installation is blocked by registry policy.

## 12. Priority-ranked issue list

### Critical

1. Add Firebase emulator rules tests before any education-center pilot.
2. Build authenticated, role-based institution dashboard querying before showing Firebase mode as operational.
3. Define retention, deletion, admin access, incident response, and support workflows before collecting pilot data.

### High

1. Keep localStorage and Firebase limitation warnings visible across report/dashboard flows.
2. Continue expanding real-but-redacted and legitimate-message validation sets.
3. Conduct counselor review of escalation language and official-resource scripts.
4. Add real-browser E2E once registry access allows Playwright.

### Medium

1. Add accessibility checks and keyboard/screen-reader QA.
2. Add mobile manual QA and visual checks.
3. Add an error boundary for unexpected app failures.
4. Add data export review to prevent raw-message copy/paste in reports.

### Low

1. Improve content formatting for long case/resource lists.
2. Add version/date labels to resource packs after institution review.
3. Add copy confirmation for verification script buttons.
