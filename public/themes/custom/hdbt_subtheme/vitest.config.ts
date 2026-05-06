import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths({ projects: ['./tsconfig.json', '../../contrib/hdbt/tsconfig.json'] })],
  resolve: {
    alias: {
      react: resolve(__dirname, '../../contrib/hdbt/node_modules/react'),
      'react-dom': resolve(__dirname, '../../contrib/hdbt/node_modules/react-dom'),
    },
  },
  test: {
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
  }
});

