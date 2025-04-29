module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  // Optional: if you have path aliases in tsconfig.json
  // moduleNameMapper: {
  //   '^@/(.*)$': '<rootDir>/src/$1'
  // },
  // Optional: Transform ignore patterns if needed for specific node_modules
  // transformIgnorePatterns: [
  //   'node_modules/(?!(react-native|@react-native|@react-navigation|.*\.mjs)/)'
  // ],
  // Ensure TSX files are transformed
  transform: {
    '^.+\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
}; 