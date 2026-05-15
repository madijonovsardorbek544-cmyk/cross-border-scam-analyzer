import type { CheckInput, RiskLevel } from '../../types';

export function buildSafeNextSteps(input: CheckInput, level: RiskLevel): string[] {
  const steps = [
    'Pause before paying, clicking, replying, or sending documents. Treat the message as unverified until checked through official channels.',
    'Open the university, embassy, testing provider, housing office, or scholarship site by typing the official address yourself, not by using the message link.',
    'Compare the requested fee, deadline, document, or account number with the official portal or published instructions.',
    'Contact the institution using a phone number or email published on its official website, not contact details inside the suspicious message.',
  ];
  if (['high', 'critical'].includes(level)) {
    steps.push('If you already paid or shared documents, contact your bank/payment provider and the real institution immediately, then preserve screenshots for support staff.');
  }
  if (input.context === 'housing') steps.push('For housing, request a live video tour, lease documentation, and proof that the person can legally rent the property before sending any deposit.');
  if (input.context === 'visa') steps.push('For visa issues, log in to the official government account or visa application center portal directly before taking action.');
  return steps;
}

export function buildVerificationScript(input: CheckInput): string {
  const authority = input.claimedAuthority?.trim() || 'your office';
  return `Hello, I am verifying a message that claims to be from ${authority}. It asks about ${input.context} for study in ${input.destinationCountry || 'my destination country'}. Please confirm through an official channel whether this request, fee, link, deadline, and sender are legitimate. I will not send payment or documents until I receive confirmation from a published official contact.`;
}

export const whatNotToDo = [
  'Do not send passport photos, visas, bank statements, login codes, card numbers, or school credentials through chat or unverified links.',
  'Do not pay by crypto, gift card, wire transfer, mobile money, or a personal account unless the official institution independently confirms it.',
  'Do not rely on screenshots, logos, seals, caller ID, or “official agent” claims as proof.',
  'Do not continue privately if you feel threatened. Ask a counselor, trusted adult, parent/guardian, or school official to review it with you.',
];
