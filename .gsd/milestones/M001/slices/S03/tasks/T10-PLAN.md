# T10 Plan — Create .husky/pre-commit

## Objective
Create pre-commit hook that runs quick checks: ESLint + YAML validation.

## Files to Create
- `.husky/pre-commit`

## Hook Script

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Skip if eslint not installed (optional dependency)
if ! command -v npx >/dev/null 2>&1; then
  echo "⚠ npx not found, skipping pre-commit checks"
  exit 0
fi

if ! [ -f "node_modules/.bin/eslint" ]; then
  echo "⚠ ESLint not installed, skipping lint check"
  exit 0
fi

echo "🔍 Running pre-commit checks..."

# 1. ESLint (quick check on staged files)
echo "  → ESLint..."
npx eslint . --max-warnings=0 2>&1 | head -30
LINT_EXIT=$?
if [ $LINT_EXIT -ne 0 ]; then
  echo "❌ ESLint failed. Fix errors or commit with --no-verify"
  exit 1
fi

# 2. YAML validation (catalog/tools.yaml)
echo "  → YAML validation..."
if [ -f "catalog/tools.yaml" ]; then
  node -e "
    const fs = require('fs');
    const yaml = require('js-yaml');
    try {
      yaml.load(fs.readFileSync('catalog/tools.yaml', 'utf8'));
      console.log('  ✓ catalog/tools.yaml valid');
    } catch (e) {
      console.error('❌ YAML invalid:', e.message);
      process.exit(1);
    }
  "
  YAML_EXIT=$?
  if [ $YAML_EXIT -ne 0 ]; then
    echo "❌ YAML validation failed"
    exit 1
  fi
fi

echo "✅ Pre-commit checks passed"
exit 0
```

## Key Behaviors

| Scenario | Behavior |
|----------|----------|
| ESLint not installed | Skip with warning (optional) |
| Lint errors found | Block commit, show errors |
| YAML invalid | Block commit, show error |
| `--no-verify` flag | Git bypasses hook entirely |

## Verification
- File exists at `.husky/pre-commit` with execute permissions
- `git commit -m "test"` runs hook (shows "🔍 Running pre-commit checks...")
- Lint error blocks commit
- `--no-verify` bypasses hook
- YAML error blocks commit