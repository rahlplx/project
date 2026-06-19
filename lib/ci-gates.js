const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

class CIGates {
  constructor(rootDir) {
    this.rootDir = rootDir || path.join(__dirname, '..');
  }

  validateYAML(content) {
    if (!content || typeof content !== 'string') {
      return { valid: false, error: 'Empty or non-string input' };
    }
    try {
      yaml.load(content);
      return { valid: true };
    } catch (e) {
      return { valid: false, error: e.message };
    }
  }

  validateFileName(fileName) {
    if (!fileName || typeof fileName !== 'string') {
      return { valid: false, error: 'Empty file name' };
    }
    const kebabCase = /^[a-z0-9]+(-[a-z0-9]+)*\.[a-z]+$/;
    if (!kebabCase.test(fileName)) {
      return { valid: false, error: `File name must be kebab-case: ${fileName}` };
    }
    return { valid: true };
  }

  validateSkillStructure(skillDir) {
    if (!fs.existsSync(skillDir)) {
      return { valid: false, error: `Directory not found: ${skillDir}` };
    }
    const requiredFiles = ['SKILL.md'];
    const missing = requiredFiles.filter(f => !fs.existsSync(path.join(skillDir, f)));
    if (missing.length > 0) {
      return { valid: false, error: `Missing required files: ${missing.join(', ')}` };
    }
    return { valid: true };
  }

  async runAll() {
    const results = { yaml: [], filenames: [], skills: [] };

    // Validate YAML files in catalog
    const catalogDir = path.join(this.rootDir, 'catalog');
    if (fs.existsSync(catalogDir)) {
      const yamlFiles = this._findFiles(catalogDir, '.yaml');
      for (const file of yamlFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const result = this.validateYAML(content);
        results.yaml.push({ file: path.relative(this.rootDir, file), ...result });
      }
    }

    // Validate file names in skills directory
    const skillsDir = path.join(this.rootDir, 'skills');
    if (fs.existsSync(skillsDir)) {
      const skillDirs = this._getDirs(skillsDir);
      for (const dir of skillDirs) {
        const files = this._findFiles(dir, '.js');
        for (const file of files) {
          const result = this.validateFileName(path.basename(file));
          results.filenames.push({ file: path.relative(this.rootDir, file), ...result });
        }
      }
    }

    // Validate skill structures
    const wellKnownDir = path.join(this.rootDir, '.well-known', 'agent-skills');
    if (fs.existsSync(wellKnownDir)) {
      const skillDirs = this._getDirs(wellKnownDir);
      for (const dir of skillDirs) {
        const result = this.validateSkillStructure(dir);
        results.skills.push({ skill: path.basename(dir), ...result });
      }
    }

    results.passed = [...results.yaml, ...results.filenames, ...results.skills].every(r => r.valid);

    return results;
  }

  _findFiles(dir, ext) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...this._findFiles(fullPath, ext));
      } else if (entry.name.endsWith(ext)) {
        files.push(fullPath);
      }
    }
    return files;
  }

  _getDirs(dir) {
    const dirs = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        dirs.push(path.join(dir, entry.name));
      }
    }
    return dirs;
  }
}

module.exports = { CIGates };
