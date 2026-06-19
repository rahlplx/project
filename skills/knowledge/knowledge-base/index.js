#!/usr/bin/env node
const { SkillBase } = require('../../../lib/skill-base.js');

class KnowledgeBase extends SkillBase {
  constructor() {
    super();
    this.name = 'knowledge-base';
    this.version = '1.0.0';
    this.description = 'Project documentation generator — creates README, API docs, and guides';
    this._docs = [];
  }

  generate(type, data) {
    const generators = {
      readme: this._generateReadme,
      api: this._generateApiDoc,
      component: this._generateComponentDoc,
      changelog: this._generateChangelog,
    };
    const gen = generators[type];
    if (!gen) {
      return {
        success: false,
        error: `Unknown doc type: ${type}. Use: readme, api, component, changelog`,
      };
    }

    const doc = gen(data);
    this._docs.push({ type, title: doc.title, generatedAt: new Date().toISOString() });
    return { success: true, type, ...doc };
  }

  _generateReadme(data) {
    const title = data.title || 'Project';
    return {
      title,
      content: `# ${title}\n\n${data.description || 'Description'}\n\n## Features\n${(data.features || []).map(f => `- ${f}`).join('\n')}\n\n## Quick Start\n\`\`\`\n${data.installCommand || 'npm install'}\n\`\`\`\n\n## Usage\n${data.usage || 'See examples.'}`,
      sections: ['Title', 'Description', 'Features', 'Quick Start', 'Usage'],
    };
  }

  _generateApiDoc(data) {
    return {
      title: `${data.name || 'API'} Documentation`,
      endpoints: (data.endpoints || []).map(e => ({
        method: e.method || 'GET',
        path: e.path || '/',
        description: e.description || '',
        params: e.params || [],
      })),
      content: (data.endpoints || [])
        .map(e => `### ${e.method || 'GET'} ${e.path || '/'}\n${e.description || ''}`)
        .join('\n\n'),
    };
  }

  _generateComponentDoc(data) {
    return {
      title: `${data.name || 'Component'} Docs`,
      props: (data.props || []).map(p => ({
        name: p.name,
        type: p.type || 'any',
        description: p.description || '',
      })),
      usage: data.usage || '',
      content: `# ${data.name || 'Component'}\n\n## Props\n${(data.props || []).map(p => `- **${p.name}** (\`${p.type || 'any'}\`): ${p.description || ''}`).join('\n')}`,
    };
  }

  _generateChangelog(data) {
    return {
      title: 'Changelog',
      entries: (data.entries || []).map(e => ({
        version: e.version || '0.1.0',
        date: e.date || new Date().toISOString().split('T')[0],
        changes: e.changes || [],
      })),
      content: (data.entries || [])
        .map(
          e =>
            `## ${e.version || '0.1.0'} (${e.date || ''})\n${(e.changes || []).map(c => `- ${c}`).join('\n')}`
        )
        .join('\n\n'),
    };
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

module.exports = KnowledgeBase;
