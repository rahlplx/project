#!/usr/bin/env node

class Graphify {
  constructor() {
    this.name = 'graphify';
    this.version = '1.0.0';
    this.description = 'Semantic codebase understanding — builds a dependency graph from source files';
  }

  analyze(files = []) {
    if (!files.length) return { success: false, error: 'No files provided.' };

    const nodes = [];
    const edges = [];

    for (const file of files) {
      const name = file.name || file.path || 'unknown';
      const content = file.content || '';
      nodes.push({ id: name, type: 'file', label: name.split('/').pop() });

      const imports = this._extractImports(content);
      imports.forEach(imp => {
        if (!nodes.find(n => n.id === imp)) {
          nodes.push({ id: imp, type: 'dependency', label: imp });
        }
        edges.push({ from: name, to: imp, type: 'imports' });
      });
    }

    return {
      success: true,
      stats: { files: files.length, nodes: nodes.length, edges: edges.length },
      nodes,
      edges,
      summary: `${nodes.length} nodes, ${edges.length} edges in dependency graph`,
      timestamp: new Date().toISOString()
    };
  }

  _extractImports(content) {
    const imports = [];
    const patterns = [
      /require\(['"]([^'"]+)['"]\)/g,
      /from\s+['"]([^'"]+)['"]/g,
      /import\s+(?:\w+\s*,?\s*)*\s*from\s+['"]([^'"]+)['"]/g
    ];
    for (const pat of patterns) {
      let m;
      while ((m = pat.exec(content)) !== null) {
        imports.push(m[1]);
      }
    }
    return [...new Set(imports)];
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

module.exports = Graphify;
