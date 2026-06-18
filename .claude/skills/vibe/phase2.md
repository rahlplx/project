# Phase 2 — Market Research & Competitive Analysis

> Lazy-loaded by `/vibe phase2` or after Phase 1 gate. Requires PROJECT.md.

## Prerequisites Check

1. Read `.vibe/projects/{slug}/MANIFEST.yaml` — confirm `phase1_complete: true`
2. Read `.vibe/projects/{slug}/PROJECT.md` — load as research context
3. If either missing: stop and tell user to complete Phase 1 first (`/vibe phase1`)

---

## Research Protocol (5-Step Pipeline)

### Step 1 — Competitive Landscape (WebSearch × 5)

Run these 5 searches using the product description from PROJECT.md:

1. `"{product category} alternatives 2025"` — find direct competitors
2. `"{core problem} SaaS tool site:producthunt.com"` — validate demand signal
3. `"{target user persona} tools reddit"` — unfiltered user pain points
4. `"{product name idea} reviews"` — brand gap check
5. `"{core differentiator} startup funding 2024 2025"` — investment signal (is this space hot or dead?)

For each search: extract top 3-5 results. Fetch the most relevant URL with WebFetch.

**Source validation** — before adding any finding to knowledge-base, verify:
- [ ] At least 2 independent sources confirm this claim
- [ ] Source is <18 months old (flag older as [STALE])
- [ ] Source is not vendor-produced marketing copy (flag as [VENDOR BIAS] if so)
- [ ] Claim is specific and falsifiable (reject vague assertions)

---

### Step 2 — Competitor Deep Dive (3-5 Products)

For each major competitor found in Step 1:

| Field | What to find |
|-------|-------------|
| Product name + URL | —  |
| Pricing tiers | Free / Pro / Enterprise + prices |
| Core differentiator | What do they claim makes them unique? |
| User complaints | From Reddit, G2, Trustpilot, HN |
| Technical stack (if known) | From job postings, GitHub, BuiltWith |
| Funding / traction | Crunchbase, press releases |
| OWASP red flags | Any public breaches or security incidents? |

Produce a comparison table after this step.

---

### Step 3 — Market Size Estimation (TAM/SAM/SOM)

Use the bottom-up method:
1. **TAM** = total addressable users × avg annual spend per user
2. **SAM** = TAM × (% that fits our geography + target segment)
3. **SOM** = SAM × realistic capture rate in year 1-3

Cross-verify with:
- Statista / IBISWorld estimates (if WebSearch returns them)
- Funding amounts in the space (proxy for market belief)
- ProductHunt upvotes for similar products (proxy for demand)

Flag all estimates as [ESTIMATE — confidence: low/medium/high].

---

### Step 4 — Failure Pattern Extraction

Search for 3-5 failed products in this space:

`"{product category} failed startup postmortem"` + `"why {product category} startup failed"`

For each failure, extract:
- Root cause (category: security, perf, UX, tech debt, market timing, CAC, churn)
- What the team said vs. what users said
- What we can apply to avoid the same fate

---

### Step 5 — Knowledge-Base Synthesis

Write all findings to `.vibe/projects/{slug}/knowledge-base.json`:

```json
{
  "slug": "{slug}",
  "generated": "ISO 8601",
  "competitors": [
    {
      "name": "string",
      "url": "string",
      "pricing": "string",
      "differentiator": "string",
      "weaknesses": ["string"],
      "traction_signal": "string",
      "source_url": "string",
      "verified": true
    }
  ],
  "market_size": {
    "tam": "string",
    "sam": "string",
    "som": "string",
    "confidence": "low | medium | high",
    "sources": ["string"]
  },
  "failure_patterns": [
    {
      "product": "string",
      "root_cause": "string",
      "lesson": "string",
      "source": "string"
    }
  ],
  "opportunities": ["string"],
  "risks": ["string"],
  "unverified_claims": ["string"]
}
```

**Stress-test each finding before writing**:
- If a finding contradicts another source → log both, note discrepancy
- If a finding can't be traced to a URL → mark `"verified": false`
- If a finding is older than 18 months → suffix with `[STALE: YYYY-MM]`

---

## Phase 2 Gate

Present a synthesis table to the user:

| Insight | Confidence | Impact on PROJECT.md |
|---------|-----------|---------------------|
| {finding} | H/M/L | {what to update} |

Then ask (AskUserQuestion):
- Option A: "Update PROJECT.md with these findings and proceed to Phase 3"
- Option B: "Dig deeper on [specific competitor/risk] first"
- Option C: "Save research and exit"

On "Proceed to Phase 3":
1. Update PROJECT.md with market context section
2. Update MANIFEST.yaml: `phase2_complete: true`, `phase: 3`
3. Update `.vibe/state.json`: `current_phase: 3`
4. Tell user: "Phase 2 complete. Run `/vibe phase3` to generate your documentation suite."
