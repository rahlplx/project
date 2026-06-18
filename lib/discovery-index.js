const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { gatherSkillFiles } = require('./skill-files');

function computeDigest(filePath) {
  const content = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  return `sha256-${hash}`;
}

function buildIndex(options = {}) {
  const { rootDir = path.resolve(__dirname, '..') } = options;
  const files = gatherSkillFiles(rootDir);
  const skills = [];
  const errors = [];

  for (const file of files) {
    try {
      const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
      const parts = relPath.split('/');
      const category = parts[1];
      const skillName = parts[2];

      // Extract description from SKILL.md frontmatter — avoids require()+cache manipulation
      let description = '';
      const skillMd = path.join(path.dirname(file), 'SKILL.md');
      try {
        if (fs.existsSync(skillMd)) {
          const raw = fs.readFileSync(skillMd, 'utf8');
          const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
          if (fmMatch) {
            const descMatch = fmMatch[1].match(/^description:\s*["']?(.*?)["']?\s*$/m);
            if (descMatch) description = descMatch[1].replace(/^["']|["']$/g, '');
          }
        }
      } catch {
        /* degrade */
      }

      skills.push({
        name: skillName,
        type: 'skill-md',
        category,
        description: description || skillName,
        url: `/.well-known/agent-skills/${skillName}/SKILL.md`,
        digest: computeDigest(file),
      });
    } catch (e) {
      errors.push({ file, error: e.message });
    }
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));

  return {
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    version: '1.0',
    generated_at: new Date().toISOString(),
    skill_count: skills.length,
    skills,
    errors,
  };
}

function readIndex(projectRoot) {
  const indexPath = path.join(projectRoot, '.well-known', 'agent-skills', 'index.json');
  try {
    const content = fs.readFileSync(indexPath, 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function writeIndex(projectRoot, index) {
  const idx = index || buildIndex({ rootDir: projectRoot });
  const dir = path.join(projectRoot, '.well-known', 'agent-skills');
  fs.mkdirSync(dir, { recursive: true });
  const indexPath = path.join(dir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(idx, null, 2) + '\n', 'utf8');
}

if (require.main === module) {
  const index = buildIndex();
  console.log(JSON.stringify(index, null, 2));
}

module.exports = { buildIndex, readIndex, writeIndex, computeDigest };
