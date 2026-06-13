# REUSE.md — Skills Dependency Ledger

Every skill in this repository builds on top of existing tools, CLIs, standards, or packages.
**Nothing is built from scratch when an existing solution exists.**

## Skills & Their Upstream Dependencies

### deploy/
| Skill | Wraps / Uses | Why not from scratch |
|-------|-------------|---------------------|
| `one-click-vercel` | `npx vercel` (npm) | Official Vercel CLI handles auth, deployment, domains |
| `one-click-netlify` | `npx netlify-cli` (npm) | Official Netlify CLI handles deploy, init, env |
| `git-free-deploy` | `npx serve`, `npx surge`, `npx netlify-cli` | Battle-tested static hosts; no need to reimplement |

### design/
| Skill | Wraps / Uses | Why not from scratch |
|-------|-------------|---------------------|
| `anti-slop` | WCAG 2.1 contrast algorithm (standard) | References WCAG AA (4.5:1 ratio), OWASP naming conventions |
| `color-gen` | `child_process` for design tooling | Delegates to system tools for color extraction |
| `design-system` | Design token conventions (Style Dictionary pattern) | Follows industry-standard token naming (size/color/typography) |
| `template-gallery` | `fs` module for file scaffolding | Generates files locally; no remote template service needed |
| `theme-factory` | Built-in patterns (no external) | Theme generation is domain logic — no CLI wraps this |
| `typography-rules` | Built-in patterns (no external) | Type scale rules are mathematical ratios — no CLI needed |

### explain/
| Skill | Wraps / Uses | Why not from scratch |
|-------|-------------|---------------------|
| `code-explainer` | `child_process` for AST parsing | Falls back to regex analysis; no external parser dep needed |
| `code-translator` | Pattern matching (no external) | Language translation is regex-based — no viable CLI wrapper |
| `intent-capture` | Pattern matching (no external) | NLP extraction is domain logic — no CLI does this specifically |

### knowledge/
| Skill | Wraps / Uses | Why not from scratch |
|-------|-------------|---------------------|
| `graphify` | `child_process` for file walking | Uses system `find`/`dir` for file traversal |
| `wednesday-graph` | Built-in graph algorithms | Impact analysis is pure logic — no wrapper needed |
| `context-memory` | `fs` module for persistence | Simple key-value store — SQLite would be overkill |
| `knowledge-base` | `fs` module for file I/O | Documentation generation is pure logic |

### orchestration/
| Skill | Wraps / Uses | Why not from scratch |
|-------|-------------|---------------------|
| `virtual-team` | Role definitions (industry standard roles) | CEO/Designer/Engineer/QA/Security are standard roles |
| `model-router` | Model capability tables (published specs) | Capability data from model cards — no CLI API needed |
| `parallel-exec` | Topological sort algorithm (CS standard) | Dependency resolution is pure algorithm |
| `task-coordinator` | DAG resolution (CS standard) | Workflow orchestration is pure logic — Airflow is too heavy |

### preview/
| Skill | Wraps / Uses | Why not from scratch |
|-------|-------------|---------------------|
| `diff-preview` | Built-in diff algorithm | Text diff is well-understood — no external dep needed |
| `flowchart-gen` | Mermaid.js syntax (standard) | Outputs Mermaid format renderable by mermaid-cli or markdown renderers |
| `screenshot-preview` | `puppeteer` / `playwright` (npm) | Uses headless browser for actual screenshots |
| `visual-plans` | Built-in ASCII/formatting | Text visualization is formatting logic — no CLI wrapper |

### progress/
| Skill | Wraps / Uses | Why not from scratch |
|-------|-------------|---------------------|
| `dashboard` | Built-in formatting | Aggregation logic only — no external dashboard service needed |
| `done-checklist` | 12-factor app (standard), OWASP ASVS (standard) | Maps to recognized industry checklists |
| `error-translator` | MDN docs (reference), Node.js error docs (reference) | Maps 24 error patterns to plain English |
| `tracker` | `fs` / `path` (Node built-ins) | Simple JSON persistence — no database needed |

### quality/
| Skill | Wraps / Uses | Why not from scratch |
|-------|-------------|---------------------|
| `anti-patterns` | OWASP Top 10 (2021) categories | Maps checks to standard OWASP categories |
| `code-review` | Built-in pattern matching | Code review heuristics are domain logic |
| `guardrails` | Common safety categories | Content filtering uses standard categories |
| `health-check` | `http` module (Node built-in) | Uses Node's HTTP client for endpoint checks |
| `security-defaults` | OWASP Top 10 (2021) | 10 checks mapped to OWASP A01-A08 categories |
| `testing-guide` | `child_process` for test runners | Delegates to Jest/Mocha/Vitest CLI via exec |
| `vibe-review` | Built-in pattern detection | Code review heuristics — no existing CLI wrapper |

### setup/
| Skill | Wraps / Uses | Why not from scratch |
|-------|-------------|---------------------|
| `project-wizard` | `inquirer` (npm), `chalk` (npm), `ora` (npm) | Industry-standard CLI interaction libraries |
| `prompt-templates` | Built-in template data (no external) | Prompt templates are curated content — no API needed |
| `quick-start` | `child_process`, `npx create-*` templates, GitHub template repos | Delegates to official scaffolding tools (Vite, CRA, etc.) |

### workflow/
| Skill | Wraps / Uses | Why not from scratch |
|-------|-------------|---------------------|
| `checkpoints` | Built-in state tracking | Milestone tracking is pure data manipulation |
| `git-ops` | Git CLI commands (generated strings) | Generates `git` commands — user runs them |
| `planning-agent` | Built-in planning heuristics | Task decomposition is domain logic |
| `rollback` | Git CLI commands (generated strings) | Generates `git revert`/`git reset` commands |
| `spec-driven` | Built-in spec validation | Spec checking is pure logic |
| `tdd-vibe` | TDD cycle (red-green-refactor — standard) | Implements standard TDD workflow |
| `verification` | Built-in test heuristics | Verification logic is domain-specific |

## npm Dependencies (package.json)
```
dependencies:   chalk, inquirer, ora        # CLI interaction
devDependencies: jest, eslint, prettier       # Dev tooling
```
Zero unnecessary dependencies. Every package serves a specific purpose.

## Principle
If an existing CLI, npm package, or open-source tool handles a task better,
**we wrap it** — we don't reimplement it. If no existing tool fits the exact
use case, we build a thin domain-specific layer on top of Node.js built-ins.
