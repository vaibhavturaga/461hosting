module.exports = {
  extends: [
            'eslint:recommended',
            'plugin:@typescript-eslint/recommended-type-checked',
            'plugin:@typescript-eslint/stylistic-type-checked',
          ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  root: true,
};
