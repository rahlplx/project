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
