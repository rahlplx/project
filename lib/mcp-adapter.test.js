const { describe, it, beforeEach, mock } = require('node:test');
const assert = require('assert');
const { MCPAdapter, createMCPServer } = require('./mcp-adapter');
const { SchemaGenerator } = require('./schema-generator');
const { TokenOptimizer } = require('./token-optimizer');

describe('MCPAdapter', () => {
  let skills;
  let adapter;

  beforeEach(() => {
    skills = {
      'deploy/netlify': {
        instance: {
          description: 'Deploy to Netlify',
          deploy: (projectPath = '.', options = {}) => ({ success: true, path: projectPath }),
          status: () => ({ online: true }),
        },
        category: 'deploy',
        name: 'netlify',
      },
      'explain/error-decoder': {
        instance: {
          description: 'Decode error messages',
          decode: (error, context = {}) => ({ decoded: true, error }),
          explain: (code) => ({ explanation: 'test' }),
        },
        category: 'explain',
        name: 'error-decoder',
      },
    };
    adapter = new MCPAdapter(skills);
  });

  it('builds tool map correctly', () => {
    const toolMap = adapter.getToolMap();
    assert.ok(toolMap['deploy_netlify:deploy']);
    assert.ok(toolMap['deploy_netlify:status']);
    assert.ok(toolMap['explain_error-decoder:decode']);
    assert.ok(toolMap['explain_error-decoder:explain']);
  });

  it('includes instance, method, key in tool map entries', () => {
    const entry = adapter.getToolMap()['deploy_netlify:deploy'];
    assert.strictEqual(entry.method, 'deploy');
    assert.strictEqual(entry.key, 'deploy/netlify');
    assert.ok(entry.instance.deploy);
  });

  it('filters out private methods', () => {
    skills['test/private'] = {
      instance: {
        description: 'Test',
        _private: () => 'hidden',
        publicMethod: () => 'visible',
      },
      category: 'test',
      name: 'private',
    };
    const newAdapter = new MCPAdapter(skills);
    const toolMap = newAdapter.getToolMap();
    assert.ok(!toolMap['test_private:_private']);
    assert.ok(toolMap['test_private:publicMethod']);
  });

  it('filters out constructor and toJSON', () => {
    skills['test/filter'] = {
      instance: {
        description: 'Test',
        constructor: () => {},
        toJSON: () => {},
        normal: () => 'ok',
      },
      category: 'test',
      name: 'filter',
    };
    const newAdapter = new MCPAdapter(skills);
    const toolMap = newAdapter.getToolMap();
    assert.ok(!toolMap['test_filter:constructor']);
    assert.ok(!toolMap['test_filter:toJSON']);
    assert.ok(toolMap['test_filter:normal']);
  });

  it('extracts JSDoc from methods', () => {
    const fn = function testMethod() {};
    const jsdoc = adapter._MCPAdapter__extractJSDoc ? adapter._MCPAdapter__extractJSDoc({}, 'test') : '';
  });

  it('creates server with correct capabilities', () => {
    const server = adapter.getServer();
    assert.ok(server);
  });
});

describe('createMCPServer', () => {
  it('returns MCPAdapter instance', () => {
    const skills = {
      'test/skill': { instance: { foo: () => 'bar' }, category: 'test', name: 'skill' },
    };
    const adapter = createMCPServer(skills);
    assert.ok(adapter && typeof adapter.start === 'function');
    assert.ok(adapter && typeof adapter.getServer === 'function');
    assert.ok(adapter && typeof adapter.getToolMap === 'function');
  });
});

describe('Schema integration', () => {
  it('generates schema with named parameters', () => {
    function deploy(projectPath = '.', options = {}) {}
    const schema = SchemaGenerator.fromMethod(deploy);
    assert.ok(schema.properties.projectPath);
    assert.ok(schema.properties.options);
    assert.deepStrictEqual(schema.required, []);
  });

  it('includes description in schema', () => {
    function greet(name) {}
    const schema = SchemaGenerator.fromMethod(greet);
    assert.ok(schema.properties.name.description);
  });
});

describe('TokenOptimizer integration', () => {
  it('wraps error with isError flag', () => {
    const wrapped = TokenOptimizer.wrapError(new Error('test'));
    assert.strictEqual(wrapped.isError, true);
    assert.ok(wrapped.content[0].text.includes('test'));
  });

  it('wraps result with truncation info', () => {
    const result = { data: 'x'.repeat(20000) };
    const wrapped = TokenOptimizer.wrapResult(result, 100);
    assert.strictEqual(wrapped.truncated, true);
  });
});