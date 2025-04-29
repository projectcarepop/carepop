/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Optional: Specify root directory if needed, default is project root
  // rootDir: '.',
  // Optional: Specify test file pattern
  // testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  // Optional: Module name mapper for path aliases if you use them in tsconfig.json
  // moduleNameMapper: {
  //   '^@/(.*)$': '<rootDir>/src/$1'
  // },
  // Optional: Setup files to run before each test file
  // setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8", // or "babel"
}; 