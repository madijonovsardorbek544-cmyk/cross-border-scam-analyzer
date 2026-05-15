import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../firebase';
import type { CheckResult, ContextType, Platform, RiskLevel } from '../../types';

export type FeedbackHelpful = 'yes' | 'no';
export type FeedbackVerified = 'yes' | 'no' | 'not yet';
export type FeedbackCalibration = 'too low' | 'accurate' | 'too high';
export type FeedbackCategory = '' | 'missed risk' | 'false alarm' | 'unclear wording' | 'useful';

export interface FeedbackInput {
  helpful: FeedbackHelpful;
  verifiedOfficialChannel: FeedbackVerified;
  calibration: FeedbackCalibration;
  category?: FeedbackCategory;
}

export interface AnonymousFeedbackRecord extends FeedbackInput {
  id: string;
  createdAtIso: string;
  score: number;
  level: RiskLevel;
  context: ContextType;
  platform: Platform;
  tacticIds: string[];
  riskAreaLevels: Record<string, RiskLevel>;
  storageMode: 'local' | 'firebase';
  schemaVersion: 'feedback-v1';
}

const STORAGE_KEY = 'crossBorderScamSafety.feedback.v1';

export function createAnonymousFeedbackRecord(
  input: FeedbackInput,
  result: CheckResult,
  context: ContextType,
  platform: Platform,
  storageMode: 'local' | 'firebase' = 'local',
): AnonymousFeedbackRecord {
  return {
    ...input,
    category: input.category ?? '',
    id: `FB-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAtIso: new Date().toISOString(),
    score: result.score,
    level: result.level,
    context,
    platform,
    tacticIds: result.detectedTactics.map((tactic) => tactic.id),
    riskAreaLevels: {
      sensitiveData: result.sensitiveDataRisk.level,
      payment: result.paymentRisk.level,
      linkDomain: result.linkDomainRisk.level,
      accountSecurity: result.accountSecurityRisk.level,
      credential: result.credentialRisk.level,
      financialAccount: result.financialAccountRisk.level,
      actionPressure: result.actionPressureRisk.level,
    },
    storageMode,
    schemaVersion: 'feedback-v1',
  };
}

export function readLocalFeedback(): AnonymousFeedbackRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AnonymousFeedbackRecord[]) : [];
  } catch {
    return [];
  }
}

export async function saveAnonymousFeedback(
  input: FeedbackInput,
  result: CheckResult,
  context: ContextType,
  platform: Platform,
): Promise<AnonymousFeedbackRecord> {
  const firebaseEnabled = isFirebaseConfigured && Boolean(db);
  const record = createAnonymousFeedbackRecord(input, result, context, platform, firebaseEnabled ? 'firebase' : 'local');
  const existing = readLocalFeedback();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...existing].slice(0, 250)));
  if (firebaseEnabled && db) {
    await addDoc(collection(db, 'anonymousFeedback'), { ...record, serverCreatedAt: serverTimestamp() });
  }
  return record;
}

export function feedbackContainsRawMessage(record: AnonymousFeedbackRecord): boolean {
  return Object.keys(record).some((key) => /message|raw|redacted/i.test(key));
}
