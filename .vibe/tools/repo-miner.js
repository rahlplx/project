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

function analyzeStructure(repoDir, name) {
  const a = { patterns: [], anti_patterns: [], quality_score: 0 };
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

// ── Commands ──────────────────────────────────────────────────────
async function verify(targets) {
  console.log('\n═══════════════════════════════════════════');
  console.log('  Step 1: Community Verification');
  console.log('═══════════════════════════════════════════\n');

  const results = [];
  for (const url of targets) {
    const name = url.split('/').pop().replace('.git', '');
    const api = await fetchGitHub(url);
    if (!api) { results.push({ name, url, status: 'skip', reason: 'api_unavailable', score: 0 }); continue; }

    const stars = api.stargazers_count || 0;
    const forks = api.forks_count || 0;
    const license = api.license?.spdx_id || 'NONE';
    const days = api.pushed_at ? Math.floor((Date.now() - new Date(api.pushed_at).getTime()) / 86400000) : 999;

    let score = 0;
    const issues = [];
    if (stars >= 10000) score += 30; else if (stars >= 1000) score += 15; else if (stars >= 100) score += 5; else issues.push('low_stars');
    if (days <= 180) score += 20; else if (days <= 365) score += 10; else issues.push('inactive');
    if (['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'MPL-2.0', '0BSD'].includes(license)) score += 15; else if (license === 'NONE') issues.push('no_license');
    if (forks >= 1000) score += 15; else if (forks >= 100) score += 10; else if (forks >= 10) score += 5;
    if (api.archived) { score -= 20; issues.push('archived'); }

    const status = score >= 30 ? 'pass' : 'skip';
    const icon = status === 'pass' ? '✓' : '✗';
    console.log(`  ${icon} ${name.padEnd(25)} score:${score.toString().padStart(3)}  ${stars}★  ${license.padEnd(12)} ${days}d ago${issues.length ? '  [' + issues.join(', ') + ']' : ''}`);

    results.push({ name, url, status, score, stars, forks, license, days_since_update: days, description: api.description || '', issues });
  }

  const pass = results.filter(r => r.status === 'pass');
  const skip = results.filter(r => r.status === 'skip');
  console.log(`\n  Verified: ${pass.length} | Skipped: ${skip.length}\n`);

  const out = { timestamp: new Date().toISOString(), verified: pass, skipped: skip };
  writeJson(path.join(OUTPUT_DIR, 'verified-for-mining.json'), out);
  console.log(`  Saved to: ${OUTPUT_DIR}/verified-for-mining.json\n`);
  return out;
}

async function mine(approved) {
  console.log('═══════════════════════════════════════════');
  console.log('  Step 2: Clone + Analyze');
  console.log('═══════════════════════════════════════════\n');

  const results = [];
  for (const repo of approved) {
    const repoDir = path.join(MINING_DIR, repo.name);
    console.log(`  ${repo.name}...`);
    try { exec(`git clone --depth 1 --single-branch ${repo.url} "${repoDir}"`, MINING_DIR); }
    catch { console.log(`    ✗ Clone failed`); continue; }

    const analysis = analyzeStructure(repoDir, repo.name);
    const candidates = extractCandidates(analysis);
    const r = { name: repo.name, url: repo.url, stars: repo.stars, license: repo.license, quality_score: analysis.quality_score, patterns: analysis.patterns, anti_patterns: analysis.anti_patterns, candidates };
    results.push(r);
    writeJson(path.join(OUTPUT_DIR, `${repo.name}-analysis.json`), r);
    console.log(`    ✓ Q:${analysis.quality_score} [${analysis.patterns.join(', ')}] → [${candidates.join(', ')}]`);
  }

  // Insights
  console.log('\n═══════════════════════════════════════════');
  console.log('  Insights');
  console.log('═══════════════════════════════════════════\n');

  const pc = {}; results.flatMap(r => r.patterns).forEach(p => { pc[p] = (pc[p] || 0) + 1; });
  const cc = {}; results.flatMap(r => r.candidates).forEach(c => { cc[c] = (cc[c] || 0) + 1; });
  const avg = Math.round(results.reduce((s, r) => s + r.quality_score, 0) / results.length);

  console.log(`  Avg quality: ${avg}/100 across ${results.length} repos`);
  console.log(`\n  Patterns (what repos do well):`);
  Object.entries(pc).sort((a, b) => b[1] - a[1]).forEach(([p, n]) => console.log(`    ${p}: ${n}/${results.length}`));
  console.log(`\n  Candidates (what we could adopt):`);
  Object.entries(cc).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => console.log(`    ${c}: ${n}/${results.length}`));

  const insights = { timestamp: new Date().toISOString(), avg_quality: avg, repos: results.length, top_patterns: Object.entries(pc).sort((a, b) => b[1] - a[1]), top_candidates: Object.entries(cc).sort((a, b) => b[1] - a[1]), all_repos: results };
  writeJson(path.join(OUTPUT_DIR, 'insights.json'), insights);

  console.log(`\n  Saved to: ${OUTPUT_DIR}/insights.json\n`);
  return insights;
}

// ── CLI ───────────────────────────────────────────────────────────
const cmd = process.argv[2];
const TARGETS = [
  'https://github.com/rahlplx/project.git',
  'https://github.com/anomalyco/opencode.git',
  'https://github.com/gstackio/gstack.git',
  'https://github.com/gsd-platform/gsd.git',
  'https://github.com/superpowers/superpowers.git',
  'https://github.com/langchain-ai/langchain.git',
  'https://github.com/crewAIInc/crewAI.git',
  'https://github.com/anthropics/fastmcp.git',
  'https://github.com/mastra-ai/mastra.git',
  'https://github.com/langchain-ai/langgraph.git',
  'https://github.com/autogen-ai/autogen.git',
  'https://github.com/qdrant/qdrant.git',
  'https://github.com/mem0ai/mem0.git',
  'https://github.com/weaviate/weaviate.git',
  'https://github.com/langflow-ai/langflow.git',
  'https://github.com/dify/dify.git',
  'https://github.com/penpot/penpot.git',
  'https://github.com/open-pencil/open-pencil.git'
];

if (cmd === 'verify') {
  verify(TARGETS).catch(e => { console.error(e.message); process.exit(1); });
} else if (cmd === 'mine') {
  const data = readJson(path.join(OUTPUT_DIR, 'verified-for-mining.json'));
  if (!data || !data.verified?.length) { console.log('No verified repos found. Run: node .vibe/tools/repo-miner.js verify'); process.exit(1); }
  mine(data.verified).catch(e => { console.error(e.message); process.exit(1); });
} else if (cmd === 'full') {
  (async () => {
    const { verified } = await verify(TARGETS);
    if (verified.length) await mine(verified);
  })().catch(e => { console.error(e.message); process.exit(1); });
} else {
  console.log('Usage:');
  console.log('  node .vibe/tools/repo-miner.js verify   # Step 1: verify via GitHub API');
  console.log('  node .vibe/tools/repo-miner.js mine      # Step 2: clone + analyze approved');
  console.log('  node .vibe/tools/repo-miner.js full      # Run both steps');
}
