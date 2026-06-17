# Diff Preview Skill

Visual diff visualization for code changes. Perfect for reviewing code modifications, understanding updates, and comparing versions.

## Overview

The Diff Preview skill provides comprehensive code comparison utilities with multiple output formats including visual diffs, unified diffs, side-by-side views, and HTML exports.

## Installation

```javascript
const DiffPreview = require('./skills/preview/diff-preview');
const diffTool = new DiffPreview({
  contextLines: 3,
  showLineNumbers: true,
  colorize: true,
});
```

## Quick Start

```javascript
const oldCode = `function greet(name) {
  return "Hello, " + name;
}`;

const newCode = `function greet(name) {
  return "Hi, " + name + "!";
}`;

const result = diffTool.generateDiff(oldCode, newCode);
console.log(result.visual);
```

## Features

### Line-by-Line Diff

Computes differences using LCS (Longest Common Subsequence) algorithm for optimal results.

### Multiple Output Formats

- **Visual Diff**: Colored terminal output with line numbers
- **Side-by-Side**: Two-column comparison view
- **Unified Diff**: Git-style unified diff format
- **HTML Export**: Standalone HTML file for sharing

### Statistics

Automatically calculates:

- Lines added
- Lines removed
- Unchanged lines
- Total changes

## API Reference

### Constructor Options

```javascript
const diff = new DiffPreview({
  contextLines: 3, // Lines of context around changes (default: 3)
  showLineNumbers: true, // Display line numbers (default: true)
  colorize: true, // Use ANSI colors (default: true)
  wordDiff: false, // Enable word-level diff (default: false)
});
```

### Methods

#### `generateDiff(oldCode, newCode, options?)`

Generate a complete diff between two code strings.

**Parameters:**

- `oldCode` (string): Original code
- `newCode` (string): Modified code
- `options` (object, optional): Override constructor options

**Returns:**

```javascript
{
  type: 'diff',
  timestamp: '2024-01-15T10:30:00.000Z',
  stats: { additions: 2, deletions: 1, unchanged: 10, totalChanges: 3 },
  hunks: [...],
  visual: '...',       // Colored string output
  summary: '3 changes in 13 lines'
}
```

#### `renderSideBySide(oldCode, newCode, options?)`

Generate side-by-side view of changes.

**Parameters:**

- `maxWidth` (number): Maximum characters per column (default: 40)

**Returns:**

```javascript
[
  { type: 'unchanged', left: 'function greet(name) {', right: 'function greet(name) {' },
  { type: 'removed', left: '  return "Hello, " + name;', right: '' },
  { type: 'added', left: '', right: '  return "Hi, " + name + "!";' },
];
```

#### `generateUnifiedDiff(oldCode, newCode, filename?)`

Generate Git-style unified diff format.

**Output:**

```
--- a/file.js
+++ b/file.js
@@ -1,5 +1,5 @@
 function greet(name) {
-  return "Hello, " + name;
+  return "Hi, " + name + "!";
 }
```

#### `toHTML(oldCode, newCode, options?)`

Export diff as a standalone HTML file.

**Parameters:**

- `title` (string): Page title (default: 'Code Diff')

**Returns:** Complete HTML document as string

#### `toJSON(oldCode, newCode)`

Export diff as JSON string.

### Output Structure

#### Visual Output

```
   1     function greet(name) {
   2  -   return "Hello, " + name;
   2  +   return "Hi, " + name + "!";
   3  }
```

#### HTML Output

Dark-themed HTML with syntax highlighting:

- Green background for additions
- Red background for deletions
- Monospace font throughout

## Examples

### Basic Code Comparison

```javascript
const diff = new DiffPreview();

const before = `const add = (a, b) => a + b;
const multiply = (a, b) => a * b;

console.log(add(1, 2));
console.log(multiply(3, 4));`;

const after = `const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;

console.log(add(1, 2));
console.log(subtract(10, 5));
console.log(multiply(3, 4));`;

const result = diff.generateDiff(before, after);
console.log(result.summary); // "3 additions in 15 lines"
```

### File Version Comparison

```javascript
const fs = require('fs');

const oldContent = fs.readFileSync('version1.js', 'utf8');
const newContent = fs.readFileSync('version2.js', 'utf8');

const diffResult = diffTool.generateDiff(oldContent, newContent);
console.log(diffResult.stats);
```

### Export for Review

```javascript
const DiffPreview = require('./diff-preview');
const diff = new DiffPreview();

// Generate diff
const result = diff.generateDiff(oldCode, newCode);

// Save visual output
console.log(result.visual);

// Save as HTML for sharing
const html = diff.toHTML(oldCode, newCode, { title: 'My Feature Changes' });
fs.writeFileSync('diff-report.html', html);

// Save as JSON for processing
const json = diff.toJSON(oldCode, newCode);
```

### Side-by-Side Comparison

```javascript
const diff = new DiffPreview();
const sideBySide = diff.renderSideBySide(oldCode, newCode, { maxWidth: 50 });

for (const line of sideBySide) {
  const marker = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';
  console.log(`${marker} ${line.left} | ${line.right}`);
}
```

## Advanced Usage

### Custom Context Lines

```javascript
// Show 5 lines of context around changes
const diff = new DiffPreview({ contextLines: 5 });
```

### Disable Colors

```javascript
// For CI/CD pipelines or file output
const diff = new DiffPreview({ colorize: false });
```

### Word-Level Diff

```javascript
// For inline word highlighting
const diff = new DiffPreview({ wordDiff: true });
const result = diff.generateInlineDiff(oldText, newText);
```

## Integration

### With Git Hooks

```javascript
const DiffPreview = require('./diff-preview');
const diff = new DiffPreview();

// Compare staged changes
const staged = execSync('git diff --cached').toString();
// Parse and display
```

### With Code Review Tools

```javascript
// Generate diff for API response
app.post('/api/diff', (req, res) => {
  const { oldCode, newCode } = req.body;
  const result = new DiffPreview().generateDiff(oldCode, newCode);
  res.json(result);
});
```

## Best Practices

1. **Use appropriate context**: More context lines help understand changes but make output longer
2. **Disable colors for files**: When saving diffs to files, set `colorize: false`
3. **Use HTML for sharing**: HTML exports are ideal for code reviews and documentation

## License

MIT
