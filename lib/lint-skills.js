const fs = require('fs');
const path = require('path');

function gatherSkillFiles(rootDir) {
  const skillsDir = path.join(rootDir, 'skills');
  const results = [];

  function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name === 'index.js') results.push(full);
    }
  }

  walk(skillsDir);
  return results;
}

function lintFile(filePath, providedContent) {
  const errors = [];
  const warnings = [];

  let content = providedContent;
  if (content === undefined) {
    try { content = fs.readFileSync(filePath, 'utf8'); }
    catch { return { errors: [cr(filePath, 'file')], warnings: [] }; }
  }

  const lines = content.split('\n');

  if (lines.length < 10) {
    warnings.push(cr(filePath, 'short', `only ${lines.length} lines`));
  }

  const hasModuleExports = content.includes('module.exports');
  if (!hasModuleExports) {
    errors.push(cr(filePath, 'exports', 'missing module.exports'));
  }

  const hasClass = /class\s+\w+/.test(content);
  const hasName = content.includes('this.name =') || content.includes('this.name=');
  const hasDescription = content.includes('this.description =') || content.includes('this.description=');

  if (hasClass) {
    if (!hasName) {
      warnings.push(cr(filePath, 'class-name', 'class has no this.name property'));
    }
    if (!hasDescription) {
      warnings.push(cr(filePath, 'class-desc', 'class has no this.description property'));
    }
  } else {
    const exportedKeys = extractExportedKeys(content);
    if (exportedKeys.length === 0) {
      warnings.push(cr(filePath, 'exports-empty', 'module.exports is empty'));
    }
  }

  return { errors, warnings };
}

function extractExportedKeys(content) {
  const match = content.match(/module\.exports\s*=\s*\{([\s\S]*?)\}/);
  if (!match) return [];
  return match[1].split(',').map(k => k.trim()).filter(Boolean);
}

function cr(filePath, type, detail) {
  return { file: filePath, type, detail };
}

function lintSkills(options = {}) {
  const { rootDir = path.resolve(__dirname, '..') } = options;
  const files = gatherSkillFiles(rootDir);
  const results = [];

  for (const f of files) {
    const result = lintFile(f);
    if (result.errors.length > 0 || result.warnings.length > 0) {
      results.push({
        file: path.relative(rootDir, f),
        errors: result.errors.map(e => ({ type: e.type, detail: e.detail })),
        warnings: result.warnings.map(w => ({ type: w.type, detail: w.detail }))
      });
    }
  }

  return {
    files: files.length,
    clean: files.length - results.length,
    issues: results
  };
}

function formatReport(result) {
  const lines = [];
  lines.push(`Skills checked: ${result.files}`);
  lines.push(`Clean: ${result.clean}`);
  lines.push(`With issues: ${result.issues.length}`);
  lines.push('');

  for (const issue of result.issues) {
    const relFile = issue.file.replace(/\\/g, '/');
    for (const e of issue.errors) {
      lines.push(`  [ERR]  ${relFile}  ${e.detail || e.type}`);
    }
    for (const w of issue.warnings) {
      lines.push(`  [WARN] ${relFile}  ${w.detail || w.type}`);
    }
  }

  if (result.issues.length === 0) {
    lines.push('All skills passed lint checks.');
  }

  return lines.join('\n');
}

if (require.main === module) {
  const result = lintSkills();
  console.log(formatReport(result));
  const hasErrors = result.issues.some(i => i.errors.length > 0);
  process.exit(hasErrors ? 1 : 0);
}

module.exports = { lintSkills, formatReport, lintFile, gatherSkillFiles };
