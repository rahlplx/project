const CodeExplainer = require('./index');

describe('CodeExplainer', () => {
  it('should create instance', () => {
    const s = new CodeExplainer();
    expect(s.name).toBe('code-explainer');
  });

  it('should explain JavaScript code', () => {
    const s = new CodeExplainer();
    const r = s.explain('function add(a, b) { return a + b; }');
    expect(r.success).toBe(true);
    expect(r.language).toBe('JavaScript');
    expect(r.details.functions).toHaveLength(1);
  });

  it('should detect Python', () => {
    const s = new CodeExplainer();
    const r = s.explain('def hello(name):\n  print(f"Hello {name}")');
    expect(r.language).toBe('Python');
  });

  it('should detect imports', () => {
    const s = new CodeExplainer();
    const r = s.explain('const fs = require("fs");\nconst path = require("path");');
    expect(r.details.imports.length).toBeGreaterThan(0);
  });

  it('should handle empty input', () => {
    const s = new CodeExplainer();
    const r = s.explain('');
    expect(r.success).toBe(false);
  });

  it('should handle null input', () => {
    const s = new CodeExplainer();
    const r = s.explain(null);
    expect(r.success).toBe(false);
  });

  it('should detect classes', () => {
    const s = new CodeExplainer();
    const r = s.explain('class Animal { constructor(name) { this.name = name; } }');
    expect(r.details.classes.length).toBeGreaterThan(0);
  });

  it('should track complexity', () => {
    const s = new CodeExplainer();
    const r = s.explain('if (a) { if (b) { if (c) {} } }');
    expect(r.details.complexity.conditionalBranches).toBeGreaterThan(0);
  });

  it('should detect TypeScript', () => {
    const s = new CodeExplainer();
    const r = s.explain('interface User { name: string; age: number; }');
    expect(r.language).toBe('TypeScript');
  });

  it('should include timestamp', () => {
    const s = new CodeExplainer();
    const r = s.explain('var x = 1;');
    expect(r.timestamp).toBeTruthy();
  });

  it('should return metadata', () => {
    const s = new CodeExplainer();
    expect(s.toJSON().name).toBe('code-explainer');
  });
});
