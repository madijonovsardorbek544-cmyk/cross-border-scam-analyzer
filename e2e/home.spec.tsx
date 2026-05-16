/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clickByText, renderAt, resetBrowserState, settle, textContent } from './helpers';

describe('home controlled-beta flow', () => {
  beforeEach(resetBrowserState);
  afterEach(async () => { resetBrowserState(); await settle(); });

  it('loads homepage and primary CTAs, then opens checker', async () => {
    await renderAt('#home');
    expect(textContent()).toContain('Help international students verify suspicious study-abroad messages');
    expect(textContent()).toContain('Check a suspicious message');
    expect(textContent()).toContain('View case library');
    expect(textContent()).toContain('Public MVP');

    clickByText('Check a suspicious message');
    await settle();
    expect(window.location.hash).toBe('#checker');
    expect(textContent()).toContain('Analyze risk indicators before you pay, click, or share documents');
  });

  it('keeps checker visible after refresh-style direct hash render and handles invalid hash', async () => {
    await renderAt('#checker');
    expect(textContent()).toContain('Free student checker');

    window.location.hash = '#not-a-route';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await settle();
    expect(window.location.hash).toBe('#home');
    expect(textContent()).toContain('Help international students verify suspicious study-abroad messages');
  });
});
