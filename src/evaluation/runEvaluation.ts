import { analyzeMessage } from '../analyzer';
import type { CheckInput, RiskLevel } from '../types';
import { evaluationExamples, type EvaluationExample } from './examples';

export interface EvaluationRunItem {
  example: EvaluationExample;
  actualScore: number;
  actualLevel: RiskLevel;
  actualTactics: string[];
  passed: boolean;
  failedReasons: string[];
}

export interface EvaluationSummary {
  totalExamples: number;
  byCategory: Record<string, number>;
  byExpectedRiskLevel: Record<string, number>;
  highRiskScoredLow: number;
  lowRiskScoredHighOrCritical: number;
  averageScoreByCategory: Record<string, number>;
  weakestCategories: Array<{ category: string; failures: number; total: number; failureRate: number }>;
  failedExpectedTactics: Record<string, number>;
  failedExamples: EvaluationRunItem[];
  allResults: EvaluationRunItem[];
}

const baseInput = (example: EvaluationExample): CheckInput => ({
  message: example.message,
  language: 'English',
  countryRegion: 'International student/family',
  destinationCountry: 'United States',
  platform: example.platform,
  context: example.context,
  claimedAuthority: '',
  senderDomainOrLink: '',
});

function labelMatches(labels: string[], expected: string) {
  return labels.some((label) => label === expected || label.toLowerCase().includes(expected.toLowerCase()));
}

function countBy<T>(items: T[], pick: (item: T) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = pick(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

export function runEvaluationBenchmark(examples = evaluationExamples): EvaluationSummary {
  const allResults = examples.map<EvaluationRunItem>((example) => {
    const result = analyzeMessage(baseInput(example));
    const labels = result.detectedTactics.map((tactic) => tactic.label);
    const failedReasons: string[] = [];

    if ((example.expectedLevel === 'high' || example.expectedLevel === 'critical') && result.level === 'low') {
      failedReasons.push('High/critical expected example scored low.');
    }
    if (example.expectedLevel === 'low' && (result.level === 'high' || result.level === 'critical')) {
      failedReasons.push('Low expected example scored high/critical.');
    }
    if (result.score < example.expectedMinScore) {
      failedReasons.push(`Score ${result.score} below expected minimum ${example.expectedMinScore}.`);
    }
    if (example.expectedMaxScore !== undefined && result.score > example.expectedMaxScore) {
      failedReasons.push(`Score ${result.score} above expected maximum ${example.expectedMaxScore}.`);
    }
    for (const tactic of example.expectedTactics) {
      if (!labelMatches(labels, tactic)) failedReasons.push(`Missing expected tactic: ${tactic}.`);
    }

    return { example, actualScore: result.score, actualLevel: result.level, actualTactics: labels, passed: failedReasons.length === 0, failedReasons };
  });

  const byCategory = countBy(examples, (example) => example.category);
  const byExpectedRiskLevel = countBy(examples, (example) => example.expectedLevel);
  const categoryScores = allResults.reduce<Record<string, number[]>>((acc, item) => {
    const key = item.example.category;
    acc[key] = [...(acc[key] ?? []), item.actualScore];
    return acc;
  }, {});
  const averageScoreByCategory = Object.fromEntries(Object.entries(categoryScores).map(([category, scores]) => [category, Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)]));
  const failuresByCategory = allResults.reduce<Record<string, number>>((acc, item) => {
    if (!item.passed) acc[item.example.category] = (acc[item.example.category] ?? 0) + 1;
    return acc;
  }, {});
  const weakestCategories = Object.entries(byCategory)
    .map(([category, total]) => ({ category, total, failures: failuresByCategory[category] ?? 0, failureRate: total ? (failuresByCategory[category] ?? 0) / total : 0 }))
    .filter((item) => item.failures > 0)
    .sort((a, b) => b.failureRate - a.failureRate || b.failures - a.failures)
    .slice(0, 6);
  const failedExpectedTactics = allResults.reduce<Record<string, number>>((acc, item) => {
    for (const reason of item.failedReasons) {
      const tactic = reason.match(/^Missing expected tactic: (.+)\.$/)?.[1];
      if (tactic) acc[tactic] = (acc[tactic] ?? 0) + 1;
    }
    return acc;
  }, {});

  return {
    totalExamples: examples.length,
    byCategory,
    byExpectedRiskLevel,
    highRiskScoredLow: allResults.filter((item) => ['high', 'critical'].includes(item.example.expectedLevel) && item.actualLevel === 'low').length,
    lowRiskScoredHighOrCritical: allResults.filter((item) => item.example.expectedLevel === 'low' && ['high', 'critical'].includes(item.actualLevel)).length,
    averageScoreByCategory,
    weakestCategories,
    failedExpectedTactics,
    failedExamples: allResults.filter((item) => !item.passed),
    allResults,
  };
}
