import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths({ projects: ['./tsconfig.json', '../../contrib/hdbt/tsconfig.json'] })],
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
  }
});

