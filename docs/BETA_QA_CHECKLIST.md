# Controlled Beta Manual QA Checklist

Use this checklist before sharing a beta link with students, friends, or counselors. Record browser, device, date, build/commit, and whether Firebase environment variables were configured.

| Area | Manual step | Expected result |
| --- | --- | --- |
| Live site | Open the live site URL. | Homepage loads without console-breaking errors and clearly says this is an educational MVP that detects risk indicators, not certainty. |
| Homepage CTAs | Click “Check a suspicious message,” “View case library,” and “Explore institution pilot.” | Each CTA updates the hash route and shows the expected page without a full app failure. |
| Bank/card phishing demo | Open `#checker`, select “Bank/card phishing,” and run analysis. | Result is high or critical; account/card/identity/click indicators appear in top reasons or analyst view. |
| Scholarship scam demo | Select “Scholarship fee scam” and run analysis. | Result shows scholarship/payment/sensitive-data risk indicators and safe verification steps. |
| Legitimate university reminder | Paste a normal university reminder that points to the official portal and does not request unusual payment or secrets. | Result remains low or medium and copy warns that legitimate messages can still be verified. |
| Custom suspicious message | Paste a short custom suspicious message, then enter a real country/region and destination country. | Analysis button enables only after required fields are present; result avoids fraud-certainty language. |
| Copy script | In the result page, use the copyable verification script control or confirm the script is visible if clipboard permissions are blocked. | Script is readable, official-channel oriented, and does not tell the student to click suspicious links. |
| Save feedback | Save anonymous feedback after analysis. | Loading state appears, then success indicates storage mode; local fallback warning appears if Firebase failed; raw message is not included. |
| Submit local report | Open `#report`, paste text, review redacted preview, enter country/destination, consent, and submit with Firebase unconfigured. | Report saves locally only, shows browser-only warning, and offers dashboard navigation. |
| Dashboard local mode | Open `#dashboard`, select local report source mode. | Locally saved redacted report appears in metrics/trends; dashboard states local mode is browser-only and no raw messages are included. |
| Dashboard sample mode | Select sample source mode. | Dashboard clearly labels sample/synthetic data and does not imply real institution metrics. |
| Eval dashboard | Open `#eval`. | Evaluation dashboard loads and shows total examples plus guardrails that benchmark results are not real-world accuracy. |
| Case library search | Open `#cases`, search for `visa`, `housing`, or `IELTS`, and use filters. | Results filter without crashing; empty states are understandable. |
| Report redaction preview | Paste text containing an email, phone, passport-like ID, URL, and card-like number. | Preview replaces sensitive patterns where detected; user is warned redaction is best effort. |
| Privacy page | Open `#privacy`. | Page explains local analysis, redacted reports, structured feedback, and limits of local/Firebase storage. |
| Mobile width | Test around 375px width. | Navigation, forms, results, report preview, and dashboard controls remain usable without horizontal scrolling. |
| Browser back/forward | Navigate home → checker → cases → dashboard, then use browser back/forward. | Visible page and URL hash stay consistent. |
| Refresh direct routes | Refresh on `#checker` and `#eval`. | Correct page loads directly after refresh. |
| Invalid route | Open an invalid hash such as `#not-real`. | App falls back safely to home and normal navigation still works. |
| No raw message in feedback | After saving feedback, inspect localStorage key `crossBorderScamSafety.feedback.v1`. | Stored feedback contains structured score/context/tactic data only; it does not contain raw, redacted, full, or original message text. |
| No raw message in local reports | After saving a report, inspect localStorage key `crossBorderScamSafety.reports.v1`. | Stored report contains redacted payload only; original raw message is not present. |
| Clear local reports | Use “Clear saved local reports” on the report page and confirm. | Local reports are removed from browser localStorage; the control warns this is not institutional storage. |
