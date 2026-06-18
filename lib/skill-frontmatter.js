const fs = require('fs');
const path = require('path');

function extractFromModule(filePath) {
  try {
    const mod = require(filePath);
    if (typeof mod === 'function') {
      const instance = new mod();
      const name = instance.name || path.basename(path.dirname(filePath));
      const description = instance.description || '';
      const category = path.basename(path.dirname(path.dirname(filePath)));
      return { name, description, category };
    } else if (typeof mod === 'object' && mod !== null) {
      const keys = Object.keys(mod);
      if (keys.length === 0) return null;
      const name = mod.name || path.basename(path.dirname(filePath));
      const description = mod.description || '';
      const category = path.basename(path.dirname(path.dirname(filePath)));
      return { name, description, category };
    }
  } catch {
    return null;
  }
  return null;
}

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yaml = match[1];
  const result = {};

  for (const line of yaml.split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) {
      result[kv[1]] = kv[2].trim();
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

function extractFromAny(filePath) {
  const skillDir = path.dirname(filePath);
  const skillMdPath = path.join(skillDir, 'SKILL.md');
  if (fs.existsSync(skillMdPath)) {
    const content = fs.readFileSync(skillMdPath, 'utf8');
    const frontmatter = extractFrontmatter(content);
    if (frontmatter) {
      return {
        name: frontmatter.name || path.basename(skillDir),
        description: frontmatter.description || '',
        category: frontmatter.category || path.basename(path.dirname(skillDir)),
      };
    }
  }

  return extractFromModule(filePath);
}

function generateFrontmatter(meta) {
  const lines = ['---'];
  if (meta.name) lines.push(`name: ${meta.name}`);
  if (meta.description) lines.push(`description: ${meta.description}`);
  if (meta.category) lines.push(`category: ${meta.category}`);
  lines.push('---');
  return lines.join('\n') + '\n';
}

module.exports = { extractFromModule, extractFromAny, extractFrontmatter, generateFrontmatter };
