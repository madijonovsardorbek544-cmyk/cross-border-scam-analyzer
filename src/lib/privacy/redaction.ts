export interface RedactionResult {
  redactedText: string;
  replacements: Record<string, number>;
  highRiskMarkers: string[];
}

const redactionPatterns: Array<[string, RegExp, string]> = [
  ['emails', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[REDACTED_EMAIL]'],
  ['urls', /\bhttps?:\/\/[^\s]+|\bwww\.[^\s]+/gi, '[REDACTED_URL]'],
  ['telegramWhatsAppHandles', /(?:@|t\.me\/|wa\.me\/)[a-zA-Z0-9_]{4,32}\b/gi, '[REDACTED_HANDLE]'],
  ['datesOfBirth', /\b(?:DOB|date of birth|birth date)\s*[:\-]?\s*(?:\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}|\d{4}[\/.-]\d{1,2}[\/.-]\d{1,2})\b/gi, '[REDACTED_DOB]'],
  ['cardLikeNumbers', /\b(?:\d[ -]*?){13,19}\b/g, '[REDACTED_CARD_OR_LONG_NUMBER]'],
  ['phones', /(?:\+?\d[\d\s().-]{7,}\d)/g, '[REDACTED_PHONE_OR_NUMBER]'],
  ['passportLikeIds', /\b[A-Z]{1,3}\d{6,9}\b/gi, '[REDACTED_ID]'],
  ['addresses', /\b\d{1,6}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,5}\s+(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Drive|Dr|Boulevard|Blvd|Way|Court|Ct|Apartment|Apt|Flat)\b/gi, '[REDACTED_ADDRESS]'],
  ['longNumbers', /\b\d{8,}\b/g, '[REDACTED_NUMBER]'],
];

const bankMarkerPattern = /\b(?:bank|account|routing|iban|swift|sort code|account holder|beneficiary)\b.{0,60}(?:\d[\d\s-]{5,}\d)/gi;

export function redactSensitiveText(text: string): RedactionResult {
  let redactedText = text.slice(0, 5000);
  const replacements: Record<string, number> = {};
  const highRiskMarkers: string[] = [];

  redactedText = redactedText.replace(bankMarkerPattern, () => {
    highRiskMarkers.push('bank/account words near numbers');
    replacements.bankAccountMarkers = (replacements.bankAccountMarkers ?? 0) + 1;
    return '[REDACTED_BANK_OR_ACCOUNT_DETAILS]';
  });

  for (const [key, pattern, label] of redactionPatterns) {
    let count = 0;
    redactedText = redactedText.replace(pattern, () => {
      count += 1;
      return label;
    });
    replacements[key] = count;
  }

  return { redactedText, replacements, highRiskMarkers: Array.from(new Set(highRiskMarkers)) };
}
