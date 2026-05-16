# Cross-Border Scam Safety for International Students

A public MVP foundation for an international-student scam-safety platform. The product helps students, parents, counselors, schools, and future institution partners identify **risk indicators** in suspicious study-abroad messages involving scholarships, visas, admissions, housing, tuition/payment, testing, documents/legalization, education agents, and bank/card/account phishing.

## Honest status

This is **under validation**. It is not certified fraud detection, does not prove that a message is a scam, and does not replace legal, immigration, financial, emergency, law-enforcement, counselor, or institution advice.

| Use case | Readiness | Condition |
| --- | --- | --- |
| Self-testing | Ready | Use synthetic or safely redacted messages only. |
| Controlled student/friend beta | Ready after QA checklist | Complete `docs/BETA_QA_CHECKLIST.md`; tell testers not to paste private data. |
| Counselor feedback | Ready after QA checklist | Use for workflow/content review, not operational decisions. |
| Education center pilot | Not ready | Requires Firebase/security/data-governance review, emulator rules tests, retention/deletion, verified resources, and role-based access. |
| Paid institution use | Not ready | Requires production security, legal/privacy review, multi-tenant auth, audit logs, monitoring, support, and validated outcomes. |

## What it does now

- Local-first scam checker for international education scenarios.
- Transparent rule-based scoring with confidence and safe next steps.
- Counselor/analyst view with matched rules, evidence, and risk areas.
- Case library and resource packs for awareness training.
- Redacted report flow with consent and local-only fallback.
- Anonymous structured feedback loop without raw message storage.
- Dashboard with explicit sample/local/Firebase source labels.
- Evaluation dashboard and benchmark suite with 120 labeled examples.
- Firestore rules designed to reject raw-message fields.
- Vitest unit/integration tests plus jsdom E2E-style controlled-beta flows.

## Critical privacy boundaries

- Checker analysis runs in the browser by default.
- Do **not** paste passport scans, student IDs, card/bank numbers, CVV/PIN/passwords/OTPs, exact addresses, private documents, or screenshots with personal data.
- Redaction is best effort and can miss personal data.
- Local reports are saved in browser localStorage only; localStorage is not encrypted, not synced, and not institutional storage.
- Anonymous feedback stores structured fields only, not raw or redacted message text.
- Firebase dashboard mode is not connected unless a secure Firebase implementation and governance process are actually built and tested.

## Routes

The app uses hash routing for GitHub Pages:

- `#checker` — checker
- `#cases` — case library
- `#report` — redacted report flow
- `#dashboard` — sample/local/Firebase-labeled dashboard
- `#eval` — evaluation dashboard
- Invalid hashes fall back cleanly to home.

## Development

```bash
npm install
npm test
npm run build
npm run test:e2e
npm run test:all
```

`test:e2e` currently runs Vitest/jsdom E2E-style flows because `@playwright/test` installation was blocked by registry policy in this environment. Add Playwright real-browser coverage once dependency access is available.

## Documentation

- [Full technical audit](docs/FULL_TECHNICAL_AUDIT.md)
- [Project audit and readiness](docs/PROJECT_AUDIT_AND_READINESS.md)
- [Beta QA checklist](docs/BETA_QA_CHECKLIST.md)
- [Controlled beta guide](docs/CONTROLLED_BETA_GUIDE.md)
- [Market leader roadmap](docs/MARKET_LEADER_ROADMAP.md)
- [Firebase rules test plan](docs/FIREBASE_RULES_TEST_PLAN.md)
- [Feedback analysis template](docs/FEEDBACK_ANALYSIS_TEMPLATE.md)
- [Privacy threat model](docs/PRIVACY_THREAT_MODEL.md)
- [Validation plan](docs/VALIDATION_PLAN.md)
- [Security policy](SECURITY.md)

## Deployment

The Vite base path is configured for GitHub Pages under `/cross-border-scam-analyzer/`. The GitHub Actions workflow installs dependencies, runs tests, builds, and deploys `dist` to Pages from `main`.

## Product direction

The goal is to become a trustworthy, privacy-first, evaluation-driven safety layer for international education. The next milestones are controlled beta, validation with real-but-redacted and legitimate examples, Firebase emulator rules tests, role-based institution workspaces, verified official resources, and counselor escalation workflows.
