const DiffPreview = require('./index');

describe('DiffPreview', () => {
  it('should create instance', () => {
    const s = new DiffPreview();
    expect(s.name).toBe('diff-preview');
  });

  it('should generate diff with stats', () => {
    const s = new DiffPreview();
    const result = s.generateDiff('a\nb\nc', 'a\nd\nc');
    expect(result).toHaveProperty('type', 'diff');
    expect(result).toHaveProperty('stats');
    expect(result.stats).toHaveProperty('additions');
    expect(result.stats).toHaveProperty('deletions');
    expect(result.stats).toHaveProperty('totalChanges');
  });

  it('should compute diff showing one change', () => {
    const s = new DiffPreview();
    const oldLines = ['a', 'b', 'c'];
    const newLines = ['a', 'd', 'c'];
    const diff = s.computeDiff(oldLines, newLines);
    const added = diff.filter(d => d.type === 'added');
    const removed = diff.filter(d => d.type === 'removed');
    expect(added.length).toBe(1);
    expect(removed.length).toBe(1);
    expect(added[0].content).toBe('d');
    expect(removed[0].content).toBe('b');
  });

  it('should handle empty input', () => {
    const s = new DiffPreview();
    const result = s.generateDiff('', '');
    expect(result.stats.additions).toBe(0);
    expect(result.stats.deletions).toBe(0);
    expect(result.stats.totalChanges).toBe(0);
  });

  it('should detect additions', () => {
    const s = new DiffPreview();
    const result = s.generateDiff('a\nb\nc', 'a\nb\nc\nd\ne');
    expect(result.stats.additions).toBe(2);
    expect(result.stats.deletions).toBe(0);
  });

  it('should detect deletions', () => {
    const s = new DiffPreview();
    const result = s.generateDiff('a\nb\nc\nd\ne', 'a\nb\nc');
    expect(result.stats.deletions).toBe(2);
    expect(result.stats.additions).toBe(0);
  });

  it('should render visual diff', () => {
    const s = new DiffPreview();
    const diff = s.computeDiff(['a', 'b', 'c'], ['a', 'd', 'c']);
    const visual = s.renderVisualDiff(diff);
    expect(typeof visual).toBe('string');
    expect(visual.length).toBeGreaterThan(0);
  });

  it('should group changes into hunks', () => {
    const s = new DiffPreview();
    const diff = s.computeDiff(['a', 'b', 'c', 'd'], ['a', 'x', 'c', 'y']);
    const hunks = s.groupIntoHunks(diff);
    expect(Array.isArray(hunks)).toBe(true);
    expect(hunks.length).toBeGreaterThan(0);
    expect(hunks[0]).toHaveProperty('changes');
  });

  it('should generate summary', () => {
    const s = new DiffPreview();
    const diff = s.computeDiff(['a', 'b', 'c'], ['a', 'd', 'c']);
    const summary = s.generateSummary(diff);
    expect(typeof summary).toBe('string');
    expect(summary).toContain('addition');
    expect(summary).toContain('deletion');
  });

  it('should return no changes summary for empty diff', () => {
    const s = new DiffPreview();
    const diff = s.computeDiff(['a'], ['a']);
    const summary = s.generateSummary(diff);
    expect(summary).toBe('No changes detected.');
  });

  it('should respect contextLines option', () => {
    const s = new DiffPreview({ contextLines: 1 });
    const result = s.generateDiff('a\nb\nc\nd\ne', 'a\nb\nx\nd\ne', { contextLines: 1 });
    expect(result).toHaveProperty('stats');
    expect(result.stats.totalChanges).toBe(2);
    expect(result.hunks.length).toBeGreaterThan(0);
  });

  it('should render side-by-side diff', () => {
    const s = new DiffPreview();
    const lines = s.renderSideBySide('a\nb\nc', 'a\nd\nc');
    expect(Array.isArray(lines)).toBe(true);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines[0]).toHaveProperty('type');
  });

  it('should generate unified diff', () => {
    const s = new DiffPreview();
    const output = s.generateUnifiedDiff('a\nb\nc', 'a\nd\nc');
    expect(output).toContain('---');
    expect(output).toContain('+++');
  });

  it('should export diff as JSON', () => {
    const s = new DiffPreview();
    const json = s.toJSON('a\nb\nc', 'a\nd\nc');
    expect(typeof json).toBe('string');
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('should export diff as HTML', () => {
    const s = new DiffPreview();
    const html = s.toHTML('a\nb\nc', 'a\nd\nc');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('diff-container');
  });
});
