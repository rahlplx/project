module.exports = {
  env: {
    es2022: true,
    node: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'commonjs',
  },
  rules: {
    quotes: ['error', 'single', { avoidEscape: true }],
    semi: ['error', 'always'],
    eqeqeq: ['error', 'always'],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-var': 'error',
    'prefer-const': 'warn',
    'no-console': 'warn',
    curly: ['error', 'multi-line'],
  },
  ignorePatterns: ['node_modules/', '.vibe/', '.gsd/', 'scripts/', 'coverage/'],
};