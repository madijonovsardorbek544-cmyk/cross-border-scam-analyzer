/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { changeControl, clickByText, renderAt, resetBrowserState, settle, textContent } from './helpers';

describe('dashboard controlled-beta flow', () => {
  beforeEach(resetBrowserState);
  afterEach(async () => { resetBrowserState(); await settle(); });

  it('shows a saved report in local mode and labels Firebase/sample limitations', async () => {
    await renderAt('#report');
    changeControl(document.querySelector('textarea') as HTMLTextAreaElement, 'Fake tuition payment change: send wire transfer today to a personal account or admission will be cancelled.');
    const inputs = Array.from(document.querySelectorAll('input')).filter((input) => ['text', ''].includes((input as HTMLInputElement).type)) as HTMLInputElement[];
    changeControl(inputs[0], 'Brazil');
    changeControl(inputs[1], 'Canada');
    (document.querySelector('input[type="checkbox"]') as HTMLInputElement).click();
    await settle();
    clickByText('Submit redacted report');
    await settle();

    window.location.hash = '#dashboard';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await settle();
    const sourceSelect = Array.from(document.querySelectorAll('select')).find((select) => select.textContent?.includes('Firebase')) as HTMLSelectElement;
    changeControl(sourceSelect, 'local');
    await settle();
    expect(textContent()).toContain('Current mode: local');
    expect(textContent()).toContain('Reports1');

    changeControl(sourceSelect, 'firebase');
    await settle();
    expect(textContent()).toContain('Firebase dashboard querying is not implemented');
    changeControl(sourceSelect, 'sample');
    await settle();
    expect(textContent()).toContain('synthetic sample data only');
  });
});
