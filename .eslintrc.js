module.exports = {
  env: { node: true, es2021: true },
  parserOptions: { ecmaVersion: 'latest' },
  rules: {
    'no-unused-vars': ['warn', { args: 'none' }],
    semi: ['error', 'always'],
    quotes: ['error', 'single', { avoidEscape: true }],
    eqeqeq: ['error', 'always'],
    'no-console': 'warn',
    curly: ['error', 'multi-line'],
    'no-var': 'error',
    'prefer-const': 'error',
  },
};
