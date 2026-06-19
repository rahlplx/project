const { describe, test, expect, jest } = require('../jest-compat');

const { FeedbackLoop } = require('./feedback-loop');

describe('feedback loop', () => {
  test('creates feedback loop with knowledge base', () => {
    const kb = { patterns: [], addPattern: jest.fn() };
    const loop = new FeedbackLoop(kb);
    expect(loop.kb).toBe(kb);
  });

  test('captures project feedback', () => {
    const kb = { patterns: [], addPattern: jest.fn(), incrementProjectCount: jest.fn() };
    const loop = new FeedbackLoop(kb);
    loop.captureFeedback({
      projectName: 'TestApp',
      patterns: [
        { name: 'Auth Pattern', category: 'auth', description: 'Use NextAuth.js', confidence: 0.8 },
      ],
      lessons: ['Use TypeScript'],
    });
    expect(kb.addPattern).toHaveBeenCalledTimes(1);
    expect(kb.incrementProjectCount).toHaveBeenCalledTimes(1);
  });

  test('captures multiple patterns', () => {
    const kb = { patterns: [], addPattern: jest.fn(), incrementProjectCount: jest.fn() };
    const loop = new FeedbackLoop(kb);
    loop.captureFeedback({
      projectName: 'TestApp',
      patterns: [
        { name: 'Auth Pattern', category: 'auth', description: 'Use NextAuth.js', confidence: 0.8 },
        { name: 'API Pattern', category: 'api', description: 'Use Express', confidence: 0.7 },
      ],
      lessons: [],
    });
    expect(kb.addPattern).toHaveBeenCalledTimes(2);
    expect(kb.incrementProjectCount).toHaveBeenCalledTimes(1);
  });

  test('returns feedback summary', () => {
    const kb = { patterns: [], addPattern: jest.fn() };
    const loop = new FeedbackLoop(kb);
    const summary = loop.getSummary();
    expect(summary).toHaveProperty('totalCaptured');
    expect(summary).toHaveProperty('lastCapture');
  });
});
