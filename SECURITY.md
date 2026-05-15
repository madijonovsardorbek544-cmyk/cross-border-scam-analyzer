# Security Policy

## Responsible disclosure

Please report suspected vulnerabilities privately to the project maintainer or startup security contact. Do not open public issues that include exploit details, personal data, student records, scam messages containing private information, passport numbers, payment information, or credentials.

## Data handling expectations

- The checker analyzes messages locally by default.
- Users should remove personal details before pasting text.
- Reports should store redacted/anonymized content only.
- Raw suspicious messages, private documents, exact addresses, passport numbers, payment card numbers, and login credentials should never be stored.

## Firebase and Firestore

Firebase configuration values in `.env.local` are public web app identifiers, not server secrets. Do not commit private service account keys. Use `firestore.rules` as a restrictive draft and review it before production deployment.

## MVP limitations

This MVP is educational and does not guarantee scam detection, anonymity, or legal/law-enforcement outcomes. Treat all findings as risk indicators that require verification through official institution channels.
