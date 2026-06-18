# Sentinel's Journal

## 2025-05-15 - [Security Tool Precision and Input Hardening]
**Vulnerability:**
1. The security scanner (ASI03-005) had low precision, flagging any template literal as a command injection risk. This created significant "alert fatigue" and obscured real issues.
2. \`lib/intent-capture.js\` lacked input length limits and sanitization for most fields, creating a potential DoS or injection vector in Markdown generation.

**Learning:**
- Security tools must be context-aware. Flagging all template literals in JavaScript is too broad because they are commonly used for benign string interpolation (e.g., Markdown generation).
- Display-only strings (like those in \`one-click-netlify\`) have a much lower blast radius than strings executed on the server, but still benefit from defense-in-depth validation.

**Prevention:**
- Refined ASI03-005 to only flag template literals within known dangerous function calls (\`exec\`, \`spawn\`, etc.).
- Implemented \`sanitizeText\` with a 2000-character cap and control character stripping for all user-facing intent capture fields.

## 2025-05-15 - [Documentation Standardization]
**Vulnerability:**
- Inconsistent skill documentation (README vs SKILL.md) and phase drift between Claude-native and core-repo definitions.

**Learning:**
- Standardizing documentation is a security enhancement; it ensures AI agents have a predictable and accurate understanding of system constraints and capabilities.

**Prevention:**
- Unified 5 core skills to the `SKILL.md` format.
- Documented the strategic drift in `docs/audit/DOCUMENTATION_STRATEGY.md` for future resolution.
