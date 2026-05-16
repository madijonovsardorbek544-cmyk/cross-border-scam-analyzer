# Project audit and readiness review

_Last updated: 2026-05-16_

## A. Current project summary

### What the project is

Cross-Border Scam Safety for International Students is a public MVP that helps international students, families, counselors, education centers, and institutions review study-abroad messages for scam risk indicators. It is an educational risk-indicator tool, not certified fraud detection and not a replacement for legal, immigration, financial, emergency, or law-enforcement support.

### Target users

- International students and applicants.
- Parents/families supporting study-abroad decisions.
- School counselors and education-center advisors.
- Institutional international offices, admissions, financial aid, housing, testing, and student support teams evaluating future pilot workflows.

### Public demo link

https://madijonovsardorbek544-cmyk.github.io/cross-border-scam-analyzer/

### Current architecture

- React + Vite + TypeScript single-page app.
- Hash-based routing for GitHub Pages.
- Local-first analyzer rules and combination boosts.
- Browser localStorage for local redacted reports and structured anonymous feedback.
- Optional Firebase client configuration for redacted report and structured feedback submission.
- Firestore rules for reports, anonymous feedback, pilot requests, users, institutions, and institution summaries.
- Static data for cases, official resources, sample reports, resource packs, and synthetic/labeled evaluation examples.

## B. What works now

- **Local-first checker:** students can paste a message and receive a score, risk level, top reasons, safe next steps, and a copyable verification script without network submission.
- **Analyzer rules:** transparent rules detect urgency, account threats, OTP/credential requests, payment risk, suspicious links/domains, sensitive-data requests, visa threats, housing scarcity, test-score scams, personal-account payment requests, and cross-border bureaucracy pressure.
- **Evaluation benchmark:** labeled examples run in automated tests and the evaluation dashboard to protect calibration regressions. The benchmark is synthetic/labeled; it is not real-world accuracy proof.
- **Analyst view:** counselor/analyst mode exposes matched rules, evidence, weights, risk areas, combination boosts, and false-positive guidance.
- **Case library:** users can filter and review study-abroad scam scenarios and safe-response guidance.
- **Resource packs:** resource packs provide official-verification scripts and checklists for visas, testing, housing, scholarships, and education-agent scenarios.
- **Redacted reporting:** the report flow previews best-effort redaction, requires consent, sanitizes undefined fields, submits only redacted fields, saves locally when Firebase is unavailable, and exposes copy/clear controls.
- **Anonymous feedback:** feedback stores structured calibration fields only, sanitizes undefined fields, includes loading/success/error states, and never stores raw messages by schema.
- **Dashboard modes:** sample mode shows synthetic/sample reports; local mode reads locally saved redacted reports and feedback; Firebase mode is clearly labeled as not connected to Firestore dashboard queries in this MVP.
- **Docs:** README, validation, pilot, privacy threat model, institution setup, counselor interview, resource review, student safety, and this audit document exist.

## C. What is not production-ready

- Firebase must be configured, deployed, and tested with real environment variables before use beyond local/browser mode.
- Firestore rules need emulator tests before an institution pilot or production launch.
- Dashboard Firebase mode is not connected to Firestore queries in this MVP; it must not be presented as live institutional data.
- Evaluation benchmark examples are synthetic/labeled regression checks, not measured real-world fraud-detection accuracy.
- Redaction is best effort. Users must still be told not to paste private documents, screenshots, passport scans, card numbers, passwords, OTPs, exact addresses, or private records.
- There is no verified institution pilot yet.
- There is no verified data-sharing agreement, retention process, deletion process, incident-response process, or counselor escalation process yet.
- There is no admin console, audit log, role-management workflow, or production monitoring.

## D. Critical bugs found and fixed

| Bug | File(s) | Problem | Fix | Test added |
| --- | --- | --- | --- | --- |
| Firebase report schema mismatch | `src/pages/ReportPage.tsx`, `firestore.rules` | App submitted `serverCreatedAt`, but rules allowed `createdAt`/`createdAtIso`; report creation could be denied. | Report submission now uses `createdAt: serverTimestamp()` and rules/tests exclude `serverCreatedAt`. | `src/privacyStorage.test.ts` checks report submission keys match rules and `serverCreatedAt` is not allowed. |
| Missing anonymous feedback rules | `firestore.rules` | `anonymousFeedback` writes had no collection rule and were likely denied. | Added restrictive create-only rule, raw-message-field rejection, structured-field allowlist, admin-only read, and public update/delete denial. | `src/privacyStorage.test.ts` checks feedback payload keys against rules and raw message fields are absent. |
| Misleading local report flow | `src/pages/ReportPage.tsx`, `src/lib/privacy/reportSchema.ts` | UI said a local report ID existed, but no report was saved locally. | Added local redacted report storage key, save/read helpers, copy report ID, clear form, local-only success notice, and Firebase failure fallback to local redacted storage. | `src/privacyStorage.test.ts` checks local report save/read and raw message absence. |
| Dashboard local mode ignored reports | `src/pages/Dashboard.tsx`, `src/lib/privacy/reportSchema.ts` | Local/Firebase modes returned empty report arrays; sample mode was the only populated mode. | Local mode now reads saved local redacted reports; Firebase mode is clearly marked not connected instead of pretending queried data exists. | Covered by helper tests and documented in this readiness review. |
| Undefined Firestore fields | `src/lib/privacy/reportSchema.ts`, `src/lib/feedback/feedbackSchema.ts`, `src/lib/privacy/payloadSanitizer.ts` | Optional fields could be `undefined`, which Firestore rejects. | Added sanitizer and applied it to report, feedback, and Firebase submission payloads. | `src/privacyStorage.test.ts` checks no undefined fields for reports/feedback and sanitizer behavior. |
| Weak submission error handling | `src/pages/ReportPage.tsx`, `src/components/ResultCard.tsx`, `src/lib/feedback/feedbackSchema.ts` | Report/feedback submissions had limited loading/success/error handling and could fail opaquely. | Added loading, success, error messages, safe local fallback on Firebase report/feedback failures, and clear local/Firebase labeling. | Build and component type checks cover the new states; manual UI review is still needed. |
| Unpinned dependency versions | `package.json`, `package-lock.json` | Dependencies used `latest`, making builds less reproducible. | Replaced `latest` with explicit versions from the lockfile and added `node >=20` engine. | `npm install`, `npm test`, and `npm run build` pass. |
| README overstated readiness | `README.md` | README language could imply institution readiness and Firebase-backed dashboard behavior. | Added public-MVP readiness status, Firebase/security caveats, localStorage limitation, synthetic dashboard data caveat, and paid/institution no-go warning. | Documentation review in this audit. |

## E. User-flow readiness

| Flow | Status | Notes |
| --- | --- | --- |
| 1. Open homepage | Ready for public MVP review | Hash routing and GitHub Pages base path are configured. Copy must remain clear that this is educational and under validation. |
| 2. Use demo checker | Ready | Demo messages can populate the checker and run locally. |
| 3. Paste custom suspicious message | Partially ready | Works locally, but users must be reminded not to paste highly sensitive personal data or documents. |
| 4. Read result | Ready for controlled feedback | Results explain risk indicators, confidence, and safe next steps without claiming certainty. |
| 5. Copy verification script | Ready | Script copy action exists. Browser clipboard permissions may vary. |
| 6. Submit feedback | Partially ready | Structured local/Firebase feedback flow now has safe schema and error states. Firestore rules still need emulator testing. |
| 7. Submit redacted report | Partially ready | Local redacted storage and Firebase submission schema are fixed. Redaction remains best effort and Firebase needs emulator/security validation. |
| 8. View dashboard in sample mode | Ready with caveat | Shows synthetic/sample data only and must not be interpreted as institution data. |
| 9. View dashboard in local mode | Ready for browser-only testing | Reads local redacted reports and structured feedback from the same browser only. Not shared or authoritative. |
| 10. Open evaluation dashboard | Ready for regression review | Shows benchmark behavior. It does not prove real-world accuracy. |
| 11. Use case library filters | Ready for public MVP review | Static case library and filters are suitable for controlled feedback. |
| 12. Open resource packs/methodology/privacy | Ready for review | Docs and resource packs exist, but official links/scripts require institution review before pilots. |

## F. Security and privacy readiness

### Raw message storage check

- Checker analysis is local by default.
- Anonymous feedback records exclude keys containing raw, message, or redacted message fields.
- Local report storage stores the redacted payload only, not the original message input.
- Tests assert raw submitted messages are not present in report/feedback records or localStorage.

### Report payload check

- Report payload includes report ID, timestamp string, redacted message, redaction counts, high-risk markers, non-sensitive context metadata, score, risk level, guessed scam type, consent version, and deletion instructions.
- Optional fields are removed when absent to avoid Firestore `undefined` submission failures.
- Firebase report submission uses `createdAt`, matching the Firestore rules allowlist.

### Feedback payload check

- Feedback payload includes helpfulness, official-channel verification status, calibration, optional category, score/level, context/platform, tactic IDs, risk area levels, storage mode, schema version, and timestamp string.
- It does not include raw, redacted, full, or unredacted message text.
- Firebase feedback submission uses `createdAt`, matching the Firestore rules allowlist.

### Firestore rules check

- Reports: create-only for redacted allowed fields; public read/update/delete denied.
- Anonymous feedback: create-only for structured allowed fields; raw-message fields rejected; public update/delete denied; admin read allowed only through role claims.
- Pilot requests reject obvious raw/private fields.
- Default deny exists for all other documents.
- Remaining gap: emulator tests are not yet implemented. Add `@firebase/rules-unit-testing` and CI emulator coverage before pilots.

### localStorage limitations

- localStorage is browser-local, not encrypted, not synced, not access-controlled per institution, and can be cleared by the user/browser.
- It is acceptable for self-testing and controlled local pilot demos, not an institutional system of record.

### Minors/students safety

- Copy should continue to encourage trusted adult/counselor escalation.
- The product should avoid urgency, blame, or certainty language.
- Before broader student exposure, add reviewed escalation paths for minors, crises, financial loss, immigration deadlines, and law-enforcement reporting.

### Remaining risks

- Redaction can miss personal data.
- Rule-based scoring can miss novel scams or over-score legitimate messages.
- Firebase admin roles, retention, deletion, and monitoring are not productionized.
- No human validation, pilot outcomes, or support process exists yet.

## G. Market-best roadmap

### Must fix before showing to people

- Keep all disclaimers visible: educational, under validation, not certified fraud detection, not legal/immigration/financial advice.
- Manually review critical user flows on deployed GitHub Pages after each release.
- Add a short privacy pre-submit checklist near report submission.
- Document that local dashboard data is browser-only and synthetic sample data is not real.

### Must build before institution pilot

- Firebase emulator tests for reports, anonymous feedback, pilot requests, admin reads, and denial cases.
- Firestore dashboard querying with authenticated role-based access, or remove Firebase mode entirely until ready.
- Data retention, deletion-by-report-ID workflow, admin audit logging, and incident response.
- Institution-specific resource review and approved official contacts.
- Accessibility review, content-safety review, and browser compatibility pass.

### Must validate with humans

- International student interviews across regions/languages.
- Counselor and international-office workflow review.
- False-positive and missed-risk review sessions.
- Comprehension testing for risk levels, confidence, and verification scripts.
- Privacy comfort testing for redacted reports and feedback.

### Must build for paid product

- Multi-tenant institution accounts and role management.
- Secure admin dashboard backed by audited Firestore queries or a server-side API.
- Retention controls, exports, deletion, consent logs, and legal agreements.
- Monitoring, abuse prevention, rate limiting, observability, and support workflows.
- Formal security review, threat model updates, and privacy/legal review.

### Long-term moat

- Institution-verified resource graph and official-contact registry.
- Human-reviewed anonymized trend taxonomy by country, destination, channel, and scenario.
- Counselor workflow integrations and multilingual verification scripts.
- High-quality real-world validation dataset with consent and governance.
- Trustworthy privacy posture: minimal data collection, transparent rules, deletion, and auditability.

## H. Go/no-go decision

- **Ready for self-testing?** Yes.
- **Ready for friends/student testing?** Yes, controlled and clearly labeled as an educational MVP under validation. Do not collect private documents or raw sensitive messages.
- **Ready for counselor feedback?** Partially. Good for workflow/content review, not operational decisions.
- **Ready for education center pilot?** Not yet. Requires Firebase/rules emulator testing, data governance, resource review, retention/deletion process, and counselor escalation process.
- **Ready for paid institution use?** No. It lacks production security review, verified pilots, real-world validation, tenant access controls, admin auditability, support process, legal/privacy agreements, and certified detection claims.
