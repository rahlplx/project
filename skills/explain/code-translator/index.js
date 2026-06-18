#!/usr/bin/env node

class CodeTranslator {
  constructor(config = {}) {
    this.name = 'code-translator';
    this.version = '1.0.0';
    this.description = 'Translate code between programming languages — maps common patterns';
  }

  translate(code, from, to) {
    if (!code) return { success: false, error: 'No code provided.' };

    const sourceLang = from || this._detectLanguage(code);
    const targetLang = to || 'python';
    const mapping = this._buildMapping(sourceLang, targetLang);

    const lines = code.split('\n');
    const translated = lines
      .map(line => {
        const result = this._translateLine(line, mapping, sourceLang, targetLang);
        return result;
      })
      .join('\n');

    return {
      success: true,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      sourceCode: code,
      translatedCode: translated,
      notes: mapping.notes || [],
      timestamp: new Date().toISOString(),
    };
  }

  _detectLanguage(code) {
    if (
      /require\(|module\.exports|const\s+|let\s+|=>|console\.log/.test(code) &&
      !/def\s+/.test(code)
    ) {
      return 'javascript';
    }
    if (/def\s+\w+\s*\(|print\s*\(/.test(code)) return 'python';
    if (/fn\s+\w+|let\s+mut|println!/.test(code)) return 'rust';
    if (/func\s+\w+|package\s+|fmt\.Println/.test(code)) return 'go';
    if (/public\s+(class|static)|System\.out/.test(code)) return 'java';
    return 'javascript';
  }

  _buildMapping(from, to) {
    const pairs = {
      javascript: {
        python: {
          const: line => line.replace(/\bconst\s+(\w+)\s*=\s*([^;]+);?/, '$1 = $2'),
          let: line => line.replace(/\blet\s+(\w+)\s*=\s*([^;]+);?/, '$1 = $2'),
          '=>': line =>
            line.replace(/\(([^)]*)\)\s*=>\s*{?([^}]*)}?/, (_, p, b) => `lambda ${p}: ${b.trim()}`),
          'console.log': line => line.replace(/console\.log\(([^)]+)\)/g, 'print($1)'),
          function: line => line.replace(/function\s+(\w+)\s*\(([^)]*)\)\s*{/g, 'def $1($2):'),
          if: line => line.replace(/}\s*else\s+if\s*\(([^)]+)\)\s*{/g, 'elif $1:'),
          else: line => line.replace(/}\s*else\s*{/g, 'else:'),
          '//': line => line.replace(/\/\/(.*)/, '#$1'),
          null: line => line.replace(/\bnull\b/g, 'None'),
          true: line => line.replace(/\btrue\b/g, 'True'),
          false: line => line.replace(/\bfalse\b/g, 'False'),
          array: line => line.replace(/\.push\(([^)]+)\)/g, '.append($1)'),
          length: line => line.replace(/\.length\b/g, '.__len__()'),
          semicolon: line => line.replace(/;\s*$/, ''),
          notes: ['Python uses indentation instead of braces', 'Use len() instead of .length'],
        },
      },
      python: {
        javascript: {
          def: line => line.replace(/def\s+(\w+)\s*\(([^)]*)\):/g, 'function $1($2) {'),
          print: line => line.replace(/print\s*\(([^)]+)\)/g, 'console.log($1)'),
          None: line => line.replace(/\bNone\b/g, 'null'),
          True: line => line.replace(/\bTrue\b/g, 'true'),
          False: line => line.replace(/\bFalse\b/g, 'false'),
          elif: line => line.replace(/elif\s+([^:]+):/g, '} else if ($1) {'),
          'else:': line => line.replace(/else:/g, 'else {'),
          '#': line => line.replace(/#(.*)/, '//$1'),
          '.append(': line => line.replace(/\.append\(/g, '.push('),
          notes: ['JavaScript uses braces and semicolons', 'Use .length instead of __len__()'],
        },
      },
    };
    return (
      pairs[from]?.[to] || {
        notes: [`No direct mapping from ${from} to ${to}. Basic syntax only.`],
      }
    );
  }

  _translateLine(line, mapping, from, _to) {
    let result = line;

    if (mapping['//'] && from !== 'python') result = mapping['//'](result);
    else if (mapping['#']) result = mapping['#'](result);

    const transforms = [
      'const',
      'let',
      'function',
      'def',
      '=>',
      'console.log',
      'print',
      'if',
      'else',
      'elif',
      'else:',
      'null',
      'None',
      'true',
      'True',
      'false',
      'False',
      '.push',
      '.append',
      'length',
      'semicolon',
      '.append(',
    ];

    for (const key of transforms) {
      if (mapping[key]) {
        result = mapping[key](result);
      }
    }

    return result;
  }

  getSupportedLanguages() {
    return [
      { id: 'javascript', name: 'JavaScript', canTranslateTo: ['python'] },
      { id: 'python', name: 'Python', canTranslateTo: ['javascript'] },
      { id: 'rust', name: 'Rust', canTranslateTo: [] },
      { id: 'go', name: 'Go', canTranslateTo: [] },
      { id: 'java', name: 'Java', canTranslateTo: [] },
    ];
  }

  toJSON() {
    return {
      name: this.name,
      version: this.version,
      description: this.description,
      supported: this.getSupportedLanguages().map(l => l.name),
    };
  }
}

if (require.main === module) {
  const skill = new CodeTranslator();
  const code = process.argv[2] || 'const x = 1;';
  const from = process.argv[3] || '';
  const to = process.argv[4] || '';
  console.log(JSON.stringify(skill.translate(code, from, to), null, 2));
}

module.exports = CodeTranslator;
