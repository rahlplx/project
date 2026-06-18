const CodeTranslator = require('./index');

describe('CodeTranslator', () => {
  it('should create instance', () => {
    const s = new CodeTranslator();
    expect(s.name).toBe('code-translator');
  });

  it('should translate JS const to Python', () => {
    const s = new CodeTranslator();
    const r = s.translate('const x = 42;', 'javascript', 'python');
    expect(r.success).toBe(true);
    expect(r.translatedCode).toContain('x = 42');
  });

  it('should translate console.log to print', () => {
    const s = new CodeTranslator();
    const r = s.translate('console.log("hello");', 'javascript', 'python');
    expect(r.translatedCode).toContain('print');
  });

  it('should translate Python def to JS function', () => {
    const s = new CodeTranslator();
    const r = s.translate('def add(a, b):', 'python', 'javascript');
    expect(r.translatedCode).toContain('function');
  });

  it('should translate print to console.log', () => {
    const s = new CodeTranslator();
    const r = s.translate('print("hello")', 'python', 'javascript');
    expect(r.translatedCode).toContain('console.log');
  });

  it('should translate None to null', () => {
    const s = new CodeTranslator();
    const r = s.translate('x = None', 'python', 'javascript');
    expect(r.translatedCode).toContain('null');
  });

  it('should handle empty input', () => {
    const s = new CodeTranslator();
    const r = s.translate('');
    expect(r.success).toBe(false);
  });

  it('should auto-detect language', () => {
    const s = new CodeTranslator();
    const r = s.translate('const x = 1;', '', 'python');
    expect(r.sourceLanguage).toBe('javascript');
  });

  it('should include translation notes', () => {
    const s = new CodeTranslator();
    const r = s.translate('const x = 1;', 'javascript', 'python');
    expect(r.notes.length).toBeGreaterThan(0);
  });

  it('should list supported languages', () => {
    const s = new CodeTranslator();
    const langs = s.getSupportedLanguages();
    expect(langs.length).toBeGreaterThan(0);
    expect(langs[0]).toHaveProperty('id');
  });

  it('should return metadata', () => {
    const s = new CodeTranslator();
    expect(s.toJSON().supported).toContain('JavaScript');
  });
});
