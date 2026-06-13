const WednesdayGraph = require('./index');

describe('WednesdayGraph', () => {
  it('should create instance', () => {
    const s = new WednesdayGraph();
    expect(s.name).toBe('wednesday-graph');
  });

  it('should analyze impact', () => {
    const s = new WednesdayGraph();
    const nodes = ['a', 'b', 'c'];
    const edges = [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }];
    const r = s.analyze(nodes, edges, 'a');
    expect(r.success).toBe(true);
    expect(r.impact.directly).toBe(1);
  });

  it('should detect transitive dependencies', () => {
    const s = new WednesdayGraph();
    const edges = [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }];
    const r = s.analyze([], edges, 'a');
    expect(r.impact.downstream).toBeGreaterThan(0);
  });

  it('should return success with zero impact for empty nodes and edges', () => {
    const s = new WednesdayGraph();
    const r = s.analyze([], [], 'a');
    expect(r.success).toBe(true);
    expect(r.impact.affected).toBe(1);
    expect(r.impact.directly).toBe(0);
    expect(r.impact.downstream).toBe(0);
    expect(r.impact.upstream).toBe(0);
  });

  it('should handle single node with no edges', () => {
    const s = new WednesdayGraph();
    const r = s.analyze(['a'], [], 'a');
    expect(r.success).toBe(true);
    expect(r.impact.affected).toBe(1);
    expect(r.affected).toEqual([]);
  });

  it('should ignore disconnected subgraphs', () => {
    const s = new WednesdayGraph();
    const edges = [{ from: 'a', to: 'b' }, { from: 'c', to: 'd' }];
    const r = s.analyze(['a', 'b', 'c', 'd'], edges, 'a');
    expect(r.success).toBe(true);
    expect(r.impact.affected).toBe(2);
    expect(r.affected).toEqual(['b']);
  });

  it('should return error for null or undefined inputs', () => {
    const s = new WednesdayGraph();
    const r1 = s.analyze(null, null, 'a');
    expect(r1.success).toBe(false);
    expect(r1.error).toBe('Nodes and edges required.');
    const r2 = s.analyze(undefined, undefined, 'a');
    expect(r2.success).toBe(false);
    expect(r2.error).toBe('Nodes and edges required.');
  });

  it('should handle self-referencing edges', () => {
    const s = new WednesdayGraph();
    const edges = [{ from: 'a', to: 'a' }];
    const r = s.analyze(['a'], edges, 'a');
    expect(r.success).toBe(true);
    expect(r.impact.directly).toBe(1);
    expect(r.impact.downstream).toBe(0);
    expect(r.impact.upstream).toBe(0);
  });
});
