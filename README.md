# Cross-Border Scam Safety for International Students

## One-line positioning

A privacy-first scam prevention MVP that helps international students, families, and education institutions detect risk indicators in scholarship, visa, admission, housing, payment, test-registration, document, and education-agent messages.

## Problem

International students and families often make high-stakes decisions across unfamiliar legal, academic, financial, and housing systems. Scammers exploit that uncertainty with fake scholarships, visa threats, tuition account changes, housing deposits, test score upgrades, document legalization offers, fake university portals, and impersonated agents.

## Target users

- International students applying abroad
- Parents and families helping with payments and documents
- High schools and counselors supporting applicants
- Education centers and advising organizations
- Admissions counselors and international student offices
- Scholarship and student support programs

## Why international students

The risk is cross-border and context-specific: students may be far from the destination institution, under deadline pressure, translating unfamiliar bureaucracy, and receiving messages across email, SMS, WhatsApp, Telegram, Instagram, phone calls, and unofficial websites. A generic scam checker does not explain study-abroad verification steps or institution-level prevention.

## MVP features

- Browser-first scam checker with score, risk level, detected tactics, fake authority type, sensitive-data risk, payment risk, link/domain risk, cross-border adaptation pattern, confidence level, false-positive warning, safe next steps, verification script, and “what not to do” guidance.
- Redaction-first report flow with preview, consent checkbox, report ID, Firebase/local demo mode, and no raw message storage by default.
- Structured case library with 25+ synthetic/example study-abroad scam patterns and filters by scam type, platform, language, origin, destination, target group, and tactic.
- Official resources model for government visa pages, testing providers, EducationUSA, and pilot-specific institution templates.
- Institution pilot dashboard with anonymized sample/local reports, trend breakdowns, latest redacted reports, interventions, and downloadable Markdown awareness report.
- Institution pilot page describing 30-day validation, collected/not-collected data, deliverables, and pricing hypothesis.

## Architecture

```text
React + Vite + TypeScript
├── src/main.tsx                     # Single-page MVP UX and page routing
├── src/lib/analyzer/rules.ts         # Extensible rule definitions
├── src/lib/analyzer/analyzeMessage.ts# Structured risk analysis
├── src/lib/analyzer/scoreLevels.ts   # Score, level, confidence helpers
├── src/lib/analyzer/safeNextSteps.ts # Verification and safety guidance
├── src/lib/privacy/redaction.ts      # Best-effort sensitive data redaction
├── src/lib/privacy/reportSchema.ts   # Redacted report payload creation
├── data/cases.json                   # Seed case library
├── data/officialResources.json       # Official and pilot resource entries
├── firestore.rules                   # Restrictive draft Firestore rules
└── src/analyzer.test.ts              # Analyzer and privacy tests
```

## Privacy principles

- Analyze pasted messages locally in the browser by default.
- Do not store raw suspicious messages by default.
- Require redaction preview and consent before submitting anonymized reports.
- Submit only redacted fields to Firebase when configured.
- Use local demo storage when Firebase is not configured and label it clearly.
- Treat minors and students as vulnerable users; encourage review by trusted adults or counselors.
- Avoid public GitHub issues for scam messages or personal data.

## Data model

### `CheckInput`

Includes suspicious message, language, country/region, destination country, platform, context, optional claimed institution/authority, and optional sender domain/link.

### `CheckResult`

Returns structured output: score, level, detected tactics, fake authority type, sensitive-data risk, payment risk, link/domain risk, cross-border adaptation pattern, confidence level, false-positive warning, safe next steps, official verification script, and “what not to do” list.

### `AnonymizedReportPayload`

Stores a generated report ID, ISO timestamp, redacted message, redaction counts, high-risk markers, platform/context/country metadata, score/level, consent version, and deletion instructions. It intentionally excludes raw message fields.

## Scoring methodology

The MVP uses transparent rule weights rather than black-box AI claims. Rules include urgency pressure, authority impersonation, sensitive-data request, payment/fee request, suspicious link/domain, unofficial payment method, generic greeting, vague institution, unrealistic guarantee, deportation/visa threat, housing scarcity pressure, test score upgrade claim, crypto/gift card/wire transfer, personal account payment, cross-border bureaucracy confusion, language mismatch, and platform risk.

Scores are educational risk indicators. The product must not make certainty claims about fraud.

## Institution pilot model

A 30-day pilot should:

1. Replace template resources with the institution’s official payment, admissions, visa, housing, and counselor contacts.
2. Share the free checker with students and parents during admissions/pre-arrival periods.
3. Collect only consented, redacted, anonymized reports.
4. Review dashboard trends with counselors or student support staff.
5. Export an awareness report with top scam categories, platforms, fake authorities, and recommended interventions.

## Business model hypothesis

Students use the checker for free. Institutions may pay for dashboards, awareness reports, verified resources, student safety pages, and anonymized scam trend intelligence.

Potential validation pricing:

- Free student checker
- School pilot: **$500–$2,000/year**
- Institution dashboard: **$5,000–$10,000/year**

## Million-dollar ARR path

A possible path is **200 institutions × $5,000/year = $1M ARR**. This is a strategic business model hypothesis for validation, not an achieved result, guarantee, or investment claim.

## Install, run, and test

```bash
npm install
npm run dev
npm run build
npm test
```

## Environment setup

Copy `.env.example` to `.env.local` only if you want Firebase-backed anonymized report storage.

```bash
cp .env.example .env.local
```

The app runs without Firebase credentials. In that mode, report submission uses browser local storage and clearly displays “local demo mode.”

## Firebase setup

Set these Vite environment variables in `.env.local` or your hosting provider:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Firebase web config values are public identifiers, not server secrets. Never commit service account keys.

## Firestore rules

`firestore.rules` is intentionally restrictive:

- Anonymous or authenticated users may create redacted reports only.
- `rawMessage`, `message`, `fullMessage`, `unredactedMessage`, and attachments are rejected.
- Users can read/update/delete only their own profiles.
- Institution/admin access is scoped to summaries and institution records.
- Public reads of raw reports are denied.
- Everything else is denied by default.

Review and test rules before any real pilot.

## Security policy

See `SECURITY.md`. Do not submit private scam messages or vulnerability details in public GitHub issues.

## Roadmap

### Next 30 days

- Validate scoring with 3–5 counselors or education center staff.
- Replace template official resources for one pilot institution.
- Add pre/post awareness survey questions.
- Add counselor review workflow for redacted examples.
- Test Firestore rules with emulator-based rule tests.

### Days 31–60

- Add authenticated institution admin view.
- Add report deletion workflow by report ID.
- Add localization and country-specific rule packs.
- Add printable/PDF awareness report export.

### Days 61–90

- Run 1–3 small pilots with schools or advising organizations.
- Measure student engagement, counselor workload, false positives, and prevented high-risk actions.
- Package onboarding materials and security review checklist.

## Validation plan

- Interview counselors about the top recurring scam categories.
- Observe whether students understand safe next steps without additional instruction.
- Track anonymized report volume by category and platform.
- Compare awareness survey scores before and after training.
- Validate whether dashboard exports are useful enough for paid renewal conversations.

## Current limitations

- Rule-based scoring can miss novel scams or over-score legitimate messages with deadlines/payment language.
- Redaction is best effort and should not receive private documents or images.
- Official resources require institution-specific replacement before real pilots.
- Firebase setup and Firestore rules require production security review.
- The MVP does not provide legal, immigration, financial, law-enforcement, or emergency assistance.
