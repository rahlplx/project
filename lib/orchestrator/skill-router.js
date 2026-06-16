/**
 * Skill Router
 * Maps user intent keywords to the recommended skill bundle to invoke.
 * Addresses the "no skill auto-selection from user intent" gap.
 */

const ROUTING_TABLE = [
  {
    id: 'auth-security',
    patterns: [/\b(login|logout|auth|authentication|password|session|token|jwt|oauth)\b/i],
    skills: ['vibe-security', 'vibe-tdd'],
    reason: 'Auth work carries the highest security surface area — security audit + tests are mandatory.'
  },
  {
    id: 'payment',
    patterns: [/\b(payment|stripe|billing|subscription|checkout|invoice|charge)\b/i],
    skills: ['vibe-security', 'vibe-tdd', 'vibe-review'],
    reason: 'Payment code is PCI-scope; security + TDD + human review before shipping.'
  },
  {
    id: 'ui-design',
    patterns: [/\b(ui|design|layout|color|css|style|component|screen|page|landing|hero)\b/i],
    skills: ['vibe-design', 'vibe-tdd'],
    reason: 'UI work needs anti-slop + WCAG audit + component tests.'
  },
  {
    id: 'deploy-infra',
    patterns: [/\b(deploy|ship|production|staging|hosting|ci|cd|pipeline|release)\b/i],
    skills: ['vibe-deploy', 'vibe-security'],
    reason: 'Deployment requires done-verifier checklist and a pre-deploy security scan.'
  },
  {
    id: 'api-integration',
    patterns: [/\b(api|endpoint|rest|graphql|webhook|integration|sdk|fetch|axios)\b/i],
    skills: ['vibe-tdd', 'vibe-security'],
    reason: 'External API calls need contract tests and input-validation security check.'
  },
  {
    id: 'database',
    patterns: [/\b(database|db|sql|query|migration|schema|model|orm|prisma|supabase)\b/i],
    skills: ['vibe-tdd', 'vibe-security'],
    reason: 'DB work needs injection-safe queries (security) and rollback-safe migrations (tests).'
  },
  {
    id: 'refactor',
    patterns: [/\b(refactor|clean|simplify|restructure|rewrite|cleanup|technical debt)\b/i],
    skills: ['vibe-review', 'vibe-tdd'],
    reason: 'Refactoring without tests is just guessing — TDD + code review first.'
  },
  {
    id: 'testing',
    patterns: [/\b(test|spec|tdd|coverage|unit|integration|e2e|jest|vitest|cypress)\b/i],
    skills: ['vibe-tdd'],
    reason: 'Testing work — wire red/green/refactor loop.'
  },
  {
    id: 'explain-debug',
    patterns: [/\b(explain|understand|debug|diagnose|why|what does|broken|error|bug)\b/i],
    skills: ['vibe-explain', 'vibe-status'],
    reason: 'Diagnostic work — explain the code and check current state before changing anything.'
  }
];

class SkillRouter {
  route(request) {
    const text = String(request || '');
    const matched = ROUTING_TABLE.filter((entry) =>
      entry.patterns.some((p) => p.test(text))
    );

    if (matched.length === 0) {
      return {
        skills: ['vibe'],
        confidence: 0.3,
        reason: 'No specific intent detected — run the full /vibe pipeline.',
        matches: []
      };
    }

    const allSkills = [...new Set(matched.flatMap((m) => m.skills))];
    const confidence = Math.min(0.95, 0.5 + matched.length * 0.15);

    return {
      skills: allSkills,
      confidence: Math.round(confidence * 100) / 100,
      reason: matched.map((m) => m.reason).join(' '),
      matches: matched.map(({ id, skills }) => ({ id, skills }))
    };
  }

  getTable() {
    return ROUTING_TABLE.map(({ id, skills, reason }) => ({ id, skills, reason }));
  }
}

module.exports = { SkillRouter, ROUTING_TABLE };
