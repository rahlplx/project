const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const { SchemaGenerator } = require('./schema-generator');
const { TokenOptimizer } = require('./token-optimizer');
const { SkillCache, BatchProcessor } = require('./performance-optimizer');

class MCPAdapter {
  constructor(skills, options = {}) {
    this.skills = skills;
    this.server = new Server(
      { name: 'vibe-stack', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    this.skillCache = new SkillCache(() => skills);
    this.batchProcessor = new BatchProcessor({ maxConcurrency: options.maxConcurrency ?? 10 });
    this.tokenOptimizer = new TokenOptimizer();
    this.toolMap = this.#buildToolMap();
    this.#registerHandlers();
  }

  #buildToolMap() {
    const skills = this.skillCache.getAll();
    const map = {};
    for (const [key, { instance }] of Object.entries(skills)) {
      const proto = Object.getPrototypeOf(instance);
      const methodNames = new Set([
        ...Object.getOwnPropertyNames(proto),
        ...Object.getOwnPropertyNames(instance),
      ]);
      for (const method of methodNames) {
        if (
          typeof instance[method] === 'function' &&
          method !== 'constructor' &&
          method !== 'toJSON' &&
          !method.startsWith('_')
        ) {
          const toolName = `${key}:${method}`.replace(/\//g, '_');
          const jsdoc = this.#extractJSDoc(instance, method);
          const schema = SchemaGenerator.fromMethod(instance[method], jsdoc);
          const paramOrder = Object.keys(schema.properties || {});
          map[toolName] = { instance, method, key, paramOrder };
        }
      }
    }
    return map;
  }

  invalidateSkillCache() {
    this.skillCache.invalidate();
    this.toolMap = this.#buildToolMap();
  }

  #extractJSDoc(instance, methodName) {
    const proto = Object.getPrototypeOf(instance);
    const descriptor = Object.getOwnPropertyDescriptor(proto, methodName);
    if (descriptor && descriptor.value) {
      const fnStr = descriptor.value.toString();
      const jsdocMatch = fnStr.match(/\/\*\*[\s\S]*?\*\//);
      return jsdocMatch ? jsdocMatch[0] : '';
    }
    return '';
  }

  #sanitizeArgs(args) {
    return Object.fromEntries(
      Object.entries(args || {}).map(([k, v]) => {
        if (typeof v === 'string' && v.length > 4096) {
          return [k, v.slice(0, 4096)];
        }
        return [k, v];
      })
    );
  }

  #registerHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = [];
      for (const [toolName, { instance, method, key }] of Object.entries(this.toolMap)) {
        const fn = instance[method];
        const jsdoc = this.#extractJSDoc(instance, method);
        const inputSchema = SchemaGenerator.fromMethod(fn, jsdoc);

        tools.push({
          name: toolName,
          description: `${instance.description || key} — ${method}`,
          inputSchema,
        });
      }
      return { tools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params;
      const entry = this.toolMap[name];

      if (!entry) {
        return TokenOptimizer.wrapError(new Error(`Unknown tool: ${name}`), -32602);
      }

      try {
        const safeArgs = this.#sanitizeArgs(args);
        const orderedArgs = entry.paramOrder.map(k => safeArgs[k]);
        const result = await Promise.resolve(entry.instance[entry.method](...orderedArgs));

        const wrapped = TokenOptimizer.wrapResult(result);
        if (wrapped.truncated) {
          return {
            content: [{ type: 'text', text: wrapped.text }],
            isError: false,
            _meta: { truncated: true, originalTokens: wrapped.originalTokens },
          };
        }

        return {
          content: [{ type: 'text', text: wrapped.text }],
          isError: false,
        };
      } catch (err) {
        return TokenOptimizer.wrapError(err);
      }
    });
  }

  async callToolsBatch(toolCalls) {
    const tasks = toolCalls.map(({ name, arguments: args }) => {
      const entry = this.toolMap[name];
      if (!entry) {
        return Promise.resolve(
          TokenOptimizer.wrapError(new Error(`Unknown tool: ${name}`), -32602)
        );
      }
      return {
        instance: entry.instance,
        method: entry.method,
        args: entry.paramOrder.map(k => this.#sanitizeArgs(args)[k]),
      };
    });

    const results = await this.batchProcessor.run(tasks);
    return results.map((result, _index) => {
      if (result.status === 'rejected') {
        return TokenOptimizer.wrapError(result.reason);
      }
      const wrapped = TokenOptimizer.wrapResult(result.value);
      return {
        content: [{ type: 'text', text: wrapped.text }],
        isError: false,
        _meta: wrapped.truncated
          ? { truncated: true, originalTokens: wrapped.originalTokens }
          : undefined,
      };
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }

  getServer() {
    return this.server;
  }

  getToolMap() {
    return this.toolMap;
  }

  getSkillCacheStats() {
    return { size: this.skillCache.cacheSize };
  }
}

function createMCPServer(skills, options = {}) {
  return new MCPAdapter(skills, options);
}

module.exports = { MCPAdapter, createMCPServer };
