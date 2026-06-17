const Dashboard = require('./index');

describe('Dashboard', () => {
  it('should create instance with defaults', () => {
    const s = new Dashboard();
    expect(s.name).toBe('dashboard');
    expect(s.version).toBe('1.0.0');
  });

  it('should generate report from tracker data', () => {
    const s = new Dashboard();
    const data = {
      projectName: 'Test',
      tasks: [
        { id: '1', status: 'done' },
        { id: '2', status: 'in-progress' },
        { id: '3', status: 'todo' },
      ],
    };
    const r = s.generateReport(data);
    expect(r.project).toBe('Test');
    expect(r.progress).toBe(33);
    expect(r.summary.total).toBe(3);
    expect(r.summary.done).toBe(1);
  });

  it('should handle empty tasks', () => {
    const s = new Dashboard();
    const r = s.generateReport({});
    expect(r.progress).toBe(0);
    expect(r.summary.total).toBe(0);
  });

  it('should return 0 progress with no done tasks', () => {
    const s = new Dashboard();
    const r = s.generateReport({ tasks: [{ id: '1', status: 'todo' }] });
    expect(r.progress).toBe(0);
  });

  it('should return 100 progress with all done', () => {
    const s = new Dashboard();
    const r = s.generateReport({ tasks: [{ id: '1', status: 'done' }] });
    expect(r.progress).toBe(100);
  });

  it('should detect blockers', () => {
    const s = new Dashboard();
    const r = s.generateReport({
      tasks: [
        { id: '1', status: 'in-progress', blocker: true },
        { id: '2', status: 'done', blocker: false },
      ],
    });
    expect(r.summary.blockers).toBe(1);
  });

  it('should include phase breakdown', () => {
    const s = new Dashboard();
    const r = s.generateReport({ tasks: [] });
    expect(r.phases.length).toBeGreaterThan(0);
    expect(r.phases[0]).toHaveProperty('phase');
    expect(r.phases[0]).toHaveProperty('count');
  });

  it('should generate recommendations', () => {
    const s = new Dashboard();
    const r = s.generateReport({ tasks: [{ id: '1', status: 'todo' }] });
    expect(r.recommendations.length).toBeGreaterThan(0);
  });

  it('should include timeline estimate', () => {
    const s = new Dashboard();
    const r = s.generateReport({ tasks: [{ id: '1', status: 'done' }] });
    expect(r.timeline).toHaveProperty('estimatedCompletion');
  });

  it('should render ASCII representation', () => {
    const s = new Dashboard();
    const r = s.generateReport({ projectName: 'X', tasks: [{ id: '1', status: 'done' }] });
    const ascii = s.renderAscii(r);
    expect(ascii).toContain('100%');
    expect(ascii).toContain('X');
  });
});
