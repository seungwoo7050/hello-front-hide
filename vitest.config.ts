import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    globals: true,
    // Only run tests from our source and tests folders; exclude node_modules and E2E tests
    include: [
      'src/**/*.test.{ts,tsx,js,jsx}',
      'src/**/*.spec.{ts,tsx,js,jsx}',
      'tests/unit/**/*.test.{ts,tsx,js,jsx}',
      'tests/unit/**/*.spec.{ts,tsx,js,jsx}'
    ],
    exclude: ['node_modules/**', '**/tests/e2e/**'],
    coverage: {
      provider: 'c8',
    },
  },
});
