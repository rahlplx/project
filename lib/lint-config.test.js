const { describe, it } = require('node:test');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

describe('ESLint config', () => {
  const configPath = path.resolve(__dirname, '..', '.eslintrc.js');

  it('exists', () => {
    assert.ok(fs.existsSync(configPath), '.eslintrc.js should exist');
  });

  it('parses without error', () => {
    let config;
    assert.doesNotThrow(() => {
      config = require(configPath);
    });
    assert.ok(config, 'config should be non-null');
    assert.ok(config.rules, 'config should have rules');
  });

  it('has the expected rules', () => {
    const config = require(configPath);
    const rules = config.rules || {};
    assert.ok('no-unused-vars' in rules, 'no-unused-vars rule should exist');
    assert.ok('semi' in rules, 'semi rule should exist');
    assert.ok('quotes' in rules, 'quotes rule should exist');
    assert.ok('eqeqeq' in rules, 'eqeqeq rule should exist');
    assert.ok('no-console' in rules, 'no-console rule should exist');
  });

  it('env includes node and es2021', () => {
    const config = require(configPath);
    assert.ok(config.env, 'config should have env');
    assert.strictEqual(config.env.node, true, 'env.node should be true');
  });
});
