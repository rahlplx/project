/**
 * Feedback Loop Module
 * Captures project feedback and feeds it back to knowledge base
 */

class FeedbackLoop {
  constructor(knowledgeBase) {
    this.kb = knowledgeBase;
    this.captured = [];
  }

  /**
   * Capture feedback from a project
   * @param {Object} feedback - Project feedback
   */
  captureFeedback(feedback) {
    if (feedback.patterns) {
      feedback.patterns.forEach(pattern => {
        this.kb.addPattern(pattern);
        this.captured.push({
          projectName: feedback.projectName,
          pattern: pattern.name,
          timestamp: new Date().toISOString()
        });
      });
    }

    this.kb.incrementProjectCount();
  }

  /**
   * Get feedback summary
   * @returns {Object} Summary
   */
  getSummary() {
    return {
      totalCaptured: this.captured.length,
      lastCapture: this.captured.length > 0
        ? this.captured[this.captured.length - 1].timestamp
        : null
    };
  }
}

module.exports = { FeedbackLoop };
