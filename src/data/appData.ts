import casesData from '../../data/cases.json';
import officialResourcesData from '../../data/officialResources.json';
import type { AnonymizedReportPayload, CheckInput, ContextType, OfficialResource, Platform, ScamCase } from '../types';

export const cases = casesData as ScamCase[];
export const officialResources = officialResourcesData as OfficialResource[];
export const platforms: Platform[] = ['email', 'SMS', 'Telegram', 'WhatsApp', 'Instagram', 'website', 'phone call', 'other'];
export const contexts: ContextType[] = ['scholarship', 'visa', 'admission', 'payment', 'housing', 'test registration', 'job', 'document/legalization', 'education agent', 'other'];
export const languages = ['English', 'Spanish', 'French', 'Arabic', 'Hindi', 'Mandarin', 'Portuguese', 'Vietnamese', 'Other'];
export const pages = ['home', 'checker', 'cases', 'report', 'dashboard', 'pilot', 'methodology', 'privacy'];
export const neverSubmitItems = ['passport scans', 'student IDs', 'card numbers', 'login codes', 'exact addresses', 'private documents', 'screenshots with personal data'];

export const blankInput: CheckInput = {
  message: '',
  language: 'English',
  countryRegion: 'Student/family country or region',
  destinationCountry: 'United States',
  platform: 'email',
  context: 'scholarship',
  claimedAuthority: '',
  senderDomainOrLink: '',
};

export const sampleReports: AnonymizedReportPayload[] = cases.slice(0, 14).map((item, index) => ({
  reportId: `SAMPLE-${String(index + 1).padStart(3, '0')}`,
  createdAtIso: new Date(Date.now() - index * 86400000).toISOString(),
  redactedMessage: item.messageSample.replace(/\$?\d+[\d,]*(?:\.\d+)?/g, '[REDACTED_AMOUNT]').replace(/https?:\/\/\S+/g, '[REDACTED_URL]'),
  redactionCounts: { syntheticSample: 1 },
  highRiskMarkers: [],
  language: item.language,
  countryRegion: item.originCountryRegion,
  destinationCountry: item.destinationCountryRegion,
  platform: item.platform as Platform,
  context: contexts.find((context) => item.scamType.toLowerCase().includes(context.split('/')[0])) ?? 'other',
  claimedAuthority: item.fakeAuthority,
  score: index % 4 === 0 ? 86 : index % 3 === 0 ? 67 : 48,
  level: index % 4 === 0 ? 'critical' : index % 3 === 0 ? 'high' : 'medium',
  scamTypeGuess: item.scamType,
  consentVersion: 'sample',
  deletionInstructions: 'Sample anonymized dashboard row; no personal data is present.',
}));

export function goTo(page: string, setPage: (page: string) => void) {
  window.location.hash = page;
  setPage(page);
}

export function copyText(text: string) {
  void navigator.clipboard?.writeText(text);
}
