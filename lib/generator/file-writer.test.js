const fs = require('fs');
const path = require('path');
const os = require('os');
const { writeDocs } = require('./file-writer');

describe('file writer', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vibe-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('writes PROJECT.md', () => {
    const docs = { projectMd: '# Test Project', prdMd: '', marketResearchMd: '' };
    writeDocs(tmpDir, docs);
    expect(fs.existsSync(path.join(tmpDir, 'PROJECT.md'))).toBe(true);
  });

  test('writes PRD.md', () => {
    const docs = { projectMd: '', prdMd: '# Test PRD', marketResearchMd: '' };
    writeDocs(tmpDir, docs);
    expect(fs.existsSync(path.join(tmpDir, 'PRD.md'))).toBe(true);
  });

  test('writes MARKET_RESEARCH.md', () => {
    const docs = { projectMd: '', prdMd: '', marketResearchMd: '# Test Research' };
    writeDocs(tmpDir, docs);
    expect(fs.existsSync(path.join(tmpDir, 'MARKET_RESEARCH.md'))).toBe(true);
  });

  test('writes correct content to PROJECT.md', () => {
    const docs = { projectMd: '# Test Content', prdMd: '', marketResearchMd: '' };
    writeDocs(tmpDir, docs);
    const content = fs.readFileSync(path.join(tmpDir, 'PROJECT.md'), 'utf8');
    expect(content).toBe('# Test Content');
  });

  test('writes correct content to PRD.md', () => {
    const docs = { projectMd: '', prdMd: '# PRD Content', marketResearchMd: '' };
    writeDocs(tmpDir, docs);
    const content = fs.readFileSync(path.join(tmpDir, 'PRD.md'), 'utf8');
    expect(content).toBe('# PRD Content');
  });

  test('writes correct content to MARKET_RESEARCH.md', () => {
    const docs = { projectMd: '', prdMd: '', marketResearchMd: '# Research Content' };
    writeDocs(tmpDir, docs);
    const content = fs.readFileSync(path.join(tmpDir, 'MARKET_RESEARCH.md'), 'utf8');
    expect(content).toBe('# Research Content');
  });
});
