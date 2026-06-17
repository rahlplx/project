const crypto = require('crypto');

class TokenOptimizer {
  static #ansiRegex = (() => {
    const esc = String.fromCharCode(27);
    return new RegExp(`${esc}\\[[0-9;]*m`, 'g');
  })();
  static #defaultMaxTokens = 4000;
  static #charsPerToken = 4;

  static estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / this.#charsPerToken);
  }

  static stripANSI(text) {
    if (!text) return '';
    return text.replace(this.#ansiRegex, '');
  }

  static truncate(text, maxTokens = this.#defaultMaxTokens) {
    if (!text) return { text: '', truncated: false, originalTokens: 0, truncatedTokens: 0 };

    const cleanText = this.stripANSI(text);
    const originalTokens = this.estimateTokens(cleanText);

    if (originalTokens <= maxTokens) {
      return { text: cleanText, truncated: false, originalTokens, truncatedTokens: 0 };
    }

    const targetChars = maxTokens * this.#charsPerToken;
    const keepFirst = Math.floor(targetChars * 0.5);
    const keepLast = Math.floor(targetChars * 0.2);
    const middleChars = cleanText.length - keepFirst - keepLast;
    const truncatedTokens = this.estimateTokens(
      cleanText.slice(keepFirst, cleanText.length - keepLast)
    );

    const truncated =
      cleanText.slice(0, keepFirst) +
      `\n\n[... truncated ${truncatedTokens} tokens / ${middleChars} chars ...]\n\n` +
      cleanText.slice(-keepLast);

    return {
      text: truncated,
      truncated: true,
      originalTokens,
      truncatedTokens,
      keptTokens: originalTokens - truncatedTokens,
    };
  }

  static sanitizeError(err) {
    if (!err) return { message: 'Unknown error', code: -32603 };

    const message = err.message || String(err);
    const code = err.code || (err instanceof TypeError ? -32603 : -32603);

    const suggestion = this.#inferSuggestion(message, code);

    return {
      message,
      code,
      suggestion,
      timestamp: new Date().toISOString(),
    };
  }

  static #inferSuggestion(message, code) {
    const lower = message.toLowerCase();

    if (lower.includes('econnrefused') || lower.includes('connection refused')) {
      return 'Check if the target service is running and accessible';
    }
    if (lower.includes('eacces') || lower.includes('permission denied')) {
      return 'Check file/directory permissions or run with appropriate privileges';
    }
    if (lower.includes('enoent') || lower.includes('no such file')) {
      return 'Verify the file or directory path exists';
    }
    if (lower.includes('etimedout') || lower.includes('timeout')) {
      return 'Increase timeout or check network connectivity';
    }
    if (lower.includes('json') || lower.includes('parse')) {
      return 'Validate JSON input format';
    }
    if (code === -32602) {
      return 'Check tool name and required parameters';
    }
    if (code === -32601) {
      return 'Verify the method name is correct';
    }

    return 'Review the error message and adjust parameters accordingly';
  }

  static wrapResult(result, maxTokens = this.#defaultMaxTokens) {
    const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    return this.truncate(text, maxTokens);
  }

  static wrapError(err, maxTokens = this.#defaultMaxTokens) {
    const sanitized = this.sanitizeError(err);
    const text = JSON.stringify(sanitized, null, 2);
    return {
      content: [{ type: 'text', text }],
      isError: true,
      originalError: sanitized,
    };
  }

  static setDefaultMaxTokens(maxTokens) {
    this.#defaultMaxTokens = maxTokens;
  }

  static getDefaultMaxTokens() {
    return this.#defaultMaxTokens;
  }
}

module.exports = { TokenOptimizer };
