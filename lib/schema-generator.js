const crypto = require('crypto');

class SchemaGenerator {
  static #cache = new Map();
  static #jsdocCache = new Map();

  static fromMethod(fn, jsdoc = '') {
    const cacheKey = this.#getCacheKey(fn, jsdoc);
    if (this.#cache.has(cacheKey)) {
      return this.#cache.get(cacheKey);
    }

    const schema = this.#generateSchema(fn, jsdoc);
    this.#cache.set(cacheKey, schema);
    return schema;
  }

  static #getCacheKey(fn, jsdoc) {
    const fnStr = fn.toString();
    const hash = crypto
      .createHash('sha256')
      .update(fnStr + jsdoc)
      .digest('hex')
      .slice(0, 16);
    return `${fn.name || 'anon'}:${hash}`;
  }

  static #generateSchema(fn, jsdoc) {
    const params = this.#extractParams(fn);
    const jsdocParams = this.#parseJSDoc(jsdoc);

    const properties = {};
    const required = [];

    for (const param of params) {
      const key = param.name.replace(/^_+/, '');
      const jsdocInfo = jsdocParams[param.name] || jsdocParams[key] || {};
      const type = this.#inferType(param, jsdocInfo);

      properties[key] = {
        type,
        description: jsdocInfo.description || this.#defaultDescription(key),
      };

      if (param.default === undefined) {
        required.push(key);
      }

      if (param.default !== undefined) {
        properties[key].default = param.default;
      }
    }

    return {
      type: 'object',
      properties,
      required,
      additionalProperties: false,
    };
  }

  static #extractParams(fn) {
    const fnStr = fn.toString();
    const match = fnStr.match(/^(?:async\s+)?(?:function\s+\w*\s*)?\(([^)]*)\)/);
    if (!match) return [];

    const paramsStr = match[1].trim();
    if (!paramsStr) return [];

    return this.#splitParams(paramsStr).map((p, i) => this.#parseParam(p.trim(), i));
  }

  static #splitParams(paramsStr) {
    const params = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = '';
    for (let i = 0; i < paramsStr.length; i++) {
      const char = paramsStr[i];

      if (!inString && (char === '"' || char === "'" || char === '`')) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar && paramsStr[i - 1] !== '\\') {
        inString = false;
        stringChar = '';
      }

      if (!inString) {
        if (char === '{' || char === '[' || char === '(') {
          depth++;
        } else if (char === '}' || char === ']' || char === ')') {
          depth--;
        }
      }

      if (char === ',' && depth === 0 && !inString) {
        params.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    if (current) params.push(current);
    return params;
  }

  static #parseParam(paramStr, index) {
    let name = `arg${index}`;
    let defaultValue = undefined;
    let isRest = false;
    let destructured = null;

    const trimmed = paramStr.trim();

    if (trimmed.startsWith('...')) {
      isRest = true;
      name = trimmed.slice(3).trim();
    } else if (this.#hasTopLevelEquals(trimmed)) {
      const [left, right] = this.#splitTopLevelEquals(trimmed);
      const leftTrimmed = left.trim();
      if (leftTrimmed.startsWith('{') && leftTrimmed.endsWith('}')) {
        destructured = leftTrimmed
          .slice(1, -1)
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
        name = 'options';
      } else {
        name = leftTrimmed;
      }
      defaultValue = this.#parseDefaultValue(right.trim());
    } else if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      destructured = trimmed
        .slice(1, -1)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      name = 'options';
    } else {
      name = trimmed;
    }

    return { name, default: defaultValue, isRest, destructured };
  }

  static #hasTopLevelEquals(str) {
    let depth = 0;
    for (const char of str) {
      if (char === '{' || char === '[' || char === '(') depth++;
      else if (char === '}' || char === ']' || char === ')') depth--;
      else if (char === '=' && depth === 0) return true;
    }
    return false;
  }

  static #splitTopLevelEquals(str) {
    let depth = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '{' || char === '[' || char === '(') depth++;
      else if (char === '}' || char === ']' || char === ')') depth--;
      else if (char === '=' && depth === 0) {
        return [str.slice(0, i), str.slice(i + 1)];
      }
    }
    return [str, ''];
  }

  static #parseDefaultValue(str) {
    if (str === 'true') return true;
    if (str === 'false') return false;
    if (str === 'null') return null;
    if (str === 'undefined') return undefined;
    if (/^\d+$/.test(str)) return parseInt(str, 10);
    if (/^\d*\.\d+$/.test(str)) return parseFloat(str);
    if (/^["'`].*["'`]$/.test(str)) return str.slice(1, -1);
    if (str.startsWith('[') || str.startsWith('{')) {
      try {
        // Handle unquoted keys in object literals: { debug: true } -> { "debug": true }
        const jsonStr = str.replace(/(['"])?([a-zA-Z_$][a-zA-Z0-9_$]*)(['"])?\s*:/g, '"$2":');
        return JSON.parse(jsonStr.replace(/'/g, '"'));
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  static #parseJSDoc(jsdoc) {
    if (!jsdoc) return {};

    const cacheKey = crypto.createHash('sha256').update(jsdoc).digest('hex').slice(0, 16);
    if (this.#jsdocCache.has(cacheKey)) {
      return this.#jsdocCache.get(cacheKey);
    }

    const params = {};
    const paramRegex = /@param\s+\{([^}]+)\}\s*(\w+(?:\.\w+)?)\s*(?:[-–—]\s*(.+))?/g;
    let match;
    while ((match = paramRegex.exec(jsdoc)) !== null) {
      const [, type, name, description] = match;
      params[name] = { type: type.toLowerCase(), description: description?.trim() };
    }

    this.#jsdocCache.set(cacheKey, params);
    return params;
  }

  static #inferType(param, jsdocInfo) {
    if (jsdocInfo.type) {
      return this.#normalizeType(jsdocInfo.type);
    }

    if (param.default !== undefined) {
      return this.#jsTypeToSchemaType(typeof param.default);
    }

    if (param.destructured) {
      return 'object';
    }

    if (param.isRest) {
      return 'array';
    }

    return this.#inferFromName(param.name);
  }

  static #normalizeType(type) {
    const t = type.toLowerCase();
    if (t.includes('string')) return 'string';
    if (t.includes('number') || t.includes('int') || t.includes('float')) return 'number';
    if (t.includes('boolean') || t === 'bool') return 'boolean';
    if (t.includes('array') || t.includes('[]')) return 'array';
    if (t.includes('object') || t === 'obj') return 'object';
    if (t === 'any') return 'string';
    return 'string';
  }

  static #jsTypeToSchemaType(jsType) {
    switch (jsType) {
      case 'string':
        return 'string';
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'object':
        return 'object';
      case 'function':
        return 'string';
      default:
        return 'string';
    }
  }

  static #inferFromName(name) {
    const lower = name.toLowerCase();
    if (
      lower.includes('path') ||
      lower.includes('dir') ||
      lower.includes('file') ||
      lower.includes('url') ||
      lower.includes('name') ||
      lower.includes('id') ||
      lower.includes('key')
    ) {
      return 'string';
    }
    if (
      lower.includes('count') ||
      lower.includes('num') ||
      lower.includes('size') ||
      lower.includes('limit') ||
      lower.includes('max') ||
      lower.includes('min') ||
      lower.includes('port') ||
      lower.includes('timeout')
    ) {
      return 'number';
    }
    if (
      lower.startsWith('is') ||
      lower.startsWith('has') ||
      lower.startsWith('can') ||
      lower.startsWith('should') ||
      lower.startsWith('enable') ||
      lower.startsWith('disable') ||
      lower.includes('flag')
    ) {
      return 'boolean';
    }
    if (
      lower.includes('list') ||
      lower.includes('items') ||
      lower.includes('array') ||
      lower.endsWith('s')
    ) {
      return 'array';
    }
    if (
      lower.includes('options') ||
      lower.includes('config') ||
      lower.includes('settings') ||
      lower.includes('params')
    ) {
      return 'object';
    }
    return 'string';
  }

  static #defaultDescription(name) {
    const lower = name.toLowerCase();
    if (lower.includes('path')) return 'File or directory path';
    if (lower.includes('dir')) return 'Directory path';
    if (lower.includes('file')) return 'File path';
    if (lower.includes('url')) return 'URL string';
    if (lower.includes('name')) return 'Name identifier';
    if (lower.includes('id')) return 'Unique identifier';
    if (lower.includes('count')) return 'Count value';
    if (lower.includes('limit')) return 'Maximum limit';
    if (lower.includes('options')) return 'Configuration options';
    if (lower.includes('config')) return 'Configuration object';
    return 'Parameter value';
  }

  static clearCache() {
    this.#cache.clear();
    this.#jsdocCache.clear();
  }
}

module.exports = { SchemaGenerator };
