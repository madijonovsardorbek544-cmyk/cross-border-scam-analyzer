import { describe, expect, it } from 'vitest';
import { analyzeMessage } from './analyzer';
import { redactSensitiveText } from './redaction';
import { createAnonymizedReportPayload, payloadContainsRawSensitiveData } from './lib/privacy/reportSchema';
import type { CheckInput } from './types';

const base: CheckInput = { language: 'English', countryRegion: 'India', destinationCountry: 'Canada', platform: 'email', context: 'visa', message: '' };

describe('analyzeMessage', () => {
  it('flags high-risk visa fee scams without claiming certainty', () => {
    const result = analyzeMessage({ ...base, message: 'IRCC visa officer urgent notice: pay processing fee in 2 hours via bit.ly/pay and send passport number A1234567.' });
    expect(result.score).toBeGreaterThanOrEqual(55);
    expect(result.detectedTactics.map((x) => x.label)).toContain('Urgency pressure');
    expect(result.sensitiveDataRisk.summary).toMatch(/Elevated/);
    expect(result.paymentRisk.summary).toMatch(/Elevated/);
    expect(result.falsePositiveWarning).toMatch(/risk indicators/i);
  });

  it('keeps a normal university reminder low risk', () => {
    const result = analyzeMessage({ ...base, context: 'admission', message: 'Reminder: orientation starts Monday. Please log into the official university portal using your usual bookmark for the schedule.' });
    expect(result.level).toBe('low');
    expect(result.falsePositiveWarning).toMatch(/legitimate message/i);
  });

  it('flags scholarship guarantee scams', () => {
    const result = analyzeMessage({ ...base, context: 'scholarship', platform: 'WhatsApp', message: 'Congratulations dear applicant, full scholarship guaranteed. Pay processing fee today by mobile money.' });
    expect(result.detectedTactics.map((x) => x.label)).toContain('Unrealistic guarantee');
    expect(result.paymentRisk.level).not.toBe('low');
  });

  it('flags housing crypto deposit scams', () => {
    const result = analyzeMessage({ ...base, context: 'housing', platform: 'Instagram', message: 'Last room near campus. Many applicants. Send passport photo and crypto deposit now, inspection after arrival.' });
    expect(result.detectedTactics.map((x) => x.label)).toContain('Housing scarcity pressure');
    expect(result.detectedTactics.map((x) => x.label)).toContain('Crypto/gift card/wire transfer');
  });

  it('flags test score upgrade scams', () => {
    const result = analyzeMessage({ ...base, context: 'test registration', platform: 'Telegram', message: 'IELTS insider can upgrade your band score. Send passport and USDT for guaranteed score.' });
    expect(result.detectedTactics.map((x) => x.label)).toContain('Test score upgrade claim');
    expect(result.level).not.toBe('low');
  });

  it('detects link and domain risk from an optional sender field', () => {
    const result = analyzeMessage({ ...base, senderDomainOrLink: 'secure-admissions-login.xyz', message: 'Please verify your admission portal.' });
    expect(result.linkDomainRisk.summary).toMatch(/Elevated/);
  });

  it('detects sensitive-data requests', () => {
    const result = analyzeMessage({ ...base, message: 'Send passport, date of birth, bank statement, and visa number for manual review.' });
    expect(result.sensitiveDataRisk.summary).toMatch(/Elevated/);
  });

  it('detects payment risk', () => {
    const result = analyzeMessage({ ...base, message: 'Pay tuition deposit by wire transfer to personal account today.' });
    expect(result.paymentRisk.summary).toMatch(/Elevated/);
    expect(result.detectedTactics.map((x) => x.label)).toContain('Personal account payment');
  });
});

describe('redactSensitiveText', () => {
  it('redacts email', () => {
    expect(redactSensitiveText('student@example.com').redactedText).toBe('[REDACTED_EMAIL]');
  });

  it('redacts URL', () => {
    expect(redactSensitiveText('Visit https://bad.test/path').redactedText).toContain('[REDACTED_URL]');
  });

  it('redacts phone', () => {
    expect(redactSensitiveText('+1 555 123 4567').redactedText).toContain('[REDACTED_PHONE_OR_NUMBER]');
  });

  it('redacts passport-like ID', () => {
    expect(redactSensitiveText('Passport A1234567').redactedText).toContain('[REDACTED_ID]');
  });

  it('redacts long card-like number', () => {
    expect(redactSensitiveText('4111 1111 1111 1111').redactedText).toContain('[REDACTED_CARD_OR_LONG_NUMBER]');
  });

  it('redacts Telegram handle', () => {
    expect(redactSensitiveText('Message @visa_agent_now').redactedText).toContain('[REDACTED_HANDLE]');
  });

  it('redacts mixed sensitive text', () => {
    const text = 'DOB: 01/02/2004, bank account 1234567890, 123 Main Street, email a@b.com';
    const result = redactSensitiveText(text);
    expect(result.redactedText).not.toContain('01/02/2004');
    expect(result.redactedText).not.toContain('1234567890');
    expect(result.redactedText).not.toContain('123 Main Street');
    expect(result.highRiskMarkers).toContain('bank/account words near numbers');
  });

  it('keeps raw sensitive data out of report payload creation', () => {
    const input = { ...base, message: 'Email student@example.com passport A1234567 card 4111111111111111 Telegram @visa_agent_now https://bad.test' };
    const result = analyzeMessage(input);
    const payload = createAnonymizedReportPayload(input, result);
    expect(payloadContainsRawSensitiveData(payload)).toBe(false);
    expect(payload).not.toHaveProperty('rawMessage');
  });
});
