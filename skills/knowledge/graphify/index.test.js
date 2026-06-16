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

  it('should tag static-import edges as EXTRACTED with confidence 1.0', () => {
    const s = new Graphify();
    const r = s.analyze([{ name: 'app.js', content: 'import React from "react";' }]);
    const tagged = s.classifyEdges(r.edges);
    expect(tagged[0].tag).toBe('EXTRACTED');
    expect(tagged[0].confidence).toBe(1.0);
  });

  it('should tag low-confidence edges as AMBIGUOUS and mid-confidence as INFERRED', () => {
    const s = new Graphify();
    const tagged = s.classifyEdges([
      { from: 'a', to: 'b', type: 'related', confidence: 0.3 },
      { from: 'a', to: 'c', type: 'related', confidence: 0.8 }
    ]);
    expect(tagged[0].tag).toBe('AMBIGUOUS');
    expect(tagged[1].tag).toBe('INFERRED');
  });

  it('should rank god nodes by degree', () => {
    const s = new Graphify();
    const r = s.analyze([
      { name: 'a.js', content: 'require("./shared");' },
      { name: 'b.js', content: 'require("./shared");' },
      { name: 'c.js', content: 'require("./shared");' }
    ]);
    const gods = s.godNodes(r, 1);
    expect(gods[0].id).toBe('./shared');
    expect(gods[0].degree).toBe(3);
  });

  it('should build a GRAPH_REPORT.md-equivalent report', () => {
    const s = new Graphify();
    const r = s.analyze([{ name: 'a.js', content: 'require("./shared");' }]);
    const report = s.buildReport(r);
    expect(report).toHaveProperty('stats');
    expect(report).toHaveProperty('godNodes');
    expect(report).toHaveProperty('surprisingConnections');
    expect(report).toHaveProperty('suggestedQuestions');
  });

  it('should query nodes by keyword', () => {
    const s = new Graphify();
    const r = s.analyze([{ name: 'app.js', content: 'import React from "react";' }]);
    const matches = s.query(r, 'react');
    expect(matches.some((n) => n.id === 'react')).toBe(true);
  });

  it('should trace the shortest path between two nodes', () => {
    const s = new Graphify();
    const r = s.analyze([
      { name: 'a.js', content: 'require("b.js");' },
      { name: 'b.js', content: 'require("c.js");' }
    ]);
    const result = s.tracePath(r, 'a.js', 'c.js');
    expect(result.found).toBe(true);
    expect(result.path).toEqual(['a.js', 'b.js', 'c.js']);
  });

  it('should report no path when nodes are disconnected', () => {
    const s = new Graphify();
    const r = s.analyze([{ name: 'a.js', content: 'require("./b");' }]);
    const result = s.tracePath(r, 'a.js', 'nonexistent');
    expect(result.found).toBe(false);
  });

  it('should explain a node by id', () => {
    const s = new Graphify();
    const r = s.analyze([{ name: 'app.js', content: 'import React from "react";' }]);
    const explanation = s.explain(r, 'react');
    expect(explanation.found).toBe(true);
    expect(explanation.edges.length).toBe(1);
  });

  it('should list the CLI command surface', () => {
    const s = new Graphify();
    expect(s.getCommands().some((c) => c.command.startsWith('graphify query'))).toBe(true);
  });
});
