const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

const MINING_DIR = path.join(__dirname, '..', 'repo-mining');
const OUTPUT_DIR = path.join(__dirname, '..', 'telemetry', 'repo-mining');

[MINING_DIR, OUTPUT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function exec(cmd, cwd) {
  try { return execSync(cmd, { cwd, encoding: 'utf8', timeout: 120000 }); }
  catch (e) { return e.stdout || e.message || ''; }
}

function readJson(f) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } }
function writeJson(f, d) { fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n', 'utf8'); }
function log(m) { console.log(`[miner] ${m}`); }

function fetchGitHub(repoUrl) {
  const m = repoUrl.match(/github\.com\/([^/]+)\/([^/.]+)/);
  if (!m) return null;
  const [, owner, repo] = m;
  return new Promise(resolve => {
    const req = https.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { 'User-Agent': 'vibe-stack-miner', 'Accept': 'application/vnd.github.v3+json' }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { const j = JSON.parse(d); resolve(j.message ? null : j); } catch { resolve(null); } });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(10000, () => { req.destroy(); resolve(null); });
  });
}

// ── Phase 1: Verify (no clone) ───────────────────────────────────
async function verifyOnly(targets) {
  console.log('\n═══════════════════════════════════════════');
  console.log('  Phase 1: Community Verification');
  console.log('═══════════════════════════════════════════\n');

  const verified = [];
  const skipped = [];

  for (const url of targets) {
    const name = url.split('/').pop().replace('.git', '');
    const api = await fetchGitHub(url);
    if (!api) { skipped.push({ name, url, reason: 'api_unavailable' }); continue; }

    const stars = api.stargazers_count || 0;
    const forks = api.forks_count || 0;
    const license = api.license?.spdx_id || 'NONE';
    const pushed = api.pushed_at || '';
    const days = pushed ? Math.floor((Date.now() - new Date(pushed).getTime()) / 86400000) : 999;
    const archived = api.archived || false;

    let score = 0;
    const issues = [];

    if (stars >= 10000) score += 30;
    else if (stars >= 1000) score += 15;
    else if (stars >= 100) score += 5;
    else issues.push('low_stars');

    if (days <= 180) score += 20;
    else if (days <= 365) score += 10;
    else issues.push('inactive');

    if (['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'MPL-2.0', '0BSD'].includes(license)) score += 15;
    else if (license === 'NONE') issues.push('no_license');

    if (forks >= 1000) score += 15;
    else if (forks >= 100) score += 10;
    else if (forks >= 10) score += 5;

    if (archived) { score -= 20; issues.push('archived'); }

    const entry = { name, url, score, stars, forks, license, days_since_update: days, archived, description: api.description || '', issues };

    if (score >= 30) {
      verified.push(entry);
      console.log(`  ✓ ${name.padEnd(25)} score:${score.toString().padStart(3)}  ${stars}★  ${license.padEnd(12)} ${days}d ago`);
    } else {
      skipped.push(entry);
      console.log(`  ✗ ${name.padEnd(25)} score:${score.toString().padStart(3)}  ${stars}★  ${license.padEnd(12)} ${days}d ago  [${issues.join(', ')}]`);
    }
  }

  console.log(`\n  Verified: ${verified.length} | Skipped: ${skipped.length}\n`);

  // Save verified list for user review
  const reviewFile = path.join(OUTPUT_DIR, 'verified-for-mining.json');
  writeJson(reviewFile, { timestamp: new Date().toISOString(), verified, skipped });

  return { verified, skipped };
}

// ── Phase 2: Clone + Analyze ──────────────────────────────────────
function analyzeStructure(repoDir, name) {
  const a = { name, patterns: [], anti_patterns: [], quality_score: 0 };
  const files = [];

  function scan(dir, rel = '') {
    try {
      for (const e of fs.readdirSync(dir)) {
        const full = path.join(dir, e);
        const stat = fs.statSync(full);
        const r = rel ? `${rel}/${e}` : e;
        files.push({ path: r, is_dir: stat.isDirectory() });
        if (stat.isDirectory() && !e.startsWith('.') && e !== 'node_modules') scan(full, r);
      }
    } catch {}
  }
  scan(repoDir);

  const has = f => files.some(x => x.path === f || x.path.includes(f));

  if (has('package.json')) a.patterns.push('node');
  if (has('pyproject.toml') || has('setup.py')) a.patterns.push('python');
  if (has('Cargo.toml')) a.patterns.push('rust');
  if (has('Dockerfile')) a.patterns.push('docker');
  if (has('.github/workflows')) a.patterns.push('ci-cd');
  if (has('tsconfig.json')) a.patterns.push('typescript');
  if (has('.test.') || has('.spec.')) a.patterns.push('tested');
  if (has('docs/')) a.patterns.push('documented');
  if (has('skills/') || has('skill')) a.patterns.push('skills');
  if (has('catalog') || has('tools.yaml')) a.patterns.push('catalog');
  if (has('lifecycle') || has('maintenance')) a.patterns.push('self-improving');
  if (has('telemetry')) a.patterns.push('telemetry');
  if (has('evolution') || has('learnings')) a.patterns.push('evolution');
  if (has('mcp') || has('MCP')) a.patterns.push('mcp');
  if (has('agent')) a.patterns.push('agents');
  if (has('rules')) a.patterns.push('rules');
  if (has('harness') || has('retro') || has('vibe')) a.patterns.push('vibe-stack');

  if (!has('test')) a.anti_patterns.push('no-tests');
  if (!has('README.md')) a.anti_patterns.push('no-readme');
  if (!has('.github') && !has('.gitlab')) a.anti_patterns.push('no-ci');

  let q = 0;
  if (a.patterns.includes('tested')) q += 20;
  if (a.patterns.includes('ci-cd')) q += 15;
  if (a.patterns.includes('documented')) q += 15;
  if (a.patterns.includes('typescript')) q += 10;
  if (a.patterns.includes('skills')) q += 10;
  if (a.patterns.includes('catalog')) q += 10;
  if (a.patterns.includes('self-improving')) q += 10;
  if (a.patterns.includes('evolution')) q += 10;
  if (a.patterns.includes('mcp')) q += 5;
  if (a.patterns.includes('agents')) q += 5;
  if (a.patterns.includes('vibe-stack')) q += 10;
  if (a.anti_patterns.includes('no-tests')) q -= 20;
  if (a.anti_patterns.includes('no-readme')) q -= 15;
  a.quality_score = Math.max(0, Math.min(100, q));

  return a;
}

function extractCandidates(analysis) {
  const c = [];
  if (analysis.patterns.includes('skills') && analysis.patterns.includes('tested')) c.push('skill-adoption');
  if (analysis.patterns.includes('catalog')) c.push('catalog-pattern');
  if (analysis.patterns.includes('self-improving')) c.push('self-improvement');
  if (analysis.patterns.includes('evolution')) c.push('evolution-mechanism');
  if (analysis.patterns.includes('mcp')) c.push('mcp-integration');
  if (analysis.patterns.includes('agents')) c.push('agent-arch');
  if (analysis.patterns.includes('telemetry')) c.push('telemetry-system');
  if (analysis.patterns.includes('rules')) c.push('rules-engine');
  if (analysis.patterns.includes('vibe-stack')) c.push('vibe-stack-pattern');
  return c;
}

async function cloneAndAnalyze(repos) {
  console.log('═══════════════════════════════════════════');
  console.log('  Phase 2: Clone + Analyze Approved Repos');
  console.log('═══════════════════════════════════════════\n');

  const results = [];

  for (const repo of repos) {
    const repoDir = path.join(MINING_DIR, repo.name);
    console.log(`  ${repo.name}...`);

    try {
      exec(`git clone --depth 1 --single-branch ${repo.url} "${repoDir}"`, MINING_DIR);
    } catch (e) {
      console.log(`    ✗ Clone failed`);
      continue;
    }

    const analysis = analyzeStructure(repoDir, repo.name);
    const candidates = extractCandidates(analysis);
    const result = { ...repo, patterns: analysis.patterns, anti_patterns: analysis.anti_patterns, quality_score: analysis.quality_score, candidates };
    results.push(result);

    writeJson(path.join(OUTPUT_DIR, `${repo.name}-analysis.json`), result);
    console.log(`    ✓ Q:${analysis.quality_score} patterns:[${analysis.patterns.join(', ')}] candidates:[${candidates.join(', ')}]`);
  }

  return results;
}

function generateInsights(results) {
  console.log('\n═══════════════════════════════════════════');
  console.log('  Insights Report');
  console.log('═══════════════════════════════════════════\n');

  const allP = results.flatMap(r => r.patterns);
  const pc = {}; for (const p of allP) pc[p] = (pc[p] || 0) + 1;

  const allC = results.flatMap(r => r.candidates);
  const cc = {}; for (const c of allC) cc[c] = (cc[c] || 0) + 1;

  const avg = Math.round(results.reduce((s, r) => s + r.quality_score, 0) / results.length);
  const top = [...results].sort((a, b) => b.quality_score - a.quality_score).slice(0, 5);

  const insights = {
    timestamp: new Date().toISOString(),
    avg_quality: avg,
    repos_analyzed: results.length,
    top_patterns: Object.entries(pc).sort((a, b) => b[1] - a[1]),
    top_candidates: Object.entries(cc).sort((a, b) => b[1] - a[1]),
    top_repos: top.map(r => ({ name: r.name, stars: r.stars, quality: r.quality_score, patterns: r.patterns })),
    all_repos: results.map(r => ({ name: r.name, stars: r.stars, quality: r.quality_score, patterns: r.patterns, candidates: r.candidates }))
  };

  writeJson(path.join(OUTPUT_DIR, 'insights.json'), insights);

  console.log(`  Avg quality: ${avg}/100 across ${results.length} repos`);
  console.log(`\n  Top patterns (what repos do well):`);
  for (const [p, n] of insights.top_patterns) console.log(`    ${p}: ${n}/${results.length} repos`);
  console.log(`\n  Top candidates (what we could adopt):`);
  for (const [c, n] of insights.top_candidates) console.log(`    ${c}: ${n}/${results.length} repos`);
  console.log(`\n  Top repos:`);
  for (const r of top) console.log(`    ${r.quality}★ Q:${r.quality} — ${r.name} (${r.stars}★)`);

  return insights;
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  const TARGETS = [
    // Core
    'https://github.com/rahlplx/project.git',
    'https://github.com/anomalyco/opencode.git',
    // Foundations
    'https://github.com/gstackio/gstack.git',
    'https://github.com/gsd-platform/gsd.git',
    'https://github.com/superpowers/superpowers.git',
    // Agents
    'https://github.com/langchain-ai/langchain.git',
    'https://github.com/crewAIInc/crewAI.git',
    'https://github.com/anthropics/fastmcp.git',
    'https://github.com/mastra-ai/mastra.git',
    'https://github.com/langchain-ai/langgraph.git',
    'https://github.com/autogen-ai/autogen.git',
    // Knowledge
    'https://github.com/qdrant/qdrant.git',
    'https://github.com/mem0ai/mem0.git',
    'https://github.com/weaviate/weaviate.git',
    // Visual
    'https://github.com/langflow-ai/langflow.git',
    'https://github.com/dify/dify.git',
    // Design
    'https://github.com/penpot/penpot.git',
    'https://github.com/open-pencil/open-pencil.git'
  ];

  // Phase 1: Verify
  const { verified, skipped } = await verifyOnly(TARGETS);

  if (verified.length === 0) {
    console.log('No repos passed verification. Aborting.');
    return;
  }

  // Save for user review
  console.log(`\n📁 Verified repos saved to: ${OUTPUT_DIR}/verified-for-mining.json`);
  console.log(`   Review this file to see what passed verification.`);
  console.log(`   To skip specific repos, edit the file and remove them before running Phase 2.\n`);

  // Phase 2: Clone + Analyze
  const results = await cloneAndAnalyze(verified);

  // Phase 3: Insights
  generateInsights(results);

  console.log('\n═══════════════════════════════════════════');
  console.log(`  Done. ${results.length} repos mined.`);
  console.log(`  Output: ${OUTPUT_DIR}/`);
  console.log('═══════════════════════════════════════════\n');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
