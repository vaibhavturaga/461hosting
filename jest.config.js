module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/tests/tools/**/*.test.ts', '**/tests/tools/api/**/*.test.ts'],
};
