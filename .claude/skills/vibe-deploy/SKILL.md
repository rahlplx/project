---
name: vibe-deploy
description: "One-click deployment with pre-flight checklist, platform selection, smoke test,
  and rollback plan. Use when: ready to ship, deploying to staging or production, or setting
  up CI/CD for the first time. Enforces 14-point done-verifier checklist before any deploy.
  Wraps: one-click-vercel, one-click-netlify, git-free-deploy, done-verifier skills.
  Supports: Vercel, Netlify, Railway, Fly.io, AWS, Docker."
argument-hint: "[vercel|netlify|railway|fly|docker|status] [--staging] [--prod] [--force]"
version: 1.0.0
allowed-tools:
  - Read
  - Bash(npm run build*)
  - Bash(npm test*)
  - Bash(npm audit*)
  - Bash(git status*)
  - Bash(git log*)
  - Bash(vercel*)
  - Bash(netlify*)
  - Bash(railway*)
  - Bash(fly*)
  - Bash(docker*)
  - Bash(curl -f*)
  - AskUserQuestion
---

<EXTREMELY-IMPORTANT>
NEVER deploy to production without passing the pre-flight checklist. A failed deploy
to production affects real users. Take 3 extra minutes to verify — it is always worth it.
If `--force` is passed, still run the checklist and show results — just don't block on warnings.
</EXTREMELY-IMPORTANT>

# Vibe-Deploy — One-Click Deployment

## Dispatcher

- No args → guided deployment (asks platform + environment)
- `vercel` → deploy to Vercel
- `netlify` → deploy to Netlify
- `railway` → deploy to Railway
- `fly` → deploy to Fly.io
- `docker` → build + push Docker image
- `status` → check current deployment status across platforms
- `--staging` → deploy to staging environment
- `--prod` → deploy to production (triggers full pre-flight)
- `--force` → run checklist but don't block on warnings (blockers still block)

---

## Step 1 — Pre-Flight Checklist (Always Runs)

Run all checks before touching deployment. Show results as they come in.

### Build Check
```bash
npm run build
```
- If build fails: STOP. Fix build errors before deploying. No exceptions.

### Test Gate
```bash
npm test
```
- If any tests fail: STOP for `--prod`. For `--staging`: warn but allow with confirmation.

### Security Gate
```bash
npm audit --audit-level=high
```
- Critical/High vulnerabilities: STOP for `--prod`. Warn for `--staging`.

### Secrets Check
```bash
# Ensure no hardcoded secrets are shipping
grep -rn "password\s*=\s*['\"].\{3,\}" --include="*.js" --include="*.ts" . | grep -v "test\|spec\|example"
grep -rn "api_key\s*=\s*['\"]" --include="*.js" --include="*.ts" . | grep -v "process.env"
```
- Any hits: STOP. Hard block regardless of `--force`.

### Environment Variables Check
Ask user to confirm these are set in the deployment platform (not in code):
- `DATABASE_URL` or equivalent
- `JWT_SECRET` / `SESSION_SECRET`
- Any third-party API keys
- `NODE_ENV=production`

### Git State Check
```bash
git status --short
git log --oneline -1
```
- Uncommitted changes: warn (are you deploying the right version?)
- Confirm which commit SHA is being deployed

---

## Step 2 — Platform-Specific Deploy

### Vercel
```bash
# First deploy (adds project)
vercel deploy --prod

# Subsequent deploys
vercel deploy --prod

# Preview deploy (staging)
vercel deploy
```

Config check: ensure `vercel.json` has:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "auto"
}
```

Environment variables: verify in Vercel dashboard or via `vercel env ls`.

### Netlify
```bash
# Deploy via CLI
netlify deploy --prod --dir=dist

# Preview deploy
netlify deploy --dir=dist
```

Config check: ensure `netlify.toml` exists:
```toml
[build]
  command = "npm run build"
  publish = "dist"
```

### Railway
```bash
railway up
```

Check `railway.json` or Dockerfile exists. Verify environment variables in Railway dashboard.

### Fly.io
```bash
fly deploy
```

Check `fly.toml` exists. Verify secrets with `fly secrets list`.

### Docker
```bash
# Build image
docker build -t {app-name}:{version} .

# Tag for registry
docker tag {app-name}:{version} {registry}/{app-name}:{version}

# Push
docker push {registry}/{app-name}:{version}
```

---

## Step 3 — Post-Deploy Smoke Test

Run immediately after deploy completes:

```bash
# Health check
curl -f {deploy-url}/health || echo "❌ Health check failed"

# If no /health endpoint, check the root
curl -f {deploy-url}/ -o /dev/null -w "%{http_code}" | grep -E "^2" || echo "❌ Root URL not returning 2xx"
```

Manual smoke test checklist (user confirms):
- [ ] Can load the homepage/app root
- [ ] Can complete the primary user action (signup, login, core feature)
- [ ] No console errors in browser devtools
- [ ] No 500 errors in deployment platform logs

If smoke test fails: immediately run rollback (Step 4).

---

## Step 4 — Rollback Plan

Know this BEFORE deploying. Every deploy needs a rollback path.

### Vercel Rollback
```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback {deployment-url}
```

### Netlify Rollback
```bash
# Via CLI
netlify deploy --prod --dir=dist  # Redeploy previous build

# Or via dashboard: Deploys → click previous → Publish deploy
```

### Railway Rollback
```bash
railway rollback
```

### Database Migrations Rollback
If this deploy included schema changes:
```bash
# For most ORMs
npm run db:migrate:rollback
# or
npx prisma migrate resolve --rolled-back {migration-name}
```

**Always note the previous commit SHA before deploying:**
```bash
git log --oneline -3
# Save this: previous SHA = {sha}
# Rollback command: git revert HEAD && git push
```

---

## Deploy Report Format

```
VIBE-DEPLOY — {platform} {environment}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRE-FLIGHT:
  ✅ Build: passed
  ✅ Tests: {N} passing
  ✅ Security: 0 critical/high
  ✅ Secrets: clean
  ⚠️  Uncommitted changes: none
  ✅ Deploying: {commit SHA} — "{commit message}"

DEPLOY: {deploying... / complete}
  URL: {deploy-url}
  Duration: {N}s

SMOKE TEST:
  ✅ /health → 200 OK
  ✅ Manual: {user confirmed}

ROLLBACK:
  Previous: {previous-deploy-url or commit SHA}
  Command: {rollback command}

VERDICT: {DEPLOYED ✅ | DEPLOY FAILED 🔴 | ROLLBACK NEEDED 🚨}
```
