# Firebase Rules Test Plan

Firebase dashboard/reporting is **not ready for institution pilots** until these Firestore rules are validated in the Firebase Emulator Suite using `@firebase/rules-unit-testing` or an equivalent CI-controlled emulator setup.

## Why this is required before institution pilots

International students may paste or summarize sensitive visa, banking, housing, education-agent, or document information. A rules regression could expose reports, accept raw messages, or allow public modification/deletion. Emulator tests are the minimum evidence that the intended privacy boundary exists outside UI copy.

## Required test setup

- Load `firestore.rules` into the emulator.
- Use unauthenticated/public contexts for report and feedback create tests unless a future product decision requires auth.
- Use authenticated admin and non-admin contexts for any future admin read tests.
- Clear emulator data between tests.
- Run in CI before deployment once dependencies are available.

## Required allow/deny matrix

| Test | Collection/path | Auth | Payload/action | Expected | Reason |
| --- | --- | --- | --- | --- | --- |
| Valid redacted report create allowed | `reports/{id}` | public | allowlisted fields including `redactedMessage`, score, level | Allow | Enables consent-based redacted reports. |
| Report with `rawMessage` denied | `reports/{id}` | public | valid report + `rawMessage` | Deny | Raw messages must never be accepted. |
| Report with `message` denied | `reports/{id}` | public | valid report + `message` | Deny | Blocks common raw-text field name. |
| Report with `fullMessage` denied | `reports/{id}` | public | valid report + `fullMessage` | Deny | Blocks full raw text. |
| Report with `unredactedMessage` denied | `reports/{id}` | public | valid report + `unredactedMessage` | Deny | Blocks explicit unredacted text. |
| Public read reports denied | `reports/{id}` | public | get/list | Deny | Public cannot read student trend reports. |
| Public update reports denied | `reports/{id}` | public | update | Deny | Prevent tampering. |
| Public delete reports denied | `reports/{id}` | public | delete | Deny | Prevent unauthorized deletion. |
| Valid anonymous feedback create allowed | `anonymousFeedback/{id}` | public | structured fields only | Allow | Enables calibration without raw text. |
| Feedback with `rawMessage` denied | `anonymousFeedback/{id}` | public | valid feedback + `rawMessage` | Deny | Feedback must not collect raw text. |
| Feedback with `redactedMessage` denied | `anonymousFeedback/{id}` | public | valid feedback + `redactedMessage` | Deny | Feedback should not store message excerpts. |
| Public read feedback denied | `anonymousFeedback/{id}` | public | get/list | Deny | Public cannot read calibration data. |
| Public update feedback denied | `anonymousFeedback/{id}` | public | update | Deny | Prevent tampering. |
| Public delete feedback denied | `anonymousFeedback/{id}` | public | delete | Deny | Prevent unauthorized deletion. |
| Pilot request with raw scam message denied | `pilotRequests/{id}` | public | payload with `rawMessage` or attachment-like field | Deny | Pilot leads must not submit private scam text. |
| Valid pilot request allowed | `pilotRequests/{id}` | public | organization/contact/role/country/notes only | Allow | Allows contact requests without scam content. |
| Default unknown collection read denied | `unknown/{id}` | public/auth | get/list | Deny | Deny-by-default posture. |
| Default unknown collection write denied | `unknown/{id}` | public/auth | create/update/delete | Deny | Deny-by-default posture. |

## Implementation sketch

1. Install emulator dependencies when registry access allows:
   - `npm install -D @firebase/rules-unit-testing firebase-tools`
2. Add `firebase.rules.test.ts` using `initializeTestEnvironment`.
3. Use `assertSucceeds` for allowed creates and `assertFails` for denies.
4. Add a CI script such as `npm run test:firebase-rules`.
5. Block institution pilots until all rules tests pass in CI.
