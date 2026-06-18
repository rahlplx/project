const VisualPlansSkill = require('./index');

describe('VisualPlansSkill', () => {
  it('should create instance', () => {
    const s = new VisualPlansSkill();
    expect(s.name).toBe('visual-plans');
    expect(s.description).toBe('Generate UI mockups and pseudo-code from descriptions');
  });

  it('generatePlan returns object with type, layout, components', () => {
    const s = new VisualPlansSkill();
    const plan = s.generatePlan('header with logo, navigation with 3 links, footer with copyright');
    expect(plan.type).toBe('visual-plan');
    expect(plan).toHaveProperty('layout');
    expect(plan).toHaveProperty('components');
    expect(plan).toHaveProperty('mockup');
    expect(plan).toHaveProperty('styling');
    expect(plan.components.length).toBeGreaterThanOrEqual(3);
  });

  it('generatePlan with empty string returns empty components', () => {
    const s = new VisualPlansSkill();
    const plan = s.generatePlan('');
    expect(plan.components).toEqual([]);
    expect(plan.mockup).toBeTruthy();
  });

  it('parseDescription breaks description into components', () => {
    const s = new VisualPlansSkill();
    const components = s.parseDescription(
      'header with title, button for submit, footer with copyright'
    );
    expect(components.length).toBe(3);
    expect(components[0].type).toBe('header');
    expect(components[1].type).toBe('button');
    expect(components[2].type).toBe('footer');
  });

  it('getStylingGuide returns color and spacing info', () => {
    const s = new VisualPlansSkill();
    const guide = s.getStylingGuide();
    expect(guide).toHaveProperty('fontFamily');
    expect(guide).toHaveProperty('spacing');
    expect(guide).toHaveProperty('borderRadius');
    expect(guide).toHaveProperty('shadows');
  });

  it('colorScheme option changes generated styling', () => {
    const s = new VisualPlansSkill({ colorScheme: 'dark', style: 'brutalist' });
    const plan = s.generatePlan('header with logo');
    expect(plan.styling.fontFamily).toBe('monospace');
    expect(plan.styling.borderRadius).toBe('0px');
  });

  it('extractComponent returns null for unrecognized input', () => {
    const s = new VisualPlansSkill();
    expect(s.extractComponent('some random gibberish')).toBeNull();
  });

  it('extractComponent detects button type', () => {
    const s = new VisualPlansSkill();
    const comp = s.extractComponent('primary submit button');
    expect(comp.type).toBe('button');
    expect(comp.styles.variant).toBe('primary');
  });

  it('extractComponent infers position from keywords', () => {
    const s = new VisualPlansSkill();
    const comp = s.extractComponent('top navigation bar');
    expect(comp.type).toBe('navigation');
    expect(comp.position).toBe('top');
  });

  it('determineLayout returns sidebar-layout when sidebar present', () => {
    const s = new VisualPlansSkill();
    const layout = s.determineLayout([
      { type: 'sidebar', label: 'Sidebar', position: 'left', styles: {} },
    ]);
    expect(layout).toBe('single-page');
  });

  it('determineLayout returns app-layout with header and nav', () => {
    const s = new VisualPlansSkill();
    const layout = s.determineLayout([
      { type: 'header', label: 'Header', position: 'top', styles: {} },
      { type: 'navigation', label: 'Nav', position: 'top', styles: {} },
    ]);
    expect(layout).toBe('app-layout');
  });

  it('generateMockupCode returns JSX-like string', () => {
    const s = new VisualPlansSkill();
    const code = s.generateMockupCode([
      { type: 'button', label: 'Submit', position: 'auto', styles: { variant: 'primary' } },
      { type: 'header', label: 'Welcome', position: 'top', styles: {} },
    ]);
    expect(code).toContain('<button');
    expect(code).toContain('<h1');
    expect(code).toContain('app-container');
  });

  it('generateAsciiMockup returns ASCII representation', () => {
    const s = new VisualPlansSkill();
    const ascii = s.generateAsciiMockup([
      { type: 'button', label: 'Submit', position: 'auto', styles: {} },
    ]);
    expect(ascii).toContain('UI Mockup');
    expect(ascii).toContain('[BUTTON]');
  });
});
