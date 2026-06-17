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
  overrides: [
    {
      // Test helpers commonly pass isolation-dir args that the test body doesn't need to reference directly
      files: ['**/*.test.js'],
      rules: {
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_|^dir$', varsIgnorePattern: '^_' }],
      },
    },
    {
      // CLI utilities, command handlers, bin entry points, and skill modules all emit intentional console output
      files: [
        'lib/vibe-commands/**/*.js',
        'lib/check-index-integrity.js',
        'lib/check-originality.js',
        'lib/design/**/*.js',
        'lib/discovery-index.js',
        'lib/enrich-skills.js',
        'lib/legacy-orchestrator.js',
        'lib/lint-skills.js',
        'lib/orchestrator/**/*.js',
        'lib/security-scan*.js',
        'lib/skill-files.js',
        'lib/telemetry-*.js',
        'bin/**/*.js',
        'skills/**/*.js',
      ],
      rules: {
        'no-console': 'off',
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_|^args$|^state$|^options$|^config$' }],
      },
    },
    {
      // Skill constructors accept a `config` arg for future extensibility — unused by design
      files: ['skills/**/*.js'],
      rules: {
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_|^config$|^options$|^args$|^state$' }],
      },
    },
  ],
  ignorePatterns: ['node_modules/', '.vibe/', '.gsd/', 'scripts/', 'coverage/'],
};
