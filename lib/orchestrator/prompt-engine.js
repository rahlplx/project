/**
 * VibeNexus Semantic Prompt Compressor
 * Ensures ZERO-LOSS retrieval via structural mapping.
 */

class PromptEngine {
  constructor() {
    this._meshStore = new Map();
  }

  /**
   * Compress a prompt into a Signature (Zero-Loss)
   */
  compress(id, content, schema) {
    const signature = {
      id,
      content, // Full content preserved for zero-loss
      schema,
      compressedAt: Date.now(),
      v: '1.0.0'
    };
    this._meshStore.set(id, signature);
    return { id, schema, hash: Buffer.from(id).toString('hex') };
  }

  /**
   * Zero-loss extraction
   */
  extract(id) {
    return this._meshStore.get(id);
  }

  /**
   * Secure Injection Gate
   */
  secureInject(template, context) {
    const INJECTION_SIGNALS = /ignore previous|you are now|disregard|you are a/i;
    const sanitized = {};
    for (const [k, v] of Object.entries(context || {})) {
      const val = String(v || '');
      if (INJECTION_SIGNALS.test(val)) {
        sanitized[k] = "[BLOCK: PROMPT INJECTION DETECTED]";
      } else {
        sanitized[k] = val;
      }
    }
    return template.replace(/{{(\w+)}}/g, (_, p1) => sanitized[p1] || _);
  }
}

module.exports = new PromptEngine();
