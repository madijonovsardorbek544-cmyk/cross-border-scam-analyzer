# Cross-Border Scam Safety for International Students

A privacy-first multilingual scam checker and case intelligence MVP for students, parents, schools, education centers, admissions counselors, and scholarship programs.

> Positioning: **Protecting international students from fake scholarship, visa, admission, and payment scams.**

## Why this exists

International students and families are targeted by fake scholarship, visa, admission, housing, payment, test-registration, document, university-impersonation, and student-job scams. Attackers adapt messages across countries, languages, platforms, and trusted institutions.

This project is not a generic scam checker. It focuses on study-abroad decisions where a single fake payment, document request, or portal link can cost students money, identity documents, admission status, or visa timelines.

## MVP capabilities

- Browser-local scam checker for suspicious messages.
- International-student-specific scoring rubric.
- Structured case library with filters and 10 seed cases in `data/cases.json`.
- In-app report flow with redaction preview instead of unsafe public GitHub issues.
- Local-first dashboard concept for students and anonymized institution pilots.
- Methodology and privacy pages that explain limitations and data handling.
- Optional Firebase Auth + Firestore wiring with draft security rules.

## Tech stack

- React + Vite + TypeScript
- Firebase Auth + Firestore optional configuration
- Vitest tests for analyzer and redaction
- Structured JSON content models for cases, scoring rules, and official resources

The MVP intentionally runs without Firebase credentials. That keeps the checker local by default while allowing a future authenticated dashboard and anonymized report storage.

## Install and run

```bash
npm install
npm run dev
npm run build
npm test
```

Copy `.env.example` to `.env.local` and add Firebase web config only if you want hosted authentication and Firestore-backed anonymized reports.

## Data model

### `data/cases.json`

Each case includes:

- `id`
- `title`
- `targetGroup`
- `countryRegion`
- `platform`
- `language`
- `messageSample`
- `scamType`
- `fakeAuthority`
- `psychologicalTactics`
- `redFlags`
- `crossBorderAdaptation`
- `safeResponse`
- `confidenceLevel`
- `sourceType`: `public`, `example`, `synthetic`, or `verified`

### `data/scoringRules.json`

Transparent rule weights:

- urgency pressure
- authority impersonation
- sensitive data request
- payment or fee request
- suspicious link/domain
- vague institution/name
- generic greeting
- unrealistic reward/threat
- cross-border adaptation pattern

### `data/officialResources.json`

Supports official verification resources by country, institution type, name, official website, verification advice, and notes.

## Privacy and safety principles

- Analyze pasted messages locally in the browser by default.
- Do not store raw suspicious messages by default.
- Replace public issue reporting with an in-app report workflow.
- Warn users not to submit names, phone numbers, addresses, passport numbers, card numbers, private documents, or login credentials.
- Automatically redact emails, phone numbers, URLs, passport-like IDs, and long number sequences before report submission.
- Treat minors and students with special care: collect age group only, not exact birthdate or school ID.
- Do not claim certainty. Use language like “risk indicators detected.”

## Firebase setup

`src/firebase.ts` initializes Firebase only when required Vite environment variables exist and exports `auth` and `db`. `firebase.js` remains as a legacy script-tag-free compatibility module.

Draft rules live in `firestore.rules` and are intentionally restrictive:

- anonymous report creation accepts redacted fields only
- raw messages are not allowed by schema
- user profile data is scoped to the authenticated user
- institution summaries are admin-only

## Business positioning

- **Target customer:** schools, education centers, admissions agencies, scholarship organizations
- **Free user:** students and families using the checker and case library
- **Paid user:** institutions that need trend reports, awareness campaigns, and student safety tooling
- **Possible pricing:**
  - free student checker
  - school pilot: **$500–$2,000/year**
  - institution dashboard: **$5,000–$10,000/year**
- **Million-dollar path:** 200 institutions × $5,000/year = **$1M ARR**

## Pilot plan

1. Recruit 3–5 high schools, education centers, or scholarship programs that support international applicants.
2. Replace generic official resources with institution-specific links and verification scripts.
3. Run a 30-day awareness pilot with pre/post scam recognition surveys.
4. Collect only anonymized report categories and redacted examples.
5. Deliver an awareness report with top scam categories, fake authorities, platforms, and recommended interventions.

## 90-day roadmap

### Days 1–30

- Validate scoring rubric with counselors and student advisors.
- Expand case library from 10 to 25 examples.
- Add language-specific patterns for Spanish, French, Arabic, Hindi, and Mandarin.
- Add Firebase-backed anonymized report submission with report IDs.

### Days 31–60

- Add authenticated student accounts with delete-my-report workflow.
- Build admin moderation tools for redacted report review.
- Add institution-specific official resources and exportable PDF awareness reports.
- Add accessibility audit and mobile usability testing.

### Days 61–90

- Pilot with 3–5 institutions.
- Add trend aggregation without exposing individual reports.
- Build counselor-facing onboarding materials.
- Prepare paid institution dashboard packaging and security review.

## Security

See `SECURITY.md` for responsible disclosure, data handling expectations, and current MVP limitations.
