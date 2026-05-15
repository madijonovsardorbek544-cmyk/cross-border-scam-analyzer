# Cross-Border Scam Safety for International Students

## Live public MVP

https://madijonovsardorbek544-cmyk.github.io/cross-border-scam-analyzer/

This is a public MVP hosted on GitHub Pages. It is being built toward a validated, institution-ready scam safety platform for international students, families, counselors, education centers, and institutions. It detects **risk indicators** and provides safer verification steps; it does not claim certainty or replace legal, immigration, financial, emergency, or law-enforcement help.

## Positioning

A privacy-first, evaluation-driven scam prevention MVP for study-abroad messages involving scholarships, visas, admissions, housing, payments, testing, documents, and education agents.

## Why international students

International students and families make high-stakes decisions across unfamiliar countries, institutions, payment systems, visa processes, languages, time zones, and communication channels. Scammers exploit this with fake scholarships, visa threats, tuition diversion, fake housing deposits, test score upgrade offers, fake portals, and impersonated agents. A generic scam checker does not provide study-abroad verification scripts or institution-level prevention workflows.

## Current MVP capabilities

- Local-first scam checker with score, level, top reasons, safe next steps, and copyable verification scripts.
- Counselor / Analyst View showing all matched rules, evidence, rule weights, combination boosts, risk areas, false-positive warning, and score-level explanation.
- Evaluation benchmark with 60 labeled examples covering high-risk phishing, international-student scams, legitimate messages, borderline messages, and adversarial wording.
- Official resource packs for U.S., Canada, UK, Australia, testing providers, housing deposits, scholarship fees, and education-agent verification.
- Case library connected to relevant resource packs.
- Redacted report flow with consent and no raw message storage by default.
- Anonymous feedback loop that stores structured calibration signals locally by default and never stores the raw message.
- Pilot-ready institution dashboard with date range, sample/local/Firebase source mode, feedback insights, false-positive/missed-risk categories, recommended interventions, and Markdown report export.
- Validation and pilot documentation for counselors, institutions, privacy review, and product requirements.

## Architecture

```text
React + Vite + TypeScript
├── src/main.tsx                         # Hash-based app routing for GitHub Pages
├── src/pages/                           # Landing, checker, cases, report, dashboard, pilot, methodology, privacy
├── src/components/                      # Shared UI components
├── src/lib/analyzer/                    # Transparent rules, scoring, safe next steps
├── src/evaluation/examples.ts           # 60 labeled benchmark examples
├── src/evaluation/evaluateAnalyzer.test.ts # Evaluation regression tests
├── src/data/resourcePacks.ts            # Structured official resource packs
├── src/lib/feedback/feedbackSchema.ts   # Anonymous feedback schema/storage
├── src/lib/privacy/                     # Redaction and anonymized report payloads
├── data/cases.json                      # Seed case library
├── data/officialResources.json          # Official and pilot resource entries
└── docs/                                # Validation, pilot, interview, privacy threat model, PRD
```

Routing remains hash-based and the Vite base path remains `/cross-border-scam-analyzer/` for GitHub Pages.

## Evaluation-driven analyzer

The analyzer uses transparent rules and combination boosts rather than fake AI claims. Rules cover urgency, account lock threats, identity verification, click/action pressure, credential/OTP risk, financial account/card risk, authority impersonation, sensitive-data requests, payment pressure, suspicious links/domains, unofficial payment methods, vague institutions, unrealistic guarantees, visa threats, housing scarcity, test-score upgrade claims, personal-account payments, cross-border bureaucracy confusion, language mismatch, and platform risk.

The benchmark tests assert that:

- High-risk examples are not scored low.
- Low-risk legitimate messages are not high/critical.
- Minimum and maximum expected score boundaries are respected.
- Expected tactics appear when listed.

## Resource packs

Resource packs provide structured safer-verification guidance for:

- U.S. student visa safety
- Canada study permit safety
- UK student visa/CAS safety
- Australia student visa safety
- IELTS/TOEFL/SAT testing safety
- Housing deposit safety
- Scholarship fee safety
- Education-agent verification safety

Each pack includes who it helps, common scams, official verification steps, normal vs. suspicious requests, a safe script, related case tags, and official resource IDs.

## Feedback loop

After a checker result, users can submit anonymous feedback:

- Was this helpful? yes/no
- Did you verify through an official channel? yes/no/not yet
- Did the result feel too low, accurate, or too high?
- Optional category: missed risk, false alarm, unclear wording, useful

Feedback is stored locally by default. If Firebase is configured, only structured feedback fields are submitted. Raw messages are not stored in feedback.

## Institution pilot workflow

A 30-day pilot should:

1. Confirm official payment, admissions, visa, housing, testing, and counselor escalation resources.
2. Share the checker and awareness materials with a limited student group.
3. Collect only consented redacted reports and anonymous structured feedback.
4. Review dashboard trends, false-positive categories, missed-risk categories, and recommended interventions.
5. Export a Markdown awareness report and decide whether to continue, revise, expand, or stop.

Dashboard source modes make clear when data is sample, local browser data, or Firebase-backed.

## Documentation

- [Validation plan](docs/VALIDATION_PLAN.md)
- [Pilot playbook](docs/PILOT_PLAYBOOK.md)
- [Counselor interview guide](docs/COUNSELOR_INTERVIEW_GUIDE.md)
- [Privacy threat model](docs/PRIVACY_THREAT_MODEL.md)
- [Product requirements](docs/PRODUCT_REQUIREMENTS.md)
- [Security policy](SECURITY.md)

## Privacy principles

- Analyze pasted messages locally in the browser by default.
- Do not store raw suspicious messages by default.
- Require redaction preview and consent before submitting anonymized reports.
- Store only structured feedback fields, never raw messages, in feedback.
- Label sample/local/Firebase dashboard modes clearly.
- Treat minors and students as vulnerable users; encourage review by trusted adults or counselors.
- Avoid public GitHub issues for scam messages or personal data.

## Install, run, test, and build

```bash
npm install
npm run dev
npm test
npm run build
```

## Firebase setup

The app runs without Firebase credentials. Configure Firebase only for consented redacted reports and structured anonymous feedback.

Set these Vite environment variables in `.env.local` or your hosting provider:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Firebase web config values are public identifiers, not server secrets. Never commit service account keys. Review Firestore rules, authentication, retention, and access controls before real pilots.

## Deployment

GitHub Pages deployment should build the Vite app and publish `dist`. Keep the Vite base path as `/cross-border-scam-analyzer/`.

## Current limitations

- Rule-based scoring can miss novel scams or over-score legitimate messages with deadline/payment language.
- Benchmark examples are useful regression checks but are not a substitute for human validation.
- Redaction is best effort and should not receive private documents or images.
- Official resources require institution-specific review before real pilots.
- Firebase setup and Firestore rules require production security review.
- The MVP does not provide legal, immigration, financial, law-enforcement, or emergency assistance.
