/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createRoot } from 'react-dom/client';
import { App } from './main';
import { normalizeHashRoute } from './lib/routes';

function textContent() {
  return document.body.textContent ?? '';
}

function clickByText(text: string) {
  const element = Array.from(document.querySelectorAll('button,a')).find((node) => node.textContent?.includes(text));
  expect(element, `Expected clickable text: ${text}`).toBeTruthy();
  element!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

function changeControl(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  const prototype = control.tagName === 'TEXTAREA'
    ? HTMLTextAreaElement.prototype
    : control.tagName === 'SELECT'
      ? HTMLSelectElement.prototype
      : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  setter?.call(control, value);
  control.dispatchEvent(new Event('input', { bubbles: true }));
  control.dispatchEvent(new Event('change', { bubbles: true }));
}

async function settle() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

async function renderAt(hash = '#home') {
  window.location.hash = hash;
  const rootElement = document.createElement('div');
  rootElement.id = 'root';
  document.body.appendChild(rootElement);
  createRoot(rootElement).render(<App />);
  await settle();
  await settle();
}

beforeEach(() => {
  document.body.innerHTML = '';
  window.localStorage.clear();
  window.location.hash = '#home';
  Object.assign(navigator, { clipboard: { writeText: async () => undefined } });
});

afterEach(() => {
  document.body.innerHTML = '';
  window.localStorage.clear();
  window.location.hash = '#home';
});

describe('controlled beta flow coverage without Playwright', () => {
  it('normalizes invalid hash routes to home', () => {
    expect(normalizeHashRoute('#checker')).toBe('checker');
    expect(normalizeHashRoute('#cases')).toBe('cases');
    expect(normalizeHashRoute('#dashboard')).toBe('dashboard');
    expect(normalizeHashRoute('#eval')).toBe('eval');
    expect(normalizeHashRoute('#not-a-real-route')).toBe('home');
  });

  it('loads homepage CTAs, runs bank/card demo, shows risk indicators, and saves feedback locally', async () => {
    await renderAt('#home');
    expect(textContent()).toContain('Check a suspicious message');
    expect(textContent()).toContain('View case library');

    clickByText('Check a suspicious message');
    await settle();
    expect(window.location.hash).toBe('#checker');
    clickByText('Bank/card phishing');
    await settle();
    clickByText('Analyze risk indicators');
    await settle();

    expect(textContent()).toContain('Copyable verification script');
    (document.querySelector('input[type="checkbox"]') as HTMLInputElement).click();
    await settle();
    const body = textContent();
    expect(body).toMatch(/Risk level:\s*(HIGH|CRITICAL)/);
    expect(body).toContain('Account security threat');
    expect(body).toContain('Identity verification request');
    expect(body).toContain('Click/action pressure');
    expect(body).toContain('Financial account/card risk');

    clickByText('Save anonymous feedback');
    await settle();
    await settle();
    expect(textContent()).toContain('Storage mode: local');
    expect(textContent()).toContain('No raw message was stored');
    expect(window.localStorage.getItem('crossBorderScamSafety.feedback.v1')).not.toContain('Synthetic demo sample');
  });

  it('submits a redacted local report and shows it in local dashboard mode', async () => {
    await renderAt('#report');
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    changeControl(textarea, 'Urgent scholarship guarantee: pay $420 by wire transfer today and send passport A1234567.');
    const textInputs = Array.from(document.querySelectorAll('input')).filter((input) => ['text', ''].includes((input as HTMLInputElement).type)) as HTMLInputElement[];
    changeControl(textInputs[0], 'India');
    changeControl(textInputs[1], 'United States');
    const consent = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
    consent.click();
    await settle();
    clickByText('Submit redacted report');
    await settle();
    await settle();

    expect(textContent()).toContain('Report saved:');
    expect(textContent()).toContain('Local browser storage only');
    expect(window.localStorage.getItem('crossBorderScamSafety.reports.v1')).not.toContain('passport A1234567');

    clickByText('View local reports in dashboard');
    window.location.hash = '#dashboard';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await settle();
    const sourceSelect = Array.from(document.querySelectorAll('select')).find((select) => select.textContent?.includes('Firebase')) as HTMLSelectElement;
    expect(sourceSelect).toBeTruthy();
    changeControl(sourceSelect, 'local');
    await settle();
    expect(textContent()).toContain('Current mode: local');
    expect(textContent()).toContain('Reports1');
  });

  it('supports case search, eval dashboard, direct hashes, and invalid-route fallback', async () => {
    await renderAt('#cases');
    expect(textContent()).toContain('Case library');
    const search = document.querySelector('input') as HTMLInputElement;
    changeControl(search, 'IELTS');
    await settle();
    expect(textContent()).toMatch(/IELTS|score/i);

    window.location.hash = '#eval';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await settle();
    expect(textContent()).toContain('Internal evaluation dashboard');
    expect(textContent()).toContain('Total examples');

    window.location.hash = '#does-not-exist';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await settle();
    expect(window.location.hash).toBe('#home');
    expect(textContent()).toContain('Help international students verify suspicious study-abroad messages');
  });
});
