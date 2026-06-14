class SampleSkill {
  constructor() {
    this.name = 'sample-skill';
    this.version = '1.0.0';
    this.description = 'A sample skill for testing IDE installation';
  }

  process(input) {
    return { processed: true, input };
  }

  validate(data) {
    const errors = [];
    if (!data) errors.push('data is required');
    return { valid: errors.length === 0, errors };
  }

  transform(items) {
    return items.map(i => i * 2);
  }

  toJSON() {
    return { name: this.name, version: this.version };
  }
}

module.exports = SampleSkill;
