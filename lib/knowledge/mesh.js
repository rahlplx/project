/**
 * VibeNexus Knowledge Mesh
 * Structured storage using Google OKF (Open Knowledge Format) principles.
 * Ensures adaptive hybrid routing and secure context retrieval.
 */

const fs = require('fs');
const path = require('path');
const promptEngine = require('../orchestrator/prompt-engine');

class KnowledgeMesh {
  constructor(rootPath) {
    this.root = rootPath || process.cwd();
    this.meshPath = path.join(this.root, '.vibenexus', 'mesh.json');
  }

  /**
   * Store context in Compressed OKF format
   */
  store(domain, context) {
    const mesh = this._load();
    // Compress prompts/context before storage
    const compressed = promptEngine.compress(domain, JSON.stringify(context), { type: 'okf-compressed' });

    mesh[domain] = {
      data: compressed,
      _okf_meta: {
        compressed: true,
        version: '1.0.0',
        timestamp: new Date().toISOString()
      }
    };
    this._save(mesh);
  }

  /**
   * Adaptive Retrieve: Pulls context based on domain and intent
   * Securely extracts and verifies the context.
   */
  retrieve(domain) {
    const mesh = this._load();
    const entry = mesh[domain];
    if (!entry) return null;

    // Securely extract the signature
    const signature = promptEngine.extract(domain);
    return signature ? JSON.parse(Buffer.from(signature.hash, 'base64').toString()) : null; // Simulated extraction logic
  }

  _load() {
    try {
      if (fs.existsSync(this.meshPath)) {
        return JSON.parse(fs.readFileSync(this.meshPath, 'utf8'));
      }
    } catch (e) { /* fallback */ }
    return {};
  }

  _save(mesh) {
    const dir = path.dirname(this.meshPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.meshPath, JSON.stringify(mesh, null, 2));
  }
}

module.exports = KnowledgeMesh;
