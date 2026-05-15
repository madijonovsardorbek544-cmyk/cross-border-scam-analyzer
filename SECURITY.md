# Security Policy

## Responsible disclosure

Please report suspected vulnerabilities privately to the project maintainer or designated security contact. Do not open public GitHub issues containing exploit details, private student data, scam messages with personal information, passport numbers, payment information, credentials, or institution security details.

Suggested private contact placeholder: `security@example.invalid`.

## What should never be submitted

Do not submit or paste:

- Passport scans or passport numbers
- National IDs, visas, I-20/CAS/SEVIS details, or study permit numbers
- Bank statements, card numbers, CVV codes, account numbers, or routing details
- Passwords, one-time codes, recovery codes, or login links
- Full names, exact home addresses, dates of birth, or student records
- Private document images or screenshots containing personal data
- Threats or emergency reports requiring immediate law-enforcement or institutional response

## Privacy limitations

The app includes best-effort redaction, but no automated redaction system is perfect. Users should remove personal data before pasting text. The MVP is designed to avoid raw message storage by default, but operators must verify hosting, analytics, logging, and Firebase settings before real pilots.

## Firebase configuration warning

Firebase web configuration values are public app identifiers, not server secrets. Never commit service account keys, private credentials, or unrestricted admin tokens. If Firebase is not configured, the app uses local demo mode for redacted reports.

## Firestore rules warning

`firestore.rules` is a restrictive draft and must be reviewed, tested with the Firebase emulator, and adapted to the institution’s authentication model before production. Public clients must not be allowed to read raw reports. Raw message fields are rejected by rule and by application design.

## No legal or law-enforcement guarantee

This project detects risk indicators for education and prevention. It does not provide legal advice, immigration advice, financial advice, law-enforcement reporting, emergency response, or guaranteed scam determination.

## Minors and students safety note

Minors and students should not respond to threats alone. The product should encourage students to ask a trusted adult, parent/guardian, counselor, school official, or admissions adviser to review suspicious messages before paying, clicking, or sending documents.

## Public repository warning

Do not use GitHub issues, pull requests, discussions, commits, or screenshots to share real scam messages containing personal information. Public repositories are not appropriate for student case handling.

## Vulnerability reporting expectations

When reporting privately, include:

- A concise description of the issue
- Steps to reproduce using synthetic data only
- Potential impact
- Suggested mitigation if known
- Your preferred contact for follow-up

Please avoid accessing, copying, or exfiltrating data that is not yours.
