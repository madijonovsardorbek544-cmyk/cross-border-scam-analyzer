import type { CheckInput, ContextType, Platform } from '../../types';

export interface AnalyzerRule {
  id: string;
  label: string;
  description: string;
  weight: number;
  pattern?: RegExp;
  applies?: (input: CheckInput, text: string) => boolean;
  evidence?: (input: CheckInput, text: string) => string[];
}

const words = (pattern: RegExp, text: string): string[] => Array.from(new Set((text.match(pattern) ?? []).slice(0, 5).map((x) => x.trim())));

export const analyzerRules: AnalyzerRule[] = [
  { id: 'urgencyPressure', label: 'Urgency pressure', description: 'Creates a short deadline, immediate action request, or threat of consequence.', weight: 10, pattern: /\b(urgent|immediately|immediate|now|within\s+\d+\s*(hours?|days?)|today only|final notice|last chance|act now|before midnight|deadline|required to prevent|prevent account closure|closure)\b/gi },
  { id: 'accountSecurityThreat', label: 'Account security threat', description: 'Claims an account, login, card, or bank access is locked, suspended, restricted, frozen, or under unauthorized activity.', weight: 13, pattern: /\b(unauthorized login|suspicious login|unusual activity|account locked|account has been suspended|account suspended|account disabled|account restricted|temporary lock|temporarily locked|card locked|card suspended|payment card blocked|bank account frozen|account closure|account has been closed|account will be closed)\b/gi },
  { id: 'identityVerificationRequest', label: 'Identity verification request', description: 'Requests identity or account verification, KYC, account recovery, or a security check.', weight: 12, pattern: /\b(verify your identity|confirm your identity|identity verification|verify account|verify your account|confirm account|confirm your account|re-verify|KYC|account recovery|security check)\b/gi },
  { id: 'clickActionPressure', label: 'Click/action pressure', description: 'Pushes the user to click, open a link, verify now, restore access, unlock, or secure an account.', weight: 11, pattern: /\b(click here|tap here|follow this link|open link|verify now|confirm now|restore access|unlock account|secure your account|send otp now|send .* now)\b/gi },
  { id: 'credentialOrOtpRisk', label: 'Credential/OTP risk', description: 'Mentions passwords, one-time codes, login codes, PINs, or 2FA details that should not be shared through messages.', weight: 13, pattern: /\b(password|OTP|one-time code|verification code|recovery code|login code|2FA|PIN)\b/gi },
  { id: 'financialAccountRisk', label: 'Financial account/card risk', description: 'Mentions bank cards, bank accounts, transactions, refunds, charges, or fraud alerts.', weight: 11, pattern: /\b(card|debit card|credit card|bank card|bank account|transaction|payment method|account balance|refund|charge|unauthorized transaction|fraud alert)\b/gi },
  { id: 'brandOrPortalImpersonation', label: 'Brand or portal impersonation', description: 'Uses generic support, security, fraud, account, or payment department language that should be verified through official channels.', weight: 8, pattern: /\b(support team|security team|fraud department|bank security|account department|customer support|payment support)\b/gi },
  { id: 'authorityImpersonation', label: 'Authority impersonation', description: 'Claims to represent a trusted school, embassy, immigration, testing, or scholarship authority.', weight: 12, pattern: /\b(embassy|consulate|immigration|visa officer|IRCC|USCIS|SEVP|home office|university|admissions?|registrar|finance office|scholarship committee|IELTS|TOEFL|ETS|College Board|SAT|official agent)\b/gi },
  { id: 'sensitiveDataRequest', label: 'Sensitive-data request', description: 'Requests identity, school, visa, account, or financial data.', weight: 14, pattern: /\b(passport|national id|date of birth|DOB|birth date|I-20|CAS|SEVIS|study permit|visa number|biometrics|bank statement|card number|CVV|password|login|transcript|diploma|document scan|selfie|photo of your id)\b/gi },
  { id: 'paymentFeeRequest', label: 'Payment or fee request', description: 'Mentions fees, deposits, penalties, refunds, tuition, or payment instructions.', weight: 12, pattern: /\b(pay|payment|fee|deposit|tuition|processing fee|penalty|fine|refund|invoice|receipt|balance|transfer|send money)\b/gi },
  { id: 'suspiciousLinkDomain', label: 'Suspicious link/domain', description: 'Contains short links, non-official login language, or high-risk domain patterns.', weight: 12, pattern: /(https?:\/\/|www\.|bit\.ly|tinyurl|t\.me\/|wa\.me\/|\.top\b|\.xyz\b|\.info\b|secure-|verify-|admissions-secure|login-|portal-verify)/gi },
  { id: 'unofficialPaymentMethod', label: 'Unofficial payment method', description: 'Requests hard-to-reverse or informal payment channels.', weight: 13, pattern: /\b(western union|moneygram|mobile money|zelle|cash app|venmo|paypal friends|wise transfer|gift cards?|steam card|apple card|google play|crypto|bitcoin|usdt|ethereum|wire transfer)\b/gi },
  { id: 'genericGreeting', label: 'Generic greeting', description: 'Uses a non-specific greeting rather than the applicant name or ID.', weight: 5, pattern: /\b(dear applicant|dear student|hello student|attention applicant|congratulations dear|dear candidate)\b/gi },
  { id: 'vagueInstitution', label: 'Vague institution', description: 'Uses vague office names or regional officials instead of verifiable departments.', weight: 7, pattern: /\b(regional officer|approved agent|official department|finance officer|visa support office|scholarship office|international desk|authorized representative)\b/gi },
  { id: 'unrealisticGuarantee', label: 'Unrealistic guarantee', description: 'Promises guaranteed admission, scholarships, visas, jobs, refunds, or score changes.', weight: 12, pattern: /\b(guaranteed|100%|full scholarship|approved visa|visa guaranteed|unconditional admission|sure admission|instant refund|guaranteed job|no interview required)\b/gi },
  { id: 'deportationVisaThreat', label: 'Deportation or visa threat', description: 'Threatens cancellation, deportation, or immigration consequences.', weight: 14, pattern: /\b(deportation|visa cancelled|cancel your visa|study permit cancelled|blacklist|immigration hold|embassy cancellation|CAS cancelled|appointment cancelled)\b/gi },
  { id: 'housingScarcityPressure', label: 'Housing scarcity pressure', description: 'Pressures students to pay before viewing housing because rooms are scarce.', weight: 9, pattern: /\b(room will be gone|many applicants|limited rooms|no inspection|inspection after arrival|reserve the room now|housing deadline|last room)\b/gi },
  { id: 'testScoreUpgradeClaim', label: 'Test score upgrade claim', description: 'Claims test scores can be changed, upgraded, leaked, or registered unofficially.', weight: 15, pattern: /\b(score upgrade|change your score|increase your band|IELTS band|TOEFL score|SAT score|inside examiner|leaked questions|proxy test|guaranteed score)\b/gi },
  { id: 'cryptoGiftCardWire', label: 'Crypto/gift card/wire transfer', description: 'Requests irreversible payment instruments.', weight: 12, pattern: /\b(crypto|bitcoin|usdt|gift card|wire transfer|western union|moneygram)\b/gi },
  { id: 'personalAccountPayment', label: 'Personal account payment', description: 'Asks for payment to a personal or regional account rather than an official institution account.', weight: 13, pattern: /\b(personal account|individual account|regional account|agent account|finance officer account|send to my account|account holder)\b/gi },
  { id: 'crossBorderBureaucracyConfusion', label: 'Cross-border bureaucracy confusion', description: 'Mixes real cross-border terms to exploit unfamiliar processes.', weight: 7, pattern: /\b(CAS|I-20|SEVIS|biometrics|study permit|visa support letter|legalization|apostille|attestation|DLI|embassy appointment|courier clearance)\b/gi },
  { id: 'languageMismatch', label: 'Language mismatch', description: 'Language or grammar may not match the claimed institution or process.', weight: 5, applies: (input, text) => input.language !== 'English' && /\b(dear applicant|official department|kindly|do the needful|western union|gift card)\b/i.test(text) },
  { id: 'platformRisk', label: 'Platform risk', description: 'The channel is often abused for impersonation or unverifiable payments.', weight: 6, applies: (input) => ['Telegram', 'WhatsApp', 'Instagram', 'SMS', 'phone call'].includes(input.platform) },
];

export const authorityByContext: Record<ContextType, string> = {
  scholarship: 'Scholarship committee or financial-aid impersonation',
  visa: 'Immigration, embassy, consulate, or visa-service impersonation',
  admission: 'University admissions, registrar, or education-agent impersonation',
  payment: 'Finance office, tuition portal, payment processor, or refund impersonation',
  housing: 'Landlord, residence office, or housing agent impersonation',
  'test registration': 'Testing provider, exam center, or score office impersonation',
  job: 'Career office, employer, or work-placement impersonation',
  'document/legalization': 'Notary, legalization, apostille, courier, or ministry impersonation',
  'education agent': 'Education agent, counselor, or admissions representative impersonation',
  other: 'Unclear or mixed authority claim',
};

export function extractEvidence(rule: AnalyzerRule, input: CheckInput, text: string): string[] {
  if (rule.evidence) return rule.evidence(input, text);
  if (rule.pattern) return words(rule.pattern, text);
  if (rule.applies?.(input, text)) return [rule.label];
  return [];
}

export function platformRisk(platform: Platform): number {
  return platform === 'email' || platform === 'website' ? 0 : 6;
}
