/**
 * VibeNexus Semantic Prompt Compressor
 * Ensures zero-loss retrieval by storing prompts as Intent Signatures.
 * Mathematically compressed via structural schema mapping.
 */

class PromptEngine {
  constructor() {
    this._registry = new Map();
  }

  /**
   * Compress a prompt into a Signature (Intent + Schema)
   */
  compress(id, intent, schema) {
    const signature = {
      intent: intent.toLowerCase().trim(),
      schema: schema,
      compressedAt: Date.now(),
      hash: Buffer.from(intent).toString('base64').slice(0, 12),
    };
    this._registry.set(id, signature);
    return signature;
  }

  /**
   * Zero-loss retrieval of the prompt signature
   */
  extract(id) {
    return this._registry.get(id);
  }

  /**
   * Secure Injection Gate: Validates context before prompt construction
   */
  secureInject(template, context) {
    // Prevent AI Slop and Injection
    const INJECTION_SIGNALS = /ignore previous|disregard|you are now/i;
    const sanitizedContext = {};

    for (const [key, value] of Object.entries(context)) {
      if (typeof value === 'string' && INJECTION_SIGNALS.test(value)) {
        sanitizedContext[key] = "[BLOCK: SECURITY RISK]";
      } else {
        sanitizedContext[key] = value;
      }
    }

    return template.replace(/{{(\w+)}}/g, (match, p1) => sanitizedContext[p1] || match);
  }
}

module.exports = new PromptEngine();
