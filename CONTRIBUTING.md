# Contributing to Vibe-Stack

Thank you for your interest in contributing to Vibe-Stack.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch: `git checkout -b feat/your-feature`
4. Install dependencies: `npm install`
5. Run tests: `npm test`
6. Commit your changes
7. Push to your fork and submit a Pull Request

## Development Standards

- **Test-Driven Development**: Write tests before implementation
- **CommonJS**: All modules use `require()` / `module.exports`
- **No new dependencies**: Prefer built-in Node.js APIs
- **0 ESLint errors**: Run `npm run lint` before committing
- **All tests pass**: Run `npm test` and verify 853+ tests pass

## Skill Development

Skills live in `skills/<category>/<skill-name>/`. Each skill needs:

- `SKILL.md` — Agent instructions
- `index.js` — Implementation (CommonJS)
- `index.test.js` — Tests (node:test or Jest)

### Skill Categories

| Category | Purpose |
|----------|---------|
| `deploy/` | Deployment automation |
| `design/` | UI/UX design tools |
| `explain/` | Code explanation/translation |
| `knowledge/` | Knowledge management |
| `orchestration/` | Task coordination |
| `preview/` | Visual previews |
| `progress/` | Progress tracking |
| `quality/` | Code quality tools |
| `setup/` | Project setup |
| `testing-qa/` | Testing and QA |
| `workflow/` | Development workflow |

## Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure all quality gates pass
4. Request review from maintainers
5. Squash and merge after approval

## Code of Conduct

- Be respectful and constructive
- Focus on technical merit
- Help others learn and grow

## Questions?

Open an issue or start a discussion.
