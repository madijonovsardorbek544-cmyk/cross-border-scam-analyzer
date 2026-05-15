export interface RedactionResult {
  redactedText: string;
  replacements: Record<string, number>;
}

const redactionPatterns: Array<[string, RegExp, string]> = [
  ['emails', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[REDACTED_EMAIL]'],
  ['urls', /\bhttps?:\/\/[^\s]+|\bwww\.[^\s]+/gi, '[REDACTED_URL]'],
  ['phones', /(?:\+?\d[\d\s().-]{7,}\d)/g, '[REDACTED_PHONE_OR_NUMBER]'],
  ['passportLikeIds', /\b[A-Z]{1,3}\d{6,9}\b/gi, '[REDACTED_ID]'],
  ['longNumbers', /\b\d{8,}\b/g, '[REDACTED_NUMBER]'],
];

export function redactSensitiveText(text: string): RedactionResult {
  let redactedText = text.slice(0, 5000);
  const replacements: Record<string, number> = {};
  for (const [key, pattern, label] of redactionPatterns) {
    let count = 0;
    redactedText = redactedText.replace(pattern, () => {
      count += 1;
      return label;
    });
    replacements[key] = count;
  }
  return { redactedText, replacements };
}
