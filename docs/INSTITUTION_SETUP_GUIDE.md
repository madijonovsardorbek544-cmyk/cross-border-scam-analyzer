# Institution Setup Guide

This guide helps an institution prepare the MVP for a small validation pilot without collecting raw sensitive messages by default.

## What the institution must provide

- A named escalation owner for student-safety and scam reports
- A named privacy owner for data minimization, retention, and access review
- Approved official links and contacts for each student process
- A pilot success metric and review cadence
- A decision on whether Firebase is disabled, enabled for structured feedback only, or replaced with an institution-approved backend

## Official payment links

Provide the official tuition, deposit, refund, and payment-plan pages. Include rules for wire transfers, accepted payment methods, and how students can verify a changed payment instruction.

## Admissions contacts

Provide official admissions email addresses, phone numbers, applicant portal links, agent-verification pages, and after-hours instructions if available.

## Visa/immigration contacts

Provide the international office, DSO/immigration adviser, embassy/VAC guidance pages when appropriate, and approved scripts for checking visa threats, appointment changes, I-20/CAS/COE issues, or SEVIS-style payments.

## Housing contacts

Provide campus housing contacts, off-campus housing guidance, lease-review options, deposit guidance, and emergency housing escalation paths.

## Testing/advising contacts

Provide official testing-provider pages, campus testing/advising contacts, and rules for score reports, registration receipts, and fee questions.

## Escalation owner

Name the person or team who receives urgent cases, coordinates with student support/public safety/legal/IT, and decides when to involve banks, platforms, law enforcement, or government reporting channels.

## Privacy owner

Name the person or team who approves data fields, retention, access, deletion procedures, and whether structured feedback can be stored beyond local browser storage.

## Pilot success metric

Choose one or two measurable, modest goals, for example:

- Counselors can triage suspected scam messages faster using structured risk indicators.
- Students can identify official verification steps before paying or sending documents.
- Staff can identify top resource gaps without collecting raw messages.

Do not use the MVP to claim certified detection accuracy.

## How to avoid collecting raw sensitive data

- Keep the checker local-first and do not submit pasted messages by default.
- Use structured feedback fields such as risk level, context, platform, calibration, and tactic IDs.
- If reports are shared, store redacted payloads only and review redaction quality.
- Avoid screenshots, passport numbers, card numbers, OTPs, addresses, or full message bodies in pilot analytics.
- Publish deletion and access-review procedures before inviting students.
