/**
 * Orchestrator Module
 * Coordinates all modules for unified AI engineering workflow
 */

const { captureIntent, validateInput, sanitizeProjectName } = require('./intent-capture');
const { researchProject } = require('./research/researcher');
const { generateDocs } = require('./generator/doc-generator');
// file-writer imported only when writeDocs is needed at runtime
const { KnowledgeBase } = require('./knowledge/knowledge-base');
const { FeedbackLoop } = require('./knowledge/feedback-loop');

class Orchestrator {
  constructor() {
    this.knowledgeBase = new KnowledgeBase();
    this.feedbackLoop = new FeedbackLoop(this.knowledgeBase);
  }

  /**
   * Run the full pipeline
   * @param {Object} input - User input
   * @returns {Object} Generated documents
   */
  async run(input) {
    const validation = validateInput(input);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const intent = captureIntent(input);
    const research = researchProject({
      projectName: sanitizeProjectName(input.projectName),
      domain: input.domain,
    });

    const docs = generateDocs(intent, research);
    return docs;
  }

  /**
   * Capture feedback from completed project
   * @param {Object} feedback - Project feedback
   */
  captureFeedback(feedback) {
    this.feedbackLoop.captureFeedback(feedback);
  }

  /**
   * Get statistics
   * @returns {Object} Stats
   */
  getStats() {
    return {
      totalProjects: this.knowledgeBase.stats.totalProjects,
      totalPatterns: this.knowledgeBase.stats.totalPatterns,
    };
  }
}

module.exports = { Orchestrator };
