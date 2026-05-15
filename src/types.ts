export type Platform = 'email' | 'SMS' | 'Telegram' | 'WhatsApp' | 'Instagram' | 'website' | 'phone call' | 'other';
export type ContextType = 'scholarship' | 'visa' | 'admission' | 'payment' | 'housing' | 'test registration' | 'job' | 'document/legalization' | 'education agent' | 'other';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface ScamCase {
  id: string;
  title: string;
  shortSummary: string;
  targetGroup: string;
  originCountryRegion: string;
  destinationCountryRegion: string;
  platform: Platform | string;
  language: string;
  messageSample: string;
  scamType: string;
  fakeAuthority: string;
  psychologicalTactics: string[];
  redFlags: string[];
  crossBorderAdaptation: string;
  safeResponse: string;
  officialVerificationSteps: string[];
  confidenceLevel: ConfidenceLevel;
  sourceType: 'public' | 'example' | 'synthetic' | 'verified';
  tags: string[];
}

export interface OfficialResource {
  id: string;
  country: string;
  institutionType: string;
  name: string;
  officialWebsite: string;
  verificationAdvice: string;
  scamTypesRelevant: string[];
  notes: string;
  lastReviewedDate: string;
}

export interface CheckInput {
  message: string;
  language: string;
  countryRegion: string;
  destinationCountry: string;
  platform: Platform;
  context: ContextType;
  claimedAuthority?: string;
  senderDomainOrLink?: string;
}

export interface RiskArea {
  level: RiskLevel;
  summary: string;
  evidence: string[];
}

export interface DetectedTactic {
  id: string;
  label: string;
  description: string;
  weight: number;
  evidence: string[];
}

export interface CheckResult {
  score: number;
  level: RiskLevel;
  detectedTactics: DetectedTactic[];
  fakeAuthorityType: string;
  sensitiveDataRisk: RiskArea;
  paymentRisk: RiskArea;
  linkDomainRisk: RiskArea;
  crossBorderAdaptationPattern: string;
  confidenceLevel: ConfidenceLevel;
  falsePositiveWarning: string;
  safeNextSteps: string[];
  officialVerificationScript: string;
  whatNotToDo: string[];
  trustedAdultNote: string;
  matchedRules: string[];
}

export interface AnonymizedReportPayload {
  reportId: string;
  createdAtIso: string;
  redactedMessage: string;
  redactionCounts: Record<string, number>;
  highRiskMarkers: string[];
  language: string;
  countryRegion: string;
  destinationCountry: string;
  platform: Platform;
  context: ContextType;
  claimedAuthority?: string;
  senderDomainOrLinkHost?: string;
  score: number;
  level: RiskLevel;
  scamTypeGuess: string;
  consentVersion: string;
  deletionInstructions: string;
}
