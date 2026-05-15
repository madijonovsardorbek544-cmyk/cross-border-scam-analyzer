export type Platform = 'email' | 'SMS' | 'Telegram' | 'WhatsApp' | 'Instagram' | 'website' | 'other';
export type ContextType = 'scholarship' | 'visa' | 'admission' | 'payment' | 'housing' | 'test registration' | 'job' | 'other';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ScamCase {
  id: string;
  title: string;
  targetGroup: string;
  countryRegion: string;
  platform: Platform | string;
  language: string;
  messageSample: string;
  scamType: string;
  fakeAuthority: string;
  psychologicalTactics: string[];
  redFlags: string[];
  crossBorderAdaptation: string;
  safeResponse: string;
  confidenceLevel: 'low' | 'medium' | 'high';
  sourceType: 'public' | 'example' | 'synthetic' | 'verified';
}

export interface CheckInput {
  message: string;
  language: string;
  countryRegion: string;
  platform: Platform;
  context: ContextType;
}

export interface CheckResult {
  score: number;
  level: RiskLevel;
  detectedTactics: string[];
  fakeAuthorityType: string;
  sensitiveDataRisk: string;
  paymentRisk: string;
  linkDomainRisk: string;
  safeNextSteps: string[];
  officialChecklist: string[];
  matchedRules: string[];
}
