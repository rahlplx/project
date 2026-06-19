/**
 * VibeNexus Knowledge Mesh
 * OKF-compliant structured storage.
 */

const fs = require('fs');
const path = require('path');
const promptEngine = require('../orchestrator/prompt-engine');

class KnowledgeMesh {
  constructor(rootPath) {
    this.root = rootPath || process.cwd();
    this.meshPath = path.join(this.root, '.vibenexus', 'mesh.json');
  }

  store(domain, context) {
    const mesh = this._load();
    const signature = promptEngine.compress(domain, JSON.stringify(context), { type: 'okf-v1' });

    mesh[domain] = {
      signature,
      updatedAt: new Date().toISOString()
    };
    this._save(mesh);
  }

  retrieve(domain) {
    const signature = promptEngine.extract(domain);
    if (!signature) return null;

    try {
      return JSON.parse(signature.content);
    } catch (e) {
      return signature.content;
    }
  }

  _load() {
    try {
      if (fs.existsSync(this.meshPath)) {
        return JSON.parse(fs.readFileSync(this.meshPath, 'utf8'));
      }
    } catch (e) {}
    return {};
  }

  _save(mesh) {
    const dir = path.dirname(this.meshPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.meshPath, JSON.stringify(mesh, null, 2));
  }
}

module.exports = KnowledgeMesh;
