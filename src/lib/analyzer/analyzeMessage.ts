import type { CheckInput, CheckResult, DetectedTactic, RiskArea } from '../../types';
import { analyzerRules, authorityByContext, extractEvidence } from './rules';
import { buildSafeNextSteps, buildVerificationScript, whatNotToDo } from './safeNextSteps';
import { clampScore, confidenceFor, levelForScore } from './scoreLevels';

function normalizedMessage(input: CheckInput): string {
  return [input.message, input.claimedAuthority ?? '', input.senderDomainOrLink ?? ''].join('\n').trim().slice(0, 5000);
}

function has(pattern: RegExp, text: string): boolean {
  pattern.lastIndex = 0;
  return pattern.test(text);
}

function riskArea(hit: boolean, score: number, elevated: string, low: string, evidence: string[]): RiskArea {
  return { level: levelForScore(hit ? Math.max(score, 45) : Math.min(score, 20)), summary: hit ? elevated : low, evidence };
}

function domainRisk(input: CheckInput, text: string): string[] {
  const source = `${text}\n${input.senderDomainOrLink ?? ''}`;
  const matches = source.match(/(https?:\/\/[^\s]+|www\.[^\s]+|[a-z0-9.-]+\.(?:top|xyz|info)\b|bit\.ly[^\s]*|tinyurl[^\s]*|t\.me[^\s]*)/gi) ?? [];
  return Array.from(new Set(matches)).slice(0, 5);
}

export function validateCheckInput(input: CheckInput): string[] {
  const errors: string[] = [];
  if (!input.message.trim()) errors.push('Paste a suspicious message to analyze.');
  if (input.message.length > 5000) errors.push('Message is longer than 5,000 characters; shorten it before checking.');
  if (!input.language.trim()) errors.push('Choose or enter a language.');
  if (!input.countryRegion.trim()) errors.push('Choose or enter the student/family country or region.');
  if (!input.destinationCountry.trim()) errors.push('Choose or enter the destination country.');
  return errors;
}

export function analyzeMessage(input: CheckInput): CheckResult {
  const text = normalizedMessage(input);
  let score = 0;
  const detectedTactics: DetectedTactic[] = [];

  for (const rule of analyzerRules) {
    const regexMatch = rule.pattern ? has(rule.pattern, text) : false;
    const functionalMatch = rule.applies?.(input, text) ?? false;
    if (regexMatch || functionalMatch) {
      const evidence = extractEvidence(rule, input, text);
      score += rule.weight;
      detectedTactics.push({ id: rule.id, label: rule.label, description: rule.description, weight: rule.weight, evidence });
    }
  }

  if (input.context === 'visa' || input.context === 'payment' || input.context === 'scholarship') score += 3;
  if (input.senderDomainOrLink && !/\.edu\b|\.gov\b|\.ac\.|canada\.ca|gov\.uk|homeaffairs\.gov\.au|ets\.org|ielts\.org|collegeboard\.org/i.test(input.senderDomainOrLink)) score += 6;

  const finalScore = clampScore(score);
  const level = levelForScore(finalScore);
  const sensitiveEvidence = text.match(/\b(passport|national id|DOB|date of birth|bank statement|card number|CVV|password|login|I-20|CAS|SEVIS|biometrics)\b/gi) ?? [];
  const paymentEvidence = text.match(/\b(pay|fee|deposit|tuition|refund|wire|western union|moneygram|mobile money|gift card|crypto|bitcoin|usdt|personal account)\b/gi) ?? [];
  const linkEvidence = domainRisk(input, text);

  return {
    score: finalScore,
    level,
    detectedTactics: detectedTactics.length ? detectedTactics : [{ id: 'noStrongRule', label: 'No strong rule matched', description: 'The text did not match strong scam-risk indicators. Continue normal verification because legitimate messages can still be spoofed.', weight: 0, evidence: [] }],
    fakeAuthorityType: detectedTactics.some((x) => x.id === 'authorityImpersonation') || input.claimedAuthority ? authorityByContext[input.context] : 'No explicit authority detected, but verify any sender identity.',
    sensitiveDataRisk: riskArea(sensitiveEvidence.length > 0, finalScore, 'Elevated: message appears to request identity, visa, login, school, or financial data.', 'No direct sensitive-data request detected in the text.', Array.from(new Set(sensitiveEvidence)).slice(0, 5)),
    paymentRisk: riskArea(paymentEvidence.length > 0, finalScore, 'Elevated: message references a fee, deposit, refund, tuition payment, or risky payment channel.', 'No direct payment request detected in the text.', Array.from(new Set(paymentEvidence)).slice(0, 5)),
    linkDomainRisk: riskArea(linkEvidence.length > 0, finalScore, 'Elevated: link, short link, chat link, or suspicious domain pattern detected.', 'No obvious link/domain pattern detected; still verify sender domains manually.', linkEvidence),
    crossBorderAdaptationPattern: detectedTactics.some((x) => x.id === 'crossBorderBureaucracyConfusion') ? 'The message mixes real cross-border education, visa, testing, payment, or document terms in a way that can pressure families unfamiliar with the destination-country process.' : 'No strong cross-border bureaucracy pattern detected, but students should still verify with official destination-country and institution channels.',
    confidenceLevel: confidenceFor(detectedTactics.length, finalScore),
    falsePositiveWarning: 'This tool reports risk indicators, not certainty. A legitimate message can contain deadlines or payment language; verify through official channels before acting.',
    safeNextSteps: buildSafeNextSteps(input, level),
    officialVerificationScript: buildVerificationScript(input),
    whatNotToDo,
    trustedAdultNote: 'If you are a minor or feel pressured, ask a trusted adult, parent/guardian, school counselor, or admissions adviser to review the message with you before responding.',
    matchedRules: detectedTactics.map((x) => `${x.label}: ${x.description}`),
  };
}
