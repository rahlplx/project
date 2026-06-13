const FlowchartGen = require('./index');

describe('FlowchartGen', () => {
  it('should create instance', () => {
    const s = new FlowchartGen();
    expect(s.name).toBe('flowchart-gen');
    expect(s.description).toBe('Generate architecture diagrams from code structure');
  });

  it('should generate flowchart with correct type and structure', () => {
    const s = new FlowchartGen();
    const result = s.generateFlowchart({
      functions: [{ name: 'foo', params: [], calls: ['bar'] }],
      classes: [],
      exports: [],
      imports: [],
      dependencies: []
    });
    expect(result.type).toBe('flowchart');
    expect(Array.isArray(result.nodes)).toBe(true);
    expect(Array.isArray(result.edges)).toBe(true);
    expect(result.nodes.length).toBeGreaterThan(0);
  });

  it('should detect correct node count for functions', () => {
    const s = new FlowchartGen();
    const result = s.generateFlowchart({
      functions: [
        { name: 'foo', params: [], line: 1 },
        { name: 'bar', params: [], line: 5 }
      ],
      classes: [],
      exports: [],
      imports: [],
      dependencies: []
    });
    const funcNodes = result.nodes.filter(n => n.id.startsWith('func_'));
    expect(funcNodes).toHaveLength(2);
  });

  it('should handle empty structure gracefully', () => {
    const s = new FlowchartGen();
    const result = s.generateFlowchart({ functions: [], classes: [], exports: [], imports: [], dependencies: [] });
    expect(result.type).toBe('flowchart');
    expect(result.nodes.length).toBe(2);
    expect(result.edges.length).toBeGreaterThanOrEqual(1);
  });

  it('should generate mermaid string starting with flowchart', () => {
    const s = new FlowchartGen();
    const nodes = [
      { id: 'entry', type: 'start', label: 'Start', shape: 'oval' },
      { id: 'exit', type: 'end', label: 'End', shape: 'oval' }
    ];
    const edges = [{ from: 'entry', to: 'exit', label: '' }];
    const mermaid = s.toMermaid(nodes, edges);
    expect(mermaid.startsWith('flowchart')).toBe(true);
  });

  it('should return ASCII representation', () => {
    const s = new FlowchartGen();
    const nodes = [
      { id: 'entry', type: 'start', label: 'Start', shape: 'oval' },
      { id: 'exit', type: 'end', label: 'End', shape: 'oval' }
    ];
    const edges = [{ from: 'entry', to: 'exit', label: '' }];
    const ascii = s.toAscii(nodes, edges);
    expect(ascii).toContain('FLOWCHART');
  });

  it('should change diagram layout with direction option', () => {
    const s = new FlowchartGen();
    const structure = {
      functions: [{ name: 'foo', params: [], line: 1 }],
      classes: [],
      exports: [],
      imports: [],
      dependencies: []
    };
    const result = s.generateFlowchart(structure, { direction: 'LR' });
    expect(result.direction).toBe('LR');
    expect(result.diagram.direction).toBe('LR');
  });

  it('should create instance with custom direction', () => {
    const s = new FlowchartGen({ direction: 'LR' });
    expect(s.direction).toBe('LR');
  });

  it('should generate YAML output', () => {
    const s = new FlowchartGen();
    const yaml = s.toYAML({ functions: [{ name: 'foo', params: [], line: 1 }], classes: [], exports: [], imports: [], dependencies: [] });
    expect(yaml).toContain('flowchart:');
    expect(yaml).toContain('nodes:');
    expect(yaml).toContain('edges:');
  });

  it('should parse source code into structure', () => {
    const s = new FlowchartGen();
    const code = 'import { something } from "dep";\nconst greet = () => {};\nclass App {}';
    const structure = s.parseCode(code);
    expect(structure.imports).toHaveLength(1);
    expect(structure.functions.length).toBeGreaterThanOrEqual(1);
    expect(structure.classes.length).toBeGreaterThanOrEqual(1);
  });

  it('should calculate positions for React Flow', () => {
    const s = new FlowchartGen();
    const pos = s.calculatePosition(0, 4);
    expect(pos).toHaveProperty('x');
    expect(pos).toHaveProperty('y');
    expect(typeof pos.x).toBe('number');
  });

  it('should generate React Flow structure', () => {
    const s = new FlowchartGen();
    const nodes = [
      { id: 'entry', type: 'start', label: 'Start', shape: 'oval' },
      { id: 'func_foo', type: 'process', label: 'foo', shape: 'rectangle' }
    ];
    const edges = [{ from: 'entry', to: 'func_foo', label: '' }];
    const rf = s.toReactFlow(nodes, edges);
    expect(rf.nodes).toHaveLength(2);
    expect(rf.edges).toHaveLength(1);
    expect(rf.edges[0].source).toBe('entry');
  });

  it('should generate SVG string', () => {
    const s = new FlowchartGen();
    const svg = s.toSVG([
      { id: 'entry', type: 'start', label: 'Start', shape: 'oval' }
    ], []);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('should generate JSON string', () => {
    const s = new FlowchartGen();
    const json = s.toJSON({ functions: [{ name: 'foo', params: [], line: 1 }], classes: [], exports: [], imports: [], dependencies: [] });
    expect(() => JSON.parse(json)).not.toThrow();
    const parsed = JSON.parse(json);
    expect(parsed.type).toBe('flowchart');
  });
});
