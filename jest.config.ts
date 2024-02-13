import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const config: Config = {
  collectCoverageFrom: [
    'src/**/*.ts*',
    '!src/app/**/layout.tsx',
    '!src/app/**/page.tsx',
    '!src/lib/fakes/**',
    '!src/types/**',
  ],
  coveragePathIgnorePatterns: [
    'src/components/*',
    'src/lib/prisma.ts',
    'src/lib/tailwind-utils.ts',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/test-setup/fetch-polyfill.setup.ts',
    '<rootDir>/test-setup/prisma-mock.setup.ts',
  ],
  testPathIgnorePatterns: ['<rootDir>/tests/'],
  // necessary to overcome BigInt serialization issues
  // https://github.com/jestjs/jest/issues/11617
  workerThreads: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
