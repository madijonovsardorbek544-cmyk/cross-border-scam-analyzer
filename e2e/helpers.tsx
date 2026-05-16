/** @vitest-environment jsdom */
import { expect } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { App } from '../src/main';

const mountedRoots: Root[] = [];

export function textContent() {
  return document.body.textContent ?? '';
}

export function clickByText(text: string) {
  const element = Array.from(document.querySelectorAll('button,a')).find((node) => node.textContent?.includes(text));
  expect(element, `Expected clickable text: ${text}`).toBeTruthy();
  element!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

export function changeControl(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
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

export async function settle() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

export async function renderAt(hash = '#home'): Promise<Root> {
  window.location.hash = hash;
  const rootElement = document.createElement('div');
  rootElement.id = 'root';
  document.body.appendChild(rootElement);
  const root = createRoot(rootElement);
  mountedRoots.push(root);
  root.render(<App />);
  await settle();
  await settle();
  return root;
}

export function resetBrowserState() {
  while (mountedRoots.length) {
    try { mountedRoots.pop()?.unmount(); } catch { /* ignore cleanup races in jsdom */ }
  }
  document.body.innerHTML = '';
  window.localStorage.clear();
  window.location.hash = '#home';
  Object.assign(navigator, { clipboard: { writeText: async () => undefined } });
}
