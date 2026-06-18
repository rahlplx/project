/**
 * Flowchart Gen Skill
 * Auto-generate architecture diagrams from code structure
 */

class FlowchartGen {
  constructor(options = {}) {
    this.name = 'flowchart-gen';
    this.description = 'Generate architecture diagrams from code structure';
    this.direction = options.direction || 'TB'; // TB (top-bottom), LR (left-right), RL, BT
    this.showDetails = options.showDetails !== false;
    this.maxDepth = options.maxDepth || 10;
  }

  /**
   * Generate a flowchart from code structure
   * @param {Object|string} codeStructure - Parsed code structure or source code
   * @param {Object} options - Generation options
   * @returns {Object} Flowchart definition
   */
  generateFlowchart(codeStructure, options = {}) {
    const structure =
      typeof codeStructure === 'string' ? this.parseCode(codeStructure) : codeStructure;

    const nodes = this.extractNodes(structure);
    const edges = this.extractEdges(structure);
    const diagram = this.buildDiagram(nodes, edges, options);

    return {
      type: 'flowchart',
      timestamp: new Date().toISOString(),
      direction: options.direction || this.direction,
      nodes,
      edges,
      diagram,
      mermaid: this.toMermaid(nodes, edges, options),
      ascii: this.toAscii(nodes, edges, options),
    };
  }

  /**
   * Parse source code into structure
   */
  parseCode(code) {
    const structure = {
      imports: [],
      exports: [],
      functions: [],
      classes: [],
      dependencies: [],
    };

    const lines = code.split('\n');

    for (const line of lines) {
      // Extract imports
      const importMatch = line.match(/^import\s+(?:{[^}]+}|[^;]+)\s+from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        structure.imports.push(importMatch[1]);
        structure.dependencies.push(importMatch[1]);
      }

      // Extract exports
      const exportMatch = line.match(/^export\s+(?:default\s+)?(?:const|function|class)\s+(\w+)/);
      if (exportMatch) {
        structure.exports.push(exportMatch[1]);
      }

      // Extract function declarations
      const funcMatch = line.match(/(?:const|function)\s+(\w+)\s*[=(]/);
      if (funcMatch && !line.includes('import')) {
        structure.functions.push({
          name: funcMatch[1],
          line: this.getLineNumber(lines, line),
        });
      }

      // Extract class declarations
      const classMatch = line.match(/class\s+(\w+)/);
      if (classMatch) {
        const classInfo = {
          name: classMatch[1],
          line: this.getLineNumber(lines, line),
          methods: [],
          extends: null,
        };

        // Check for extends
        const extendsMatch = line.match(/extends\s+(\w+)/);
        if (extendsMatch) {
          classInfo.extends = extendsMatch[1];
          structure.dependencies.push(extendsMatch[1]);
        }

        structure.classes.push(classInfo);
      }

      // Extract require statements
      const requireMatch = line.match(/require\(['"]([^'"]+)['"]\)/);
      if (requireMatch) {
        structure.dependencies.push(requireMatch[1]);
      }
    }

    // Extract method definitions within classes
    for (let i = 0; i < lines.length; i++) {
      const methodMatch = lines[i].match(/^\s*(?:async\s+)?(\w+)\s*\([^)]*\)\s*[{:]/);
      if (methodMatch && !['const', 'let', 'var', 'if', 'for', 'while'].includes(methodMatch[1])) {
        for (const cls of structure.classes) {
          if (i > cls.line && i < cls.line + 50) {
            cls.methods.push(methodMatch[1]);
          }
        }
      }
    }

    return structure;
  }

  /**
   * Get line number of a string in array
   */
  getLineNumber(lines, targetLine) {
    return lines.indexOf(targetLine) + 1;
  }

  /**
   * Extract nodes from structure
   */
  extractNodes(structure) {
    const nodes = [];

    // Add entry point node
    nodes.push({
      id: 'entry',
      type: 'start',
      label: 'Start',
      shape: 'oval',
    });

    // Add module node
    if (structure.imports.length > 0 || structure.exports.length > 0) {
      nodes.push({
        id: 'module',
        type: 'process',
        label: 'Module',
        shape: 'rectangle',
      });
    }

    // Add function nodes
    for (const func of structure.functions) {
      nodes.push({
        id: `func_${func.name}`,
        type: 'process',
        label: func.name,
        shape: 'rectangle',
        details: `Line ${func.line}`,
      });
    }

    // Add class nodes
    for (const cls of structure.classes) {
      nodes.push({
        id: `class_${cls.name}`,
        type: 'process',
        label: cls.name,
        shape: 'rectangle',
        details: cls.methods.length > 0 ? `Methods: ${cls.methods.join(', ')}` : null,
      });
    }

    // Add external dependency nodes
    const uniqueDeps = [...new Set(structure.dependencies)];
    for (const dep of uniqueDeps.slice(0, 5)) {
      if (!structure.classes.some(c => c.name === dep)) {
        nodes.push({
          id: `dep_${dep.replace(/[^a-zA-Z0-9]/g, '_')}`,
          type: 'external',
          label: dep,
          shape: 'diamond',
        });
      }
    }

    // Add exit node
    nodes.push({
      id: 'exit',
      type: 'end',
      label: 'End',
      shape: 'oval',
    });

    return nodes;
  }

  /**
   * Extract edges from structure
   */
  extractEdges(structure) {
    const edges = [];

    // Entry to module/first function
    if (structure.imports.length > 0 || structure.exports.length > 0) {
      edges.push({ from: 'entry', to: 'module', label: '' });
    } else if (structure.functions.length > 0) {
      edges.push({ from: 'entry', to: `func_${structure.functions[0].name}`, label: '' });
    }

    // Module to functions/classes
    if (structure.functions.length > 0) {
      edges.push({ from: 'module', to: `func_${structure.functions[0].name}`, label: '' });
    }
    if (structure.classes.length > 0) {
      edges.push({ from: 'module', to: `class_${structure.classes[0].name}`, label: '' });
    }

    // Connect functions sequentially
    for (let i = 1; i < structure.functions.length; i++) {
      edges.push({
        from: `func_${structure.functions[i - 1].name}`,
        to: `func_${structure.functions[i].name}`,
        label: '',
      });
    }

    // Connect classes to functions they might call
    for (const cls of structure.classes) {
      for (const func of structure.functions) {
        if (this.mightCall(cls, func, structure)) {
          edges.push({
            from: `class_${cls.name}`,
            to: `func_${func.name}`,
            label: 'calls',
          });
        }
      }
    }

    // Dependencies
    for (const dep of structure.dependencies) {
      const depId = `dep_${dep.replace(/[^a-zA-Z0-9]/g, '_')}`;
      if (structure.imports.some(i => i.includes(dep))) {
        const sourceNode =
          structure.classes.length > 0
            ? `class_${structure.classes[0].name}`
            : structure.functions.length > 0
              ? `func_${structure.functions[0].name}`
              : 'module';
        edges.push({ from: sourceNode, to: depId, label: 'imports' });
      }
    }

    // Connect to exit
    if (structure.functions.length > 0) {
      edges.push({
        from: `func_${structure.functions[structure.functions.length - 1].name}`,
        to: 'exit',
        label: '',
      });
    } else if (structure.classes.length > 0) {
      edges.push({ from: `class_${structure.classes[0].name}`, to: 'exit', label: '' });
    } else {
      edges.push({ from: 'module', to: 'exit', label: '' });
    }

    return edges;
  }

  /**
   * Heuristic to determine if a class might call a function
   */
  mightCall(cls, func, _structure) {
    // Simple heuristic: check if function name suggests it belongs to the class
    const funcLower = func.name.toLowerCase();
    const classLower = cls.name.toLowerCase();

    return (
      funcLower.includes(classLower) ||
      classLower.includes(funcLower) ||
      funcLower.startsWith('handle') ||
      funcLower.startsWith('get') ||
      funcLower.startsWith('set')
    );
  }

  /**
   * Build diagram structure
   */
  buildDiagram(nodes, edges, options = {}) {
    return {
      nodes: nodes.map(n => ({
        id: n.id,
        label: n.label,
        type: n.type,
        shape: n.shape,
        ...(this.showDetails && n.details ? { description: n.details } : {}),
      })),
      edges: edges.map(e => ({
        from: e.from,
        to: e.to,
        label: e.label,
      })),
      direction: options.direction || this.direction,
    };
  }

  /**
   * Convert to Mermaid flowchart syntax
   */
  toMermaid(nodes, edges, options = {}) {
    const direction = options.direction || this.direction;
    const dirMap = {
      TB: 'TD',
      LR: 'LR',
      RL: 'RL',
      BT: 'BT',
    };

    let mermaid = `flowchart ${dirMap[direction] || 'TD'}\n`;

    // Define node styles
    mermaid += '    %% Node definitions\n';
    for (const node of nodes) {
      const escapedLabel = node.label.replace(/"/g, "'");
      if (node.type === 'start' || node.type === 'end') {
        mermaid += `    ${node.id}((${escapedLabel}))\n`;
      } else if (node.type === 'external') {
        mermaid += `    ${node.id}{${escapedLabel}}\n`;
      } else {
        mermaid += `    ${node.id}[${escapedLabel}]\n`;
      }
    }

    mermaid += '\n    %% Connections\n';
    for (const edge of edges) {
      const label = edge.label ? `|${edge.label}|` : '';
      mermaid += `    ${edge.from} -->${label} ${edge.to}\n`;
    }

    // Add styling
    mermaid += '\n    %% Styling\n';
    mermaid += '    style entry fill:#90EE90,stroke:#228B22,stroke-width:2px\n';
    mermaid += '    style exit fill:#FFB6C1,stroke:#DC143C,stroke-width:2px\n';
    mermaid += '    classDef external fill:#FFE4B5,stroke:#FF8C00\n';
    mermaid += '    classDef process fill:#E6E6FA,stroke:#9370DB\n';

    return mermaid;
  }

  /**
   * Generate ASCII art flowchart
   */
  toAscii(nodes, edges, options = {}) {
    const lines = [];
    const maxWidth = 60;

    // Build adjacency list
    const adj = {};
    for (const edge of edges) {
      if (!adj[edge.from]) adj[edge.from] = [];
      adj[edge.from].push({ to: edge.to, label: edge.label });
    }

    // Traverse from entry
    const visited = new Set();
    const queue = ['entry'];

    lines.push('┌────────────────────────────────────────┐');
    lines.push('│              FLOWCHART                  │');
    lines.push('└────────────────────────────────────────┘');
    lines.push('');

    while (queue.length > 0) {
      const current = queue.shift();
      if (visited.has(current)) continue;
      visited.add(current);

      const node = nodes.find(n => n.id === current);
      if (!node) continue;

      // Draw node
      const label =
        node.label.length > maxWidth - 10
          ? node.label.substring(0, maxWidth - 13) + '...'
          : node.label;

      if (node.type === 'start' || node.type === 'end') {
        lines.push('        ╭─────────────╮');
        lines.push(`        │  ${label.padEnd(11)}  │`);
        lines.push('        ╰─────────────╯');
      } else if (node.type === 'external') {
        lines.push(`      ◇ ${label} ◇`);
      } else {
        lines.push('      ┌─────────────┐');
        lines.push(`      │ ${label.padEnd(11)} │`);
        lines.push('      └─────────────┘');
      }

      // Draw edges
      const children = adj[current] || [];
      for (const child of children) {
        lines.push('            │');
        if (child.label) {
          lines.push(`            ↓ ${child.label}`);
        } else {
          lines.push('            ↓');
        }
        queue.push(child.to);
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate React Flow compatible structure
   */
  toReactFlow(nodes, edges) {
    const reactNodes = nodes.map((node, index) => ({
      id: node.id,
      type: node.shape === 'oval' ? 'input' : 'default',
      data: { label: node.label },
      position: this.calculatePosition(index, nodes.length),
    }));

    const reactEdges = edges.map(edge => ({
      id: `${edge.from}-${edge.to}`,
      source: edge.from,
      target: edge.to,
      label: edge.label,
      type: 'smoothstep',
    }));

    return { nodes: reactNodes, edges: reactEdges };
  }

  /**
   * Calculate node positions for React Flow
   */
  calculatePosition(index, total) {
    const cols = Math.ceil(Math.sqrt(total));
    const row = Math.floor(index / cols);
    const col = index % cols;

    return {
      x: col * 250 + 100,
      y: row * 150 + 50,
    };
  }

  /**
   * Generate SVG diagram
   */
  toSVG(nodes, edges, options = {}) {
    const width = options.width || 800;
    const height = options.height || 600;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">\n`;
    svg += `  <style>
    .node-rect { fill: #e6e6fa; stroke: #9370db; stroke-width: 2; }
    .node-circle { fill: #90ee90; stroke: #228b22; stroke-width: 2; }
    .node-diamond { fill: #ffe4b5; stroke: #ff8c00; stroke-width: 2; }
    .edge { stroke: #666; stroke-width: 2; fill: none; marker-end: url(#arrow); }
    .label { font-family: Arial; font-size: 12px; fill: #333; }
  </style>\n`;
    svg += `  <defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
    <path d="M0,0 L0,6 L9,3 z" fill="#666" /></marker></defs>\n`;

    const positions = {};
    nodes.forEach((node, i) => {
      positions[node.id] = this.calculatePosition(i, nodes.length);
    });

    for (const edge of edges) {
      const from = positions[edge.from];
      const to = positions[edge.to];
      if (from && to) {
        svg += `  <line class="edge" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" />\n`;
      }
    }

    for (const node of nodes) {
      const pos = positions[node.id];
      if (!pos) continue;

      if (node.shape === 'oval') {
        svg += `  <ellipse class="node-circle" cx="${pos.x}" cy="${pos.y}" rx="50" ry="25" />\n`;
        svg += `  <text class="label" x="${pos.x}" y="${pos.y + 5}" text-anchor="middle">${node.label}</text>\n`;
      } else if (node.shape === 'diamond') {
        svg += `  <polygon class="node-diamond" points="${pos.x},${pos.y - 20} ${pos.x + 50},${pos.y} ${pos.x},${pos.y + 20} ${pos.x - 50},${pos.y}" />\n`;
        svg += `  <text class="label" x="${pos.x}" y="${pos.y + 4}" text-anchor="middle">${node.label}</text>\n`;
      } else {
        svg += `  <rect class="node-rect" x="${pos.x - 50}" y="${pos.y - 20}" width="100" height="40" rx="5" />\n`;
        svg += `  <text class="label" x="${pos.x}" y="${pos.y + 5}" text-anchor="middle">${node.label}</text>\n`;
      }
    }

    svg += '</svg>';
    return svg;
  }

  /**
   * Export to JSON
   */
  toJSON(codeStructure, options = {}) {
    const result = this.generateFlowchart(codeStructure, options);
    return JSON.stringify(result, null, 2);
  }

  /**
   * Export to YAML-like format
   */
  toYAML(codeStructure, options = {}) {
    const result = this.generateFlowchart(codeStructure, options);
    let yaml = `flowchart:
  direction: ${result.direction}
  timestamp: ${result.timestamp}

nodes:
`;
    for (const node of result.nodes) {
      yaml += `  - id: ${node.id}\n`;
      yaml += `    label: ${node.label}\n`;
      yaml += `    type: ${node.type}\n`;
      if (node.details) yaml += `    details: ${node.details}\n`;
    }

    yaml += '\nedges:\n';
    for (const edge of result.edges) {
      yaml += `  - from: ${edge.from}\n`;
      yaml += `    to: ${edge.to}\n`;
      if (edge.label) yaml += `    label: ${edge.label}\n`;
    }

    return yaml;
  }
}

module.exports = FlowchartGen;
