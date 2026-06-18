const ErrorTranslator = require('./index');

describe('ErrorTranslator', () => {
  it('should create instance with defaults', () => {
    const s = new ErrorTranslator();
    expect(s.name).toBe('error-translator');
    expect(s.version).toBe('1.0.0');
  });

  it('should translate module not found errors', () => {
    const s = new ErrorTranslator();
    const r = s.translate('Error: Cannot find module "express"');
    expect(r.translation).toContain('file or package is missing');
    expect(r.suggestion).toContain('npm install');
  });

  it('should translate ENOENT errors', () => {
    const s = new ErrorTranslator();
    const r = s.translate('ENOENT: no such file or directory');
    expect(r.translation).toContain('does not exist');
  });

  it('should translate permission denied errors', () => {
    const s = new ErrorTranslator();
    const r = s.translate('EACCES: permission denied');
    expect(r.translation).toContain('blocking access');
  });

  it('should translate port in use errors', () => {
    const s = new ErrorTranslator();
    const r = s.translate('EADDRINUSE: port already in use');
    expect(r.translation).toContain('already using');
  });

  it('should translate connection refused', () => {
    const s = new ErrorTranslator();
    const r = s.translate('ECONNREFUSED');
    expect(r.translation).toContain('Could not connect');
  });

  it('should translate timeout errors', () => {
    const s = new ErrorTranslator();
    const r = s.translate('timed out waiting for response');
    expect(r.translation).toContain('took too long');
  });

  it('should translate git errors', () => {
    const s = new ErrorTranslator();
    const r = s.translate('fatal: not a git repository');
    expect(r.translation).toContain('not a git repository');
  });

  it('should translate undefined errors', () => {
    const s = new ErrorTranslator();
    const r = s.translate('TypeError: Cannot read properties of undefined');
    expect(r.translation).toContain('has not been set');
  });

  it('should return generic for unknown errors', () => {
    const s = new ErrorTranslator();
    const r = s.translate('Some completely unknown error text');
    expect(r.translation).toContain('does not match');
  });

  it('should handle empty input', () => {
    const s = new ErrorTranslator();
    const r = s.translate('');
    expect(r.translation).toContain('No error provided');
  });

  it('should handle null input', () => {
    const s = new ErrorTranslator();
    const r = s.translate(null);
    expect(r.translation).toContain('No error provided');
  });

  it('should batch translate multiple errors', () => {
    const s = new ErrorTranslator();
    const results = s.batchTranslate(['ENOENT', 'EACCES']);
    expect(results).toHaveLength(2);
    expect(results[0].translation).toContain('does not exist');
  });

  it('should return known pattern count in toJSON', () => {
    const s = new ErrorTranslator();
    const j = s.toJSON();
    expect(j.knownPatterns).toBe(24);
  });
});
