const path = require('path');
const { buildIndex, writeIndex } = require('./discovery-index');

function enrichSkills(options = {}) {
  const { rootDir = path.resolve(__dirname, '..'), write = true } = options;
  const index = buildIndex({ rootDir });

  if (write) {
    writeIndex(rootDir, index);
  }

  return index;
}

if (require.main === module) {
  const result = enrichSkills();
  console.log(`Index built: ${result.skill_count} skills, ${result.errors.length} errors`);
}

module.exports = { enrichSkills };
