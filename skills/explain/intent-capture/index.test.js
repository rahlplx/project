const IntentCapture = require('./index');

describe('IntentCapture', () => {
  it('should create instance', () => {
    const s = new IntentCapture();
    expect(s.name).toBe('intent-capture');
  });

  it('should capture project name', () => {
    const s = new IntentCapture();
    const r = s.capture('Build an app called MyApp for tracking expenses');
    expect(r.projectName).toContain('MyApp');
  });

  it('should detect website type', () => {
    const s = new IntentCapture();
    const r = s.capture('A landing page for my business');
    expect(r.projectType).toBe('website');
  });

  it('should detect API type', () => {
    const s = new IntentCapture();
    const r = s.capture('A REST API for managing inventory');
    expect(r.projectType).toBe('api');
  });

  it('should detect UI when mentioned', () => {
    const s = new IntentCapture();
    const r = s.capture('A dashboard showing analytics');
    expect(r.hasUI).toBe(true);
  });

  it('should detect no UI when not mentioned', () => {
    const s = new IntentCapture();
    const r = s.capture('A CLI tool for formatting code');
    expect(r.projectType).toBe('cli-tool');
  });

  it('should extract tech stack', () => {
    const s = new IntentCapture();
    const r = s.capture('A React dashboard with Node.js backend and PostgreSQL database');
    expect(r.techStack).toContain('React');
    expect(r.techStack).toContain('Node.js');
    expect(r.techStack).toContain('PostgreSQL');
  });

  it('should extract features', () => {
    const s = new IntentCapture();
    const r = s.capture('A site where users can create accounts, upload files, and send messages');
    expect(r.features.length).toBeGreaterThan(0);
  });

  it('should handle empty input', () => {
    const s = new IntentCapture();
    const r = s.capture('');
    expect(r.success).toBe(false);
  });

  it('should handle null input', () => {
    const s = new IntentCapture();
    const r = s.capture(null);
    expect(r.success).toBe(false);
  });

  it('should generate a summary', () => {
    const s = new IntentCapture();
    const r = s.capture('An ecommerce store with React frontend and Stripe payments');
    expect(r.summary).toBeTruthy();
    expect(r.summary).toContain('ecommerce');
  });

  it('should detect audience', () => {
    const s = new IntentCapture();
    const r = s.capture('An internal dashboard for the team');
    expect(r.targetAudience).toBe('internal');
  });

  it('should return metadata', () => {
    const s = new IntentCapture();
    expect(s.toJSON().capabilities.length).toBeGreaterThan(0);
  });
});
