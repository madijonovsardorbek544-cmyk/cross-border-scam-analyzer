/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from 'vitest';
import { analyzeMessage } from './analyzer';
import type { CheckInput } from './types';
import { createAnonymousFeedbackRecord, feedbackContainsRawMessage, readLocalFeedback, saveLocalFeedback } from './lib/feedback/feedbackSchema';
import { createAnonymizedReportPayload, payloadContainsRawSensitiveData, readLocalReports, saveLocalReport } from './lib/privacy/reportSchema';
import { hasUndefinedField, removeUndefinedFields } from './lib/privacy/payloadSanitizer';
import { readFileSync } from 'node:fs';

const base: CheckInput = {
  message: '',
  language: 'English',
  countryRegion: 'India',
  destinationCountry: 'United States',
  platform: 'email',
  context: 'visa',
  claimedAuthority: '',
  senderDomainOrLink: '',
};

const forbiddenMessageKeys = ['rawMessage', 'message', 'fullMessage', 'unredactedMessage'];

function rulesHasOnlyFields(functionName: string): string[] {
  const rules = readFileSync('firestore.rules', 'utf8');
  const start = rules.indexOf(`function ${functionName}()`);
  expect(start).toBeGreaterThan(-1);
  const slice = rules.slice(start, rules.indexOf(']);', start));
  return [...slice.matchAll(/'([^']+)'/g)].map((match) => match[1]);
}

describe('privacy-safe report and feedback payloads', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('removes undefined fields before Firestore submission', () => {
    const sanitized = removeUndefinedFields({ keep: 'yes', optional: undefined, count: 0 });
    expect(sanitized).toEqual({ keep: 'yes', count: 0 });
    expect(hasUndefinedField(sanitized)).toBe(false);
  });

  it('report payload has no undefined fields and no raw message fields', () => {
    const input = {
      ...base,
      message: 'Email student@example.com passport A1234567 card 4111111111111111 Telegram @visa_agent_now https://bad.test',
      claimedAuthority: '',
      senderDomainOrLink: '',
    };
    const result = analyzeMessage(input);
    const payload = createAnonymizedReportPayload(input, result);

    expect(hasUndefinedField(payload as unknown as Record<string, unknown>)).toBe(false);
    expect(payloadContainsRawSensitiveData(payload)).toBe(false);
    for (const key of forbiddenMessageKeys) expect(payload).not.toHaveProperty(key);
    expect(JSON.stringify(payload)).not.toContain(input.message);
  });

  it('local report save/read works without storing the raw message', () => {
    const input = { ...base, message: 'Pay SEVIS fee by gift card now or visa is cancelled. Call +1 555 123 4567.' };
    const result = analyzeMessage(input);
    const payload = createAnonymizedReportPayload(input, result);

    saveLocalReport(payload);
    const saved = readLocalReports();

    expect(saved).toHaveLength(1);
    expect(saved[0].reportId).toBe(payload.reportId);
    expect(JSON.stringify(saved)).not.toContain(input.message);
    expect(JSON.stringify(window.localStorage)).not.toContain(input.message);
  });

  it('feedback payload has no undefined fields and no raw message fields', () => {
    const input = { ...base, message: 'Your university account is suspended. Send OTP and bank details immediately.' };
    const result = analyzeMessage(input);
    const feedback = createAnonymousFeedbackRecord(
      { helpful: 'yes', verifiedOfficialChannel: 'not yet', calibration: 'accurate', category: undefined },
      result,
      input.context,
      input.platform,
    );

    expect(hasUndefinedField(feedback as unknown as Record<string, unknown>)).toBe(false);
    expect(feedbackContainsRawMessage(feedback)).toBe(false);
    for (const key of forbiddenMessageKeys) expect(feedback).not.toHaveProperty(key);
    expect(JSON.stringify(feedback)).not.toContain(input.message);
  });

  it('feedback local save/read works without storing the raw message', () => {
    const input = { ...base, message: 'Pay tuition to personal account today to avoid deportation.' };
    const result = analyzeMessage(input);
    const feedback = createAnonymousFeedbackRecord(
      { helpful: 'no', verifiedOfficialChannel: 'no', calibration: 'too low', category: 'missed risk' },
      result,
      input.context,
      input.platform,
    );

    saveLocalFeedback(feedback);
    const saved = readLocalFeedback();

    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe(feedback.id);
    expect(JSON.stringify(saved)).not.toContain(input.message);
  });

  it('Firestore report payload keys match the report rules schema as much as practical', () => {
    const input = { ...base, message: 'Send passport and wire transfer today.', claimedAuthority: 'Embassy', senderDomainOrLink: 'visa-help.example' };
    const result = analyzeMessage(input);
    const payload = createAnonymizedReportPayload(input, result);
    const submittedKeys = [...Object.keys(payload), 'createdAt'].sort();
    const allowed = rulesHasOnlyFields('reportHasOnlyRedactedFields');

    expect(submittedKeys.every((key) => allowed.includes(key))).toBe(true);
    expect(allowed).not.toContain('serverCreatedAt');
  });

  it('Firestore feedback payload keys match the anonymous feedback rules schema as much as practical', () => {
    const input = { ...base, message: 'Click link and send OTP now.' };
    const result = analyzeMessage(input);
    const feedback = createAnonymousFeedbackRecord(
      { helpful: 'yes', verifiedOfficialChannel: 'not yet', calibration: 'accurate', category: 'useful' },
      result,
      input.context,
      input.platform,
      'firebase',
    );
    const submittedKeys = [...Object.keys(feedback), 'createdAt'].sort();
    const allowed = rulesHasOnlyFields('feedbackHasOnlyStructuredFields');

    expect(submittedKeys.every((key) => allowed.includes(key))).toBe(true);
    expect(allowed).not.toContain('serverCreatedAt');
    expect(allowed).not.toContain('message');
    expect(allowed).not.toContain('redactedMessage');
  });
});

describe('risk calibration guardrails', () => {
  it('keeps an exact phishing sentence high or critical', () => {
    const result = analyzeMessage({
      ...base,
      platform: 'SMS',
      context: 'other',
      message: 'Your account has been suspended. Verify now to restore access and send your OTP immediately.',
    });

    expect(['high', 'critical']).toContain(result.level);
  });

  it('keeps legitimate reminders low or medium', () => {
    const reminders = [
      'Reminder: the scholarship application deadline is Friday. Log in through the official university website.',
      'Your university orientation schedule is available in the official student portal.',
    ];

    for (const message of reminders) {
      const result = analyzeMessage({ ...base, context: 'scholarship', message });
      expect(['low', 'medium']).toContain(result.level);
    }
  });
});
