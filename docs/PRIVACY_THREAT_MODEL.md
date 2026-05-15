# Privacy Threat Model

## Assets
- Student messages and contextual metadata.
- Redacted report payloads.
- Anonymous feedback records.
- Institution dashboard trend exports.
- Official resource links and verification scripts.

## Threat actors
- Scammers attempting to learn detection patterns.
- Curious insiders or misconfigured Firebase readers.
- Users accidentally pasting sensitive documents.
- Institutions over-interpreting scores as proof.
- Attackers trying to inject malicious links into shared examples.

## Privacy risks
- Raw messages may contain passports, card details, login codes, addresses, or immigration identifiers.
- Trend reports could expose small-group patterns if a pilot group is tiny.
- Feedback could become sensitive if free-text raw messages were allowed.

## Misuse risks
- Treating scores as certainty or legal findings.
- Blocking legitimate institutional communications solely because of a score.
- Collecting raw scam reports outside the redacted consent flow.
- Using the tool for populations outside its validated scope without retesting.

## Mitigations
- Local analysis by default.
- No raw message storage in feedback.
- Redacted report preview plus consent.
- Clear false-positive warning and “risk indicators detected” language.
- Dashboard source labels for sample/local/Firebase data.
- Documentation for pilot privacy boundaries and validation needs.

## Remaining limitations
- Redaction is best effort and can miss unusual identifiers.
- Rule-based scoring can miss new adversarial language.
- Firebase deployment requires project-specific security rules, authentication, retention, and access review.
- Small pilots need aggregation thresholds before sharing institution-wide conclusions.
