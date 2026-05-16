# Beta QA Checklist

Run this before sharing any controlled-beta link. Expected result should be recorded as pass/fail with notes. Do not use raw private messages during QA.

| Area | Manual QA step | Expected result |
| --- | --- | --- |
| Homepage | Open the deployed site or local preview. | Homepage loads with public MVP/beta status and no production-ready claims. |
| Homepage CTA | Click “Check a suspicious message.” | `#checker` opens the checker. |
| Checker demo | Select “Bank/card phishing” and analyze. | Result is high or critical; account/card/identity/click indicators and verification script appear. |
| Scholarship demo | Select “Scholarship fee scam” and analyze. | Result shows scholarship/payment/guarantee-style risk indicators. |
| Legitimate reminder | Test a normal university portal reminder. | Result remains low/medium, not high/critical. |
| Custom suspicious message | Enter a synthetic suspicious message with context. | Result appears with safe next steps and no certainty claims. |
| Verification script | Click copy script. | Script copies or browser gracefully blocks; text remains visible. |
| Feedback | Save anonymous feedback. | Success message appears; feedback contains structured fields only. |
| Report preview | Open `#report`, enter synthetic/redacted text. | Redacted preview appears and consent is required. |
| Report local save | Submit with Firebase unconfigured. | Report saves locally with localStorage warning and report ID. |
| Dashboard local | Open dashboard and choose local mode. | Saved report appears; local mode warning is visible. |
| Dashboard sample | Choose sample mode. | It is clearly labeled synthetic sample data only. |
| Dashboard Firebase | Choose Firebase mode. | It clearly states Firebase querying is not connected/not decision-ready. |
| Eval dashboard | Open `#eval`. | Evaluation dashboard loads and shows total benchmark examples and limitations. |
| Case search | Open `#cases`, search for IELTS/housing/visa. | Cases filter or clean empty state appears. |
| Resource packs | Review case library/resource cards. | Resource packs display with review/source limitations. |
| Privacy page | Open `#privacy`. | Privacy page explains local analysis, redaction, feedback, and limits in practical language. |
| Mobile width | Test at ~375px wide. | Navigation wraps, forms fit, buttons remain usable, no horizontal content loss. |
| Back/forward | Navigate home → checker → cases → back/forward. | Visible page and hash stay aligned. |
| Refresh hash route | Refresh/open direct `#checker`, `#cases`, `#report`, `#dashboard`, `#eval`. | Correct page remains visible. |
| Invalid hash | Open `#not-real`. | App falls back cleanly to home; no crash. |
| Feedback storage | Inspect `localStorage.crossBorderScamSafety.feedback.v1`. | No raw, redacted, full, or unredacted message appears. |
| Report storage | Inspect `localStorage.crossBorderScamSafety.reports.v1`. | Only redacted report payload is stored; no raw message appears. |

## Release gate

- `npm install` passes for existing dependencies.
- `npm test` passes.
- `npm run build` passes.
- `npm run test:e2e` passes.
- If any privacy/storage test fails, stop the beta.
