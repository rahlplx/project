/**
 * Screenshot Preview Skill
 * Browser screenshots and app state visualization
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

class ScreenshotPreview {
  constructor(options = {}) {
    this.name = 'screenshot-preview';
    this.description = 'Capture screenshots and preview app state';
    this.outputDir = options.outputDir || './screenshots';
    this.format = options.format || 'png';
    this.quality = options.quality || 90;
    this.viewport = options.viewport || { width: 1280, height: 720 };
    this.delay = options.delay || 1000;
    
    this.ensureOutputDir();
  }

  /**
   * Ensure output directory exists
   */
  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Capture a screenshot
   * @param {string} url - URL or file path to capture
   * @param {Object} options - Capture options
   * @returns {Object} Screenshot result
   */
  async capture(url, options = {}) {
    const filename = options.filename || this.generateFilename();
    const outputPath = path.join(this.outputDir, filename);
    
    const viewport = options.viewport || this.viewport;
    const fullPage = options.fullPage || false;
    const waitForSelector = options.waitForSelector;
    
    try {
      // Use puppeteer if available, otherwise use fallback
      const screenshot = await this.captureWithPuppeteer(url, {
        path: outputPath,
        ...viewport,
        fullPage,
        waitForSelector,
        delay: options.delay || this.delay
      });
      
      return {
        success: true,
        path: outputPath,
        filename,
        timestamp: new Date().toISOString(),
        size: fs.statSync(outputPath).size,
        format: this.format
      };
    } catch (error) {
      // Fallback to simple capture method
      return this.fallbackCapture(url, outputPath, options);
    }
  }

  /**
   * Capture using Puppeteer
   */
  async captureWithPuppeteer(url, options) {
    try {
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();
      
      await page.setViewport({
        width: options.width || 1280,
        height: options.height || 720
      });
      
      await page.goto(url, { waitUntil: 'networkidle0' });
      
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, { timeout: 10000 });
      }
      
      if (options.delay) {
        await page.waitForTimeout(options.delay);
      }
      
      await page.screenshot({
        path: options.path,
        fullPage: options.fullPage || false,
        type: this.format === 'jpg' ? 'jpeg' : 'png'
      });
      
      await browser.close();
      
      return { path: options.path };
    } catch (error) {
      throw new Error(`Puppeteer capture failed: ${error.message}`);
    }
  }

  /**
   * Fallback capture method for when puppeteer isn't available
   */
  fallbackCapture(url, outputPath, options) {
    // For demo purposes, create a placeholder image
    const { createCanvas } = require('canvas');
    const canvas = createCanvas(options.viewport?.width || 1280, options.viewport?.height || 720);
    const ctx = canvas.getContext('2d');
    
    // Draw placeholder
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#333';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Screenshot Preview', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '16px sans-serif';
    ctx.fillText(url, canvas.width / 2, canvas.height / 2 + 20);
    
    const buffer = canvas.toBuffer(this.format === 'jpg' ? 'image/jpeg' : 'image/png');
    fs.writeFileSync(outputPath, buffer);
    
    return {
      success: true,
      path: outputPath,
      filename: path.basename(outputPath),
      timestamp: new Date().toISOString(),
      size: buffer.length,
      format: this.format,
      note: 'Created with fallback method - install puppeteer for full functionality'
    };
  }

  /**
   * Generate screenshot filename
   */
  generateFilename() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `screenshot-${timestamp}.${this.format}`;
  }

  /**
   * Capture multiple URLs in sequence
   */
  async captureBatch(urls, options = {}) {
    const results = [];
    const concurrency = options.concurrency || 1;
    
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchPromises = batch.map((url, idx) => 
        this.capture(url, { ...options, filename: `screenshot-${i + idx}.${this.format}` })
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults.map((r, idx) => ({
        url: batch[idx],
        ...(r.status === 'fulfilled' ? r.value : { error: r.reason.message })
      })));
    }
    
    return {
      total: urls.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => r.error).length,
      results
    };
  }

  /**
   * Compare two screenshots
   */
  async compare(img1Path, img2Path) {
    try {
      const { diff } = require('pixelmatch');
      const PNG = require('pngjs').PNG;
      
      const img1 = PNG.sync.read(fs.readFileSync(img1Path));
      const img2 = PNG.sync.read(fs.readFileSync(img2Path));
      
      const diffImage = new PNG(img1.width, img1.height);
      const numDiffPixels = diff(img1.data, img2.data, diffImage.data, {
        threshold: 0.1
      });
      
      const diffPath = path.join(this.outputDir, 'diff.png');
      fs.writeFileSync(diffPath, PNG.sync.write(diffImage));
      
      const percentDiff = (numDiffPixels / (img1.width * img1.height)) * 100;
      
      return {
        identical: numDiffPixels === 0,
        diffPixels: numDiffPixels,
        percentDiff: percentDiff.toFixed(2) + '%',
        diffImagePath: diffPath
      };
    } catch (error) {
      return {
        identical: false,
        error: 'Comparison requires pixelmatch and pngjs packages',
        note: 'Install with: npm install pixelmatch pngjs'
      };
    }
  }

  /**
   * Get current app state
   */
  getAppState() {
    return {
      timestamp: new Date().toISOString(),
      viewport: this.viewport,
      outputDir: this.outputDir,
      format: this.format,
      recentScreenshots: this.getRecentScreenshots()
    };
  }

  /**
   * Get list of recent screenshots
   */
  getRecentScreenshots(limit = 10) {
    if (!fs.existsSync(this.outputDir)) return [];
    
    const files = fs.readdirSync(this.outputDir)
      .filter(f => f.endsWith(`.${this.format}`))
      .map(f => ({
        name: f,
        path: path.join(this.outputDir, f),
        size: fs.statSync(path.join(this.outputDir, f)).size,
        created: fs.statSync(path.join(this.outputDir, f)).mtime
      }))
      .sort((a, b) => b.created - a.created)
      .slice(0, limit);
    
    return files;
  }

  /**
   * Open screenshot in default viewer
   */
  _safePath(filename) {
    const base = path.basename(filename);
    const safe = path.join(this.outputDir, base);
    if (!safe.startsWith(this.outputDir)) {
      throw new Error(`Invalid path: ${filename}`);
    }
    return safe;
  }

  open(filename) {
    const filepath = this._safePath(filename);
    if (!fs.existsSync(filepath)) {
      throw new Error(`Screenshot not found: ${filepath}`);
    }
    
    const platform = process.platform;
    let command;
    
    if (platform === 'darwin') {
      command = `open "${filepath}"`;
    } else if (platform === 'win32') {
      command = `start "" "${filepath}"`;
    } else {
      command = `xdg-open "${filepath}"`;
    }
    
    try {
      execSync(command, { stdio: 'ignore' });
    } catch {
      return { opened: filename, warning: 'Could not open viewer' };
    }
    return { opened: filename };
  }

  /**
   * Delete a screenshot
   */
  delete(filename) {
    const filepath = this._safePath(filename);
    if (!fs.existsSync(filepath)) {
      throw new Error(`Screenshot not found: ${filepath}`);
    }
    
    fs.unlinkSync(filepath);
    return { deleted: filename };
  }

  /**
   * Clean up old screenshots
   */
  cleanup(options = {}) {
    const maxAge = options.maxAge || 24 * 60 * 60 * 1000; // 24 hours default
    const maxFiles = options.maxFiles || 100;
    
    const files = this.getRecentScreenshots(1000);
    const now = Date.now();
    const toDelete = [];
    
    for (const file of files) {
      const age = now - file.created.getTime();
      if (age > maxAge) {
        toDelete.push(file.name);
      }
    }
    
    // Also limit total files
    if (files.length > maxFiles) {
      const excess = files.slice(maxFiles);
      toDelete.push(...excess.map(f => f.name));
    }
    
    for (const filename of [...new Set(toDelete)]) {
      this.delete(filename);
    }
    
    return {
      deleted: toDelete.length,
      remaining: files.length - toDelete.length
    };
  }

  /**
   * Generate a base64 encoded screenshot
   */
  async toBase64(filepath) {
    if (!fs.existsSync(filepath)) {
      throw new Error(`Screenshot not found: ${filepath}`);
    }
    
    const buffer = fs.readFileSync(filepath);
    const ext = path.extname(filepath).slice(1);
    const mimeType = ext === 'jpg' ? 'jpeg' : ext;
    
    return `data:image/${mimeType};base64,${buffer.toString('base64')}`;
  }

  /**
   * Create thumbnail of screenshot
   */
  async createThumbnail(filename, width = 200) {
    const inputPath = this._safePath(filename);
    const outputPath = path.join(this.outputDir, `thumb_${path.basename(filename)}`);
    
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Screenshot not found: ${inputPath}`);
    }
    
    try {
      const sharp = require('sharp');
      await sharp(inputPath)
        .resize(width)
        .toFile(outputPath);
      
      return { thumbnail: outputPath };
    } catch (error) {
      return {
        error: 'Thumbnail creation requires sharp package',
        note: 'Install with: npm install sharp'
      };
    }
  }

  /**
   * Add annotation to screenshot
   */
  async annotate(filename, annotation) {
    const inputPath = this._safePath(filename);
    const outputPath = path.join(this.outputDir, `annotated_${path.basename(filename)}`);
    
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Screenshot not found: ${inputPath}`);
    }
    
    try {
      const sharp = require('sharp');
      const { createCanvas } = require('canvas');
      
      // Load image with sharp
      const metadata = await sharp(inputPath).metadata();
      
      // Create overlay canvas
      const canvas = createCanvas(metadata.width, metadata.height);
      const ctx = canvas.getContext('2d');
      
      // Draw annotation
      if (annotation.text) {
        ctx.fillStyle = annotation.color || '#ff0000';
        ctx.font = `${annotation.fontSize || 20}px sans-serif`;
        ctx.fillText(annotation.text, annotation.x || 10, annotation.y || 30);
      }
      
      // Composite with original
      const overlayBuffer = canvas.toBuffer();
      
      await sharp(inputPath)
        .composite([{
          input: overlayBuffer,
          blend: 'over'
        }])
        .toFile(outputPath);
      
      return { annotated: outputPath };
    } catch (error) {
      return {
        error: 'Annotation requires sharp and canvas packages',
        note: 'Install with: npm install sharp canvas'
      };
    }
  }

  /**
   * Get screenshot metadata
   */
  getMetadata(filename) {
    const filepath = this._safePath(filename);
    if (!fs.existsSync(filepath)) {
      throw new Error(`Screenshot not found: ${filepath}`);
    }
    
    const stats = fs.statSync(filepath);
    
    return {
      filename,
      path: filepath,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      format: this.format
    };
  }

  /**
   * List all screenshots with filtering
   */
  list(options = {}) {
    const files = this.getRecentScreenshots(1000);
    
    let filtered = files;
    
    if (options.format) {
      filtered = filtered.filter(f => f.name.endsWith(`.${options.format}`));
    }
    
    if (options.since) {
      const sinceDate = new Date(options.since);
      filtered = filtered.filter(f => f.created > sinceDate);
    }
    
    if (options.before) {
      const beforeDate = new Date(options.before);
      filtered = filtered.filter(f => f.created < beforeDate);
    }
    
    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }
    
    return {
      total: filtered.length,
      screenshots: filtered
    };
  }

  /**
   * Export screenshots as ZIP
   */
  async exportAsZip(outputName = 'screenshots.zip') {
    const archiver = require('archiver');
    const output = fs.createWriteStream(path.join(this.outputDir, '..', outputName));
    const archive = archiver('zip');
    
    return new Promise((resolve, reject) => {
      output.on('close', () => {
        resolve({
          archive: outputName,
          size: archive.pointer(),
          files: archive._entries ? archive._entries.length : 0
        });
      });
      
      archive.on('error', reject);
      archive.pipe(output);
      
      const files = this.getRecentScreenshots();
      for (const file of files) {
        archive.file(file.path, { name: file.name });
      }
      
      archive.finalize();
    });
  }
}

module.exports = ScreenshotPreview;