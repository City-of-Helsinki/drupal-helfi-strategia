import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const hdbtNodeModules = resolve(import.meta.dirname, '../../contrib/hdbt/node_modules');

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      react: `${hdbtNodeModules}/react`,
      'react-dom': `${hdbtNodeModules}/react-dom`,
    },
  },
  test: {
    server: {
      deps: {
        inline: ['@testing-library/react'],
      },
    },
    coverage: {
      include: ['src/js/react/apps/hyte-search/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        'src/js/react/apps/hyte-search/types',
        'src/js/react/apps/hyte-search/testutils',
        'src/js/react/apps/hyte-search/index.tsx',
      ],
    },
    environment: 'jsdom',
    exclude: ['node_modules'],
    globals: true,
    setupFiles: ['src/js/react/apps/hyte-search/tests/setupTests.ts'],
  },
});

