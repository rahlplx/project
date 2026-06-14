#!/usr/bin/env node

class SpecDriven {
  constructor() {
    this.name = 'spec-driven';
    this.version = '1.0.0';
    this.description = 'Keep AI aligned with project intent using spec-driven development';
  }

  createSpec(options) {
    const spec = {
      title: options.title || 'Untitled Project',
      version: '1.0.0',
      description: options.description || '',
      requirements: this._parseRequirements(options.requirements || []),
      constraints: options.constraints || [],
      architecture: options.architecture || 'Not specified',
      techStack: options.techStack || [],
      features: (options.features || []).map(f => ({
        name: f,
        status: 'planned',
        tests: []
      })),
      timestamp: new Date().toISOString()
    };
    return spec;
  }

  validate(spec) {
    const issues = [];
    if (!spec.title || spec.title === 'Untitled Project') {
      issues.push('Spec is missing a meaningful title');
    }
    if (!spec.features || spec.features.length === 0) {
      issues.push('Spec must have at least one feature');
    }
    return { valid: issues.length === 0, issues };
  }

  exportToHandoff(spec) {
    const now = new Date().toISOString();
    let md = '# Handoff\n\n';
    md += '---\n';
    md += `spec: ${spec.title}\n`;
    md += `version: ${spec.version}\n`;
    md += `generated: ${now}\n`;
    md += `features: ${spec.features.length}\n`;
    md += '---\n\n';
    md += `## Spec: ${spec.title}\n\n`;
    md += `${spec.description || 'No description provided.'}\n\n`;
    md += '### Features\n\n';
    for (const f of spec.features) {
      md += `- ${f.name} (${f.status})\n`;
    }
    md += '\n### Requirements\n\n';
    for (const r of spec.requirements || []) {
      md += `- ${r.id}: ${r.description} [${r.priority}]\n`;
    }
    md += '\n### Constraints\n\n';
    for (const c of spec.constraints || []) {
      md += `- ${c}\n`;
    }
    if (spec.techStack && spec.techStack.length > 0) {
      md += '\n### Tech Stack\n\n';
      for (const t of spec.techStack) {
        md += `- ${t}\n`;
      }
    }
    md += '\n---\n';
    return md;
  }

  compareSpecs(specA, specB) {
    const changes = [];
    const added = [];
    const removed = [];

    if (specA.title !== specB.title) {
      changes.push(`Title changed: "${specA.title}" → "${specB.title}"`);
    }

    const featuresA = (specA.features || []).map(f => typeof f === 'string' ? f : f.name);
    const featuresB = (specB.features || []).map(f => typeof f === 'string' ? f : f.name);

    for (const f of featuresB) {
      if (!featuresA.includes(f)) {
        added.push(f);
        changes.push(`Feature added: ${f}`);
      }
    }

    for (const f of featuresA) {
      if (!featuresB.includes(f)) {
        removed.push(f);
        changes.push(`Feature removed: ${f}`);
      }
    }

    return { changes, added, removed, drift: changes.length > 0 };
  }

  mergeSpecs(specs) {
    const merged = {
      title: specs.length > 0 ? specs[0].title : 'Merged Spec',
      version: '1.0.0',
      description: specs.map(s => s.description || '').filter(Boolean).join('; '),
      requirements: [],
      constraints: [],
      architecture: specs.map(s => s.architecture).filter(Boolean)[0] || 'Not specified',
      techStack: [],
      features: [],
      timestamp: new Date().toISOString()
    };

    const seenFeatures = new Set();
    const seenTech = new Set();
    const seenReqs = new Set();

    for (const spec of specs) {
      for (const f of spec.features || []) {
        const name = typeof f === 'string' ? f : f.name;
        if (!seenFeatures.has(name)) {
          seenFeatures.add(name);
          merged.features.push(typeof f === 'string' ? f : { ...f });
        }
      }
      for (const t of spec.techStack || []) {
        if (!seenTech.has(t)) {
          seenTech.add(t);
          merged.techStack.push(t);
        }
      }
      for (const r of spec.requirements || []) {
        const key = r.description || r;
        if (!seenReqs.has(key)) {
          seenReqs.add(key);
          merged.requirements.push(r);
        }
      }
      for (const c of spec.constraints || []) {
        if (!merged.constraints.includes(c)) {
          merged.constraints.push(c);
        }
      }
    }

    return merged;
  }

  _parseRequirements(reqs) {
    return reqs.map((r, i) => ({
      id: `REQ-${String(i + 1).padStart(3, '0')}`,
      description: r,
      priority: i < 3 ? 'high' : 'medium',
      status: 'open'
    }));
  }

  checkAlignment(code, spec) {
    if (!code || !spec) return { aligned: false, message: 'Both code and spec are required.' };

    const specFeatures = spec.features?.map(f => f.name.toLowerCase()) || [];
    const specReqs = spec.requirements?.map(r => r.description.toLowerCase()) || [];
    const allSpec = [...specFeatures, ...specReqs].join(' ');
    const codeLower = code.toLowerCase();

    const matched = specFeatures.filter(f => codeLower.includes(f));
    const unmatched = specFeatures.filter(f => !codeLower.includes(f));

    return {
      aligned: unmatched.length === 0,
      matchedFeatures: matched,
      unmatchedFeatures: unmatched,
      coverage: specFeatures.length > 0 ? Math.round((matched.length / specFeatures.length) * 100) : 0,
      suggestions: unmatched.map(f => `Consider implementing: ${f}`),
      timestamp: new Date().toISOString()
    };
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

module.exports = SpecDriven;
