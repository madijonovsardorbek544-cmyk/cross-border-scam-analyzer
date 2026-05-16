/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { changeControl, renderAt, resetBrowserState, settle, textContent } from './helpers';

describe('case library controlled-beta flow', () => {
  beforeEach(resetBrowserState);
  afterEach(async () => { resetBrowserState(); await settle(); });

  it('loads case library and supports search/filter', async () => {
    await renderAt('#cases');
    expect(textContent()).toContain('Case library');
    expect(textContent()).toContain('Source labels');
    const search = document.querySelector('input') as HTMLInputElement;
    changeControl(search, 'IELTS');
    await settle();
    expect(textContent()).toMatch(/IELTS|score|testing/i);

    const sourceSelect = Array.from(document.querySelectorAll('select')).find((select) => select.textContent?.includes('synthetic')) as HTMLSelectElement;
    changeControl(sourceSelect, 'synthetic');
    await settle();
    expect(textContent()).toMatch(/synthetic|No matching cases/i);
  });
});
