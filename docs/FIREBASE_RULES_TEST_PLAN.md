# Firebase Rules Test Plan Before Any Institution Pilot

This project is not ready for an education-center or institution pilot until Firestore rules are tested with the Firebase emulator and the resulting checks run in CI.

## Scope

Collections covered by the first rules test suite:

- `reports`
- `anonymousFeedback`
- representative public-deny checks for update/delete/read paths

## Required tooling

1. Add dev dependencies:
   - `firebase-tools`
   - `@firebase/rules-unit-testing`
2. Add a script such as:
   - `"test:rules": "firebase emulators:exec --only firestore \"vitest run firestore.rules.test.ts\""`
3. Run with an isolated emulator project ID, for example `cross-border-scam-safety-rules-test`.

## Exact tests to implement

### Reports collection

1. **Valid redacted report create is allowed**
   - Create `/reports/{id}` with only allowed fields from `reportHasOnlyRedactedFields()`.
   - Include `reportId`, `createdAtIso`, `redactedMessage`, `redactionCounts`, `highRiskMarkers`, `language`, `countryRegion`, `destinationCountry`, `platform`, `context`, `score`, `level`, `scamTypeGuess`, `consentVersion`, and `deletionInstructions`.
   - Expected: `assertSucceeds`.

2. **Report with `rawMessage` is denied**
   - Add `rawMessage: "original text"` to an otherwise valid report.
   - Expected: `assertFails`.

3. **Report with `message` is denied**
   - Add `message: "original text"`.
   - Expected: `assertFails`.

4. **Report with `fullMessage` is denied**
   - Add `fullMessage: "original text"`.
   - Expected: `assertFails`.

5. **Report with `unredactedMessage` is denied**
   - Add `unredactedMessage: "original text"`.
   - Expected: `assertFails`.

6. **Report with `attachments` is denied**
   - Add `attachments: []` or any attachment-like metadata.
   - Expected: `assertFails`.

7. **Overlong redacted report is denied**
   - Set `redactedMessage` to more than 5,000 characters.
   - Expected: `assertFails`.

8. **Public read of reports is denied**
   - Try to read `/reports/{id}` as an unauthenticated client.
   - Expected: `assertFails`.

9. **Public update/delete of reports is denied**
   - Try update and delete as an unauthenticated client.
   - Expected: `assertFails`.

### Anonymous feedback collection

1. **Valid anonymous feedback create is allowed**
   - Create `/anonymousFeedback/{id}` with only allowed structured fields from `feedbackHasOnlyStructuredFields()`.
   - Include `id`, `createdAtIso`, `helpful`, `verifiedOfficialChannel`, `calibration`, `category`, `score`, `level`, `context`, `platform`, `tacticIds`, `riskAreaLevels`, `storageMode`, and `schemaVersion`.
   - Expected: `assertSucceeds`.

2. **Feedback with `rawMessage` is denied**
   - Add `rawMessage`.
   - Expected: `assertFails`.

3. **Feedback with `message` is denied**
   - Add `message`.
   - Expected: `assertFails`.

4. **Feedback with `redactedMessage` is denied**
   - Add `redactedMessage`.
   - Expected: `assertFails`.

5. **Feedback with `fullMessage` is denied**
   - Add `fullMessage`.
   - Expected: `assertFails`.

6. **Feedback with `unredactedMessage` is denied**
   - Add `unredactedMessage`.
   - Expected: `assertFails`.

7. **Feedback with invalid enums is denied**
   - Try `helpful: "maybe"`, `calibration: "unknown"`, or `level: "certain fraud"`.
   - Expected: `assertFails`.

8. **Public read of feedback is denied**
   - Try unauthenticated read of `/anonymousFeedback/{id}`.
   - Expected: `assertFails`.

9. **Public update/delete of feedback is denied**
   - Try update and delete as an unauthenticated client.
   - Expected: `assertFails`.

10. **Admin feedback read is allowed only with admin role claim**
    - Read with auth token `{ role: "admin" }`.
    - Expected: `assertSucceeds`.
    - Read with no token or a non-admin token.
    - Expected: `assertFails`.

## CI go/no-go rule

An education-center pilot must not start until:

- all tests above pass in CI,
- Firebase dashboard querying is either implemented behind authenticated role-based access or hidden/disabled,
- data retention/deletion ownership is documented,
- admin access and incident response are reviewed by a human privacy/security owner.
