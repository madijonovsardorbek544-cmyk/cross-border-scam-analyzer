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

function evidenceFor(pattern: RegExp, text: string): string[] {
  pattern.lastIndex = 0;
  return Array.from(new Set(text.match(pattern) ?? [])).slice(0, 5).map((x) => x.trim());
}

function riskArea(hit: boolean, score: number, elevated: string, low: string, evidence: string[]): RiskArea {
  return { level: levelForScore(hit ? Math.max(score, 45) : Math.min(score, 20)), summary: hit ? elevated : low, evidence };
}

function domainRisk(input: CheckInput, text: string): string[] {
  const source = `${text}\n${input.senderDomainOrLink ?? ''}`;
  const matches = source.match(/(https?:\/\/[^\s]+|www\.[^\s]+|[a-z0-9.-]+\.(?:top|xyz|info)\b|bit\.ly[^\s]*|tinyurl[^\s]*|t\.me[^\s]*)/gi) ?? [];
  return Array.from(new Set(matches)).slice(0, 5);
}

const accountLockedOrSuspendedPattern = /\b(account locked|account has been suspended|account suspended|account disabled|account restricted|temporary lock|temporarily locked|card locked|card suspended|payment card blocked|bank account frozen|account closure)\b/i;
const verifyIdentityPattern = /\b(verify your identity|confirm your identity|identity verification|verify account|verify your account|confirm account|confirm your account|re-verify|KYC|account recovery|security check)\b/i;
const clickHerePattern = /\b(click here|tap here|follow this link|open link|verify now|confirm now|restore access|unlock account|secure your account|send otp now)\b/i;

interface CombinationBoost {
  id: string;
  label: string;
  description: string;
  weight: number;
  when: (matched: Set<string>, text: string, linkEvidence: string[]) => boolean;
  evidence: (text: string, linkEvidence: string[]) => string[];
}

const combinationBoosts: CombinationBoost[] = [
  {
    id: 'comboUrgencyIdentity',
    label: 'Combination boost: urgency + identity verification',
    description: 'Urgent timing plus identity verification is a common phishing pressure pattern.',
    weight: 8,
    when: (matched) => matched.has('urgencyPressure') && matched.has('identityVerificationRequest'),
    evidence: (text) => [...evidenceFor(/\b(urgent|immediately|now|deadline|required to prevent)\b/gi, text), ...evidenceFor(/\b(verify your identity|identity verification|verify account|security check)\b/gi, text)],
  },
  {
    id: 'comboAccountAction',
    label: 'Combination boost: account threat + click/action pressure',
    description: 'Account lock, suspension, or unauthorized login language paired with a click/action request increases risk.',
    weight: 10,
    when: (matched) => matched.has('accountSecurityThreat') && matched.has('clickActionPressure'),
    evidence: (text) => [...evidenceFor(/\b(unauthorized login|account suspended|temporarily locked|card locked|account closure)\b/gi, text), ...evidenceFor(/\b(click here|verify now|restore access|send otp now)\b/gi, text)],
  },
  {
    id: 'comboFinancialIdentity',
    label: 'Combination boost: financial account risk + identity verification',
    description: 'Card, bank, refund, charge, or transaction language combined with identity verification is a high-value phishing pattern.',
    weight: 10,
    when: (matched) => matched.has('financialAccountRisk') && matched.has('identityVerificationRequest'),
    evidence: (text) => [...evidenceFor(/\b(card|bank account|transaction|refund|charge|fraud alert)\b/gi, text), ...evidenceFor(/\b(verify your identity|identity verification|verify account)\b/gi, text)],
  },
  {
    id: 'comboCredentialAction',
    label: 'Combination boost: credential/OTP risk + click/action pressure',
    description: 'Codes, passwords, PINs, or 2FA language paired with action pressure can indicate credential theft.',
    weight: 10,
    when: (matched) => matched.has('credentialOrOtpRisk') && matched.has('clickActionPressure'),
    evidence: (text) => [...evidenceFor(/\b(password|OTP|one-time code|verification code|recovery code|login code|2FA|PIN)\b/gi, text), ...evidenceFor(/\b(click here|verify now|confirm now|send otp now)\b/gi, text)],
  },
  {
    id: 'comboLockedVerify',
    label: 'Combination boost: locked/suspended account + verify identity',
    description: 'Locked or suspended account language plus identity verification creates account-recovery pressure.',
    weight: 10,
    when: (_matched, text) => accountLockedOrSuspendedPattern.test(text) && verifyIdentityPattern.test(text),
    evidence: (text) => [...evidenceFor(accountLockedOrSuspendedPattern, text), ...evidenceFor(verifyIdentityPattern, text)],
  },
  {
    id: 'comboLinkUrgency',
    label: 'Combination boost: link/action pressure + urgency',
    description: 'A suspicious link/domain or “click here” style instruction combined with urgency increases risk even without a visible URL.',
    weight: 8,
    when: (matched, text, linkEvidence) => (matched.has('suspiciousLinkDomain') || linkEvidence.length > 0 || clickHerePattern.test(text)) && matched.has('urgencyPressure'),
    evidence: (text, linkEvidence) => [...linkEvidence, ...evidenceFor(clickHerePattern, text), ...evidenceFor(/\b(urgent|immediately|now|deadline|required to prevent)\b/gi, text)],
  },
];

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
  const matchedIds = new Set<string>();

  for (const rule of analyzerRules) {
    const regexMatch = rule.pattern ? has(rule.pattern, text) : false;
    const functionalMatch = rule.applies?.(input, text) ?? false;
    if (regexMatch || functionalMatch) {
      const evidence = extractEvidence(rule, input, text);
      score += rule.weight;
      matchedIds.add(rule.id);
      detectedTactics.push({ id: rule.id, label: rule.label, description: rule.description, weight: rule.weight, evidence });
    }
  }

  if (input.context === 'visa' || input.context === 'payment' || input.context === 'scholarship') score += 3;
  if (input.senderDomainOrLink && !/\.edu\b|\.gov\b|\.ac\.|canada\.ca|gov\.uk|homeaffairs\.gov\.au|ets\.org|ielts\.org|collegeboard\.org/i.test(input.senderDomainOrLink)) score += 6;

  const linkEvidence = domainRisk(input, text);
  for (const boost of combinationBoosts) {
    if (boost.when(matchedIds, text, linkEvidence)) {
      score += boost.weight;
      detectedTactics.push({ id: boost.id, label: boost.label, description: boost.description, weight: boost.weight, evidence: boost.evidence(text, linkEvidence) });
    }
  }

  const finalScore = clampScore(score);
  const level = levelForScore(finalScore);
  const sensitiveEvidence = evidenceFor(/\b(passport|national id|DOB|date of birth|bank statement|card number|CVV|password|login|I-20|CAS|SEVIS|biometrics|verify your identity|identity verification|KYC)\b/gi, text);
  const paymentEvidence = evidenceFor(/\b(pay|fee|deposit|tuition|refund|wire|western union|moneygram|mobile money|gift card|crypto|bitcoin|usdt|personal account)\b/gi, text);
  const accountSecurityEvidence = evidenceFor(/\b(unauthorized login|suspicious login|unusual activity|account locked|account suspended|account disabled|account restricted|temporary lock|temporarily locked|card locked|card suspended|payment card blocked|bank account frozen|account closure)\b/gi, text);
  const credentialEvidence = evidenceFor(/\b(password|OTP|one-time code|verification code|recovery code|login code|2FA|PIN)\b/gi, text);
  const financialAccountEvidence = evidenceFor(/\b(card|debit card|credit card|bank card|bank account|transaction|payment method|account balance|refund|charge|unauthorized transaction|fraud alert)\b/gi, text);
  const actionPressureEvidence = evidenceFor(/\b(click here|tap here|follow this link|open link|verify now|confirm now|restore access|unlock account|secure your account|immediately|act now)\b/gi, text);

  return {
    score: finalScore,
    level,
    detectedTactics: detectedTactics.length ? detectedTactics : [{ id: 'noStrongRule', label: 'No strong rule matched', description: 'The text did not match strong scam-risk indicators. Continue normal verification because legitimate messages can still be spoofed.', weight: 0, evidence: [] }],
    fakeAuthorityType: detectedTactics.some((x) => x.id === 'authorityImpersonation') || input.claimedAuthority ? authorityByContext[input.context] : 'No explicit authority detected, but verify any sender identity.',
    sensitiveDataRisk: riskArea(sensitiveEvidence.length > 0, finalScore, 'Elevated: message appears to request identity, visa, login, school, or financial data.', 'No direct sensitive-data request detected in the text.', sensitiveEvidence),
    paymentRisk: riskArea(paymentEvidence.length > 0, finalScore, 'Elevated: message references a fee, deposit, refund, tuition payment, or risky payment channel.', 'No direct payment request detected in the text.', paymentEvidence),
    linkDomainRisk: riskArea(linkEvidence.length > 0 || matchedIds.has('clickActionPressure'), finalScore, 'Elevated: link, short link, chat link, suspicious domain pattern, or click/action language detected.', 'No obvious link/domain pattern detected; still verify sender domains manually.', linkEvidence.length ? linkEvidence : actionPressureEvidence),
    accountSecurityRisk: riskArea(accountSecurityEvidence.length > 0, finalScore, 'Elevated: message claims unauthorized activity, account closure, or locked/suspended access.', 'No account lock, suspension, or unauthorized-login claim detected.', accountSecurityEvidence),
    credentialRisk: riskArea(credentialEvidence.length > 0, finalScore, 'Elevated: message references passwords, OTPs, login codes, PINs, or 2FA details.', 'No password, OTP, PIN, or login-code request detected.', credentialEvidence),
    financialAccountRisk: riskArea(financialAccountEvidence.length > 0, finalScore, 'Elevated: message references cards, bank accounts, transactions, refunds, charges, or fraud alerts.', 'No direct card, bank-account, transaction, refund, or charge language detected.', financialAccountEvidence),
    actionPressureRisk: riskArea(actionPressureEvidence.length > 0, finalScore, 'Elevated: message pushes clicking, verifying now, restoring access, or immediate action.', 'No direct click/action pressure detected.', actionPressureEvidence),
    crossBorderAdaptationPattern: detectedTactics.some((x) => x.id === 'crossBorderBureaucracyConfusion') ? 'The message mixes real cross-border education, visa, testing, payment, or document terms in a way that can pressure families unfamiliar with the destination-country process.' : 'No strong cross-border bureaucracy pattern detected, but students should still verify with official destination-country and institution channels.',
    confidenceLevel: confidenceFor(detectedTactics.length, finalScore),
    falsePositiveWarning: 'This tool reports risk indicators, not certainty. A legitimate message can contain deadlines or payment language; verify through official channels before acting.',
    safeNextSteps: buildSafeNextSteps(input, level, matchedIds),
    officialVerificationScript: buildVerificationScript(input),
    whatNotToDo,
    trustedAdultNote: 'If you are a minor or feel pressured, ask a trusted adult, parent/guardian, school counselor, or admissions adviser to review the message with you before responding.',
    matchedRules: detectedTactics.map((x) => `${x.label}: ${x.description}`),
  };
}
