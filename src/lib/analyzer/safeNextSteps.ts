import type { CheckInput, RiskLevel } from '../../types';

export function buildSafeNextSteps(input: CheckInput, level: RiskLevel, matchedRuleIds = new Set<string>()): string[] {
  const hasAccountOrCardPhishing = matchedRuleIds.has('accountSecurityThreat') || matchedRuleIds.has('identityVerificationRequest') || matchedRuleIds.has('financialAccountRisk') || matchedRuleIds.has('clickActionPressure');
  const steps = [
    'Pause before paying, clicking, replying, or sending documents. Treat the message as unverified until checked through official channels.',
    'Open the official bank, app, university, embassy, testing provider, housing office, or scholarship portal directly by typing the address yourself or using a saved bookmark — not by using the message link.',
    'Contact official support using a verified phone number, app, portal, or website published outside the suspicious message.',
    'Compare the requested fee, deadline, document, or account number with the official portal or published instructions.',
  ];
  if (hasAccountOrCardPhishing) {
    steps.unshift('Do not click the link or button in the message, even if it says an account or card is locked.');
    steps.push('Do not enter your password, OTP, identity details, card data, PIN, or recovery codes through the message link.');
  }
  if (['high', 'critical'].includes(level)) {
    steps.push('If you already paid, clicked, or shared documents/codes, contact your bank/payment provider and the real institution immediately, then preserve screenshots for support staff.');
  }
  if (input.context === 'housing') steps.push('For housing, request a live video tour, lease documentation, and proof that the person can legally rent the property before sending any deposit.');
  if (input.context === 'visa') steps.push('For visa issues, log in to the official government account or visa application center portal directly before taking action.');
  return steps;
}

export function buildVerificationScript(input: CheckInput): string {
  const authority = input.claimedAuthority?.trim() || 'your office';
  return `Hello, I am verifying a message that claims to be from ${authority}. It asks about ${input.context} for study in ${input.destinationCountry || 'my destination country'}. Please confirm through an official channel whether this request, fee, link, deadline, and sender are legitimate. I will not click links, send payment, or provide documents, passwords, OTPs, identity details, or card data until I receive confirmation from a published official contact.`;
}

export const whatNotToDo = [
  'Do not click “verify,” “restore access,” “unlock account,” or similar links from the message; open the official app/site manually instead.',
  'Do not send passport photos, visas, bank statements, passwords, login codes, OTPs, PINs, card numbers, or school credentials through chat or unverified links.',
  'Do not pay by crypto, gift card, wire transfer, mobile money, or a personal account unless the official institution independently confirms it.',
  'Do not rely on screenshots, logos, seals, caller ID, or “official agent” claims as proof.',
  'Do not continue privately if you feel threatened. Ask a counselor, trusted adult, parent/guardian, or school official to review it with you.',
];
