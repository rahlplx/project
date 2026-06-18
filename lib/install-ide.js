const fs = require('fs');
const path = require('path');

function detectIDE(projectRoot, options = {}) {
  const env = options.env || process.env;
  const argv = options.argv || process.argv;

  const dirExists = d => {
    try {
      return fs.statSync(d).isDirectory();
    } catch {
      return false;
    }
  };

  const candidates = [
    {
      name: 'cursor',
      dir: '.cursor',
      signals: [
        { name: 'CURSOR_TRACE env', matched: !!env.CURSOR_TRACE },
        { name: 'CURSOR_MODE env', matched: !!env.CURSOR_MODE },
        { name: '--cursor flag', matched: argv.includes('--cursor') },
        { name: '.cursor/ directory', matched: dirExists(path.join(projectRoot, '.cursor')) },
      ],
    },
    {
      name: 'trae',
      dir: '.trae',
      signals: [
        { name: 'TRAE_MODE env', matched: !!env.TRAE_MODE },
        { name: '--trae flag', matched: argv.includes('--trae') },
        { name: '.trae/ directory', matched: dirExists(path.join(projectRoot, '.trae')) },
      ],
    },
    {
      name: 'windsurf',
      dir: '.windsurf',
      signals: [
        { name: 'WS_PROJECT env', matched: !!env.WS_PROJECT },
        { name: 'WS_SESSION_ID env', matched: !!env.WS_SESSION_ID },
        { name: '--windsurf flag', matched: argv.includes('--windsurf') },
        { name: '.windsurf/ directory', matched: dirExists(path.join(projectRoot, '.windsurf')) },
      ],
    },
    {
      name: 'kilocode',
      dir: '.kilo',
      signals: [
        { name: 'KILO_MODE env', matched: !!env.KILO_MODE },
        { name: '--kilocode flag', matched: argv.includes('--kilocode') },
        { name: '.kilo/ directory', matched: dirExists(path.join(projectRoot, '.kilo')) },
      ],
    },
    {
      name: 'antigravity',
      dir: '.agents',
      signals: [
        { name: 'AGY_MODE env', matched: !!env.AGY_MODE },
        { name: '--antigravity flag', matched: argv.includes('--antigravity') },
        { name: '.agents/ directory', matched: dirExists(path.join(projectRoot, '.agents')) },
      ],
    },
    {
      name: 'claude-code',
      dir: '.claude',
      signals: [
        { name: 'CLAUDE_CODE env', matched: !!env.CLAUDE_CODE },
        { name: '--claude-code flag', matched: argv.includes('--claude-code') },
        { name: '.claude/ directory', matched: dirExists(path.join(projectRoot, '.claude')) },
      ],
    },
  ];

  for (const c of candidates) {
    const matched = c.signals.filter(s => s.matched);
    if (matched.length >= 2) {
      return {
        name: c.name,
        configDir: path.join(projectRoot, c.dir),
        rulesFormat: c.name === 'cursor' ? '.mdc' : '.md',
        signals: c.signals,
      };
    }
  }

  return null;
}

function installForIDE(ide, projectRoot) {
  const results = { written: [], errors: [] };

  const claudeMdPath = path.join(projectRoot, 'CLAUDE.md');
  let content;
  try {
    content = fs.readFileSync(claudeMdPath, 'utf-8');
  } catch {
    results.errors.push('CLAUDE.md not found: ' + claudeMdPath);
    return results;
  }

  const rules = parseCLAUDEToRules(content);
  const rulesDir = path.join(ide.configDir, 'rules');
  const ext = ide.name === 'cursor' ? '.mdc' : '.md';

  try {
    fs.mkdirSync(rulesDir, { recursive: true });
  } catch (err) {
    results.errors.push('Failed to create ' + rulesDir + ': ' + err.message);
    return results;
  }

  rules.forEach((rule, i) => {
    const prefix = String(i + 1).padStart(3, '0');
    const slug = slugify(rule.title);
    const filename = prefix + '-' + slug + ext;
    const filePath = path.join(rulesDir, filename);

    try {
      let output;
      if (ide.name === 'cursor') {
        output = formatCursorRule(rule);
      } else if (ide.name === 'windsurf' || ide.name === 'trae') {
        output = formatWindsurfRule(rule);
      } else if (ide.name === 'kilocode') {
        output = formatKiloRule(rule);
      } else if (ide.name === 'antigravity') {
        output = formatAntigravityRule(rule);
      } else {
        output = formatPlainRule(rule);
      }
      fs.writeFileSync(filePath, output);
      results.written.push(filename);
    } catch (err) {
      results.errors.push('Failed to write ' + filename + ': ' + err.message);
    }
  });

  return results;
}

function parseCLAUDEToRules(content) {
  const rules = [];
  const lines = content.split('\n');
  let currentHeading = null;
  let currentBody = [];

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (currentHeading !== null) {
        rules.push({ title: currentHeading, body: currentBody.join('\n').trim() });
      }
      currentHeading = line.slice(3).trim();
      currentBody = [];
    } else if (currentHeading !== null) {
      currentBody.push(line);
    }
  }

  if (currentHeading !== null) {
    rules.push({ title: currentHeading, body: currentBody.join('\n').trim() });
  }

  return rules;
}

function formatCursorRule(rule) {
  const body = rule.body;
  const firstLine = body.split('\n')[0] || rule.title;
  return (
    '---\ndescription: "' +
    firstLine.replace(/"/g, '\\"') +
    '"\nglobs: "*"\nalwaysApply: true\n---\n\n# ' +
    rule.title +
    '\n\n' +
    body +
    '\n'
  );
}

function formatWindsurfRule(rule) {
  const body = rule.body;
  const firstLine = body.split('\n')[0] || rule.title;
  return (
    '---\ndescription: "' +
    firstLine.replace(/"/g, '\\"') +
    '"\nfilePattern: "*"\nalwaysApply: true\n---\n\n# ' +
    rule.title +
    '\n\n' +
    body +
    '\n'
  );
}

function formatPlainRule(rule) {
  return '# ' + rule.title + '\n\n' + rule.body + '\n';
}

function formatKiloRule(rule) {
  return '# ' + rule.title + '\n\n' + rule.body + '\n';
}

function formatAntigravityRule(rule) {
  const body = rule.body;
  const firstLine = body.split('\n')[0] || rule.title;
  return (
    '---\nname: "' +
    rule.title +
    '"\ndescription: "' +
    firstLine.replace(/"/g, '\\"') +
    '"\n---\n\n' +
    body +
    '\n'
  );
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function syncToIDE(ide, skillsDir, options = {}) {
  const results = { written: [], skipped: [], errors: [], total: 0 };

  if (ide.name !== 'claude-code') {
    results.errors.push('Skill syncing only supported for claude-code');
    return results;
  }

  if (!fs.existsSync(skillsDir)) {
    return results;
  }

  const skillIndices = walkSkillIndices(skillsDir);
  results.total = skillIndices.length;

  const skillsTargetDir = path.join(ide.configDir, 'skills');

  for (const skillPath of skillIndices) {
    const rel = path.relative(skillsDir, path.dirname(skillPath));
    const category = path.dirname(rel);
    const name = path.basename(rel);

    const targetDir = path.join(skillsTargetDir, category);
    const targetFile = path.join(targetDir, name + '.md');

    try {
      fs.mkdirSync(targetDir, { recursive: true });

      if (fs.existsSync(targetFile) && !options.force) {
        results.skipped.push(targetFile);
        continue;
      }

      const SkillClass = require(skillPath);
      const instance = new SkillClass();
      const proto = Object.getPrototypeOf(instance);
      const methods = Object.getOwnPropertyNames(proto).filter(
        m => typeof instance[m] === 'function' && m !== 'constructor' && m !== 'toJSON'
      );

      const md = generateSkillMarkdown(instance, category, name, methods);
      fs.writeFileSync(targetFile, md);
      results.written.push(targetFile);
    } catch (err) {
      results.errors.push('Failed to sync ' + name + ': ' + err.message);
    }
  }

  return results;
}

function walkSkillIndices(skillsDir) {
  const results = [];

  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        walk(full);
      } else if (e.name === 'index.js') {
        results.push(full);
      }
    }
  }

  walk(skillsDir);
  return results;
}

function generateSkillMarkdown(instance, category, name, methods) {
  const desc = instance.description || '';
  let md = '# ' + name + '\n\n';
  md += '## Category\n' + category + '\n\n';
  md += '## Description\n' + desc + '\n\n';

  if (methods.length > 0) {
    md += '## Methods\n\n';
    md += '| Method | Description |\n';
    md += '|--------|-------------|\n';
    for (const m of methods) {
      md += '| ' + m + ' | ' + desc + ' |\n';
    }
    md += '\n';
  }

  md += '## Usage\n\n```javascript\n';
  md +=
    'const ' + name.replace(/-/g, '') + " = new (require('../" + category + '/' + name + "'))();\n";
  if (methods.length > 0) {
    md += 'const result = ' + name.replace(/-/g, '') + '.' + methods[0] + '(...);\n';
  }
  md += '```\n';

  return md;
}

module.exports = { detectIDE, installForIDE, syncToIDE, parseCLAUDEToRules };
