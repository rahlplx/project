#!/usr/bin/env node

class CodeExplainer {
  constructor(config = {}) {
    this.name = 'code-explainer';
    this.version = '1.0.0';
    this.description = 'Explains code in plain English by analyzing structure and patterns';
  }

  explain(code, options = {}) {
    if (!code || typeof code !== 'string') {
      return { success: false, error: 'No code provided. Pass a string of source code.' };
    }

    const language = options.language || this._detectLanguage(code);
    const summary = this._analyzeStructure(code);
    const functions = this._extractFunctions(code);
    const classes = this._extractClasses(code);
    const imports = this._extractImports(code);
    const complexity = this._estimateComplexity(code);

    return {
      success: true,
      language,
      summary: this._generateSummary(summary, functions, classes, imports, complexity),
      details: {
        imports: imports,
        functions: functions.map(f => ({ name: f.name, params: f.params, lineCount: f.lineCount })),
        classes: classes.map(c => ({ name: c.name, methods: c.methods.length })),
        complexity: {
          lines: complexity.lines,
          conditionalBranches: complexity.branches,
          estimatedDifficulty: complexity.difficulty,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  _detectLanguage(code) {
    if (
      /require\(|module\.exports|import\s+|export\s+|const\s+|let\s+|=>|console\.log|function\s*(\*|\w)/.test(
        code
      )
    ) {
      return 'JavaScript';
    }
    if (/def\s+\w+\s*\(|import\s+\w+|from\s+\w+|class\s+\w+:|print\s*\(/.test(code)) {
      return 'Python';
    }
    if (/fn\s+\w+|let\s+mut|fn\s+main|println!|->\s*\w+/.test(code)) return 'Rust';
    if (/func\s+\w+|package\s+\w+|import\s+"|fmt\.Println/.test(code)) return 'Go';
    if (/public\s+(class|static)|System\.out|@Override/.test(code)) return 'Java';
    if (/interface\s+|type\s+\w+\s*=|import\s+{/.test(code)) return 'TypeScript';
    return 'Unknown';
  }

  _analyzeStructure(code) {
    const lines = code.split('\n').filter(l => l.trim());
    return {
      totalLines: lines.length,
      nonBlankLines: lines.filter(l => l.trim()).length,
      commentLines: lines.filter(
        l =>
          l.trim().startsWith('//') ||
          l.trim().startsWith('#') ||
          l.trim().startsWith('/*') ||
          l.trim().startsWith('*')
      ).length,
      emptyLines: code.split('\n').filter(l => !l.trim()).length,
    };
  }

  _extractFunctions(code) {
    const funcs = [];
    const patterns = [
      /(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g,
      /(\w+)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>)/g,
      /def\s+(\w+)\s*\(([^)]*)\)/g,
      /fn\s+(\w+)\s*\(([^)]*)\)/g,
      /func\s+(\w+)\s*\(([^)]*)\)/g,
    ];
    for (const pat of patterns) {
      let m;
      while ((m = pat.exec(code)) !== null) {
        const name = m[1] || 'anonymous';
        if (!funcs.find(f => f.name === name)) {
          funcs.push({
            name,
            params: m[2]
              ? m[2]
                  .split(',')
                  .map(p => p.trim())
                  .filter(Boolean)
              : [],
          });
        }
      }
    }
    const lines = code.split('\n');
    return funcs.map(f => ({
      ...f,
      lineCount: lines.filter(
        l =>
          l.includes(f.name) &&
          (l.includes('function') || l.includes('=>') || l.includes('def ') || l.includes('fn '))
      ).length,
    }));
  }

  _extractClasses(code) {
    const classes = [];
    const classPattern = /class\s+(\w+)(?:\s+extends\s+(\w+))?/g;
    let m;
    while ((m = classPattern.exec(code)) !== null) {
      classes.push({ name: m[1], extends: m[2] || null, methods: [], _pos: m.index });
    }

    const methodPattern = /(?<!\bfunction\s*\*?\s*)(\w+)\s*\([^)]*\)\s*\{/g;
    const SKIP = new Set(['if', 'for', 'while', 'switch', 'catch', 'function', 'constructor']);
    while ((m = methodPattern.exec(code)) !== null) {
      if (SKIP.has(m[1])) continue;
      // assign to the last class whose definition starts before this method
      let target = null;
      for (const cls of classes) {
        if (cls._pos < m.index) target = cls;
      }
      if (target) target.methods.push(m[1]);
    }

    classes.forEach(c => delete c._pos);
    return classes;
  }

  _extractImports(code) {
    const imports = [];
    const patterns = [
      /require\(['"]([^'"]+)['"]\)/g,
      /from\s+['"]([^'"]+)['"]/g,
      /import\s+(?:\w+\s*,?\s*)*\s*from\s+['"]([^'"]+)['"]/g,
      /import\s+['"]([^'"]+)['"]/g,
    ];
    for (const pat of patterns) {
      let m;
      while ((m = pat.exec(code)) !== null) {
        if (!imports.includes(m[1])) imports.push(m[1]);
      }
    }
    return imports;
  }

  _estimateComplexity(code) {
    const lines = code.split('\n');
    const branches = lines.filter(l =>
      /\bif\b|\belse\b|\belse if\b|\bfor\b|\bwhile\b|\bswitch\b|\bcase\b|\bcatch\b|\b&&\b|\b\|\|\b/.test(
        l
      )
    ).length;
    const difficulty = branches < 3 ? 'simple' : branches < 8 ? 'moderate' : 'complex';
    return { lines: lines.length, branches, difficulty };
  }

  _generateSummary(struct, functions, classes, imports, complexity) {
    const parts = [];
    parts.push(`This code contains ${struct.totalLines} lines (${struct.commentLines} comments).`);

    if (imports.length > 0) {
      parts.push(`It imports from ${imports.length} source${imports.length > 1 ? 's' : ''}.`);
    }

    if (functions.length > 0) {
      const names = functions.map(f => f.name).join(', ');
      parts.push(
        `It defines ${functions.length} function${functions.length > 1 ? 's' : ''}: ${names}.`
      );
    }

    if (classes.length > 0) {
      const names = classes
        .map(c => c.name + (c.extends ? ` (extends ${c.extends})` : ''))
        .join(', ');
      parts.push(`It defines ${classes.length} class${classes.length > 1 ? 'es' : ''}: ${names}.`);
    }

    parts.push(
      `Complexity is ${complexity.difficulty} (${complexity.branches} conditional branches).`
    );

    if (complexity.difficulty === 'simple') {
      parts.push('This code is straightforward and easy to follow.');
    } else if (complexity.difficulty === 'moderate') {
      parts.push('This code has some branching logic — review carefully.');
    } else parts.push('This code is complex — consider simplifying or adding comments.');

    return parts.join(' ');
  }

  toJSON() {
    return { name: this.name, version: this.version, description: this.description };
  }
}

if (require.main === module) {
  const skill = new CodeExplainer();
  const input = process.argv[2] || '';
  const code = input || '';
  console.log(JSON.stringify(skill.explain(code || 'console.log("hello")'), null, 2));
}

module.exports = CodeExplainer;
