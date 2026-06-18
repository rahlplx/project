const fs = require('fs');
const path = require('path');

function gatherSkillFiles(rootDir) {
  const skillsDir = path.join(rootDir, 'skills');
  const results = [];

  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (err) {
      console.error(`[skill-files] Cannot read directory: ${dir} — ${err.message}`);
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

module.exports = { gatherSkillFiles };
