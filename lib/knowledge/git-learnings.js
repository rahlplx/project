/**
 * Git Learnings Extractor
 * Mines git log to surface commit-type distribution, most-changed files,
 * and velocity — addressing the "no learning extraction from git history" gap.
 */

const { execFileSync } = require('child_process');

const COMMIT_TYPE_PATTERNS = [
  { type: 'feat', pattern: /^feat[:(]/i },
  { type: 'fix', pattern: /^fix[:(]/i },
  { type: 'refactor', pattern: /^refactor[:(]/i },
  { type: 'test', pattern: /^test[:(]/i },
  { type: 'chore', pattern: /^chore[:(]/i },
  { type: 'docs', pattern: /^docs[:(]/i },
  { type: 'security', pattern: /\b(security|owasp|cve|auth|secret)\b/i },
];

function extract(cwd = process.cwd(), options = {}) {
  const limit = options.limit || 50;
  const git = args => execFileSync('git', args, { cwd, encoding: 'utf8', timeout: 10000 }).trim();

  let recentCommits = [];
  try {
    const log = git(['log', '--oneline', `-${limit}`]);
    recentCommits = log
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const [sha, ...rest] = line.split(' ');
        return { sha, message: rest.join(' ') };
      });
  } catch {
    return {
      error: 'Not a git repository or git unavailable.',
      recentCommits: [],
      topChangedFiles: [],
      commitTypes: {},
      velocity: null,
    };
  }

  // Commit type distribution
  const commitTypes = {};
  for (const { message } of recentCommits) {
    const matched = COMMIT_TYPE_PATTERNS.find(p => p.pattern.test(message));
    const type = matched ? matched.type : 'other';
    commitTypes[type] = (commitTypes[type] || 0) + 1;
  }

  // Most-changed files
  let topChangedFiles = [];
  try {
    const shortstat = git(['log', '--name-only', '--pretty=format:', `-${Math.min(limit, 30)}`]);
    const fileCounts = {};
    for (const line of shortstat.split('\n').filter(Boolean)) {
      fileCounts[line] = (fileCounts[line] || 0) + 1;
    }
    topChangedFiles = Object.entries(fileCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([file, count]) => ({ file, changes: count }));
  } catch {
    /* skip */
  }

  // Velocity: commits in last 7 days
  let velocity = null;
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const lines = git(['log', '--oneline', `--since=${since}`]);
    velocity = { commitsLast7Days: lines ? lines.split('\n').filter(Boolean).length : 0 };
  } catch {
    /* skip */
  }

  const antiPatterns = [];
  if ((commitTypes.fix || 0) > (commitTypes.feat || 0)) {
    antiPatterns.push(
      'More fix commits than feat commits — high defect rate, consider adding tests before new features.'
    );
  }
  if (!commitTypes.test && recentCommits.length > 5) {
    antiPatterns.push('No test commits detected — tests may be absent or untriggered by CI.');
  }

  return {
    recentCommits: recentCommits.slice(0, 10),
    topChangedFiles,
    commitTypes,
    velocity,
    antiPatterns,
  };
}

module.exports = { extract, COMMIT_TYPE_PATTERNS };
