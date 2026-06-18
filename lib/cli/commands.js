/**
 * CLI Commands Module
 * Provides CLI interface for orchestrator
 */

const { Orchestrator } = require('../legacy-orchestrator');

/**
 * Create CLI commands
 * @returns {Object} Commands object
 */
function createCommands() {
  const orch = new Orchestrator();

  return {
    intent: {
      description: 'Capture user intent',
      handler: async args => {
        return await orch.run(args);
      },
    },
    research: {
      description: 'Research project domain',
      handler: async args => {
        return await orch.run(args);
      },
    },
    generate: {
      description: 'Generate documentation',
      handler: async args => {
        return await orch.run(args);
      },
    },
  };
}

module.exports = { createCommands };
