import type { AnonymizedReportPayload, CheckInput, CheckResult } from '../../types';
import { redactSensitiveText } from './redaction';
import { removeUndefinedFields } from './payloadSanitizer';

export const REPORT_CONSENT_VERSION = 'redacted-report-consent-v1';
export const LOCAL_REPORTS_STORAGE_KEY = 'crossBorderScamSafety.reports.v1';

function reportId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return `CBSS-${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

function hostOnly(value?: string): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const normalized = value.startsWith('http') ? value : `https://${value}`;
    return new URL(normalized).hostname;
  } catch {
    return value.replace(/[^a-z0-9.-]/gi, '').slice(0, 120) || undefined;
  }
}

export function createAnonymizedReportPayload(input: CheckInput, result: CheckResult): AnonymizedReportPayload {
  const redaction = redactSensitiveText(input.message);
  return removeUndefinedFields({
    reportId: reportId(),
    createdAtIso: new Date().toISOString(),
    redactedMessage: redaction.redactedText,
    redactionCounts: redaction.replacements,
    highRiskMarkers: redaction.highRiskMarkers,
    language: input.language,
    countryRegion: input.countryRegion,
    destinationCountry: input.destinationCountry,
    platform: input.platform,
    context: input.context,
    claimedAuthority: input.claimedAuthority?.trim().slice(0, 120) || undefined,
    senderDomainOrLinkHost: hostOnly(input.senderDomainOrLink),
    score: result.score,
    level: result.level,
    scamTypeGuess: input.context,
    consentVersion: REPORT_CONSENT_VERSION,
    deletionInstructions: 'Future production pilots should allow report deletion by report ID through institution support. This MVP stores only redacted payloads by default.',
  });
}

export function readLocalReports(): AnonymizedReportPayload[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_REPORTS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AnonymizedReportPayload[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalReport(payload: AnonymizedReportPayload): AnonymizedReportPayload {
  if (typeof window === 'undefined') return payload;
  const existing = readLocalReports();
  window.localStorage.setItem(LOCAL_REPORTS_STORAGE_KEY, JSON.stringify([payload, ...existing].slice(0, 250)));
  return payload;
}

export function clearLocalReports(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(LOCAL_REPORTS_STORAGE_KEY);
  }
}

export function payloadContainsRawSensitiveData(payload: AnonymizedReportPayload): boolean {
  return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|https?:\/\/|\b[A-Z]{1,3}\d{6,9}\b|\b(?:\d[ -]*?){13,19}\b|@\w{4,32}/i.test(payload.redactedMessage);
}
