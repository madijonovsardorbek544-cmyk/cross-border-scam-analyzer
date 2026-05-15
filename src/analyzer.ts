import scoringRules from '../data/scoringRules.json';
import type { CheckInput, CheckResult, RiskLevel } from './types';

const patterns = {
  urgency: /\b(today|urgent|immediately|now|2 hours|24 hours|deadline|expire|expires|last chance|before midnight|cancelled|canceled|final notice|act fast)\b/i,
  authority: /\b(embassy|consulate|immigration|visa officer|university|admissions|registrar|financial aid|scholarship committee|IRCC|UKVI|SEVIS|IELTS|TOEFL|ETS|international office|home affairs)\b/i,
  sensitiveData: /\b(passport|national id|date of birth|dob|bank account|card number|cvv|password|login|transcript|diploma|visa number|biometrics|document scan|photo of your id)\b/i,
  payment: /\b(pay|fee|deposit|tuition|processing fee|penalty|refund|wire|western union|moneygram|mobile money|gift card|crypto|bitcoin|usdt|bank transfer|personal account)\b/i,
  linkDomain: /(https?:\/\/|www\.|bit\.ly|tinyurl|t\.me|\.top\b|\.xyz\b|\.info\b|secure-|verify-|admissions-secure|login-)/i,
  vagueInstitution: /\b(dear applicant|dear student|regional officer|official department|approved agent|finance officer|scholarship office|visa support letter)\b/i,
  genericGreeting: /\b(dear applicant|dear student|hello student|attention applicant|congratulations dear)\b/i,
  rewardThreat: /\b(guaranteed|100%|full scholarship|approved|selected|deportation|cancel your visa|lose your seat|unconditional|score upgrade|refund)\b/i,
  crossBorder: /\b(visa|passport|foreign student|international student|CAS|SEVIS|study permit|biometrics|embassy|arrival|courier|tuition|dollar|usd|gbp|cad|aud|€|£|\$)\b/i,
};

const authorityByContext: Record<string, string> = {
  scholarship: 'Scholarship committee or financial-aid impersonation',
  visa: 'Immigration, embassy, or visa-service impersonation',
  admission: 'University admissions or agent impersonation',
  payment: 'Finance office, payment portal, or refund impersonation',
  housing: 'Landlord, residence office, or housing agent impersonation',
  'test registration': 'Testing body or exam-center impersonation',
  job: 'Career office or employer impersonation',
  other: 'Unclear or mixed authority claim',
};

function levelFor(score: number): RiskLevel {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

function clampMessage(message: string) {
  return message.trim().slice(0, 5000);
}

export function validateCheckInput(input: CheckInput): string[] {
  const errors: string[] = [];
  if (!input.message.trim()) errors.push('Paste a suspicious message to analyze.');
  if (input.message.length > 5000) errors.push('Message is longer than 5,000 characters; shorten it before checking.');
  if (!input.language.trim()) errors.push('Choose or enter a language.');
  if (!input.countryRegion.trim()) errors.push('Choose or enter a country/region.');
  return errors;
}

export function analyzeMessage(input: CheckInput): CheckResult {
  const message = clampMessage(input.message);
  let score = 0;
  const detectedTactics: string[] = [];
  const matchedRules: string[] = [];

  for (const rule of scoringRules.rubric) {
    const regex = patterns[rule.id as keyof typeof patterns];
    if (regex?.test(message)) {
      score += rule.weight;
      detectedTactics.push(rule.label);
      matchedRules.push(rule.description);
    }
  }

  if (input.platform === 'Telegram' || input.platform === 'WhatsApp' || input.platform === 'Instagram') score += 4;
  if (input.context === 'visa' || input.context === 'scholarship' || input.context === 'payment') score += 4;
  score = Math.min(100, score);

  const sensitiveHit = patterns.sensitiveData.test(message);
  const paymentHit = patterns.payment.test(message);
  const linkHit = patterns.linkDomain.test(message);

  return {
    score,
    level: levelFor(score),
    detectedTactics: detectedTactics.length ? detectedTactics : ['No strong rule matched; continue manual verification.'],
    fakeAuthorityType: patterns.authority.test(message) ? authorityByContext[input.context] : 'No explicit authority detected, but verify any sender identity.',
    sensitiveDataRisk: sensitiveHit ? 'Elevated: message asks for identity, login, school, visa, or financial data.' : 'No direct sensitive-data request detected in the text.',
    paymentRisk: paymentHit ? 'Elevated: message references a fee, deposit, refund, or risky payment method.' : 'No direct payment request detected in the text.',
    linkDomainRisk: linkHit ? 'Elevated: link, short link, or suspicious domain pattern detected.' : 'No obvious link/domain pattern detected; still verify sender domain manually.',
    safeNextSteps: [
      'Do not pay, share documents, or click links until verified through an official channel.',
      'Open the university, embassy, testing provider, or housing portal by typing the official address yourself.',
      'Ask an admissions counselor, school official, or trusted adult to review high-risk messages.',
      'If money or documents were sent, contact your bank/payment provider and the relevant institution immediately.'
    ],
    officialChecklist: [
      'Does the sender email domain exactly match the official institution domain?',
      'Can you find the same request after logging into the official portal directly?',
      'Does the official website list this fee, deadline, agent, or process?',
      'Can you verify by calling or emailing a published official contact, not the contact in the suspicious message?',
      'Is the requested payment method reversible and made to an official institution account?'
    ],
    matchedRules,
  };
}
