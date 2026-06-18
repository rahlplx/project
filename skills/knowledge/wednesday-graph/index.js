#!/usr/bin/env node

class WednesdayGraph {
  constructor() {
    this.name = 'wednesday-graph';
    this.version = '1.0.0';
    this.description = 'Dependency analysis — answers "what breaks if I change this?"';
  }

  analyze(nodes, edges, target) {
    if (!nodes || !edges) return { success: false, error: 'Nodes and edges required.' };

    const allTargets = [
      target,
      ...edges.filter(e => e.from === target || e.to === target).flatMap(e => [e.from, e.to]),
    ];
    const unique = [...new Set(allTargets.filter(Boolean))];

    const direct = edges.filter(e => e.from === target || e.to === target);
    const downstream = this._traverse(edges, target, 'from');
    const upstream = this._traverse(edges, target, 'to');

    return {
      success: true,
      target,
      impact: {
        affected: unique.length,
        directly: direct.length,
        downstream: downstream.length,
        upstream: upstream.length,
      },
      affected: [
        ...new Set([
          ...direct.map(e => (e.from === target ? e.to : e.from)),
          ...downstream,
          ...upstream,
        ]),
      ],
      walk: [
        ...direct.map(e => `${e.from} → ${e.to} (direct)`),
        ...downstream.map(n => `${target} → ${n} (transitive)`),
        ...upstream.map(n => `${n} → ${target} (depends on)`),
      ],
      summary: `Changing "${target}" affects ${unique.length} node(s) — ${direct.length} direct, ${downstream.length} transitive.`,
      timestamp: new Date().toISOString(),
    };
  }

  _traverse(edges, start, dir) {
    const visited = new Set();
    const queue = [start];
    while (queue.length > 0) {
      const current = queue.shift();
      const next = edges
        .filter(e => (dir === 'from' ? e.from === current : e.to === current))
        .map(e => (dir === 'from' ? e.to : e.from))
        .filter(n => !visited.has(n) && n !== start);
      next.forEach(n => {
        visited.add(n);
        queue.push(n);
      });
    }
    return [...visited];
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

module.exports = WednesdayGraph;
