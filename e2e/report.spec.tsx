/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { changeControl, clickByText, renderAt, resetBrowserState, settle, textContent } from './helpers';

describe('report controlled-beta flow', () => {
  beforeEach(resetBrowserState);
  afterEach(async () => { resetBrowserState(); await settle(); });

  it('redacts a message and saves only a local redacted report', async () => {
    await renderAt('#report');
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    changeControl(textarea, 'Urgent scholarship guarantee: pay $420 by wire transfer today and send passport A1234567. Email student@example.com now.');
    const inputs = Array.from(document.querySelectorAll('input')).filter((input) => ['text', ''].includes((input as HTMLInputElement).type)) as HTMLInputElement[];
    changeControl(inputs[0], 'India');
    changeControl(inputs[1], 'United States');
    (document.querySelector('input[type="checkbox"]') as HTMLInputElement).click();
    await settle();

    expect(textContent()).toContain('[REDACTED_EMAIL]');
    expect(textContent()).toContain('[REDACTED_ID]');
    clickByText('Submit redacted report');
    await settle();
    await settle();

    expect(textContent()).toContain('Report saved:');
    expect(textContent()).toContain('Local browser storage only');
    const stored = window.localStorage.getItem('crossBorderScamSafety.reports.v1') ?? '';
    expect(stored).not.toContain('student@example.com');
    expect(stored).not.toContain('passport A1234567');
    expect(stored).toContain('[REDACTED_EMAIL]');
  });
});
