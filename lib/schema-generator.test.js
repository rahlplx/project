const { describe, it, beforeEach } = require('node:test');
const assert = require('assert');
const { SchemaGenerator } = require('./schema-generator');

describe('SchemaGenerator', () => {
  beforeEach(() => {
    SchemaGenerator.clearCache();
  });

  it('generates empty schema for zero-param function', () => {
    function noop() {}
    const schema = SchemaGenerator.fromMethod(noop);
    assert.deepStrictEqual(schema, {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    });
  });

  it('extracts single positional parameter', () => {
    function greet(name) {}
    const schema = SchemaGenerator.fromMethod(greet);
    assert.deepStrictEqual(schema.properties.name, { type: 'string', description: 'Name identifier' });
    assert.deepStrictEqual(schema.required, ['name']);
  });

  it('extracts parameter with default value', () => {
    function greet(name = 'world') {}
    const schema = SchemaGenerator.fromMethod(greet);
    assert.deepStrictEqual(schema.properties.name, { type: 'string', description: 'Name identifier', default: 'world' });
    assert.deepStrictEqual(schema.required, []);
  });

  it('extracts multiple parameters with mixed defaults', () => {
    function deploy(projectPath = '.', options = {}) {}
    const schema = SchemaGenerator.fromMethod(deploy);
    assert.deepStrictEqual(schema.properties.projectPath, { type: 'string', description: 'File or directory path', default: '.' });
    assert.deepStrictEqual(schema.properties.options, { type: 'object', description: 'Configuration options', default: {} });
    assert.deepStrictEqual(schema.required, []);
  });

  it('extracts boolean parameter from default', () => {
    function build(production = false) {}
    const schema = SchemaGenerator.fromMethod(build);
    assert.deepStrictEqual(schema.properties.production, { type: 'boolean', description: 'Parameter value', default: false });
    assert.deepStrictEqual(schema.required, []);
  });

  it('extracts number parameter from default', () => {
    function retry(attempts = 3) {}
    const schema = SchemaGenerator.fromMethod(retry);
    assert.deepStrictEqual(schema.properties.attempts, { type: 'number', description: 'Parameter value', default: 3 });
    assert.deepStrictEqual(schema.required, []);
  });

  it('infers types from parameter names', () => {
    function process(filePath, count, isEnabled, items, config) {}
    const schema = SchemaGenerator.fromMethod(process);
    assert.strictEqual(schema.properties.filePath.type, 'string');
    assert.strictEqual(schema.properties.count.type, 'number');
    assert.strictEqual(schema.properties.isEnabled.type, 'boolean');
    assert.strictEqual(schema.properties.items.type, 'array');
    assert.strictEqual(schema.properties.config.type, 'object');
  });

  it('uses JSDoc @param for type and description', () => {
    const jsdoc = `
/**
 * Deploy a project
 * @param {string} projectPath - Path to project directory
 * @param {object} options - Deploy options
 */
`;
    function deploy(projectPath, options = {}) {}
    const schema = SchemaGenerator.fromMethod(deploy, jsdoc);
    assert.strictEqual(schema.properties.projectPath.type, 'string');
    assert.strictEqual(schema.properties.projectPath.description, 'Path to project directory');
    assert.strictEqual(schema.properties.options.type, 'object');
    assert.strictEqual(schema.properties.options.description, 'Deploy options');
  });

  it('handles rest parameters', () => {
    function log(...messages) {}
    const schema = SchemaGenerator.fromMethod(log);
    assert.strictEqual(schema.properties.messages.type, 'array');
    assert.deepStrictEqual(schema.required, ['messages']);
  });

  it('caches schema for repeated calls', () => {
    function greet(name) {}
    const schema1 = SchemaGenerator.fromMethod(greet);
    const schema2 = SchemaGenerator.fromMethod(greet);
    assert.strictEqual(schema1, schema2);
  });

  it('generates different schemas for different functions', () => {
    function a(x) {}
    function b(y) {}
    const schemaA = SchemaGenerator.fromMethod(a);
    const schemaB = SchemaGenerator.fromMethod(b);
    assert.notDeepStrictEqual(schemaA, schemaB);
  });

  it('handles destructured parameter as options object', () => {
    function build({ output, minify = false } = {}) {}
    const schema = SchemaGenerator.fromMethod(build);
    assert.strictEqual(schema.properties.options.type, 'object');
  });

  it('includes additionalProperties: false', () => {
    function greet(name) {}
    const schema = SchemaGenerator.fromMethod(greet);
    assert.strictEqual(schema.additionalProperties, false);
  });

  it('handles complex default values', () => {
    function config(settings = { debug: true, port: 3000 }) {}
    const schema = SchemaGenerator.fromMethod(config);
    assert.deepStrictEqual(schema.properties.settings.default, { debug: true, port: 3000 });
  });

  it('parses params with nested destructuring', () => {
    function foo({ a, b: { c } }) {}
    const schema = SchemaGenerator.fromMethod(foo);
    assert.strictEqual(schema.properties.options.type, 'object');
  });
});