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
});
