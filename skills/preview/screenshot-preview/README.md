# Screenshot Preview Skill

Capture screenshots and preview your application state. Essential for visual testing, documentation, and sharing progress with clients or teammates.

## Overview

The Screenshot Preview skill provides comprehensive screenshot capabilities including single captures, batch processing, comparison tools, and annotations. Perfect for vibe coders who want to quickly visualize and share their application's current state.

## Installation

```javascript
const ScreenshotPreview = require('./skills/preview/screenshot-preview');
const screenshots = new ScreenshotPreview({
  outputDir: './screenshots',
  format: 'png',
  quality: 90,
  viewport: { width: 1280, height: 720 }
});
```

## Quick Start

```javascript
// Capture a screenshot
const result = await screenshots.capture('http://localhost:3000');
console.log(result.path); // ./screenshots/screenshot-2024-01-15.png

// View the screenshot
screenshots.open(result.filename);
```

## Features

### Single Screenshot Capture

Capture any URL or local file:

```javascript
const result = await screenshots.capture('http://localhost:3000', {
  filename: 'homepage.png',
  viewport: { width: 1920, height: 1080 },
  fullPage: true
});
```

### Batch Processing

Capture multiple URLs in sequence:

```javascript
const results = await screenshots.captureBatch([
  'http://localhost:3000/',
  'http://localhost:3000/about',
  'http://localhost:3000/contact'
], {
  concurrency: 2,
  filename: 'page-{index}.png'
});

console.log(`Captured ${results.successful} of ${results.total}`);
```

### Screenshot Comparison

Compare two screenshots to detect visual changes:

```javascript
const comparison = await screenshots.compare(
  'before.png',
  'after.png'
);

console.log(`Difference: ${comparison.percentDiff}`);
if (!comparison.identical) {
  // Show diff image
  screenshots.open('diff.png');
}
```

## API Reference

### Constructor Options

```javascript
const screenshots = new ScreenshotPreview({
  outputDir: './screenshots',    // Where to save screenshots
  format: 'png',                  // Output format: 'png' or 'jpg'
  quality: 90,                   // JPEG quality (1-100)
  viewport: {                    // Browser viewport
    width: 1280,
    height: 720
  },
  delay: 1000                    // Wait time before capture (ms)
});
```

### Methods

#### `capture(url, options?)`

Capture a single screenshot.

**Parameters:**
- `url` (string): URL or file path to capture
- `options.filename` (string): Custom filename
- `options.viewport` (object): Override default viewport
- `options.fullPage` (boolean): Capture entire page
- `options.waitForSelector` (string): Wait for element before capture

**Returns:**
```javascript
{
  success: true,
  path: './screenshots/homepage.png',
  filename: 'homepage.png',
  timestamp: '2024-01-15T10:30:00.000Z',
  size: 245678,
  format: 'png'
}
```

#### `captureBatch(urls, options?)`

Capture multiple URLs.

**Parameters:**
- `urls` (array): Array of URLs to capture
- `options.concurrency` (number): Parallel captures (default: 1)

**Returns:**
```javascript
{
  total: 5,
  successful: 4,
  failed: 1,
  results: [
    { url: '...', success: true, path: '...' },
    { url: '...', error: 'Timeout' }
  ]
}
```

#### `compare(img1Path, img2Path)`

Compare two screenshots pixel-by-pixel.

**Returns:**
```javascript
{
  identical: false,
  diffPixels: 1234,
  percentDiff: '0.5%',
  diffImagePath: './screenshots/diff.png'
}
```

#### `getAppState()`

Get current configuration and recent screenshots.

**Returns:**
```javascript
{
  timestamp: '2024-01-15T10:30:00.000Z',
  viewport: { width: 1280, height: 720 },
  outputDir: './screenshots',
  format: 'png',
  recentScreenshots: [...]
}
```

#### `getRecentScreenshots(limit?)`

List recent screenshots.

**Parameters:**
- `limit` (number): Maximum number to return (default: 10)

**Returns:**
```javascript
[
  { name: 'screenshot-2024-01-15.png', path: '...', size: 245678, created: Date },
  ...
]
```

#### `open(filename)`

Open screenshot in default system viewer.

#### `delete(filename)`

Delete a screenshot.

#### `cleanup(options?)`

Clean up old screenshots.

**Parameters:**
- `options.maxAge` (number): Maximum age in ms (default: 24 hours)
- `options.maxFiles` (number): Maximum files to keep (default: 100)

#### `toBase64(filepath)`

Convert screenshot to base64 for embedding.

#### `createThumbnail(filename, width?)`

Create thumbnail version.

#### `annotate(filename, annotation)`

Add text annotation to screenshot.

**Parameters:**
- `annotation.text` (string): Text to add
- `annotation.x` (number): X position
- `annotation.y` (number): Y position
- `annotation.color` (string): Text color
- `annotation.fontSize` (number): Font size

#### `getMetadata(filename)`

Get screenshot file metadata.

#### `list(options?)`

List screenshots with filtering.

**Parameters:**
- `options.format` (string): Filter by format
- `options.since` (date): Filter by date
- `options.before` (date): Filter by date
- `options.limit` (number): Limit results

#### `exportAsZip(outputName?)`

Export all screenshots as ZIP archive.

## Examples

### Capture After Build

```javascript
const ScreenshotPreview = require('./screenshot-preview');
const screenshots = new ScreenshotPreview();

exec('npm run build', async (error) => {
  if (!error) {
    await screenshots.capture('http://localhost:3000', {
      filename: 'build-success.png'
    });
  }
});
```

### Visual Regression Testing

```javascript
async function runVisualTests() {
  const screenshots = new ScreenshotPreview();
  
  // Capture baseline
  await screenshots.capture('http://localhost:3000', {
    filename: 'baseline.png'
  });
  
  // Make changes...
  
  // Capture new version
  await screenshots.capture('http://localhost:3000', {
    filename: 'current.png'
  });
  
  // Compare
  const result = await screenshots.compare('baseline.png', 'current.png');
  
  if (!result.identical) {
    console.log(`Visual changes detected: ${result.percentDiff}`);
    screenshots.open(result.diffImagePath);
  }
}
```

### Automated Screenshot Report

```javascript
async function generateReport() {
  const screenshots = new ScreenshotPreview();
  
  const pages = ['/', '/about', '/pricing', '/contact'];
  const results = await screenshots.captureBatch(
    pages.map(p => `http://localhost:3000${p}`)
  );
  
  const report = {
    timestamp: new Date().toISOString(),
    pages: results.results.map(r => ({
      url: r.url,
      captured: r.success,
      path: r.path
    }))
  };
  
  fs.writeFileSync('screenshot-report.json', JSON.stringify(report, null, 2));
}
```

### Thumbnail Gallery

```javascript
async function createGallery() {
  const screenshots = new ScreenshotPreview();
  
  const files = screenshots.getRecentScreenshots(20);
  
  for (const file of files) {
    await screenshots.createThumbnail(file.name, 150);
  }
  
  console.log('Gallery thumbnails created');
}
```

### Screenshot Annotation

```javascript
async function annotateError() {
  const screenshots = new ScreenshotPreview();
  
  // Capture error state
  await screenshots.capture('http://localhost:3000/error');
  
  // Add annotation
  await screenshots.annotate('error.png', {
    text: 'Error occurred here',
    x: 100,
    y: 200,
    color: '#ff0000',
    fontSize: 24
  });
  
  screenshots.open('annotated_error.png');
}
```

## Advanced Usage

### Custom Viewport Sizes

```javascript
// Mobile screenshot
await screenshots.capture(url, {
  viewport: { width: 375, height: 667 },
  filename: 'mobile-home.png'
});

// Tablet screenshot
await screenshots.capture(url, {
  viewport: { width: 768, height: 1024 },
  filename: 'tablet-home.png'
});
```

### Wait for Dynamic Content

```javascript
await screenshots.capture('http://localhost:3000/dashboard', {
  waitForSelector: '.dashboard-loaded',
  delay: 2000
});
```

### Full Page Capture

```javascript
await screenshots.capture('http://localhost:3000/long-page', {
  fullPage: true,
  filename: 'full-page.png'
});
```

### Scheduled Cleanup

```javascript
// Clean up screenshots older than 7 days
screenshots.cleanup({
  maxAge: 7 * 24 * 60 * 60 * 1000,
  maxFiles: 50
});
```

## Dependencies

For full functionality, install these packages:

```bash
npm install puppeteer
npm install sharp       # For image manipulation
npm install canvas      # For annotations
npm install pixelmatch  # For screenshot comparison
npm install pngjs       # For PNG processing
npm install archiver    # For ZIP export
```

The skill will use fallback methods when dependencies are unavailable, but full functionality requires the above packages.

## Best Practices

1. **Use descriptive filenames**: Include page name and date for easy identification
2. **Set appropriate viewport**: Match target audience's device sizes
3. **Wait for dynamic content**: Use `waitForSelector` for SPAs
4. **Regular cleanup**: Keep screenshot directory manageable
5. **Use comparisons for testing**: Catch visual regressions early

## License

MIT