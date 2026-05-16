# Controlled Beta Guide

## Current status

This product is ready for **self-testing**, **5–10 trusted student/friend testers**, and **counselor feedback** after the QA checklist passes. It is **not ready** for full education-center pilots, paid institution use, or production Firebase dashboards.

## Who can test now

- The project owner/founder.
- Trusted international students or recent applicants who understand this is under validation.
- Parents/friends using synthetic or safely redacted messages.
- Counselors/advisers reviewing language, workflows, and escalation guidance.

## Who should not use it yet

- Schools or education centers making operational decisions.
- Paid institution customers.
- Minors testing alone without a trusted adult/counselor.
- Anyone facing immediate financial loss, threats, self-harm risk, immigration deadlines, or account compromise without human support.

## What testers must be told

- The tool detects **risk indicators**, not certainty.
- It is educational and under validation.
- It does not provide legal, immigration, financial, emergency, or law-enforcement advice.
- Checker analysis runs locally by default.
- Redacted reporting is best effort and requires preview review.
- localStorage reports are browser-only, not encrypted, and not institutional records.
- Firebase dashboard mode is not connected unless a secure Firebase implementation and governance review are completed.

## What data testers must not paste

Do not paste:

- Passport scans or passport numbers.
- Student IDs, national IDs, visa numbers, SEVIS/CAS/I-20 identifiers.
- Card numbers, bank details, CVV, PINs, passwords, OTPs, recovery codes.
- Exact addresses, phone numbers, personal email addresses, names of minors.
- Private documents, screenshots with personal data, or legal/immigration files.

## Safe testing with synthetic messages

- Start with built-in demo messages.
- Create synthetic examples by scenario: scholarship fee, visa threat, fake housing deposit, bank/card phishing, testing score upgrade.
- Do not use real names, exact institutions, or real account numbers.
- Record only category, risk level, whether the explanation made sense, and next-step clarity.

## Safe testing with real messages after redaction

- Remove names, IDs, exact URLs, account numbers, addresses, phone numbers, and institution-specific identifiers before testing.
- Prefer summarizing the scenario instead of pasting full text.
- Use the report page only after reviewing the redacted preview.
- If redaction misses something, stop and clear the form/local data.

## How to collect feedback without raw messages

- Use the anonymous feedback controls in the result card.
- Use `docs/FEEDBACK_ANALYSIS_TEMPLATE.md` for sessions.
- Store categories and structured observations only.
- Never paste raw messages into docs, issues, pull requests, emails, spreadsheets, or chat.

## When to stop testing

Stop immediately if:

- A tester pastes highly sensitive data.
- A tester is scared, pressured, or confused about a real deadline.
- A result appears to encourage unsafe action.
- A legitimate message scores high/critical and the user may ignore an important official deadline.
- A high-risk message scores low and the tester might proceed unsafely.
- localStorage or Firebase behavior is unclear.

## When to involve a counselor/adult

Involve a counselor, trusted adult, bank, official school office, or relevant authority when:

- Money, deposits, tuition, refunds, cards, bank accounts, passwords, OTPs, or identity documents are involved.
- A student is a minor.
- The message threatens visa cancellation, deportation, admission loss, account closure, or housing loss.
- The student already clicked, paid, or shared data.
- The student feels afraid or pressured.

## How to summarize feedback safely

Use broad categories:

- Scenario category, not message text.
- Expected/actual risk level.
- Whether next steps were understood.
- Whether wording felt too scary, too certain, or unclear.
- False-positive/missed-risk notes without identifiers.
- Privacy concerns and feature requests.
