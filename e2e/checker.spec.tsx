/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clickByText, renderAt, resetBrowserState, settle, textContent } from './helpers';

describe('checker controlled-beta flow', () => {
  beforeEach(resetBrowserState);
  afterEach(async () => { resetBrowserState(); await settle(); });

  it('runs the bank/card phishing demo, shows high-or-critical indicators, script, and feedback success', async () => {
    await renderAt('#checker');
    clickByText('Bank/card phishing');
    await settle();
    clickByText('Analyze risk indicators');
    await settle();

    const body = textContent();
    expect(body).toMatch(/Risk level:\s*(HIGH|CRITICAL)/);
    expect(body).toContain('Account security threat');
    expect(body).toContain('Financial account/card risk');
    expect(body).toContain('Identity verification request');
    expect(body).toContain('Click/action pressure');
    expect(body).toContain('Copyable verification script');
    expect(body).toContain('I am verifying a message');

    clickByText('Save anonymous feedback');
    await settle();
    await settle();
    expect(textContent()).toContain('Structured feedback saved only in this browser');
    expect(window.localStorage.getItem('crossBorderScamSafety.feedback.v1')).not.toContain('Synthetic demo sample');
  });
});
