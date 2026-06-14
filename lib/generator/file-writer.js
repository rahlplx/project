/**
 * File Writer Module
 * Writes generated docs to filesystem
 */

const fs = require('fs');
const path = require('path');

/**
 * Write docs to directory
 * @param {string} dir - Directory path
 * @param {Object} docs - Generated docs
 */
function writeDocs(dir, docs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (docs.projectMd) {
    fs.writeFileSync(path.join(dir, 'PROJECT.md'), docs.projectMd);
  }

  if (docs.prdMd) {
    fs.writeFileSync(path.join(dir, 'PRD.md'), docs.prdMd);
  }

  if (docs.marketResearchMd) {
    fs.writeFileSync(path.join(dir, 'MARKET_RESEARCH.md'), docs.marketResearchMd);
  }
}

module.exports = { writeDocs };
