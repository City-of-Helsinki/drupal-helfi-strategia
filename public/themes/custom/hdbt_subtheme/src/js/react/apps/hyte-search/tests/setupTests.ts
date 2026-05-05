import { vi } from 'vitest';

const Drupal = { t: (key: string) => key };
vi.stubGlobal('Drupal', Drupal);

const drupalSettings = { path: { currentLanguage: 'en' } };
vi.stubGlobal('drupalSettings', drupalSettings);

// HDS produces css parsing errors with jsdom. We don't really care about these.
console.error = (_message, ..._optionalParams) => {};
