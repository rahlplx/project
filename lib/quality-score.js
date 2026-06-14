const fs = require('fs');
const path = require('path');

function parseVerifiedBy(verifiedBy) {
  if (!verifiedBy) return { tier: 4, starCount: null };
  const v = verifiedBy.trim();
  const official = ['microsoft', 'google-labs', 'anthropic', 'vercel', 'netlify', 'qdrant', 'langchain', 'huggingface'];
  if (official.includes(v)) return { tier: 1, starCount: null };
  if (v === 'community-vibe-stack') return { tier: 2, starCount: null };
  const starMatch = v.match(/community\s*\((\d+(?:\.\d+)?)([kKmM]?)\+\s*(?:stars|installs|stars,)/);
  if (starMatch) {
    let count = parseFloat(starMatch[1]);
    const suffix = (starMatch[2] || '').toLowerCase();
    if (suffix === 'k') count *= 1000;
    else if (suffix === 'm') count *= 1000000;
    return { tier: 3, starCount: Math.round(count) };
  }
  return { tier: 4, starCount: null };
}

function parseDateFreshness(verifiedDate, referenceDate) {
  const ref = referenceDate ? new Date(referenceDate) : new Date();
  const verified = new Date(verifiedDate);
  const diffMs = ref - verified;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

function scoreMaintenance(tool) {
  let score = 0;
  const details = {};
  const license = (tool.license || '').toLowerCase();
  const openLicenses = ['mit', 'apache 2.0', 'bsd-3-clause', 'mpl-2.0', 'bsd', 'mpl'];
  const isOpen = openLicenses.some(l => license.includes(l));
  if (isOpen) {
    score += 10;
    details.license = { score: 10, max: 10 };
  } else if (license.includes('proprietary')) {
    score += 5;
    details.license = { score: 5, max: 10 };
  } else {
    details.license = { score: 0, max: 10 };
  }
  const inSkills = tool.in_skills === true;
  score += inSkills ? 10 : 0;
  details.in_skills = { score: inSkills ? 10 : 0, max: 10 };
  const whatLen = (tool.what_it_does || '').length;
  const howLen = (tool.how_agent_uses || '').length;
  let descScore = 0;
  if (whatLen > 80 && howLen > 80) descScore = 5;
  else if (whatLen > 80 || howLen > 80) descScore = 3;
  details.description_quality = { score: descScore, max: 5 };
  score += descScore;
  const hasPath = !!tool.skill_path;
  score += hasPath ? 5 : 0;
  details.skill_path = { score: hasPath ? 5 : 0, max: 5 };
  return { score, max: 30, details };
}

function scoreDocs(tool) {
  let score = 0;
  const details = {};
  const wLen = (tool.what_it_does || '').length;
  let wScore = 0;
  if (wLen >= 200) wScore = 10;
  else if (wLen >= 100) wScore = 7;
  else if (wLen >= 50) wScore = 4;
  details.what_it_does = { score: wScore, max: 10, length: wLen };
  score += wScore;
  const hLen = (tool.how_agent_uses || '').length;
  let hScore = 0;
  if (hLen >= 200) hScore = 10;
  else if (hLen >= 100) hScore = 7;
  else if (hLen >= 50) hScore = 4;
  details.how_agent_uses = { score: hScore, max: 10, length: hLen };
  score += hScore;
  const dLen = (tool.description || '').length;
  let dScore = 0;
  if (dLen >= 100) dScore = 5;
  else if (dLen >= 50) dScore = 3;
  details.description = { score: dScore, max: 5, length: dLen };
  score += dScore;
  return { score, max: 25, details };
}

function scoreCommunity(tool, parsed) {
  let score = 0;
  const details = {};
  const starCount = parsed.starCount || 0;
  let starScore = 0;
  if (starCount >= 100000) starScore = 15;
  else if (starCount >= 50000) starScore = 13;
  else if (starCount >= 25000) starScore = 11;
  else if (starCount >= 10000) starScore = 9;
  else if (starCount >= 5000) starScore = 7;
  else if (starCount >= 1000) starScore = 5;
  else if (starCount > 0) starScore = 3;
  details.star_count = { score: starScore, max: 15, stars: starCount };
  score += starScore;
  const inSkills = tool.in_skills === true;
  score += inSkills ? 5 : 0;
  details.in_skills = { score: inSkills ? 5 : 0, max: 5 };
  return { score, max: 20, details };
}

function scoreTrustworthiness(parsed) {
  const tierScores = { 1: 15, 2: 12, 3: 8, 4: 5 };
  const score = tierScores[parsed.tier] || 5;
  return { score, max: 15, details: { tier: parsed.tier, tier_score: score } };
}

function scoreFreshness(daysSinceVerified) {
  let score = 0;
  if (daysSinceVerified <= 30) score = 10;
  else if (daysSinceVerified <= 90) score = 8;
  else if (daysSinceVerified <= 180) score = 6;
  else if (daysSinceVerified <= 365) score = 3;
  return { score, max: 10, details: { days_since_verified: daysSinceVerified } };
}

function computeGrade(total) {
  if (total >= 90) return 'A';
  if (total >= 75) return 'B';
  if (total >= 50) return 'C';
  return 'D';
}

function computeToolScore(toolEntry, options = {}) {
  const refDate = options.referenceDate || new Date().toISOString().slice(0, 10);
  const parsed = parseVerifiedBy(toolEntry.verified_by);
  const daysSince = parseDateFreshness(toolEntry.verified_date, refDate);
  const maintenance = scoreMaintenance(toolEntry);
  const docs = scoreDocs(toolEntry);
  const community = scoreCommunity(toolEntry, parsed);
  const trustworthiness = scoreTrustworthiness(parsed);
  const freshness = scoreFreshness(daysSince);
  const total = maintenance.score + docs.score + community.score + trustworthiness.score + freshness.score;
  return {
    name: toolEntry.name,
    scores: { maintenance, docs, community, trustworthiness, freshness },
    total_score: total,
    grade: computeGrade(total),
    date_computed: refDate,
    evidence: {
      verified_by: toolEntry.verified_by,
      verified_date: toolEntry.verified_date,
      days_since_verified: daysSince,
      tier: parsed.tier,
      star_count: parsed.starCount,
      license: toolEntry.license,
      in_skills: toolEntry.in_skills,
      has_skill_path: !!toolEntry.skill_path,
      what_it_does_length: (toolEntry.what_it_does || '').length,
      how_agent_uses_length: (toolEntry.how_agent_uses || '').length,
      description_length: (toolEntry.description || '').length
    }
  };
}

function computeSummary(scores) {
  const totals = scores.map(s => s.total_score).sort((a, b) => a - b);
  const n = totals.length;
  if (n === 0) {
    return { mean: 0, median: 0, min: 0, max: 0, stddev: 0, distribution: { A: 0, B: 0, C: 0, D: 0 } };
  }
  const sum = totals.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const median = n % 2 === 0 ? (totals[n / 2 - 1] + totals[n / 2]) / 2 : totals[Math.floor(n / 2)];
  const min = totals[0];
  const max = totals[n - 1];
  const variance = totals.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n;
  const stddev = Math.round(Math.sqrt(variance) * 100) / 100;
  const distribution = { A: 0, B: 0, C: 0, D: 0 };
  for (const s of scores) {
    distribution[s.grade]++;
  }
  return { mean: Math.round(mean * 100) / 100, median: Math.round(median * 100) / 100, min, max, stddev, distribution };
}

function computeAllToolScores(toolsYamlPath, options = {}) {
  const yaml = require('js-yaml');
  const raw = fs.readFileSync(toolsYamlPath, 'utf8');
  const doc = yaml.load(raw);
  const entries = doc.tools || [];
  const refDate = options.referenceDate || new Date().toISOString().slice(0, 10);
  const tools = entries.map(t => computeToolScore(t, { ...options, referenceDate: refDate }));
  const summary = computeSummary(tools);
  return { date_computed: refDate, tool_count: tools.length, tools, summary };
}

function writeQualityScores(results, outputPath) {
  const schema = {
    _meta: {
      schema_version: '1.0.0',
      date_computed: results.date_computed,
      tool_count: results.tool_count,
      score_dimensions: [
        { name: 'maintenance', max: 30, description: 'License, skills inclusion, description quality, skill path' },
        { name: 'docs', max: 25, description: 'What it does, how agent uses, description length' },
        { name: 'community', max: 20, description: 'Star count, skills inclusion' },
        { name: 'trustworthiness', max: 15, description: 'Verification tier from verified-by.md' },
        { name: 'freshness', max: 10, description: 'Recency of verification date' }
      ]
    },
    summary: results.summary,
    tools: results.tools
  };
  fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2) + '\n', 'utf8');
}

function formatQualityReport(results, options = {}) {
  const lines = [];
  lines.push('='.repeat(60));
  lines.push('  Quality Score Report');
  lines.push('='.repeat(60));
  lines.push(`  Computed: ${results.date_computed}`);
  lines.push(`  Tools scored: ${results.tool_count}`);
  lines.push('');
  if (results.summary) {
    lines.push('  Summary:');
    lines.push(`    Mean:   ${results.summary.mean}`);
    lines.push(`    Median: ${results.summary.median}`);
    lines.push(`    Min:    ${results.summary.min}`);
    lines.push(`    Max:    ${results.summary.max}`);
    lines.push(`    StdDev: ${results.summary.stddev}`);
    lines.push(`    Distribution: A=${results.summary.distribution.A}  B=${results.summary.distribution.B}  C=${results.summary.distribution.C}  D=${results.summary.distribution.D}`);
    lines.push('');
  }
  if (results.tools.length > 0) {
    const header = '  Tool'.padEnd(32) + 'Score'.padEnd(8) + 'Grade'.padEnd(6) + 'Maint Doc Comm Trust Fresh';
    lines.push(header);
    lines.push('  ' + '-'.repeat(header.length - 2));
    for (const t of results.tools) {
      const name = t.name.length > 28 ? t.name.slice(0, 25) + '...' : t.name;
      const s = t.scores;
      lines.push(
        `  ${name.padEnd(30)} ${String(t.total_score).padEnd(6)} ${t.grade.padEnd(4)} ` +
        `${String(s.maintenance.score).padStart(3)} ${String(s.docs.score).padStart(3)} ` +
        `${String(s.community.score).padStart(3)} ${String(s.trustworthiness.score).padStart(3)} ${String(s.freshness.score).padStart(3)}`
      );
    }
  }
  lines.push('');
  lines.push('='.repeat(60));
  return lines.join('\n');
}

module.exports = {
  parseVerifiedBy,
  parseDateFreshness,
  computeToolScore,
  computeAllToolScores,
  writeQualityScores,
  formatQualityReport,
  computeGrade,
  scoreMaintenance,
  scoreDocs,
  scoreCommunity,
  scoreTrustworthiness,
  scoreFreshness
};
