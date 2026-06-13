const { checkOriginality, formatReport, jaccard, shingle, normalize, tokenize } = require('./check-originality');

describe('normalize', () => {
  test('lowercases text', () => {
    expect(normalize('HELLO World')).toBe('hello world');
  });

  test('strips boilerplate JS keywords', () => {
    expect(normalize('const x = require("fs")')).toBe('x fs');
  });

  test('strips entity names', () => {
    expect(normalize('deploy to netlify')).toBe('deploy to');
  });

  test('collapses whitespace', () => {
    expect(normalize('a    b')).toBe('a b');
  });

  test('removes non-alphanumeric', () => {
    expect(normalize('hello-world!')).toBe('hello world');
  });
});

describe('tokenize', () => {
  test('splits on whitespace', () => {
    expect(tokenize('hello world test')).toEqual(['hello', 'world', 'test']);
  });

  test('returns empty array for empty input', () => {
    expect(tokenize('')).toEqual([]);
  });
});

describe('shingle', () => {
  test('creates set of word n-grams', () => {
    const words = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    const result = shingle(words, 4);
    expect(result.has('a b c d')).toBe(true);
    expect(result.has('b c d e')).toBe(true);
    expect(result.has('g h i j')).toBe(true);
  });

  test('returns empty set for fewer words than shingle size', () => {
    expect(shingle(['a', 'b'], 8).size).toBe(0);
  });

  test('default shingle size is 8', () => {
    const words = 'a b c d e f g h i j k l m n o p q r s t'.split(' ');
    const result = shingle(words);
    expect(result.size).toBe(13);
  });
});

describe('jaccard', () => {
  test('identical sets return 1', () => {
    const a = new Set(['a', 'b', 'c']);
    expect(jaccard(a, a)).toBe(1);
  });

  test('disjoint sets return 0', () => {
    const a = new Set(['a', 'b']);
    const b = new Set(['c', 'd']);
    expect(jaccard(a, b)).toBe(0);
  });

  test('half-overlapping sets return 0.5', () => {
    const a = new Set(['a', 'b', 'c']);
    const b = new Set(['b', 'c', 'd']);
    expect(jaccard(a, b)).toBeCloseTo(0.5, 5);
  });

  test('empty sets return 0', () => {
    expect(jaccard(new Set(), new Set())).toBe(0);
  });
});

describe('checkOriginality', () => {
  test('returns empty result for no files', () => {
    const result = checkOriginality({ files: [] });
    expect(result.files).toBe(0);
    expect(result.fails).toEqual([]);
    expect(result.warns).toEqual([]);
  });

  test('checks real skill files from root', () => {
    const result = checkOriginality({ rootDir: __dirname + '/..' });
    expect(result.files).toBeGreaterThanOrEqual(45);
    expect(result.worst).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.fails)).toBe(true);
    expect(Array.isArray(result.warns)).toBe(true);
  });
});

describe('formatReport', () => {
  test('formats empty result', () => {
    const result = { files: 0, worst: 0, fails: [], warns: [], passed: [], thresholds: { fail: 40, warn: 20 } };
    const report = formatReport(result);
    expect(report).toContain('Files checked: 0');
  });

  test('formats with failures', () => {
    const result = {
      files: 2,
      worst: 85,
      fails: [{ file: 'skills/a/index.js', match: 'skills/b/index.js', score: 85 }],
      warns: [],
      passed: [],
      thresholds: { fail: 40, warn: 20 }
    };
    const report = formatReport(result);
    expect(report).toContain('FAIL');
    expect(report).toContain('85');
  });

  test('formats with warnings', () => {
    const result = {
      files: 2,
      worst: 30,
      fails: [],
      warns: [{ file: 'skills/a/index.js', match: 'skills/b/index.js', score: 30 }],
      passed: [],
      thresholds: { fail: 40, warn: 20 }
    };
    const report = formatReport(result);
    expect(report).toContain('WARN');
  });
});
