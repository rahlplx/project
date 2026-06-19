#!/usr/bin/env node
const { SkillBase } = require('../../../lib/skill-base.js');

class IntentCapture extends SkillBase {
  constructor(config = {}) {
    super();
    this.name = 'intent-capture';
    this.version = '1.0.0';
    this.description = 'Extract structured project specs from natural language descriptions';
  }

  capture(description) {
    if (!description || typeof description !== 'string') {
      return { success: false, error: 'No description provided. Describe what you want to build.' };
    }

    const lower = description.toLowerCase();
    const words = description.split(/\s+/);

    return {
      success: true,
      projectName: this._extractName(description),
      projectType: this._detectType(lower),
      features: this._extractFeatures(lower),
      techStack: this._detectTechStack(lower),
      hasUI: this._detectUI(lower),
      targetAudience: this._detectAudience(lower),
      summary: this._generateSummary(description, lower),
      raw: { wordCount: words.length, description: description.slice(0, 500) },
      timestamp: new Date().toISOString(),
    };
  }

  _extractName(description) {
    const patterns = [
      /(?:called\s+"([^"]+)"|named\s+"([^"]+)"|called\s+(\w+)|named\s+(\w+))/i,
      /an?\s+(\w+(?:\s+\w+){0,3})\s+(?:app|website|site|tool|dashboard|platform|api|bot|service)/i,
      /(\w+(?:\s+\w+){0,2})\s+(?:builder|maker|tracker|finder|manager|generator)/i,
    ];
    for (const pat of patterns) {
      const m = description.match(pat);
      if (m) return m[1] || m[2] || m[3] || m[4] || m[0].split(' ').slice(0, 3).join(' ');
    }
    return 'Untitled Project';
  }

  _detectType(lower) {
    if (/website|landing page|site|web page/i.test(lower)) return 'website';
    if (/dashboard/i.test(lower)) return 'dashboard';
    if (/api|backend|server|service|endpoint/i.test(lower)) return 'api';
    if (/chatbot|chat|bot|assistant|ai agent/i.test(lower)) return 'chatbot';
    if (/cli|command line|terminal|tool/i.test(lower)) return 'cli-tool';
    if (/mobile|app|ios|android/i.test(lower)) return 'mobile-app';
    if (/ecommerce|shop|store|marketplace/i.test(lower)) return 'ecommerce';
    if (/blog|cms|content/i.test(lower)) return 'blog';
    if (/portfolio/i.test(lower)) return 'portfolio';
    if (/game/i.test(lower)) return 'game';
    return 'web-application';
  }

  _extractFeatures(lower) {
    const features = [];
    const patterns = [
      /(?:with|including|has|have|features?)\s+(.+?)(?:\.|$)/i,
      /users?\s+(?:can|should be able to)\s+(.+?)(?:\.|$)/i,
      /allow\s+(?:users?\s+)?to\s+(.+?)(?:\.|$)/i,
    ];
    for (const pat of patterns) {
      const m = lower.match(pat);
      if (m) {
        m[1].split(/,| and /).forEach(f => {
          const trimmed = f.trim();
          if (trimmed.length > 3 && !features.includes(trimmed)) features.push(trimmed);
        });
      }
    }
    return features.slice(0, 10);
  }

  _detectTechStack(lower) {
    const stack = [];
    const techMap = {
      react: 'React',
      vue: 'Vue',
      angular: 'Angular',
      svelte: 'Svelte',
      node: 'Node.js',
      express: 'Express',
      django: 'Django',
      flask: 'Flask',
      rails: 'Ruby on Rails',
      python: 'Python',
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      go: 'Go',
      rust: 'Rust',
      postgres: 'PostgreSQL',
      postgresql: 'PostgreSQL',
      mysql: 'MySQL',
      mongodb: 'MongoDB',
      sqlite: 'SQLite',
      tailwind: 'Tailwind CSS',
      bootstrap: 'Bootstrap',
      sass: 'Sass',
      next: 'Next.js',
      nuxt: 'Nuxt.js',
      gatsby: 'Gatsby',
      vercel: 'Vercel',
      netlify: 'Netlify',
      aws: 'AWS',
      docker: 'Docker',
      graphql: 'GraphQL',
      rest: 'REST',
      websocket: 'WebSocket',
      auth: 'Authentication',
      stripe: 'Stripe',
      supabase: 'Supabase',
      firebase: 'Firebase',
    };
    for (const [key, name] of Object.entries(techMap)) {
      if (lower.includes(key)) stack.push(name);
    }
    return [...new Set(stack)];
  }

  _detectUI(lower) {
    return /website|app|dashboard|page|mobile|interface|ui|screen|form|table|list|view/i.test(
      lower
    );
  }

  _detectAudience(lower) {
    if (/admin|internal|employee|staff|team/i.test(lower)) return 'internal';
    if (/(customer|client|user|public|anyone)/i.test(lower)) return 'external';
    if (/personal|my\s+own|myself/i.test(lower)) return 'personal';
    return 'general';
  }

  _generateSummary(raw, lower) {
    const type = this._detectType(lower);
    const ui = this._detectUI(lower);
    const features = this._extractFeatures(lower);
    const stack = this._detectTechStack(lower);
    const parts = [];
    parts.push(`A ${type}${ui ? ' with a user interface' : ''}.`);
    if (features.length > 0) parts.push(`Key features: ${features.slice(0, 3).join(', ')}.`);
    if (stack.length > 0) parts.push(`Tech: ${stack.slice(0, 5).join(', ')}.`);
    return parts.join(' ');
  }

  toJSON() {
    return {
      name: this.name,
      version: this.version,
      description: this.description,
      capabilities: [
        'project name extraction',
        'type detection',
        'feature extraction',
        'tech stack detection',
        'UI detection',
      ],
    };
  }
}

if (require.main === module) {
  const skill = new IntentCapture();
  const input =
    process.argv.slice(2).join(' ') || 'Build a website for freelancers to send invoices';
  console.log(JSON.stringify(skill.capture(input), null, 2));
}

module.exports = IntentCapture;
