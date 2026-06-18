module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'commonjs',
  },
  rules: {
    // Possible Errors
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-constant-condition': 'warn',

    // Best Practices
    eqeqeq: ['error', 'always'],
    'no-eval': 'error',

    // Variables
    'prefer-const': 'warn',
    'no-var': 'error',

    // Style
    semi: ['error', 'always'],
    quotes: ['error', 'single', { avoidEscape: true }],
    'no-trailing-spaces': 'error',
  },
  ignorePatterns: ['node_modules/', '.vibe/', 'coverage/', '*.test.js'],
};
