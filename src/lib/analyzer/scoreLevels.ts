import type { RiskLevel } from '../../types';

export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function levelForScore(score: number): RiskLevel {
  if (score >= 80) return 'critical';
  if (score >= 55) return 'high';
  if (score >= 28) return 'medium';
  return 'low';
}

export function confidenceFor(matches: number, score: number): 'low' | 'medium' | 'high' {
  if (matches >= 5 || score >= 70) return 'high';
  if (matches >= 2 || score >= 35) return 'medium';
  return 'low';
}
