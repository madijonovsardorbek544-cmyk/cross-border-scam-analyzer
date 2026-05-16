# Market Leader Roadmap

This roadmap is intentionally honest: code changes can create a controlled-beta foundation, but market leadership requires validation, trust, governance, and institution adoption.

## A. Controlled beta

Goal: safe learning with 10–20 trusted testers, not public claims.

- Recruit 10–20 international student/friend testers across at least three origin/destination patterns.
- Complete 5 counselor/international-office reviews of wording, escalation, and verification scripts.
- Run manual QA using `docs/BETA_QA_CHECKLIST.md` before every shared beta link.
- Keep Vitest and E2E-style tests passing before sharing builds.
- Confirm feedback loop works without collecting raw messages.
- Confirm no raw data collection by default and no raw messages in localStorage feedback/reports.
- Record every confusing result or missed expectation in structured notes only.

## B. Validation

Goal: prove the taxonomy and UX can reduce risky actions without creating overconfidence.

- Build at least 300 labeled synthetic and public-pattern examples.
- Add at least 100 real-but-redacted examples with consent and governance.
- Add at least 50 legitimate institution messages across admissions, billing, housing, testing, and scholarships.
- Run false-positive review sessions with counselors.
- Run missed-risk review sessions with students/counselors.
- Expand language/country coverage based on actual tester cohorts.
- Add adversarial low-key scams that avoid obvious urgency keywords.
- Publish evaluation limitations beside every benchmark summary.

## C. Institution pilot

Goal: small governed pilot, not paid SaaS.

- Implement Firebase emulator rules tests for reports, feedback, pilot requests, and default denies.
- Add authentication and role-based access.
- Build institution workspace scoping.
- Replace placeholder resources with verified official resources reviewed by each institution.
- Create data retention policy and deletion process.
- Define counselor escalation process for high-risk, student-safety, and emergency situations.
- Add pilot report export that excludes raw messages and small-cohort identifying details.
- Add audit logs for admin access and report exports.

## D. Paid SaaS

Goal: institution-ready product with security, support, and governance.

- Authentication with institution account provisioning.
- Multi-tenant institution accounts with strict tenant isolation.
- Admin, counselor, reviewer, and read-only roles.
- Audit logs for reads, exports, settings changes, and deletion requests.
- Monitoring, alerting, abuse prevention, and rate limiting.
- Support workflow for schools, counselors, students, and parents.
- Privacy/legal review, DPAs, retention schedules, and incident-response obligations.
- Monthly reports with clear denominator/limitations language.
- Institution billing model aligned with school size, region, support needs, and privacy obligations.

## E. Long-term moat

Goal: become the trusted safety layer for international education through verified knowledge and workflows.

- Verified international education scam taxonomy maintained with counselors and institutions.
- Institution-reviewed resource graph with official contacts, portals, and safe scripts.
- Multilingual verification scripts adapted by destination country and scenario.
- Anonymized trend intelligence with privacy-preserving aggregation.
- Counselor workflow integration for triage, escalation, and student education.
- Public annual scam report that avoids raw messages and avoids overstating certainty.
