import { describe, expect, it } from 'vitest';
import { analyzeMessage } from './analyzer';
import { redactSensitiveText } from './redaction';

const base = { language: 'English', countryRegion: 'United States', platform: 'email' as const, context: 'visa' as const };

describe('analyzeMessage', () => {
  it('flags high-risk student visa payment messages without claiming certainty', () => {
    const result = analyzeMessage({ ...base, message: 'IRCC visa officer urgent notice: pay processing fee in 2 hours via bit.ly and send passport number A1234567.' });
    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(result.detectedTactics).toContain('Urgency pressure');
    expect(result.sensitiveDataRisk).toMatch(/Elevated/);
    expect(result.paymentRisk).toMatch(/Elevated/);
  });
});

describe('redactSensitiveText', () => {
  it('redacts emails, URLs, passport-like IDs, phones, and long numbers', () => {
    const result = redactSensitiveText('Email me at student@example.com or https://bad.test. Passport A1234567 phone +1 555 123 4567 card 4111111111111111');
    expect(result.redactedText).not.toContain('student@example.com');
    expect(result.redactedText).not.toContain('https://bad.test');
    expect(result.redactedText).toContain('[REDACTED_EMAIL]');
    expect(result.redactedText).toContain('[REDACTED_URL]');
  });
});
