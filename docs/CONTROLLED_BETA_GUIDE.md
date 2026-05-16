# Controlled Beta Guide

## Current status

- **Ready for self-testing and small student/friend testing** with clear disclaimers and privacy instructions.
- **Ready for counselor feedback** on wording, workflows, safe-next-step usefulness, and resource gaps.
- **Not ready for an education-center pilot** until Firebase/rules/security and data governance are validated.
- **Not ready for paid institution use** and must not be marketed as certified fraud detection.

## Who can test now

- The project owner.
- Trusted friends or students who understand this is an educational MVP under validation.
- Counselors or international-student support staff reviewing content and workflow, not relying on it for operational decisions.

## Who should not use it yet

- Students in urgent financial, immigration, housing, safety, or law-enforcement situations without human support.
- Minors unless a trusted adult/counselor is involved.
- Education centers or institutions needing production records, dashboards, retention, deletion, or admin access.
- Paid customers or anyone expecting guaranteed fraud detection.

## What testers must be told

- The checker detects **risk indicators**, not certainty.
- It can miss scams and can over-score legitimate messages.
- It does not replace official university, embassy, bank, police, legal, immigration, or emergency channels.
- The checker runs locally by default, but optional reports are still best-effort redacted and should be reviewed carefully.
- Local reports and feedback in localStorage are browser-only and not encrypted institutional storage.

## What testers must not paste

Tell testers not to paste:

- passport scans or full passport numbers,
- student IDs,
- card or bank-account numbers,
- passwords, OTPs, PINs, recovery codes, or login links,
- exact home addresses,
- private documents or screenshots with personal data,
- names/contact details of real people unless removed first.

## How to collect feedback safely

- Prefer structured observations: “Which warning was confusing?” “Did the script help?” “Was the risk level too high/too low?”
- Do not ask testers to send raw suspicious messages in chat, email, forms, or screenshots.
- If examples are needed, ask testers to paraphrase and remove identifiers.
- Summarize trends by category, channel, country/destination context, and risk indicator—not by raw message text.

## How to handle suspicious real messages

1. Ask the tester to stop before paying, clicking, replying, or sending documents.
2. Have them verify through a published official channel typed manually or a saved official app/bookmark.
3. If money, credentials, card data, documents, or OTPs were already shared, direct them to the relevant bank/payment provider, real institution, counselor, and appropriate local reporting channel.
4. If the situation involves immediate danger, coercion, or a minor, stop product testing and involve a trusted adult, counselor, emergency service, or local authority as appropriate.

## When to stop testing

Stop the beta session if:

- a tester is distressed, pressured, or in immediate danger,
- a tester starts sharing private documents or secrets,
- the app gives confusing guidance for a high-stakes issue,
- Firebase/dashboard behavior appears connected when it is not,
- localStorage contains raw message text unexpectedly,
- a counselor identifies unsafe or misleading wording.

## When counselor review is needed

Counselor/international-office review is needed before using examples or guidance for:

- visa or immigration deadlines,
- tuition/payment diversion,
- housing deposits,
- scholarship/admission claims,
- minors or vulnerable students,
- country-specific official resources,
- escalation paths after money or documents are shared.

## How to summarize results without raw messages

Use aggregate, non-identifying notes such as:

- “3 testers found the verification script useful.”
- “2 testers were confused by local vs Firebase dashboard mode.”
- “Scholarship-fee examples were understood; housing-deposit examples need clearer next steps.”
- “One custom message triggered high risk due to urgency + payment + sensitive-data requests.”

Do not include raw messages, names, exact phone numbers, email addresses, URLs, passport/student IDs, card/bank details, or screenshots in beta summaries.
