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
      { id: 'refactor', name: 'Refactoring', count: 3 }
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
