const { validateInput, sanitizeProjectName } = require('./intent-capture');

describe('validateInput', () => {
  test('validates complete input', () => {
    const input = {
      projectName: 'My SaaS App',
      problem: 'Problem text',
      users: 'User text',
    };

    const result = validateInput(input);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('rejects empty project name', () => {
    const input = {
      projectName: '',
      problem: 'Problem text',
    };

    const result = validateInput(input);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Project name is required');
  });

  test('rejects missing project name', () => {
    const input = {
      problem: 'Problem text',
    };

    const result = validateInput(input);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Project name is required');
  });

  test('rejects special characters in project name', () => {
    const input = {
      projectName: 'My App!@#$%',
    };

    const result = validateInput(input);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Project name can only contain letters, numbers, spaces, and hyphens'
    );
  });

  test('allows spaces and hyphens in project name', () => {
    const input = {
      projectName: 'My SaaS App - v2',
    };

    const result = validateInput(input);

    expect(result.valid).toBe(true);
  });

  test('rejects project name longer than 100 characters', () => {
    const input = {
      projectName: 'A'.repeat(101),
    };

    const result = validateInput(input);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Project name must be 100 characters or less');
  });

  test('allows project name up to 100 characters', () => {
    const input = {
      projectName: 'A'.repeat(100),
    };

    const result = validateInput(input);

    expect(result.valid).toBe(true);
  });

  test('collects multiple errors', () => {
    const input = {
      projectName: '',
      problem: '',
      users: '',
    };

    const result = validateInput(input);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(1);
  });
});

describe('sanitizeProjectName', () => {
  test('trims whitespace', () => {
    expect(sanitizeProjectName('  My App  ')).toBe('My App');
  });

  test('removes special characters', () => {
    expect(sanitizeProjectName('My App!@#$%')).toBe('My App');
  });

  test('preserves letters, numbers, spaces, hyphens', () => {
    expect(sanitizeProjectName('My App-2 v1.0')).toBe('My App-2 v10');
  });

  test('truncates to 100 characters', () => {
    const longName = 'A'.repeat(150);
    expect(sanitizeProjectName(longName)).toHaveLength(100);
  });

  test('handles empty string', () => {
    expect(sanitizeProjectName('')).toBe('');
  });
});
