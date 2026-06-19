#!/usr/bin/env node
const { SkillBase } = require('../../../lib/skill-base.js');
/**
 * Faithful port of safishamsi/graphify (https://github.com/safishamsi/graphify) —
 * EXTRACTED/INFERRED/AMBIGUOUS edge tagging, god-node/surprising-connection
 * reporting, and the query/explain/path command surface. analyze()'s existing
 * node/edge shape is untouched (callers depend on its exact {from, to, type}
 * edge shape); everything below is additive.
 */

const CLI_COMMANDS = [
  { command: 'graphify .', description: 'Process the current directory into a graph.' },
  { command: 'graphify ./path --mode deep', description: 'Aggressive edge extraction.' },
  {
    command: 'graphify ./path --update',
    description: 'Merge changed files into an existing graph.',
  },
  { command: 'graphify query [question]', description: 'Search the graph.' },
  { command: 'graphify path [node1] [node2]', description: 'Trace connections between two nodes.' },
  { command: 'graphify explain [concept]', description: 'Detail a specific node.' },
  { command: 'graphify ./path --watch', description: 'Auto-sync the graph as files change.' },
  { command: 'graphify ./path --wiki', description: 'Generate markdown articles from the graph.' },
  { command: 'graphify hook install', description: 'Install post-commit automation.' },
];

class Graphify extends SkillBase {
  constructor() {
    super();
    this.name = 'graphify';
    this.version = '1.0.0';
    this.description =
      'Semantic codebase understanding — builds a dependency graph from source files';
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
      timestamp: new Date().toISOString(),
    };
  }

  _extractImports(content) {
    const imports = [];
    const patterns = [
      /require\(['"]([^'"]+)['"]\)/g,
      /from\s+['"]([^'"]+)['"]/g,
      /import\s+(?:\w+\s*,?\s*)*\s*from\s+['"]([^'"]+)['"]/g,
    ];
    for (const pat of patterns) {
      let m;
      while ((m = pat.exec(content)) !== null) {
        imports.push(m[1]);
      }
    }
    return [...new Set(imports)];
  }

  /**
   * Tag edges EXTRACTED/INFERRED/AMBIGUOUS. analyze()'s static-import edges are
   * always directly found in source, so they classify as EXTRACTED, confidence 1.0.
   * Callers that pass a `confidence` hint (e.g. for edges synthesized by other
   * tooling) get classified as INFERRED, or AMBIGUOUS below a 0.5 threshold.
   */
  classifyEdges(edges = []) {
    return edges.map(edge => {
      if (edge.confidence === undefined) {
        return { ...edge, tag: 'EXTRACTED', confidence: 1.0 };
      }
      if (edge.confidence < 0.5) {
        return { ...edge, tag: 'AMBIGUOUS' };
      }
      return { ...edge, tag: 'INFERRED' };
    });
  }

  /**
   * "God nodes" — the highest-degree concepts in the graph (GRAPH_REPORT.md).
   */
  godNodes(graph, topN = 5) {
    const degree = new Map();
    for (const node of graph.nodes || []) degree.set(node.id, 0);
    for (const edge of graph.edges || []) {
      degree.set(edge.from, (degree.get(edge.from) || 0) + 1);
      degree.set(edge.to, (degree.get(edge.to) || 0) + 1);
    }
    return [...degree.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([id, count]) => ({ id, degree: count }));
  }

  /**
   * Surprising connections — edges linking otherwise distant/low-degree nodes,
   * ranked by a composite score (low combined degree = more surprising).
   */
  surprisingConnections(graph, topN = 5) {
    const degree = new Map();
    for (const node of graph.nodes || []) degree.set(node.id, 0);
    for (const edge of graph.edges || []) {
      degree.set(edge.from, (degree.get(edge.from) || 0) + 1);
      degree.set(edge.to, (degree.get(edge.to) || 0) + 1);
    }
    return [...(graph.edges || [])]
      .map(edge => ({ ...edge, score: (degree.get(edge.from) || 0) + (degree.get(edge.to) || 0) }))
      .sort((a, b) => a.score - b.score)
      .slice(0, topN);
  }

  /**
   * Suggested questions the graph can uniquely answer, derived from its god nodes.
   */
  suggestedQuestions(graph) {
    return this.godNodes(graph, 3).map(n => `What depends on ${n.label || n.id}?`);
  }

  /**
   * GRAPH_REPORT.md equivalent: god nodes, surprising connections, suggested
   * questions, and stats.
   */
  buildReport(graph) {
    return {
      stats: graph.stats || {
        files: 0,
        nodes: (graph.nodes || []).length,
        edges: (graph.edges || []).length,
      },
      godNodes: this.godNodes(graph),
      surprisingConnections: this.surprisingConnections(graph),
      suggestedQuestions: this.suggestedQuestions(graph),
    };
  }

  /**
   * Keyword search over node ids/labels (graphify query [question]).
   */
  query(graph, question = '') {
    const terms = question.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return (graph.nodes || []).filter(node => {
      const haystack = `${node.id} ${node.label || ''}`.toLowerCase();
      return terms.some(term => haystack.includes(term));
    });
  }

  /**
   * Shortest path between two nodes via BFS over edges (graphify path [a] [b]).
   */
  tracePath(graph, fromId, toId) {
    const adjacency = new Map();
    for (const edge of graph.edges || []) {
      if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
      adjacency.get(edge.from).push(edge.to);
    }

    const queue = [[fromId]];
    const visited = new Set([fromId]);
    while (queue.length) {
      const path = queue.shift();
      const last = path[path.length - 1];
      if (last === toId) return { found: true, path };
      for (const next of adjacency.get(last) || []) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push([...path, next]);
        }
      }
    }
    return { found: false, path: [] };
  }

  /**
   * Detail a specific node: itself plus all edges touching it (graphify explain [concept]).
   */
  explain(graph, nodeId) {
    const node = (graph.nodes || []).find(n => n.id === nodeId);
    if (!node) return { found: false };
    const edges = (graph.edges || []).filter(e => e.from === nodeId || e.to === nodeId);
    return { found: true, node, edges };
  }

  /**
   * Blast radius — every node transitively affected if `nodeId` changes, found by
   * walking edges backward (Understand-Anything's diff-impact-analysis idea).
   */
  blastRadius(graph, nodeId) {
    const reverseAdjacency = new Map();
    for (const edge of graph.edges || []) {
      if (!reverseAdjacency.has(edge.to)) reverseAdjacency.set(edge.to, []);
      reverseAdjacency.get(edge.to).push(edge.from);
    }

    const visited = new Set([nodeId]);
    const queue = [nodeId];
    while (queue.length) {
      const current = queue.shift();
      for (const dependent of reverseAdjacency.get(current) || []) {
        if (!visited.has(dependent)) {
          visited.add(dependent);
          queue.push(dependent);
        }
      }
    }
    visited.delete(nodeId);

    return { nodeId, affected: [...visited], count: visited.size };
  }

  /**
   * Groups nodes into architectural layers by id/path keyword heuristics
   * (Understand-Anything's layer visualization).
   */
  layerize(graph) {
    const LAYER_RULES = [
      { layer: 'API', pattern: /\b(api|route|controller|endpoint)\b/i },
      { layer: 'Service', pattern: /\b(service|logic|usecase|handler)\b/i },
      { layer: 'Data', pattern: /\b(model|schema|db|database|repository|migration)\b/i },
      { layer: 'UI', pattern: /\b(component|view|page|ui|screen)\b/i },
    ];

    const layers = { API: [], Service: [], Data: [], UI: [], Utility: [] };
    for (const node of graph.nodes || []) {
      const haystack = `${node.id} ${node.label || ''}`;
      const match = LAYER_RULES.find(rule => rule.pattern.test(haystack));
      layers[match ? match.layer : 'Utility'].push(node.id);
    }
    return layers;
  }

  /**
   * 0-100 risk score combining a node's degree with inverse test coverage —
   * untested, highly-connected nodes score highest (wednesday-solutions/ai-agent-skills'
   * risk-scoring idea). `testCoverage` maps node id -> coverage fraction (0-1, default 0).
   */
  riskScore(graph, nodeId, testCoverage = {}) {
    const degrees = this.godNodes(graph, (graph.nodes || []).length);
    const maxDegree = Math.max(1, ...degrees.map(d => d.degree));
    const nodeDegree = degrees.find(d => d.id === nodeId);
    const degreeScore = ((nodeDegree ? nodeDegree.degree : 0) / maxDegree) * 60;

    const coverage = testCoverage[nodeId] || 0;
    const coverageScore = (1 - Math.min(1, Math.max(0, coverage))) * 40;

    return Math.round(degreeScore + coverageScore);
  }

  getCommands() {
    return CLI_COMMANDS;
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

module.exports = Graphify;
