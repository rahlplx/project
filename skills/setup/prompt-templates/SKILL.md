# Prompt Templates

Pre-built, copy-paste prompt templates for common development tasks. These templates are designed to work with AI coding assistants and can be customized for your specific needs.

## Table of Contents

1. [Web Development](#web-development)
2. [Backend & APIs](#backend--apis)
3. [Database](#database)
4. [Authentication](#authentication)
5. [DevOps & Deployment](#devops--deployment)
6. [Testing](#testing)
7. [Refactoring](#refactoring)

---

## Web Development

### 1. Build a Landing Page

```
Create a landing page for [PROJECT_NAME] with the following requirements:

- Hero section with headline: "[HEADLINE]"
- Subheadline: "[SUBHEADLINE]"
- Call-to-action button linking to: [CTA_URL]
- Feature highlights section with 3-4 key benefits
- Social proof section (testimonials/stats)
- Footer with links: [LINKS]

Design preferences:
- Style: [MINIMALIST/MODERN/CREATIVE]
- Primary color: [HEX_CODE]
- Include responsive mobile design
- Use semantic HTML and CSS variables for theming

Tech stack: [REACT/VUE/HTML+CSS]
```

**When to use:** Starting a new marketing site or product page.

---

### 2. Create a Dashboard

```
Build an analytics dashboard with:

Data visualization:
- Line chart for [METRIC_1] over time
- Bar chart comparing [METRIC_2]
- Pie chart for [CATEGORY_BREAKDOWN]

Features:
- Date range filter (last 7/30/90 days)
- Export to CSV functionality
- Real-time data refresh every [X] seconds

Layout:
- Sidebar navigation with: [NAV_ITEMS]
- Main content area with grid layout
- Top bar with user profile and notifications

Design: [MATERIAL/MODERN/TAILWIND_BASED]
Include loading skeletons and empty states.
```

**When to use:** Admin panels, analytics tools, monitoring dashboards.

---

### 3. Build a Form Component

```
Create a form component for: [FORM_PURPOSE]

Fields:
[FILL IN YOUR FIELDS, e.g.]
- Name (required, text, max 50 chars)
- Email (required, email validation)
- Password (required, min 8 chars, must include number)
- Subscription tier (dropdown: Free/Pro/Enterprise)
- Newsletter opt-in (checkbox)

Validation rules:
- Real-time validation as user types
- Show specific error messages for each rule
- Disable submit until all validations pass

UX features:
- Progress indicator showing completed fields
- Auto-save draft to localStorage
- Clear form button with confirmation

Style: [MATCH_EXISTING_STYLES/COMPONENT_LIBRARY]
```

**When to use:** User registration, contact forms, settings pages.

---

### 4. Add Infinite Scroll

```
Implement infinite scroll for: [LIST/CONTENT_TYPE]

Requirements:
- Load [X] items initially
- Fetch more when user scrolls within [Y]px of bottom
- Show loading spinner during fetch
- Handle end-of-content gracefully

Performance:
- Use Intersection Observer API
- Debounce scroll events (300ms)
- Virtual scrolling if list exceeds [THRESHOLD] items
- Cache previous pages in memory

Edge cases:
- Loading state while fetching
- Error state with retry button
- "Back to top" floating button after scrolling
- Disable scroll listener when all loaded
```

**When to use:** Social feeds, product catalogs, search results.

---

## Backend & APIs

### 5. Create a REST API

```
Build a REST API for: [RESOURCE_NAME]

Endpoints:
- GET /[resources] - List all [resources] (paginated)
- GET /[resources]/:id - Get single [resource]
- POST /[resources] - Create new [resource]
- PUT /[resources]/:id - Update [resource]
- DELETE /[resources]/:id - Delete [resource]

Features:
- Request validation using [ZOD/JOI/EXPRESS-VALIDATOR]
- Error handling with appropriate HTTP status codes
- Pagination with cursor or offset
- Rate limiting (100 requests/minute)

Response format:
{
  "success": true,
  "data": [...],
  "meta": { "page": 1, "total": 100 }
}

Use framework: [EXPRESS/FASTIFY/NESTJS]
Include Swagger/OpenAPI documentation.
```

**When to use:** Building CRUD APIs, microservice backends.

---

### 6. Build a GraphQL API

```
Create a GraphQL API for: [PROJECT/PRODUCT]

Schema requirements:
type [Entity] {
  id: ID!
  [fields]: [types]
  createdAt: DateTime
  updatedAt: DateTime
}

Queries:
- [entity](id: ID!): [Entity]
- [entities](limit: Int, offset: Int): [Entity]

Mutations:
- create[Entity](input: CreateInput!): [Entity]!
- update[Entity](id: ID!, input: UpdateInput!): [Entity]!
- delete[Entity](id: ID!): Boolean!

Features:
- Authentication via [JWT/COOKIE]
- Field-level authorization
- Pagination with Relay-style connections
- Input validation

Use: [APOLLO_SERVER/GRAPHQL_YOGA/PRISMA]
```

**When to use:** Complex data relationships, flexible client queries.

---

### 7. WebSocket Server

```
Implement a WebSocket server for: [USE_CASE]

Events:
- connection: Handle new client connections
- disconnect: Clean up on client leave
- [CUSTOM_EVENT]: Handle [DESCRIPTION]

Features:
- Authentication via token in handshake
- Room/namespace support for [USE_CASE]
- Message queue for offline delivery
- Heartbeat ping/pong every 30 seconds

Scaling considerations:
- Redis adapter for multi-instance
- Rate limiting per connection
- Max connections per IP

Use library: [SOCKET.IO/WEBSOCKET/WS]
```

**When to use:** Chat apps, live notifications, collaborative tools.

---

## Database

### 8. Design Database Schema

```
Design a database schema for: [APPLICATION/PROJECT]

Entities:
[LIST YOUR ENTITIES, e.g.]
- User: id, email, password_hash, name, avatar_url, created_at
- Post: id, title, content, author_id, published_at
- Comment: id, content, post_id, author_id, created_at

Relationships:
- User has many Posts
- Post belongs to User
- Post has many Comments
- Comment belongs to User and Post

Features needed:
- Soft deletes (deleted_at timestamp)
- Timestamps (created_at, updated_at)
- Indexes on frequently queried fields
- Migrations support

Use: [POSTGRESQL/MYSQL/MONGODB]
Include seed data scripts for development.
```

**When to use:** New projects, schema migrations, data modeling.

---

### 9. Write Database Migrations

```
Create migration files for: [CHANGE_DESCRIPTION]

Current schema:
[DESCRIBE CURRENT STATE]

Required changes:
1. [CHANGE_1]
2. [CHANGE_2]
3. [CHANGE_3]

Requirements:
- Both up (apply) and down (rollback) migrations
- Zero-downtime deployment strategy
- Test on staging first
- Backup before running

Use: [PRISMA/SEQUELIZE/KNEX/RAW_SQL]
Include rollback plan and validation checks.
```

**When to use:** Schema updates, adding features, data migrations.

---

## Authentication

### 10. Add User Authentication

```
Implement authentication for: [APPLICATION]

Requirements:
- Registration with email/password
- Login with email/password
- Password reset via email
- Email verification flow

Security:
- Hash passwords with bcrypt (cost factor 12)
- JWT tokens with 1-hour expiry
- Refresh tokens with 7-day expiry
- CSRF protection
- Rate limiting on auth endpoints (5 attempts/minute)

User flow:
1. User signs up → verification email sent
2. User clicks link → email verified, account active
3. User logs in → JWT + refresh token issued
4. JWT expires → refresh token used to get new JWT

Use: [PASSPORT/JWT-LIBRARY/AUTH0/SUPABASE]
```

**When to use:** User systems, SaaS products, member areas.

---

### 11. Add OAuth Login

```
Add OAuth/social login for:

Providers: [GOOGLE/GITHUB/FACEBOOK/TWITTER]

Flow:
1. User clicks "[Provider] Login"
2. Redirect to provider's auth page
3. User approves permissions
4. Callback with auth code
5. Exchange for access token
6. Fetch user profile
7. Create/link account
8. Issue session

Features:
- Link multiple OAuth providers to one account
- Auto-provision new account on first login
- Merge accounts if email matches existing

Security:
- State parameter to prevent CSRF
- PKCE for public clients
- Token storage in httpOnly cookies

Use: [PASSPORT-OAUTH/NEXT-AUTH/CUSTOM]
```

**When to use:** Reducing signup friction, social features.

---

## DevOps & Deployment

### 12. Dockerize Application

```
Create Docker configuration for: [APPLICATION]

Dockerfile requirements:
- Multi-stage build for [NODE/RUBY/GO/PYTHON]
- Production image with minimal size
- Non-root user for security
- Health check endpoint
- Build args for [ENV_VARS]

docker-compose.yml:
- App service with restart policy
- Database service (if needed)
- Redis cache service
- Nginx reverse proxy

Optimization:
- Layer caching for dependencies
- .dockerignore for build context
- Named volumes for data persistence
- Resource limits (memory, CPU)

Include:
- docker-compose.yml for local dev
- docker-compose.prod.yml for production
- .dockerignore file
```

**When to use:** Containerizing apps, Kubernetes deployment.

---

### 13. Set Up CI/CD Pipeline

```
Configure CI/CD pipeline for: [PROJECT/REPO]

GitHub Actions workflow (.github/workflows/ci.yml):

Stages:
1. Lint & Type Check
2. Unit Tests (matrix: Node 18/20)
3. Integration Tests
4. Build & Security Scan
5. Deploy to [STAGING/PRODUCTION]

Triggers:
- Push to main: deploy staging
- Push tag v*.*.*: deploy production
- PR: run tests, comment status

Environment variables:
- [LIST SECRETS]
- Database URLs per environment
- API keys (from Secrets Manager)

Deployment:
- Zero-downtime deploy
- Rollback capability
- Slack notifications on success/failure
```

**When to use:** Automating deployments, ensuring quality.

---

## Testing

### 14. Write Unit Tests

```
Write unit tests for: [MODULE/FUNCTION/COMPONENT]

Test cases to cover:
1. Happy path: [DESCRIPTION]
2. Edge cases: [LIST_EDGE_CASES]
3. Error handling: [ERROR_SCENARIOS]
4. Boundary conditions: [BOUNDARIES]

Test structure:
describe('[Unit]') {
  beforeEach(() => { /* setup */ })

  it('should [EXPECTATION]', () => {
    // Arrange
    const input = [VALUE];

    // Act
    const result = [CALL_FUNCTION(input)];

    // Assert
    expect(result).toBe([EXPECTED]);
  });
}

Coverage target: 80%+
Use: [JEST/VITEST/JASMINE]
```

**When to use:** Adding test coverage, TDD approach.

---

### 15. Write Integration Tests

```
Create integration tests for: [API/FEATURE]

Test scenarios:

1. [USER_ACTION]:
   - Given user is logged in
   - When they [PERFORM_ACTION]
   - Then [EXPECT_RESULT]

2. [ERROR_CASE]:
   - Given [PRECONDITION]
   - When [ACTION] fails
   - Then show [ERROR_MESSAGE]

3. [AUTH_FLOW]:
   - Test full authentication flow
   - Verify tokens stored correctly
   - Test expired token handling

Use test database with fresh migrations.
Mock external services (Stripe, email, etc.).

Framework: [SUPERTEST/PLAYWRIGHT/CYPRESS]
```

**When to use:** API testing, end-to-end flows.

---

## Refactoring

### 16. Refactor Legacy Code

```
Refactor [FILE/COMPONENT/MODULE] to improve:

Current issues:
- [ISSUE_1]
- [ISSUE_2]
- [ISSUE_3]

Goals:
- Better code organization
- Improved type safety
- Easier testing
- Performance optimization

Constraints:
- Maintain backward compatibility
- No breaking changes to public API
- Update all call sites

Steps:
1. Identify public API surface
2. Extract internal logic
3. Add types/interfaces
4. Write tests for new structure
5. Migrate call sites gradually
6. Remove old implementation

Keep changelog for migration guide.
```

**When to use:** Technical debt, code modernization.

---

### 17. Performance Optimization

```
Optimize [AREA/COMPONENT] for performance:

Current metrics (from profiling):
- [METRIC_1]: [CURRENT_VALUE] → target [TARGET]
- [METRIC_2]: [CURRENT_VALUE] → target [TARGET]

Known bottlenecks:
1. [BOTTLENECK_1]
2. [BOTTLENECK_2]

Strategies:
- [STRATEGY_1]: [HOW_TO_IMPLEMENT]
- [STRATEGY_2]: [HOW_TO_IMPLEMENT]

Measure before and after each change.
Use: [CHROME_DEVTOOLS/FLAMEGRAPH/BENCHMARK]

Avoid premature optimization - focus on hot paths.
```

**When to use:** Slow pages, high load, user complaints.

---

## Tips for Using These Templates

1. **Customize placeholders** - Replace all `[PLACEHOLDERS]` with your specific values
2. **Combine templates** - Mix multiple templates for complex features
3. **Iterate** - Start with a basic prompt, then refine based on results
4. **Add context** - Include existing code patterns and style preferences
5. **Specify constraints** - Include performance, security, or compatibility requirements

## Contributing

Have a template that works well? Submit a PR to add it to this collection!
