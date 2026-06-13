# Rule: Pre-Verify Tool Metadata Before Writing Descriptions

## Type
Harness check (research phase)

## Trigger
Every time a new tool is added to `catalog/tools.yaml`.

## Check
Before writing `what_it_does` or `how_agent_uses`, the agent must confirm:
1. `repo_url` resolves to the intended repository
2. License is compatible (MIT, Apache 2.0, BSD-3-Clause, MPL-2.0, or generous free tier)
3. GitHub stars ≥ threshold (1k+ for new tools, 5k+ for established categories)
4. Last commit ≤ 6 months (no abandoned repos)

## Failure Mode
Writing descriptions based on Google search snippets or memory rather than
directly verifying the actual repo. Leads to wrong stars, wrong license,
or wrong description tone.

## Origin
anti-pattern: `verify-before-describe` — 2 tools needed post-hoc corrections.

## Quality Score
0.0 (new rule, pending measurement)
