import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../firebase';
import type { CheckResult, ContextType, Platform, RiskLevel } from '../../types';
import { removeUndefinedFields } from '../privacy/payloadSanitizer';

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

export const LOCAL_FEEDBACK_STORAGE_KEY = 'crossBorderScamSafety.feedback.v1';

export function createAnonymousFeedbackRecord(
  input: FeedbackInput,
  result: CheckResult,
  context: ContextType,
  platform: Platform,
  storageMode: 'local' | 'firebase' = 'local',
): AnonymousFeedbackRecord {
  return removeUndefinedFields({
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
    schemaVersion: 'feedback-v1' as const,
  });
}

export function readLocalFeedback(): AnonymousFeedbackRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_FEEDBACK_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AnonymousFeedbackRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalFeedback(record: AnonymousFeedbackRecord): AnonymousFeedbackRecord {
  if (typeof window === 'undefined') return record;
  const existing = readLocalFeedback();
  window.localStorage.setItem(LOCAL_FEEDBACK_STORAGE_KEY, JSON.stringify([record, ...existing].slice(0, 250)));
  return record;
}

export function clearLocalFeedback(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(LOCAL_FEEDBACK_STORAGE_KEY);
  }
}

export async function saveAnonymousFeedback(
  input: FeedbackInput,
  result: CheckResult,
  context: ContextType,
  platform: Platform,
): Promise<{ record: AnonymousFeedbackRecord; storageMode: 'local' | 'firebase'; warning?: string }> {
  const firebaseEnabled = isFirebaseConfigured && Boolean(db);
  const record = createAnonymousFeedbackRecord(input, result, context, platform, firebaseEnabled ? 'firebase' : 'local');

  if (firebaseEnabled && db) {
    try {
      await addDoc(collection(db, 'anonymousFeedback'), removeUndefinedFields({ ...record, createdAt: serverTimestamp() }));
      return { record, storageMode: 'firebase' };
    } catch (error) {
      const localRecord = { ...record, storageMode: 'local' as const };
      saveLocalFeedback(localRecord);
      return {
        record: localRecord,
        storageMode: 'local',
        warning: error instanceof Error ? error.message : 'Firebase feedback submission failed. The structured feedback was saved only in this browser.',
      };
    }
  }

  return { record: saveLocalFeedback(record), storageMode: 'local' };
}

export function feedbackContainsRawMessage(record: AnonymousFeedbackRecord): boolean {
  return Object.keys(record).some((key) => /message|raw|redacted/i.test(key));
}
