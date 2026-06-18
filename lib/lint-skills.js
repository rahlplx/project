const fs = require('fs');
const path = require('path');
const { gatherSkillFiles } = require('./skill-files');

function lintFile(filePath, providedContent) {
  const errors = [];
  const warnings = [];

  let content = providedContent;
  if (content === undefined) {
    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch {
      return {
        errors: [makeIssue(filePath, 'file', 'Missing module.exports at line 1')],
        warnings: [],
      };
    }
  }

  const lines = content.split('\n');

  if (lines.length < 10) {
    warnings.push(makeIssue(filePath, 'short', `only ${lines.length} lines`));
  }

  const hasModuleExports = content.includes('module.exports');
  if (!hasModuleExports) {
    errors.push(makeIssue(filePath, 'exports', 'missing module.exports'));
  }

  const hasClass = /class\s+\w+/.test(content);
  const hasName = content.includes('this.name =') || content.includes('this.name=');
  const hasDescription =
    content.includes('this.description =') || content.includes('this.description=');

  if (hasClass) {
    if (!hasName) {
      warnings.push(makeIssue(filePath, 'class-name', 'class has no this.name property'));
    }
    if (!hasDescription) {
      warnings.push(makeIssue(filePath, 'class-desc', 'class has no this.description property'));
    }
    const descMatch = content.match(/this\.description\s*=\s*['"`]([\s\S]*?)['"`]/);
    if (descMatch && descMatch[1].length > 1024) {
      warnings.push(makeIssue(filePath, 'desc-too-long', `description is ${descMatch[1].length} chars (max 1024 — truncated in agent system prompts)`));
    }
  } else {
    const exportedKeys = extractExportedKeys(content);
    if (exportedKeys !== null && exportedKeys.length === 0) {
      warnings.push(makeIssue(filePath, 'exports-empty', 'module.exports is empty'));
    }
  }

  return { errors, warnings };
}

function extractExportedKeys(content) {
  const objMatch = content.match(/module\.exports\s*=\s*\{([\s\S]*?)\}/);
  if (objMatch) {
    return objMatch[1]
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);
  }
  const classExport = content.match(/module\.exports\s*=\s*([A-Za-z_$][\w$.]*)/);
  if (classExport) {
    return null;
  }
  return [];
}

function makeIssue(filePath, type, detail) {
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
        warnings: result.warnings.map(w => ({ type: w.type, detail: w.detail })),
      });
    }
  }

  return {
    files: files.length,
    clean: files.length - results.length,
    issues: results,
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
