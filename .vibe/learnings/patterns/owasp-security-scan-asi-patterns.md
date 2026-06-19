# Pattern: OWASP Security Scan for Agent Skills

## Problem
Agent skill modules (markdown + JS prompts) can contain malicious patterns — instruction overrides, exfiltration endpoints, obfuscated code, supply chain attacks. Need automated detection.

## Solution
Implement 40 detection patterns across OWASP ASI01-ASI08 categories:
- **ASI01** (Malicious Skills): 6 patterns — instruction override, DAN jailbreak, identity override, etc.
- **ASI02** (Supply Chain): 7 patterns — exfiltration, credential access, base64 encoding, etc.
- **ASI03** (Over-Privileged): 7 patterns — execSync, spawn, rm -rf, chmod 777, etc.
- **ASI05** (Unsafe Deserialization): 5 patterns — JSON.parse(user), eval, YAML, Function constructor
- **ASI06** (Memory Poisoning): 5 patterns — context push override, mass wipe, injection
- **ASI07** (Update Drift): 4 patterns — old dependencies, stale imports, security TODOs
- **ASI08** (Obfuscation): 6 patterns — base64, hex encoding, scanner disable, char obfuscation

Each pattern has regex detection, false-positive guard, and severity classification.

## When to Use
Any repo containing agent skill modules, prompt files, or AI configuration that could be tampered with.

## Files Changed
- `lib/security-scan.js` — 40 OWASP patterns + scan/classify/checkHarness
- `lib/security-scan.report.js` — text/JSON/markdown formatters

## Tested On
VibeNexus Curated Collection, 2026-06-14. 73 tests, 0 CRITICAL findings across 47 skills.
