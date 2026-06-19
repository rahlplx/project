# Changelog

All notable changes to VibeNexus will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Changed

- Enterprise folder structure cleanup
- Moved misplaced docs to proper directories
- Hardened .gitignore for temp/cache/tool files
- Added CONTRIBUTING.md, CHANGELOG.md, SECURITY.md

### Fixed

- Fixed audit-system.js invalid JavaScript (Chinese characters in property access)
- Converted 7 test files from Jest syntax to node:test
- Added node:test files to Jest testPathIgnorePatterns

## [2.9.0] - 2026-06-16

### Added

- Unified orchestrator state machine (14 phases, 8 layers)
- Context manager with handoff document formatting
- Role loader with lazy loading and token budget
- TDD workflow engine (RED-GREEN-REFACTOR)
- Subagent dispatch with non-interactive mode
- Strategy engine (CEO/Designer/Engineer reviews)
- Design audit system with anti-pattern detection

### Changed

- Skills categories updated to match disk (49 skills)
- Test suite expanded to 853 tests (762 Jest + 91 node:test)

## [2.8.0] - 2026-06-15

### Added

- Telemetry gap audit and fixes
- MCP SDK integration
- Spec-driven workflow gates

### Changed

- State machine updated to 5-phase workflow
- Evolution rules system expanded

## [2.7.0] - 2026-06-14

### Added

- Six-track parallel enhancement system
- Quality scoring engine
- Security scanning
- Tool registry
- Discovery index

### Changed

- 765 tests passing
- 14 harness checks

## [2.6.0] - 2026-06-13

### Added

- Catalog expansion (35 tools)
- Design doc implementation
- Workflow evolution plan

### Changed

- 493 tests passing
- 13 harness checks

## [1.0.0] - 2026-06-13

### Added

- Initial release
- 45 agent skills
- MCP server integration
- CLI with 21 commands
- Autonomous lifecycle system
