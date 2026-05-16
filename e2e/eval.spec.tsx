/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { evaluationExamples } from '../src/evaluation/examples';
import { renderAt, resetBrowserState, settle, textContent } from './helpers';

describe('evaluation dashboard controlled-beta flow', () => {
  beforeEach(resetBrowserState);
  afterEach(async () => { resetBrowserState(); await settle(); });

  it('loads eval dashboard and shows total benchmark examples', async () => {
    await renderAt('#eval');
    expect(textContent()).toContain('Internal evaluation dashboard');
    expect(textContent()).toContain('Total examples');
    expect(textContent()).toContain(String(evaluationExamples.length));
    expect(evaluationExamples.length).toBeGreaterThanOrEqual(120);
    expect(textContent()).toContain('Low false-negative counts here do not guarantee real-world scam detection');
  });
});
