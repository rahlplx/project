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
});
