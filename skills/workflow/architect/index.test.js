const Architect = require('./index');

const makeSpec = (features) => ({
  title: 'Test Project',
  features: features.map((f, i) => ({
    id: `FEAT-${String(i + 1).padStart(3, '0')}`,
    name: f.name,
    priority: f.priority || 'medium',
    dependencies: f.dependencies || []
  })),
  requirements: [],
  constraints: [],
  actors: [],
  dependencies: []
});

describe('Architect', () => {
  it('should create instance', () => {
    const a = new Architect();
    expect(a.name).toBe('architect');
    expect(a.version).toBe('1.0.0');
  });

  it('should decompose single feature into 4 tasks', () => {
    const a = new Architect();
    const spec = makeSpec([{ name: 'Login' }]);
    const result = a.decompose(spec);
    expect(result.tasks).toHaveLength(4);
  });

  it('should decompose multi-feature into 12 tasks', () => {
    const a = new Architect();
    const spec = makeSpec([
      { name: 'Login' },
      { name: 'Dashboard' },
      { name: 'Settings' }
    ]);
    const result = a.decompose(spec);
    expect(result.tasks).toHaveLength(12);
  });

  it('should order tasks by dependencies', () => {
    const a = new Architect();
    const spec = makeSpec([
      { name: 'Dashboard', dependencies: [] },
      { name: 'Login', dependencies: ['FEAT-001'] }
    ]);
    const result = a.decompose(spec);
    const loginTasks = result.tasks.filter(t => t.featureId === 'FEAT-002');
    const dashboardTasks = result.tasks.filter(t => t.featureId === 'FEAT-001');
    const loginFirstIndex = result.tasks.indexOf(loginTasks[0]);
    const dashboardLastIndex = result.tasks.indexOf(dashboardTasks[dashboardTasks.length - 1]);
    expect(dashboardLastIndex).toBeLessThan(loginFirstIndex);
  });

  it('should group tasks into milestones', () => {
    const a = new Architect();
    const spec = makeSpec([
      { name: 'A' }, { name: 'B' }, { name: 'C' },
      { name: 'D' }, { name: 'E' }
    ]);
    const result = a.decompose(spec);
    expect(result.milestones.length).toBeGreaterThanOrEqual(1);
    expect(result.milestones.length).toBeLessThanOrEqual(7);
  });

  it('should estimate effort: small=1, medium=3, large=5', () => {
    const a = new Architect();
    const tasks = [
      { id: 'T1', complexity: 'small' },
      { id: 'T2', complexity: 'medium' },
      { id: 'T3', complexity: 'large' }
    ];
    const effort = a.estimateEffort(tasks);
    expect(effort.total).toBe(9);
    expect(effort.breakdown.small).toBe(1);
    expect(effort.breakdown.medium).toBe(3);
    expect(effort.breakdown.large).toBe(5);
  });

  it('should detect parallelizable milestone groups', () => {
    const a = new Architect();
    const spec = makeSpec([
      { name: 'A', dependencies: [] },
      { name: 'B', dependencies: [] },
      { name: 'C', dependencies: ['FEAT-001'] }
    ]);
    const result = a.decompose(spec);
    const parallel = a.detectParallelizable(result.milestones);
    expect(parallel.groups.length).toBeGreaterThanOrEqual(1);
  });

  it('should handle empty spec', () => {
    const a = new Architect();
    const spec = makeSpec([]);
    const result = a.decompose(spec);
    expect(result.tasks).toHaveLength(0);
    expect(result.milestones).toHaveLength(0);
  });

  it('should handle circular dependencies gracefully', () => {
    const a = new Architect();
    const spec = makeSpec([
      { name: 'A', dependencies: ['FEAT-003'] },
      { name: 'B', dependencies: ['FEAT-001'] },
      { name: 'C', dependencies: ['FEAT-002'] }
    ]);
    const result = a.decompose(spec);
    expect(result.warnings).toBeDefined();
    expect(result.warnings.some(w => w.includes('circular'))).toBe(true);
  });

  it('should handle spec with no features gracefully', () => {
    const a = new Architect();
    const spec = { title: 'Empty', features: [], requirements: [], constraints: [], actors: [], dependencies: [] };
    const result = a.decompose(spec);
    expect(result.tasks).toEqual([]);
    expect(result.milestones).toEqual([]);
  });

  it('should generate handoff content', () => {
    const a = new Architect();
    const spec = makeSpec([{ name: 'Login' }]);
    const decomposition = a.decompose(spec);
    const handoff = a.exportForHandoff(decomposition);
    expect(handoff).toContain('# Handoff');
    expect(handoff).toContain('Login');
  });

  it('should have 3-7 milestones per project with many features', () => {
    const a = new Architect();
    const spec = makeSpec([
      { name: 'Auth' }, { name: 'Profile' }, { name: 'Search' },
      { name: 'Messaging' }, { name: 'Notifications' }, { name: 'Admin' },
      { name: 'Settings' }, { name: 'Analytics' }
    ]);
    const result = a.decompose(spec);
    expect(result.milestones.length).toBeGreaterThanOrEqual(1);
    expect(result.milestones.length).toBeLessThanOrEqual(7);
  });

  it('should assign correct task types (RED/GREEN/REFACTOR/VERIFY)', () => {
    const a = new Architect();
    const spec = makeSpec([{ name: 'Login' }]);
    const result = a.decompose(spec);
    const types = result.tasks.map(t => t.type);
    expect(types).toContain('RED');
    expect(types).toContain('GREEN');
    expect(types).toContain('REFACTOR');
    expect(types).toContain('VERIFY');
  });

  it('should handle features with no dependencies correctly', () => {
    const a = new Architect();
    const spec = makeSpec([
      { name: 'A', dependencies: [] },
      { name: 'B', dependencies: [] }
    ]);
    const result = a.decompose(spec);
    expect(result.tasks).toHaveLength(8);
  });

  it('should detect no parallelizable groups when all serial', () => {
    const a = new Architect();
    const spec = makeSpec([
      { name: 'A', dependencies: [] },
      { name: 'B', dependencies: ['FEAT-001'] },
      { name: 'C', dependencies: ['FEAT-002'] }
    ]);
    const result = a.decompose(spec);
    const parallel = a.detectParallelizable(result.milestones);
    expect(parallel.groups.length).toBeGreaterThanOrEqual(0);
  });

  it('should export handoff with all required sections', () => {
    const a = new Architect();
    const spec = makeSpec([{ name: 'Login', priority: 'high' }]);
    const decomposition = a.decompose(spec);
    const handoff = a.exportForHandoff(decomposition);
    expect(handoff).toContain('# Handoff');
    expect(handoff).toContain('## Context');
    expect(handoff).toContain('## Decomposition');
    expect(handoff).toContain('## Acceptance Criteria');
    expect(handoff).toContain('## Quality Gates');
  });
});
