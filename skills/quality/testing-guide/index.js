#!/usr/bin/env node
const { SkillBase } = require('../../../lib/skill-base.js');

class TestingGuide extends SkillBase {
  constructor(config = {}) {
    super();
    this.name = 'testing-guide';
    this.version = '1.0.0';
    this.description = 'Generates test case suggestions for your code';
  }

  suggest(code, options = {}) {
    if (!code) return { success: false, error: 'No code to analyze for tests.' };

    const language = options.language || this._detectLanguage(code);
    const framework = options.framework || (language === 'python' ? 'pytest' : 'jest');
    const functions = this._extractFunctions(code);
    const classes = this._extractClasses(code);
    const testCases = [];

    for (const fn of functions) {
      testCases.push(...this._generateFunctionTests(fn, framework));
    }
    for (const cls of classes) {
      testCases.push(...this._generateClassTests(cls, framework));
    }

    return {
      success: true,
      language,
      framework,
      testCases,
      stats: {
        functionsFound: functions.length,
        classesFound: classes.length,
        testsSuggested: testCases.length,
        testFileName: options.fileName
          ? `${options.fileName}.test.${language === 'python' ? 'py' : 'js'}`
          : 'component.test.js',
      },
      timestamp: new Date().toISOString(),
    };
  }

  _detectLanguage(code) {
    if (/def\s+|import\s+\w+|print\s*\(/.test(code)) return 'python';
    if (/fn\s+|println!/.test(code)) return 'rust';
    return 'javascript';
  }

  _extractFunctions(code) {
    const funcs = [];
    const patterns = [
      /(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g,
      /(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g,
      /def\s+(\w+)\s*\(([^)]*)\)/g,
      /fn\s+(\w+)\s*\(([^)]*)\)/g,
    ];
    for (const pat of patterns) {
      let m;
      while ((m = pat.exec(code)) !== null) {
        if (!funcs.find(f => f.name === m[1])) {
          funcs.push({
            name: m[1] || 'anonymous',
            params: m[2]
              ? m[2]
                  .split(',')
                  .map(p => p.trim())
                  .filter(Boolean)
              : [],
          });
        }
      }
    }
    return funcs;
  }

  _extractClasses(code) {
    const classes = [];
    const m = code.match(/class\s+(\w+)/g);
    if (m) {
      m.forEach(c => {
        const name = c.replace('class ', '');
        classes.push({ name, methods: [] });
      });
    }
    const methodMatch = code.match(/(\w+)\s*\([^)]*\)\s*{/g);
    if (methodMatch && classes.length > 0) {
      methodMatch.forEach(mt => {
        const n = mt.split('(')[0].trim();
        if (!['if', 'for', 'while', 'switch', 'catch'].includes(n)) {
          classes[classes.length - 1].methods.push(n);
        }
      });
    }
    return classes;
  }

  _generateFunctionTests(fn, framework) {
    const tests = [];
    const name = fn.name;

    tests.push({
      type: 'happy-path',
      title: `should execute ${name} successfully`,
      description: `Test that ${name} runs without errors with valid input.`,
      template:
        framework === 'jest'
          ? `test('${name} works', () => {\n  const result = ${name}(${fn.params.map(() => '/* value */').join(', ')});\n  expect(result).toBeDefined();\n});`
          : `def test_${name}():\n    result = ${name}(${fn.params.map(() => '/* value */').join(', ')})\n    assert result is not None`,
    });

    if (fn.params.length > 0) {
      tests.push({
        type: 'edge-case',
        title: `should handle empty params for ${name}`,
        description: `Test that ${name} handles empty or undefined parameters gracefully.`,
        template:
          framework === 'jest'
            ? `test('${name} handles empty input', () => {\n  expect(() => ${name}()).not.toThrow();\n});`
            : `def test_${name}_empty():\n    try:\n        ${name}()\n    except Exception:\n        pytest.fail("${name} raised unexpectedly")`,
      });
    }

    if (fn.name.startsWith('get') || fn.name.startsWith('find') || fn.name.startsWith('fetch')) {
      tests.push({
        type: 'not-found',
        title: `should handle not-found for ${name}`,
        description: `Test that ${name} handles cases where data is not found.`,
        template:
          framework === 'jest'
            ? `test('${name} returns null for missing data', () => {\n  const result = ${name}('nonexistent');\n  expect(result).toBeNull();\n});`
            : `def test_${name}_not_found():\n    result = ${name}('nonexistent')\n    assert result is None`,
      });
    }

    return tests;
  }

  _generateClassTests(cls, framework) {
    const tests = [];
    tests.push({
      type: 'instantiation',
      title: `should create ${cls.name} instance`,
      description: `Test that ${cls.name} can be instantiated.`,
      template:
        framework === 'jest'
          ? `test('${cls.name} creates instance', () => {\n  const instance = new ${cls.name}();\n  expect(instance).toBeInstanceOf(${cls.name});\n});`
          : `def test_${cls.name}_create():\n    instance = ${cls.name}()\n    assert isinstance(instance, ${cls.name})`,
    });
    if (cls.methods.length > 0) {
      tests.push({
        type: 'methods',
        title: `should have all methods on ${cls.name}`,
        description: `Test that ${cls.name} has expected methods.`,
        template:
          framework === 'jest'
            ? `test('${cls.name} has expected methods', () => {\n  const instance = new ${cls.name}();\n  ${cls.methods.map(m => `  expect(instance.${m}).toBeDefined();`).join('\n')}\n});`
            : `def test_${cls.name}_methods():\n    instance = ${cls.name}()\n    ${cls.methods.map(m => `    assert hasattr(instance, '${m}')`).join('\n  ')}`,
      });
    }
    return tests;
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

if (require.main === module) {
  const skill = new TestingGuide();
  const input = process.argv[2] || '';
  const r = skill.suggest(input || 'function add(a, b) { return a + b; }');
  console.log(JSON.stringify(r, null, 2));
}

module.exports = TestingGuide;
