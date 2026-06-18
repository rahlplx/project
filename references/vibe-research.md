# Market Research

Research project domain, competitors, and open-source tools.

## Research Protocol

### Step 1: Domain Analysis (5 min)

1. **Project type**: SaaS, API, CLI, extension, mobile, agent
2. **Target market**: Who are the users?
3. **Market size**: How many potential users?
4. **Trends**: What's hot in this space?

### Step 2: Competitor Analysis (10 min)

1. **Direct competitors**: Same solution, same market
2. **Indirect competitors**: Different solution, same problem
3. **Potential competitors**: Could pivot into this space

For each competitor:
- Name and URL
- Strengths (3-5)
- Weaknesses (3-5)
- Pricing model
- User reviews (G2, Capterra, Reddit)

## Competitor Analysis

### Step 3: Open Source Tools (10 min)

1. **Core tools**: Frameworks, libraries, SDKs
2. **Utility tools**: Auth, billing, permissions, API
3. **UI tools**: Component libraries, design systems
4. **DevOps tools**: CI/CD, monitoring, deployment

For each tool:
- Name and repo URL
- Stars and license
- Last commit date
- Community activity
- Production users

## Open Source Tools

### Step 4: Utility Catalog (5 min)

Check utility catalog for:
- Auth: NextAuth.js, Passport.js, Lucia, Clerk, Supabase Auth, Keycloak
- API: Express, Fastify, NestJS, Hono, tRPC, Strapi, Prisma
- UI: shadcn/ui, Radix UI, Headless UI, Chakra UI, Mantine, Ant Design
- Billing: Stripe, Lemon Squeezy, Paddle, Chargebee, Recurly
- Permissions: CASL, AccessControl, Casbin, OPA, SpiceDB, Oso

## Utility Catalog

| Category | Tools |
|----------|-------|
| Auth | NextAuth.js, Passport.js, Lucia, Clerk, Supabase Auth, Keycloak |
| API | Express, Fastify, NestJS, Hono, tRPC, Strapi, Prisma |
| UI | shadcn/ui, Radix UI, Headless UI, Chakra UI, Mantine, Ant Design |
| Billing | Stripe, Lemon Squeezy, Paddle, Chargebee, Recurly |
| Permissions | CASL, AccessControl, Casbin, OPA, SpiceDB, Oso |

## Skip Protocol

If user wants to skip research:
1. Apply defaults from utility catalog
2. Flag areas that need review
3. Generate minimal research doc

## Output

Generated file:
- `MARKET_RESEARCH.md` — Market overview, competitors, tools, recommendations, risks, next steps

## Token Budget

- Reference: lazy-loaded on demand
- Size: ~180 lines
- Re-attach: only when conducting research
