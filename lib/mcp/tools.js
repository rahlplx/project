/**
 * MCP Tools Module
 * Provides MCP interface for orchestrator
 */

const { Orchestrator } = require('../orchestrator');

/**
 * Create MCP tools
 * @returns {Array} Tools array
 */
function createTools() {
  const orch = new Orchestrator();

  return [
    {
      name: 'capture_intent',
      description: 'Capture user intent and generate PROJECT.md + PRD.md',
      handler: async (args) => {
        return await orch.run(args);
      }
    },
    {
      name: 'research_project',
      description: 'Research project domain and generate MARKET_RESEARCH.md',
      handler: async (args) => {
        return await orch.run(args);
      }
    },
    {
      name: 'generate_docs',
      description: 'Generate all documentation from intent and research',
      handler: async (args) => {
        return await orch.run(args);
      }
    }
  ];
}

module.exports = { createTools };
