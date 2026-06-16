/**
 * Complexity Scanner
 * Heuristic cyclomatic-complexity proxy: counts branching keywords + nesting depth
 * per function without requiring a full AST parser.
 * Flags functions with score >= 8 (the gate used in enterprise linting standards).
 */

const BRANCH_KEYWORDS = /\b(if|else|for|while|switch|case|catch|&&|\|\||\?)\b/g;
const FUNCTION_START = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>|\b(\w+)\s*\([^)]*\)\s*\{)/g;

const COMPLEXITY_THRESHOLD = 8;
const NESTING_WARN = 4;

function scanCode(code, options = {}) {
  const threshold = options.threshold || COMPLEXITY_THRESHOLD;
  const lines = String(code || '').split('\n');
  const findings = [];

  let currentFn = null;
  let fnLines = [];
  let depth = 0;
  let maxDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;

    if (!currentFn && FUNCTION_START.test(line)) {
      currentFn = { start: i + 1, name: extractFnName(line) };
      fnLines = [];
      depth = 0;
      maxDepth = 0;
      FUNCTION_START.lastIndex = 0;
    }

    if (currentFn) {
      fnLines.push(line);
      depth += openBraces - closeBraces;
      maxDepth = Math.max(maxDepth, depth);

      if (depth <= 0 && fnLines.length > 1) {
        const body = fnLines.join('\n');
        const branchCount = (body.match(BRANCH_KEYWORDS) || []).length;
        const score = 1 + branchCount;

        if (score >= threshold || maxDepth >= NESTING_WARN) {
          findings.push({
            name: currentFn.name,
            line: currentFn.start,
            score,
            maxNestingDepth: maxDepth,
            severity: score >= threshold * 1.5 ? 'high' : 'medium',
            message: score >= threshold
              ? `Complexity score ${score} exceeds threshold ${threshold} — split into smaller functions`
              : `Nesting depth ${maxDepth} is hard to follow — flatten with early returns`
          });
        }
        currentFn = null;
        fnLines = [];
      }
    }
  }

  return {
    findings,
    clean: findings.length === 0,
    highComplexity: findings.filter((f) => f.severity === 'high').length,
    threshold
  };
}

function extractFnName(line) {
  const m = line.match(/function\s+(\w+)/) ||
             line.match(/(?:const|let|var)\s+(\w+)\s*=/) ||
             line.match(/^\s*(\w+)\s*\(/);
  return m ? m[1] : '<anonymous>';
}

module.exports = { scanCode, COMPLEXITY_THRESHOLD, NESTING_WARN };
