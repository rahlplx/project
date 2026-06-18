const { describe, test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { detectIDE, installForIDE, syncToIDE } = require('./install-ide');

const FIXTURES = path.join(__dirname, '__fixtures__');
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(PROJECT_ROOT, 'skills');
const SAMPLE_CLAUDE = path.join(FIXTURES, 'sample-CLAUDE.md');
const SAMPLE_SKILL = path.join(FIXTURES, 'sample-skill.js');

const makeTmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'ide-test-'));

// =====================================================
// IDE DETECTION
// =====================================================

describe('detectIDE', () => {
  test('detects Cursor via env vars (CURSOR_TRACE + CURSOR_MODE)', () => {
    const tmp = makeTmp();
    try {
      const result = detectIDE(tmp, {
        env: { CURSOR_TRACE: '1', CURSOR_MODE: '1' },
      });
      assert(result !== null, 'should detect an IDE');
      assert.strictEqual(result.name, 'cursor');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('detects Cursor via .cursor directory + env var', () => {
    const tmp = makeTmp();
    fs.mkdirSync(path.join(tmp, '.cursor'));
    try {
      const result = detectIDE(tmp, {
        env: { CURSOR_TRACE: '1' },
      });
      assert(result !== null, 'should detect an IDE');
      assert.strictEqual(result.name, 'cursor');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('detects Cursor via --cursor flag + env var', () => {
    const tmp = makeTmp();
    try {
      const result = detectIDE(tmp, {
        env: { CURSOR_MODE: '1' },
        argv: ['node', 'test', '--cursor'],
      });
      assert(result !== null, 'should detect an IDE');
      assert.strictEqual(result.name, 'cursor');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('detects Windsurf via env vars (WS_PROJECT + WS_SESSION_ID)', () => {
    const tmp = makeTmp();
    try {
      const result = detectIDE(tmp, {
        env: { WS_PROJECT: '/project', WS_SESSION_ID: 'abc123' },
      });
      assert(result !== null, 'should detect an IDE');
      assert.strictEqual(result.name, 'windsurf');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('detects Windsurf via .windsurf directory + env var', () => {
    const tmp = makeTmp();
    fs.mkdirSync(path.join(tmp, '.windsurf'));
    try {
      const result = detectIDE(tmp, {
        env: { WS_PROJECT: '/project' },
      });
      assert(result !== null, 'should detect an IDE');
      assert.strictEqual(result.name, 'windsurf');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('detects Windsurf via --windsurf flag + env var', () => {
    const tmp = makeTmp();
    try {
      const result = detectIDE(tmp, {
        env: { WS_SESSION_ID: 'abc' },
        argv: ['node', 'test', '--windsurf'],
      });
      assert(result !== null, 'should detect an IDE');
      assert.strictEqual(result.name, 'windsurf');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('detects Claude Code via --claude-code flag + .claude directory', () => {
    const tmp = makeTmp();
    fs.mkdirSync(path.join(tmp, '.claude'));
    try {
      const result = detectIDE(tmp, {
        argv: ['node', 'test', '--claude-code'],
      });
      assert(result !== null, 'should detect an IDE');
      assert.strictEqual(result.name, 'claude-code');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('returns null when no IDE signals detected', () => {
    const tmp = makeTmp();
    try {
      const result = detectIDE(tmp, {
        env: {},
        argv: ['node', 'test'],
      });
      assert.strictEqual(result, null);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('priority is cursor > windsurf > claude-code when multiple match', () => {
    const tmp = makeTmp();
    try {
      const result = detectIDE(tmp, {
        env: {
          CURSOR_TRACE: '1',
          CURSOR_MODE: '1',
          WS_PROJECT: '/p',
          WS_SESSION_ID: 's',
          CLAUDE_CODE: '1',
        },
      });
      assert(result !== null, 'should detect an IDE');
      assert.strictEqual(result.name, 'cursor', 'cursor should win priority');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('signals array includes all checked signals with matched status', () => {
    const tmp = makeTmp();
    try {
      const result = detectIDE(tmp, {
        env: { CURSOR_TRACE: '1', CURSOR_MODE: '1' },
        argv: ['node', 'test'],
      });
      assert(result !== null);
      const names = result.signals.map(s => s.name);
      assert(names.includes('CURSOR_TRACE env'), 'should include CURSOR_TRACE env');
      assert(names.includes('CURSOR_MODE env'), 'should include CURSOR_MODE env');
      assert(names.includes('--cursor flag'), 'should include --cursor flag');
      assert(names.includes('.cursor/ directory'), 'should include .cursor/ directory');
      const matched = result.signals.filter(s => s.matched);
      assert.strictEqual(matched.length, 2, 'two signals should be matched');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});

// =====================================================
// RULE INSTALLATION
// =====================================================

describe('installForIDE', () => {
  function setupProject(claudeContent) {
    const tmp = makeTmp();
    fs.writeFileSync(path.join(tmp, 'CLAUDE.md'), claudeContent);
    return tmp;
  }

  test('writes .mdc files for Cursor with YAML frontmatter', () => {
    const content = fs.readFileSync(SAMPLE_CLAUDE, 'utf-8');
    const tmp = setupProject(content);
    const cursorDir = path.join(tmp, '.cursor');
    fs.mkdirSync(cursorDir);
    const ide = { name: 'cursor', configDir: cursorDir, rulesFormat: '.mdc', signals: [] };
    try {
      const result = installForIDE(ide, tmp);
      assert(result.written.length > 0);
      const mdcFiles = result.written.filter(f => f.endsWith('.mdc'));
      assert.strictEqual(mdcFiles.length, result.written.length, 'all files should be .mdc');
      const firstFile = path.join(cursorDir, 'rules', result.written[0]);
      const firstContent = fs.readFileSync(firstFile, 'utf-8');
      assert(firstContent.startsWith('---'), 'should start with YAML frontmatter');
      assert(firstContent.includes('description:'), 'should have description');
      assert(firstContent.includes('globs:'), 'should have globs');
      assert(firstContent.includes('alwaysApply:'), 'should have alwaysApply');
      assert(firstContent.includes('# Commands'), 'should include section title');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('writes .md files for Windsurf with YAML frontmatter', () => {
    const content = fs.readFileSync(SAMPLE_CLAUDE, 'utf-8');
    const tmp = setupProject(content);
    const wsDir = path.join(tmp, '.windsurf');
    fs.mkdirSync(wsDir);
    const ide = { name: 'windsurf', configDir: wsDir, rulesFormat: '.md', signals: [] };
    try {
      const result = installForIDE(ide, tmp);
      assert(result.written.length > 0);
      const mdFiles = result.written.filter(f => f.endsWith('.md'));
      assert.strictEqual(mdFiles.length, result.written.length);
      const firstFile = path.join(wsDir, 'rules', result.written[0]);
      const firstContent = fs.readFileSync(firstFile, 'utf-8');
      assert(firstContent.startsWith('---'), 'should start with YAML frontmatter');
      assert(firstContent.includes('description:'), 'should have description');
      assert(firstContent.includes('filePattern:'), 'should have filePattern');
      assert(firstContent.includes('alwaysApply:'), 'should have alwaysApply');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('generates correct number of rule files from CLAUDE.md sections', () => {
    const content = fs.readFileSync(SAMPLE_CLAUDE, 'utf-8');
    const tmp = setupProject(content);
    const cursorDir = path.join(tmp, '.cursor');
    fs.mkdirSync(cursorDir);
    const ide = { name: 'cursor', configDir: cursorDir, rulesFormat: '.mdc', signals: [] };
    try {
      const result = installForIDE(ide, tmp);
      assert.strictEqual(result.written.length, 5, '5 sections should produce 5 rule files');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('creates rules directory if missing', () => {
    const content = fs.readFileSync(SAMPLE_CLAUDE, 'utf-8');
    const tmp = setupProject(content);
    const cursorDir = path.join(tmp, '.cursor');
    fs.mkdirSync(cursorDir);
    const ide = { name: 'cursor', configDir: cursorDir, rulesFormat: '.mdc', signals: [] };
    try {
      const result = installForIDE(ide, tmp);
      assert(result.written.length > 0);
      const rulesDir = path.join(cursorDir, 'rules');
      assert(fs.existsSync(rulesDir), 'rules directory should exist');
      assert(fs.statSync(rulesDir).isDirectory(), 'rules should be a directory');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('returns error for missing CLAUDE.md', () => {
    const tmp = makeTmp();
    const ide = { name: 'cursor', configDir: tmp, rulesFormat: '.mdc', signals: [] };
    try {
      const result = installForIDE(ide, tmp);
      assert(result.errors.length > 0, 'should have at least one error');
      assert(result.written.length === 0, 'should have no written files');
      assert(result.errors[0].includes('CLAUDE.md'), 'error should mention CLAUDE.md');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('written array contains prefixed slugified filenames', () => {
    const content = fs.readFileSync(SAMPLE_CLAUDE, 'utf-8');
    const tmp = setupProject(content);
    const cursorDir = path.join(tmp, '.cursor');
    fs.mkdirSync(cursorDir);
    const ide = { name: 'cursor', configDir: cursorDir, rulesFormat: '.mdc', signals: [] };
    try {
      const result = installForIDE(ide, tmp);
      assert(result.written.length > 0);
      result.written.forEach(f => {
        assert(/^\d{3}-.+\.mdc$/.test(f), `filename ${f} should have numeric prefix`);
      });
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('rule file content includes section body preserved from source', () => {
    const content = fs.readFileSync(SAMPLE_CLAUDE, 'utf-8');
    const tmp = setupProject(content);
    const wsDir = path.join(tmp, '.windsurf');
    fs.mkdirSync(wsDir);
    const ide = { name: 'windsurf', configDir: wsDir, rulesFormat: '.md', signals: [] };
    try {
      const result = installForIDE(ide, tmp);
      const commandsFile = result.written.find(f => f.includes('commands'));
      assert(commandsFile, 'should have commands rule file');
      const fullPath = path.join(wsDir, 'rules', commandsFile);
      const fileContent = fs.readFileSync(fullPath, 'utf-8');
      assert(fileContent.includes('npm test'), 'should preserve section body content');
      assert(fileContent.includes('npm run build'), 'should preserve section body content');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});

// =====================================================
// SKILL SYNCING
// =====================================================

describe('syncToIDE', () => {
  test('syncs all 45 skills from skills directory', () => {
    const tmp = makeTmp();
    const ide = { name: 'claude-code', configDir: tmp, rulesFormat: '.md', signals: [] };
    try {
      const result = syncToIDE(ide, SKILLS_DIR);
      assert(result.total >= 45, 'should find at least 45 skills, found ' + result.total);
      assert(
        result.written.length >= 45,
        'should write at least 45 skills, wrote ' + result.written.length
      );
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('creates category subdirectories', () => {
    const tmp = makeTmp();
    const ide = { name: 'claude-code', configDir: tmp, rulesFormat: '.md', signals: [] };
    try {
      const result = syncToIDE(ide, SKILLS_DIR);
      const categories = [...new Set(result.written.map(f => path.basename(path.dirname(f))))];
      assert(categories.includes('deploy'), 'should have deploy category');
      assert(categories.includes('design'), 'should have design category');
      assert(categories.includes('quality'), 'should have quality category');
      assert(categories.includes('workflow'), 'should have workflow category');
      assert(categories.length >= 9, 'should have at least 9 categories');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('includes methods table in each skill markdown', () => {
    const tmp = makeTmp();
    const ide = { name: 'claude-code', configDir: tmp, rulesFormat: '.md', signals: [] };
    try {
      const result = syncToIDE(ide, SKILLS_DIR);
      assert(result.written.length > 0);
      const firstFile = result.written[0];
      const content = fs.readFileSync(firstFile, 'utf-8');
      assert(content.includes('## Methods'), 'should include Methods section');
      assert(content.includes('| Method |'), 'should include methods table header');
      assert(content.includes('|--------|'), 'should include methods table separator');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  function makeSingleSkillProject() {
    const tmp = makeTmp();
    const skillsDir = path.join(tmp, 'my-skills', 'test-cat', 'test-skill');
    fs.mkdirSync(skillsDir, { recursive: true });
    fs.copyFileSync(SAMPLE_SKILL, path.join(skillsDir, 'index.js'));
    return { tmp, skillsDir: path.join(tmp, 'my-skills') };
  }

  test('skips existing skill files without force option', () => {
    const { tmp, skillsDir } = makeSingleSkillProject();
    const ide = { name: 'claude-code', configDir: tmp, rulesFormat: '.md', signals: [] };
    try {
      const first = syncToIDE(ide, skillsDir);
      assert.strictEqual(first.written.length, 1, 'first run should write');

      const second = syncToIDE(ide, skillsDir);
      assert.strictEqual(second.skipped.length, 1, 'second run should skip');
      assert.strictEqual(second.written.length, 0, 'no files should be written');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('overwrites existing skill files with force option', () => {
    const { tmp, skillsDir } = makeSingleSkillProject();
    const ide = { name: 'claude-code', configDir: tmp, rulesFormat: '.md', signals: [] };
    try {
      const first = syncToIDE(ide, skillsDir);
      assert.strictEqual(first.written.length, 1);

      const second = syncToIDE(ide, skillsDir, { force: true });
      assert.strictEqual(second.written.length, 1, 'force should overwrite');
      assert.strictEqual(second.skipped.length, 0, 'no files should be skipped');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('handles empty skills directory', () => {
    const tmp = makeTmp();
    const emptySkills = path.join(tmp, 'empty-skills');
    fs.mkdirSync(emptySkills, { recursive: true });
    const ide = { name: 'claude-code', configDir: tmp, rulesFormat: '.md', signals: [] };
    try {
      const result = syncToIDE(ide, emptySkills);
      assert.strictEqual(result.total, 0);
      assert.strictEqual(result.written.length, 0);
      assert.strictEqual(result.errors.length, 0);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('handles invalid path with errors array', () => {
    const tmp = makeTmp();
    const invalidPath = path.join(tmp, 'does-not-exist');
    const ide = { name: 'claude-code', configDir: tmp, rulesFormat: '.md', signals: [] };
    try {
      const result = syncToIDE(ide, invalidPath);
      assert.strictEqual(result.total, 0);
      assert.strictEqual(result.written.length, 0);
      assert.strictEqual(result.errors.length, 0);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
