const { describe, test, expect } = require('../jest-compat');

const { researchProject } = require('./researcher');

describe('researcher', () => {
  test('returns research result with all fields', () => {
    const result = researchProject({ projectName: 'TestApp', domain: 'saas' });
    expect(result).toHaveProperty('projectName', 'TestApp');
    expect(result).toHaveProperty('domain', 'saas');
    expect(result).toHaveProperty('competitors');
    expect(result).toHaveProperty('openSourceTools');
    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('risks');
    expect(result).toHaveProperty('nextSteps');
    expect(result).toHaveProperty('researchDate');
  });

  test('competitors is an array', () => {
    const result = researchProject({ projectName: 'TestApp', domain: 'saas' });
    expect(Array.isArray(result.competitors)).toBe(true);
  });

  test('openSourceTools is an array', () => {
    const result = researchProject({ projectName: 'TestApp', domain: 'saas' });
    expect(Array.isArray(result.openSourceTools)).toBe(true);
  });

  test('recommendations is an array', () => {
    const result = researchProject({ projectName: 'TestApp', domain: 'saas' });
    expect(Array.isArray(result.recommendations)).toBe(true);
  });

  test('risks is an array', () => {
    const result = researchProject({ projectName: 'TestApp', domain: 'saas' });
    expect(Array.isArray(result.risks)).toBe(true);
  });

  test('nextSteps is an array', () => {
    const result = researchProject({ projectName: 'TestApp', domain: 'saas' });
    expect(Array.isArray(result.nextSteps)).toBe(true);
  });

  test('defaults domain to saas if not provided', () => {
    const result = researchProject({ projectName: 'TestApp' });
    expect(result.domain).toBe('saas');
  });

  test('defaults projectName to Untitled if not provided', () => {
    const result = researchProject({});
    expect(result.projectName).toBe('Untitled Project');
  });
});
