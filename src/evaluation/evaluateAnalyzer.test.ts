import { describe, expect, it } from 'vitest';
import { analyzeMessage } from '../analyzer';
import { evaluationExamples, type EvaluationExample } from './examples';
import type { CheckInput } from '../types';

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

function summarizeFailure(example: EvaluationExample, score: number, level: string, labels: string[]) {
  return `${example.id} [${example.category}] expected ${example.expectedLevel} score ${example.expectedMinScore}-${example.expectedMaxScore ?? 100}; got ${level}/${score}; labels=${labels.join(' | ')}; notes=${example.notes}`;
}

function labelMatches(labels: string[], expected: string) {
  return labels.some((label) => label === expected || label.toLowerCase().includes(expected.toLowerCase()));
}

describe('evaluation benchmark coverage', () => {
  it('contains at least 100 labeled examples across required groups', () => {
    expect(evaluationExamples.length).toBeGreaterThanOrEqual(100);
    expect(new Set(evaluationExamples.map((example) => example.id)).size).toBe(evaluationExamples.length);
  });

  it('keeps benchmark examples within expected analyzer behavior', () => {
    const failures: string[] = [];
    for (const example of evaluationExamples) {
      const result = analyzeMessage(baseInput(example));
      const labels = result.detectedTactics.map((tactic) => tactic.label);
      if (example.expectedLevel === 'high' || example.expectedLevel === 'critical') {
        try { expect(result.level, summarizeFailure(example, result.score, result.level, labels)).not.toBe('low'); } catch (error) { failures.push((error as Error).message); }
      }
      if (example.expectedLevel === 'low') {
        try { expect(['low', 'medium'], summarizeFailure(example, result.score, result.level, labels)).toContain(result.level); } catch (error) { failures.push((error as Error).message); }
      }
      try { expect(result.score, summarizeFailure(example, result.score, result.level, labels)).toBeGreaterThanOrEqual(example.expectedMinScore); } catch (error) { failures.push((error as Error).message); }
      if (example.expectedMaxScore !== undefined) {
        try { expect(result.score, summarizeFailure(example, result.score, result.level, labels)).toBeLessThanOrEqual(example.expectedMaxScore); } catch (error) { failures.push((error as Error).message); }
      }
      for (const tactic of example.expectedTactics) {
        try { expect(labelMatches(labels, tactic), summarizeFailure(example, result.score, result.level, labels)).toBe(true); } catch (error) { failures.push((error as Error).message); }
      }
    }
    expect(failures, failures.join('\n\n')).toEqual([]);
  });
});
