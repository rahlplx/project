const path = require('path');
const os = require('os');
const ScreenshotPreview = require('./index');

describe('ScreenshotPreview', () => {
  it('should create instance with defaults', () => {
    const s = new ScreenshotPreview();
    expect(s.name).toBe('screenshot-preview');
    expect(s.outputDir).toBe('./screenshots');
    expect(s.format).toBe('png');
    expect(s.quality).toBe(90);
  });

  it('should create instance with custom options', () => {
    const s = new ScreenshotPreview({ outputDir: './custom', format: 'jpg', quality: 80 });
    expect(s.outputDir).toBe('./custom');
    expect(s.format).toBe('jpg');
    expect(s.quality).toBe(80);
  });

  it('generateFilename should return string ending with format', () => {
    const s = new ScreenshotPreview({ format: 'png' });
    const name = s.generateFilename();
    expect(name).toMatch(/\.png$/);
    expect(name).toContain('screenshot-');
  });

  it('open should throw on nonexistent file', () => {
    const s = new ScreenshotPreview();
    expect(() => s.open('nonexistent.png')).toThrow();
  });

  it('delete should throw on nonexistent file', () => {
    const s = new ScreenshotPreview();
    expect(() => s.delete('nonexistent.png')).toThrow();
  });

  it('getAppState should return object with timestamp and viewport', () => {
    const s = new ScreenshotPreview({ outputDir: './test-screenshots' });
    const state = s.getAppState();
    expect(state).toHaveProperty('timestamp');
    expect(state).toHaveProperty('viewport');
    expect(state).toHaveProperty('outputDir', './test-screenshots');
    expect(state).toHaveProperty('format', 'png');
    expect(typeof state.timestamp).toBe('string');
  });

  it('getRecentScreenshots should return empty array when no files exist', () => {
    const s = new ScreenshotPreview({ outputDir: './nonexistent-dir' });
    const shots = s.getRecentScreenshots();
    expect(shots).toEqual([]);
  });

  it('list should return empty results when no files exist', () => {
    const s = new ScreenshotPreview({ outputDir: './nonexistent-dir' });
    const result = s.list();
    expect(result.total).toBe(0);
    expect(result.screenshots).toEqual([]);
  });

  it('_safePath should return path with basename preserved', () => {
    const s = new ScreenshotPreview({ outputDir: os.tmpdir() });
    const safe = s._safePath('test.png');
    expect(path.basename(safe)).toBe('test.png');
  });

  it('_safePath should throw on path traversal', () => {
    const s = new ScreenshotPreview({ outputDir: './safe-test' });
    expect(() => s._safePath('../../etc/passwd')).toThrow('Invalid path');
  });

  it('getMetadata should throw on nonexistent file', () => {
    const s = new ScreenshotPreview();
    expect(() => s.getMetadata('ghost.png')).toThrow();
  });

  it('toBase64 should throw on nonexistent file', () => {
    const s = new ScreenshotPreview();
    return expect(s.toBase64('missing.png')).rejects.toThrow();
  });

  it('createThumbnail should throw on nonexistent file', () => {
    const s = new ScreenshotPreview();
    return expect(s.createThumbnail('ghost.png')).rejects.toThrow();
  });
});
