# vibe:ship — Release Engineering

Takes completed work to production after harness passes. Syncs, tests, pushes, opens PR, and deploys.

## When to Run

After `/vibe:review` passes (and `/vibe:qa` if applicable).

## Steps

### 1. Sync
- Pull latest from base branch
- Merge or rebase cleanly
- Resolve any conflicts

### 2. Test
- Run full test suite
- Run typecheck
- Run lint
- All must pass

### 3. Version
- Determine version bump (patch/minor/major)
- Based on conventional commits since last tag
- Use semantic versioning

### 4. Push & PR
- Push branch to remote
- Create PR with:
  - Clear title (conventional commit format)
  - Description of changes
  - Checklist of what was done
  - Screenshots (for UI changes)
- Request review if in guided mode

### 5. Deploy
- Once PR is approved and merged:
  - Tag release
  - Run deployment pipeline
  - Verify deployment health

### 6. Post-Deploy
- Monitor error rates for 15 minutes
- Check key metrics
- Announce in team channel

## Reference
- gstack `/ship`
- gstack `/land-and-deploy`
- `skills/deploy/` — 3 deploy skills (git-free-deploy, one-click-netlify, one-click-vercel)
- `skills/workflow/git-ops` — git operations automation
