const { renderTemplate } = require('./template');

describe('template engine', () => {
  test('renders template with variables', () => {
    const template = '# {{projectName}}\n\nProblem: {{problem}}';
    const data = { projectName: 'TestApp', problem: 'Test problem' };
    const result = renderTemplate(template, data);
    expect(result).toBe('# TestApp\n\nProblem: Test problem');
  });

  test('handles missing variables', () => {
    const template = '# {{projectName}}\n\nProblem: {{problem}}';
    const data = { projectName: 'TestApp' };
    const result = renderTemplate(template, data);
    expect(result).toBe('# TestApp\n\nProblem: ');
  });

  test('handles extra variables', () => {
    const template = '# {{projectName}}';
    const data = { projectName: 'TestApp', extra: 'ignored' };
    const result = renderTemplate(template, data);
    expect(result).toBe('# TestApp');
  });

  test('handles empty template', () => {
    const template = '';
    const data = { projectName: 'TestApp' };
    const result = renderTemplate(template, data);
    expect(result).toBe('');
  });

  test('handles empty data', () => {
    const template = '# {{projectName}}';
    const data = {};
    const result = renderTemplate(template, data);
    expect(result).toBe('# ');
  });
});
