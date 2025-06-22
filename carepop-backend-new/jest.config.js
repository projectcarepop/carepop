module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/modules/**/*.test.ts'],
  testTimeout: 30000, // 30 seconds
  setupFiles: ['./jest.setup.ts'],
}; 