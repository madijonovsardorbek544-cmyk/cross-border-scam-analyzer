# Evaluation Results

## What the benchmark is

The benchmark is a local, synthetic/labeled regression set for the rule-based scam analyzer. It is designed to check whether expected risk indicators continue to be detected for international-student safety scenarios and common phishing patterns.

The benchmark runs in Vitest and can also be reviewed in the browser at `#eval`. It uses `src/evaluation/examples.ts` and `analyzeMessage()` only; it does not upload examples or student data.

## Number of examples

Current benchmark size: **100 labeled examples**.

## Categories covered

The set includes examples across:

- General phishing and account-lock scams
- Bank card phishing
- OTP/code stealing
- Fake refunds
- Tuition account-change scams
- Visa, embassy, IRCC, SEVIS, CAS, and document-courier scams
- Scholarship finalist/processing-fee scams
- Fake housing lease and deposit pressure
- Telegram/WhatsApp education-agent scams
- Testing registration and test-score manipulation scams
- Legitimate low-risk institution reminders
- Borderline unclear messages
- Adversarial/euphemistic examples that avoid obvious scam wording

## What tests assert

The test suite checks that:

- The benchmark contains at least 100 examples.
- Example IDs are unique.
- High/critical expected examples do not score `low`.
- Low expected examples do not score `high` or `critical`.
- Each example score is within the expected minimum and optional maximum range.
- Expected tactic labels are detected when a labeled example requires them.

## Current limitations

- The examples are synthetic regression cases, not a representative field dataset.
- The tests assert rule behavior, not real-world detection accuracy.
- Passing tests does not measure precision, recall, false-positive rate, false-negative rate, demographic fairness, language coverage, or robustness to new scam campaigns.
- Some legitimate messages can contain payment, deadline, or portal language and still require human verification.
- Institution-specific payment links, contact channels, and escalation procedures must be validated separately.

## How to add new examples

1. Add a labeled row to the appropriate group in `src/evaluation/examples.ts`.
2. Include a stable ID prefix by placing the row in an existing mapped group or creating a new group.
3. Set `context`, `platform`, `expectedLevel`, score bounds, expected tactics, category, and notes.
4. Run `npm test`.
5. If the analyzer behavior changes intentionally, update the example notes and score bounds in the same pull request.

## Why this is not a guarantee of real-world accuracy

Scammers change wording, channels, payment methods, and impersonated authorities. This benchmark only confirms that the current analyzer handles the labeled examples in this repository. It should be treated as an engineering regression tool and pilot-readiness aid, not certified fraud detection or a guarantee that a real message is safe or unsafe.
