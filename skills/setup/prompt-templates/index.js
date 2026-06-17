#!/usr/bin/env node

class PromptTemplates {
  constructor(config = {}) {
    this.name = 'prompt-templates';
    this.version = '1.0.0';
    this.description = 'Pre-built copy-paste prompt templates for AI coding assistants';
  }

  getCategories() {
    return [
      { id: 'web', name: 'Web Development', count: 3 },
      { id: 'backend', name: 'Backend & APIs', count: 3 },
      { id: 'database', name: 'Database', count: 2 },
      { id: 'auth', name: 'Authentication', count: 2 },
      { id: 'devops', name: 'DevOps & Deployment', count: 2 },
      { id: 'testing', name: 'Testing', count: 2 },
      { id: 'refactor', name: 'Refactoring', count: 3 },
      { id: 'ai-agent', name: 'AI Agent & Auto-Injection', count: 3 },
      { id: 'telemetry', name: 'Telemetry & Observability', count: 3 },
      { id: 'security', name: 'Security Review', count: 3 }
    ];
  }

  getTemplate(category, templateId) {
    const all = this.getAllTemplates();
    const cat = all[category];
    if (!cat) return null;
    return cat.find(t => t.id === templateId) || null;
  }

  getAllTemplates() {
    return {
      web: [
        {
          id: 'landing-page',
          name: 'Build a Landing Page',
          prompt: `Create a landing page for [PROJECT_NAME] with:
- Hero section with headline: "[HEADLINE]"
- Subheadline: "[SUBHEADLINE]"
- Call-to-action button linking to: [CTA_URL]
- Feature highlights section with 3-4 key benefits
- Social proof section (testimonials/stats)
- Footer with links: [LINKS]
Design: [MINIMALIST/MODERN/CREATIVE], primary color: [HEX_CODE]
Responsive, semantic HTML, CSS variables. Stack: [REACT/VUE/HTML+CSS]`
        },
        {
          id: 'dashboard',
          name: 'Create a Dashboard UI',
          prompt: `Build a dashboard UI for [APP_NAME] with:
- Sidebar navigation: [NAV_ITEMS]
- Main content area with [CHART_TYPE] chart
- Data table with sortable columns: [COLUMNS]
- Header with user avatar and notifications
- Dark/light mode toggle
Tech stack: [REACT/VUE/SVELTE]
Use a CSS framework or Tailwind. Make it responsive.`
        },
        {
          id: 'form',
          name: 'Build a Multi-Step Form',
          prompt: `Create a multi-step form for [PURPOSE] with:
- [NUMBER] steps: [STEP_NAMES]
- Progress indicator showing current step
- Form validation on each step
- Back/Next navigation
- Summary review before submit
- Success state after submission
Stack: [REACT/VUE]. Handle loading, error, and edge cases.`
        }
      ],
      backend: [
        {
          id: 'rest-api',
          name: 'Build a REST API',
          prompt: `Create a REST API for [APP_NAME] with:
- Endpoints: [LIST_ENDPOINTS]
- Framework: [EXPRESS/FASTIFY/NEST]
- Database: [MONGODB/POSTGRES/SQLITE]
- Input validation on all routes
- Error handling middleware
- Environment config (.env)
- Include: [AUTH/RATE_LIMIT/CORS/LOGGING]
Return consistent JSON responses with proper HTTP status codes.`
        },
        {
          id: 'graphql',
          name: 'Build a GraphQL API',
          prompt: `Create a GraphQL API for [APP_NAME] with:
- Schema with types: [TYPES]
- Queries: [QUERIES]
- Mutations: [MUTATIONS]
- Resolvers with data fetching
- Input validation
- Error handling
Server: [APOLLO/EXPRESS-GRAPHQL]. Include auth middleware.`
        },
        {
          id: 'webhook',
          name: 'Set Up Webhook Handler',
          prompt: `Build a webhook handler for [SERVICE] that:
- Accepts POST requests at /webhook
- Validates signature/secret
- Parses event payload: [EVENT_TYPES]
- Processes each event type
- Returns 200 OK quickly
- Queues heavy processing
- Logs all requests
Stack: [NODE/PYTHON/GO]. Deployable as serverless function.`
        }
      ],
      database: [
        {
          id: 'schema',
          name: 'Design Database Schema',
          prompt: `Design a database schema for [APP_NAME] with:
- Tables/collections: [TABLE_NAMES]
- Relationships: [RELATIONSHIPS]
- Indexes on: [FIELDS]
- Data types and constraints
- Migration files
- Seed data for development
DB: [POSTGRES/MONGODB/MYSQL]. Include an ER diagram description.`
        },
        {
          id: 'queries',
          name: 'Write Complex Queries',
          prompt: `Write [QUERY_TYPE] queries for [USE_CASE]:
- Source tables: [TABLES]
- Required fields: [FIELDS]
- Filters: [FILTERS]
- Sorting: [SORT]
- Aggregation: [AGGREGATION]
- Optimize for performance
DB: [POSTGRES/MONGODB]. Include indexes if needed.`
        }
      ],
      auth: [
        {
          id: 'login',
          name: 'Implement Authentication',
          prompt: `Implement authentication for [APP_NAME] with:
- Sign up with email/password
- Login with email/password
- JWT token generation and validation
- Password hashing (bcrypt)
- Protected route middleware
- Session management
- "Remember me" option
Stack: [NODE/PYTHON]. Include error messages for common failures.`
        },
        {
          id: 'oauth',
          name: 'Add OAuth/Social Login',
          prompt: `Add social login to [APP_NAME] using:
- Providers: [GOOGLE/GITHUB/TWITTER]
- OAuth 2.0 flow
- User profile data mapping
- JWT generation after OAuth
- Link/unlink social accounts
- Handle expired tokens
Stack: [NODE/PASSPORT/NEXT-AUTH]. Include redirect handling.`
        }
      ],
      devops: [
        {
          id: 'docker',
          name: 'Create Docker Setup',
          prompt: `Create Docker configuration for [PROJECT_NAME]:
- Dockerfile with multi-stage build
- docker-compose.yml for local dev
- Services: [APP/DB/CACHE]
- Volume mounts for persistence
- Environment variables
- Health checks
- .dockerignore
Target: [DEV/PRODUCTION]. Optimize for small image size.`
        },
        {
          id: 'ci-cd',
          name: 'Set Up CI/CD Pipeline',
          prompt: `Create a CI/CD pipeline for [PROJECT_NAME] using [GITHUB_ACTIONS/CIRCLE_CI] that:
- Runs on push to main and PRs
- Installs dependencies
- Runs linting
- Runs tests
- Builds the project
- Deploys to [VERCEL/NETLIFY/AWS]
- Notifies on [SLACK/EMAIL] on failure
Include caching for faster runs.`
        }
      ],
      testing: [
        {
          id: 'unit-tests',
          name: 'Write Unit Tests',
          prompt: `Write unit tests for [MODULE_NAME] using [JEST/VITEST/MOCHA]:
- Test all public functions
- Mock external dependencies
- Cover edge cases: empty state, errors, boundaries
- Test happy path
- Test error handling
- Aim for >80% coverage
Follow AAA pattern (Arrange, Act, Assert). Tests should be independent.`
        },
        {
          id: 'e2e-tests',
          name: 'Write E2E Tests',
          prompt: `Write end-to-end tests for [APP_NAME] using [PLAYWRIGHT/CYPRESS]:
- Test user flow: [FLOW_DESCRIPTION]
- Test on [DESKTOP/MOBILE] viewport
- Handle loading states
- Assert on page content
- Test error scenarios
- Use data-testid selectors
Run headless. Include a test for the happy path and edge cases.`
        }
      ],
      refactor: [
        {
          id: 'clean-code',
          name: 'Refactor for Clean Code',
          prompt: `Refactor [FILE_NAME] to improve code quality:
- Extract repeated logic into functions
- Improve variable/function naming
- Reduce nesting depth
- Add early returns for guard clauses
- Split large functions (>20 lines)
- Use modern language features
- Maintain existing behavior
No breaking changes. Keep the same public API.`
        },
        {
          id: 'performance',
          name: 'Optimize Performance',
          prompt: `Optimize [MODULE_NAME] for better performance:
- Profile current bottlenecks
- Reduce algorithmic complexity
- Add caching where appropriate
- Optimize database queries
- Lazy load where possible
- Reduce bundle size
Target metrics: [METRICS]. Measure before and after.`
        },
        {
          id: 'typescript',
          name: 'Convert to TypeScript',
          prompt: `Convert [FILE_NAME] from JavaScript to TypeScript:
- Add type annotations to all variables
- Create interfaces for data shapes
- Use union types for variants
- Add generics where appropriate
- Enable strict mode
- Fix any type errors
- Keep runtime behavior identical
Migration should be incremental, file by file.`
        }
      ],
      'ai-agent': [
        {
          id: 'context-injection',
          name: 'Add Context Auto-Injection',
          prompt: `Wire auto-injection into [AGENT_ENTRY_POINT] using the QueryEnricher pattern:
1. Import QueryEnricher from lib/orchestrator/query-enricher.js
2. Before each handler call, run: const enriched = new QueryEnricher(root).enrich(queryText)
3. If enriched.confidence >= 0.3, prepend enriched.enrichedContext to the prompt
4. Log enriched.skills and enriched.confidence as OTel span attributes
5. Skip injection if context_usage_pct > 85 (check RoleLoader.checkContextBudget())
Source tags: [SKILL], [GOAL], [KB], [GIT] — always prefix injected blocks.
Sanitize all external strings through _sanitize() before injection (OWASP LLM01).`
        },
        {
          id: 'skill-routing',
          name: 'Add Skill Auto-Routing',
          prompt: `Add automatic skill routing to [MODULE_NAME]:
1. Import SkillRouter from lib/orchestrator/skill-router.js
2. On each incoming query, call: const route = router.route(queryText)
3. Map route.skills to the appropriate handler or skill index.js
4. If route.confidence < 0.4, fall back to default handler
5. Log route.skills and route.reason for debugging
ROUTING_TABLE covers: security, tdd, deploy, design, review, plan, explain, status, learnings.
Add new entries to ROUTING_TABLE for any domain-specific skills in [PROJECT].`
        },
        {
          id: 'memory-recall',
          name: 'Add Persistent Memory (mem0 pattern)',
          prompt: `Add session memory to [AGENT_NAME] using the KnowledgeBase pattern:
1. Import KnowledgeBase from lib/knowledge/knowledge-base.js
2. On session start: kb.autoLoad('[PROJECT_ROOT]/.vibe/knowledge-base.json')
3. After each significant action, store: kb.store('[KEY]', { value, source, timestamp })
4. Before each query, recall with Jaccard match: kb entries whose keys overlap query words
5. On session end: kb.autoSave('[PROJECT_ROOT]/.vibe/knowledge-base.json')
Keep entries under 80 chars. Evict entries older than 30 days.`
        }
      ],
      telemetry: [
        {
          id: 'otel-instrumentation',
          name: 'Add OTel Tracing to a Module',
          prompt: `Instrument [MODULE_NAME] with OpenTelemetry spans using lib/telemetry/otel-tracer.js:
1. Import: const { getTracer } = require('./lib/telemetry/otel-tracer')
2. Create tracer once at module level: const tracer = getTracer('[SERVICE_NAME]', projectRoot)
3. Wrap each public function: const span = tracer.startSpan('[component].[operation]', { phase })
4. Add required attributes: span.setAttribute('status', ...).setAttribute('skills', ...)
5. Always call span.end() in a finally block
6. Spans export to .vibe/telemetry/otel/spans.jsonl (append-only)
Never put PII or file paths with usernames in span attributes.`
        },
        {
          id: 'telemetry-dashboard',
          name: 'Build a Telemetry Query',
          prompt: `Query .vibe/telemetry/otel/spans.jsonl for [METRIC]:
const spans = fs.readFileSync('.vibe/telemetry/otel/spans.jsonl', 'utf8')
  .split('\n').filter(Boolean).map(l => JSON.parse(l));

// Filter by time window
const since = Date.now() - [N] * 24 * 60 * 60 * 1000;
const recent = spans.filter(s => s.startTime > since);

// Aggregate [METRIC]: error rate / p95 duration / skill distribution
[AGGREGATION_LOGIC]

Output: { total, [metric], window: '[N]d' }`
        },
        {
          id: 'session-snapshot',
          name: 'Write a Telemetry Session Snapshot',
          prompt: `Write a session snapshot to .vibe/telemetry/sessions/[TIMESTAMP].json:
{
  "session_id": "[UUID]",
  "started_at": "[ISO]",
  "ended_at": "[ISO]",
  "commands_run": ["[CMD1]", "[CMD2]"],
  "phases_completed": ["[PHASE1]"],
  "tests_passing": [N],
  "skills_activated": ["[SKILL1]"],
  "git_velocity": { "commitsLast7Days": [N] },
  "errors": [],
  "confidence_avg": [0-1]
}
Call this from the session end hook or after each major phase transition.`
        }
      ],
      security: [
        {
          id: 'owasp-audit',
          name: 'OWASP Top 10 Security Audit',
          prompt: `Audit [MODULE_OR_FILE] for OWASP Top 10 vulnerabilities:
- A01 Broken Access Control: check auth gates on every route/handler
- A02 Crypto Failures: no plaintext secrets, bcrypt for passwords, TLS everywhere
- A03 Injection: execSync/execFileSync with user input? SQL with string concat?
- A05 Security Misconfiguration: default credentials, open CORS, debug mode in prod
- A06 Vulnerable Components: run npm audit; flag any CRITICAL/HIGH CVEs
- A07 Auth Failures: session fixation, weak tokens, missing rate limiting
- LLM01 Prompt Injection: external strings interpolated into prompts without sanitization
For each finding: severity (CRITICAL/HIGH/MEDIUM/LOW), file:line, remediation step.`
        },
        {
          id: 'dependency-scan',
          name: 'Dependency Security Scan',
          prompt: `Scan [PROJECT] dependencies for security issues:
1. Run: npm audit --json and parse the output
2. Group by severity: critical, high, moderate, low
3. For each critical/high: show package name, CVE ID, affected versions, fix version
4. Check for abandoned packages (last publish > 1 year)
5. Flag packages with no license or non-permissive license (GPL in commercial project)
6. Recommend: npm audit fix for auto-fixable, manual upgrade plan for breaking changes
Output as structured list with remediation priority order.`
        },
        {
          id: 'secret-scan',
          name: 'Scan for Hardcoded Secrets',
          prompt: `Scan [PROJECT] for hardcoded secrets and credentials:
Patterns to find: API keys (sk-..., ghp_..., AKIA...), passwords in config files,
JWT secrets assigned to string literals, private keys (BEGIN RSA/EC PRIVATE KEY),
connection strings with passwords (mongodb://user:pass@...).
For each finding: file, line number, pattern matched, recommended fix.
Recommended fixes: move to process.env.[VAR_NAME], add to .gitignore, rotate the credential.
Check .env.example to confirm .env is gitignored.`
        }
      ]
    };
  }

  search(query = '') {
    const results = [];
    const all = this.getAllTemplates();
    const q = query.toLowerCase();
    for (const [cat, templates] of Object.entries(all)) {
      for (const t of templates) {
        if (t.name.toLowerCase().includes(q) || t.prompt.toLowerCase().includes(q)) {
          results.push({ ...t, category: cat });
        }
      }
    }
    return results;
  }

  toJSON() {
    return {
      name: this.name,
      version: this.version,
      description: this.description,
      totalTemplates: Object.values(this.getAllTemplates()).flat().length,
      categories: this.getCategories().map(c => ({ id: c.id, name: c.name, count: c.count }))
    };
  }
}

if (require.main === module) {
  const skill = new PromptTemplates();
  const cmd = process.argv[2];

  if (cmd === 'list') {
    const cats = skill.getCategories();
    console.log('\n  Available Templates:\n');
    cats.forEach(c => {
      console.log(`  ${c.name} (${c.count} templates)`);
      skill.getAllTemplates()[c.id].forEach(t => console.log(`    - ${t.id}: ${t.name}`));
    });
  } else if (cmd === 'get' && process.argv[3]) {
    const parts = process.argv[3].split('/');
    const template = skill.getTemplate(parts[0], parts[1]);
    if (template) {
      console.log(`\n  ${template.name}\n`);
      console.log(template.prompt);
    } else {
      console.error('Template not found. Use: prompt-templates list');
    }
  } else if (cmd === 'search' && process.argv[3]) {
    const results = skill.search(process.argv[3]);
    if (results.length) {
      console.log(`\n  ${results.length} result(s):\n`);
      results.forEach(r => console.log(`  [${r.category}] ${r.name}`));
    } else {
      console.log('No results.');
    }
  } else {
    console.log('Usage: node index.js [list|get <cat/id>|search <query>]');
  }
}

module.exports = PromptTemplates;
