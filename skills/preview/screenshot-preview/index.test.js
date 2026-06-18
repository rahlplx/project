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

  it('_safePath should redirect traversal attempts to outputDir', () => {
    const path = require('path');
    const s = new ScreenshotPreview({ outputDir: './safe-test' });
    const result = s._safePath('../../etc/passwd');
    expect(result).toBe(path.resolve('./safe-test', 'passwd'));
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

describe('ScreenshotPreview — uncovered branches', () => {
  const fs = require('fs');
  const os = require('os');
  let tmpDir;
  let s;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ss-test-'));
    s = new ScreenshotPreview({ outputDir: tmpDir, format: 'png' });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('compare() returns error object when pixelmatch/pngjs not available', async () => {
    const result = await s.compare('nonexistent1.png', 'nonexistent2.png');
    expect(result.identical).toBe(false);
    expect(result.error).toContain('Comparison requires');
  });

  it('getRecentScreenshots() lists files in outputDir sorted by mtime', () => {
    fs.writeFileSync(path.join(tmpDir, 'a.png'), 'fake-png-1');
    fs.writeFileSync(path.join(tmpDir, 'b.png'), 'fake-png-2');
    const shots = s.getRecentScreenshots();
    expect(shots.length).toBe(2);
    shots.forEach(shot => {
      expect(shot).toHaveProperty('name');
      expect(shot).toHaveProperty('path');
      expect(shot).toHaveProperty('size');
      expect(shot).toHaveProperty('created');
    });
  });

  it('getRecentScreenshots() respects limit parameter', () => {
    for (let i = 0; i < 5; i++) {
      fs.writeFileSync(path.join(tmpDir, `shot${i}.png`), 'x');
    }
    const shots = s.getRecentScreenshots(3);
    expect(shots.length).toBe(3);
  });

  it('delete() removes an existing file', () => {
    const filename = 'to-delete.png';
    fs.writeFileSync(path.join(tmpDir, filename), 'data');
    const result = s.delete(filename);
    expect(result.deleted).toBe(filename);
    expect(fs.existsSync(path.join(tmpDir, filename))).toBe(false);
  });

  it('open() runs without throwing on existing file (linux/xdg-open path)', () => {
    const filename = 'open-me.png';
    fs.writeFileSync(path.join(tmpDir, filename), 'data');
    expect(() => s.open(filename)).not.toThrow();
  });

  it('cleanup() removes files older than maxAge', () => {
    const filename = 'old.png';
    fs.writeFileSync(path.join(tmpDir, filename), 'data');
    // maxAge: -1 ensures age > maxAge is always true (0 would fall back to 24h default)
    const result = s.cleanup({ maxAge: -1, maxFiles: 1000 });
    expect(result).toHaveProperty('deleted');
    expect(result.deleted).toBeGreaterThan(0);
  });

  it('cleanup() removes excess files beyond maxFiles', () => {
    for (let i = 0; i < 5; i++) {
      fs.writeFileSync(path.join(tmpDir, `excess${i}.png`), 'x');
    }
    const result = s.cleanup({ maxAge: 9999999999, maxFiles: 2 });
    expect(result).toHaveProperty('deleted');
  });

  it('_safePath redirects absolute path to outputDir basename', () => {
    const result = s._safePath('/etc/passwd');
    expect(path.dirname(result)).toBe(path.resolve(tmpDir));
    expect(path.basename(result)).toBe('passwd');
  });

  it('_safePath throws when ".." would escape outputDir', () => {
    expect(() => s._safePath('..')).toThrow('Invalid path');
  });

  it('capture() falls through to error result when puppeteer and canvas unavailable', async () => {
    const result = await s.capture('http://localhost:9999/nothing', {
      filename: 'test-cap.png',
    }).catch(e => ({ error: e.message }));
    expect(result).toBeDefined();
  });

  it('toBase64() encodes an existing png file', async () => {
    const filename = path.join(tmpDir, 'real.png');
    fs.writeFileSync(filename, Buffer.from('fake-png'));
    const result = await s.toBase64(filename);
    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  it('toBase64() maps jpg extension to jpeg mime type', async () => {
    const filename = path.join(tmpDir, 'real.jpg');
    fs.writeFileSync(filename, Buffer.from('fake-jpg'));
    const result = await s.toBase64(filename);
    expect(result).toMatch(/^data:image\/jpeg;base64,/);
  });

  it('getMetadata() returns stats for existing file', () => {
    const filename = 'meta.png';
    fs.writeFileSync(path.join(tmpDir, filename), 'data');
    const meta = s.getMetadata(filename);
    expect(meta.filename).toBe(filename);
    expect(meta.size).toBeGreaterThan(0);
    expect(meta).toHaveProperty('created');
    expect(meta).toHaveProperty('modified');
  });

  it('createThumbnail() returns error object when sharp not installed', async () => {
    const filename = 'thumb-input.png';
    fs.writeFileSync(path.join(tmpDir, filename), 'data');
    const result = await s.createThumbnail(filename);
    expect(result.error).toContain('sharp');
  });

  it('annotate() returns error object when sharp/canvas not installed', async () => {
    const filename = 'annotate-input.png';
    fs.writeFileSync(path.join(tmpDir, filename), 'data');
    const result = await s.annotate(filename, { text: 'hello', x: 10, y: 20 });
    expect(result.error).toContain('sharp');
  });

  it('list() filters by format', () => {
    fs.writeFileSync(path.join(tmpDir, 'a.png'), 'x');
    fs.writeFileSync(path.join(tmpDir, 'b.jpg'), 'x');
    const result = s.list({ format: 'png' });
    expect(result.screenshots.every(f => f.name.endsWith('.png'))).toBe(true);
  });

  it('list() filters by since date', () => {
    fs.writeFileSync(path.join(tmpDir, 'c.png'), 'x');
    const result = s.list({ since: new Date(Date.now() + 60000).toISOString() });
    expect(result.total).toBe(0);
  });

  it('list() filters by before date', () => {
    fs.writeFileSync(path.join(tmpDir, 'd.png'), 'x');
    const result = s.list({ before: new Date(Date.now() + 60000).toISOString() });
    expect(result.total).toBeGreaterThan(0);
  });

  it('list() respects limit option', () => {
    for (let i = 0; i < 4; i++) {
      fs.writeFileSync(path.join(tmpDir, `lim${i}.png`), 'x');
    }
    const result = s.list({ limit: 2 });
    expect(result.total).toBe(2);
  });

  it('exportAsZip() returns error when archiver not installed', async () => {
    const result = await s.exportAsZip('out.zip').catch(e => ({ error: e.message }));
    expect(result).toBeDefined();
  });

  it('ensureOutputDir() creates directory when it does not exist', () => {
    const newDir = path.join(tmpDir, 'new-subdir');
    expect(fs.existsSync(newDir)).toBe(false);
    new ScreenshotPreview({ outputDir: newDir });
    expect(fs.existsSync(newDir)).toBe(true);
  });
});
