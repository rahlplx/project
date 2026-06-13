const Graphify = require('./index');

describe('Graphify', () => {
  it('should create instance', () => {
    const s = new Graphify();
    expect(s.name).toBe('graphify');
  });

  it('should analyze files', () => {
    const s = new Graphify();
    const r = s.analyze([{ name: 'index.js', content: 'const fs = require("fs");' }]);
    expect(r.success).toBe(true);
    expect(r.nodes.length).toBeGreaterThan(0);
  });

  it('should extract imports', () => {
    const s = new Graphify();
    const r = s.analyze([{ name: 'app.js', content: 'import React from "react";' }]);
    expect(r.edges.some(e => e.to === 'react')).toBe(true);
  });

  it('should return error for empty file array', () => {
    const s = new Graphify();
    const r = s.analyze([]);
    expect(r.success).toBe(false);
    expect(r.error).toBe('No files provided.');
  });

  it('should handle files with no imports', () => {
    const s = new Graphify();
    const r = s.analyze([{ name: 'empty.js', content: 'const x = 1;' }]);
    expect(r.success).toBe(true);
    expect(r.stats.nodes).toBe(1);
    expect(r.stats.edges).toBe(0);
  });

  it('should detect circular imports between files', () => {
    const s = new Graphify();
    const r = s.analyze([
      { name: 'a.js', content: 'const b = require("./b");' },
      { name: 'b.js', content: 'const a = require("./a");' }
    ]);
    expect(r.success).toBe(true);
    expect(r.edges.length).toBe(2);
    expect(r.edges[0]).toEqual({ from: 'a.js', to: './b', type: 'imports' });
    expect(r.edges[1]).toEqual({ from: 'b.js', to: './a', type: 'imports' });
  });

  it('should handle malformed file content gracefully', () => {
    const s = new Graphify();
    const r = s.analyze([{ name: 'broken.js', content: null }]);
    expect(r.success).toBe(true);
    expect(r.stats.nodes).toBe(1);
    expect(r.stats.edges).toBe(0);
  });
});
