---
name: vibe-template
description: "Browse, search, and apply 226+ production-ready code templates and 26 prompt
  templates. Use when: starting a new component, page, API endpoint, schema, test, or
  config from scratch. Search by type, framework, or use case. Applies taste-skill dials
  and anti-slop rules to any template before output. Wraps: template-gallery, prompt-templates,
  quick-start skills."
argument-hint: "[search query] [--type component|page|api|db|test|prompt|scaffold] [--framework react|next|node|python]"
version: 1.0.0
allowed-tools:
  - Read
  - Write
  - Bash(node skills/setup/prompt-templates/index.js*)
  - Bash(node skills/setup/quick-start/index.js*)
  - Bash(ls skills/setup/template-gallery/*)
  - AskUserQuestion
---

# Vibe-Template — Production Template Library

## Dispatcher

- No args → show template catalog (all categories)
- `{search query}` → search templates by keyword
- `--type {category}` → filter by type
- `--framework {name}` → filter by framework
- After finding a template: offer to apply it with taste-skill dials + anti-slop cleanup

---

## Template Catalog

### Code Templates (from `skills/setup/template-gallery/`)

#### Frontend Components
| Template | Use case | Key features |
|----------|----------|--------------|
| Landing page | Marketing homepage | Hero, features, CTA, pricing, FAQ |
| Dashboard layout | Admin/app shell | Sidebar nav, header, content area, responsive |
| Data table | List with CRUD | Sorting, filtering, pagination, row actions |
| Form | Data capture | Validation, error states, loading state, success |
| Modal/Dialog | Confirmations, editing | Accessible (focus trap, Escape, overlay) |
| Card grid | Gallery, products | Responsive grid, loading skeleton, empty state |
| Infinite scroll | Feed, search results | Virtual list, load trigger, end state |
| Auth flow | Login/signup | Form, validation, OAuth buttons, forgot password |
| Profile page | User settings | Avatar upload, field editing, danger zone |
| Notification system | Toasts, alerts | Stack, auto-dismiss, severity levels |

#### Backend / API
| Template | Use case | Key features |
|----------|----------|--------------|
| REST endpoint | CRUD route | Validation, auth middleware, error handling, pagination |
| GraphQL resolver | Data fetching | Auth check, error handling, N+1 protection |
| WebSocket server | Real-time | Connection management, broadcast, reconnection |
| Webhook handler | Inbound events | Signature verification, idempotency, retry |
| Background job | Queue worker | Error handling, retries, dead letter queue |
| Rate limiter middleware | API protection | Per-IP, per-user, sliding window |
| Auth middleware | Route protection | JWT verify, role check, refresh token |

#### Database
| Template | Use case | Key features |
|----------|----------|--------------|
| Schema definition | Data model | Indexes, constraints, soft-delete, timestamps |
| Migration | Schema change | Up + down, idempotent, safe for concurrent deploys |
| Repository pattern | Data access layer | CRUD methods, query builder, transaction support |
| Seed data | Dev/test data | Realistic data, repeatable, env-gated |

#### Infrastructure
| Template | Use case | Key features |
|----------|----------|--------------|
| Dockerfile | Containerization | Multi-stage build, non-root user, health check |
| CI/CD pipeline | GitHub Actions | Build, test, lint, deploy gates |
| Environment config | 12-factor app | Required vars check, type casting, secrets separation |
| Error monitoring setup | Observability | Sentry/Datadog integration, source maps, alerts |

### Prompt Templates (from `skills/setup/prompt-templates/index.js` — 26 templates)

| Category | Templates available |
|----------|-------------------|
| **UI Generation** | Landing page, dashboard, form, infinite scroll, modal |
| **API Design** | REST CRUD, GraphQL schema, WebSocket, webhook |
| **Database** | Schema design, migration, query optimization |
| **Auth** | OAuth flow, JWT setup, role-based access |
| **DevOps** | Docker, CI/CD, monitoring, env config |
| **Testing** | Unit tests, integration tests, E2E flows |
| **Refactoring** | Performance, readability, security hardening |

### Project Scaffolds (from `skills/setup/quick-start/index.js` — 10 types)

| Scaffold | Stack | Includes |
|----------|-------|----------|
| React + Vite | Frontend SPA | Tailwind, React Router, ESLint, Prettier |
| Next.js App Router | Full-stack | Tailwind, TypeScript, tRPC or API routes |
| Node.js REST API | Backend | Express, Prisma, JWT auth, Jest |
| Node.js GraphQL | Backend | Apollo Server, Prisma, type generation |
| CLI tool | Node.js | Commander, Inquirer, chalk, ora |
| Python FastAPI | Backend | SQLAlchemy, Pydantic, JWT, pytest |
| Python Django | Full-stack | Django REST, Celery, PostgreSQL |
| Chrome Extension | Browser | Manifest v3, React popup, background worker |
| Discord bot | Bot | discord.js, slash commands, event handlers |
| Electron app | Desktop | React, SQLite, auto-updater, packaging |

---

## Template Application Protocol

When the user selects a template:

1. **Load taste-skill dials** from `.vibe/projects/{slug}/guardrails.md` if exists
   - If no dials set: ask the 3 dial questions from `/vibe-design dials` first
   - Apply dials to all aesthetic choices in the template

2. **Apply anti-slop pre-processing** before outputting any UI template:
   - Replace default blue buttons with `{brand-primary}` placeholder
   - Replace lorem ipsum with realistic domain-specific placeholder text
   - Replace generic "John Doe" names with culturally diverse realistic names
   - Replace stock photo URLs with `{image: description of what should go here}` comments
   - Check for three-card grid default — diversify layout based on DESIGN_VARIANCE dial

3. **Output the template** with:
   - File path suggestion (`where to put this file`)
   - Installation requirements (`npm install {packages}`)
   - Environment variables needed
   - Next steps (what to customize)

4. **Offer `/vibe-design audit`** immediately after: "Want me to run the design audit on this?"

---

## Search Format

When user searches:

```
TEMPLATE SEARCH — "{query}"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Found {N} matches:

  1. {Template Name} [{type}]
     {One sentence description}
     Frameworks: {list}
     Apply: /vibe-template apply {id}

  2. ...

Most relevant: {top match name}
Apply it now? (yes to proceed with taste-skill + anti-slop processing)
```
