import { vi } from 'vitest';

const Drupal = {
  t: (key: string) => key,
  formatPlural: (count: number, singular: string, plural: string) =>
    (count === 1 ? singular : plural).replace('@count', String(count)),
};
vi.stubGlobal('Drupal', Drupal);

const drupalSettings = { path: { currentLanguage: 'en' } };
vi.stubGlobal('drupalSettings', drupalSettings);

// HDS produces css parsing errors with jsdom. We don't really care about these.
console.error = (_message, ..._optionalParams) => {};

window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
