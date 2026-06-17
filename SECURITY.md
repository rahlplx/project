# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 2.9.x   | Yes       |
| < 2.9   | No        |

## Reporting a Vulnerability

If you discover a security vulnerability in Vibe-Stack, please report it responsibly.

**Do NOT open a public issue for security vulnerabilities.**

Instead, please email: security@vibe-stack.dev

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 1 week
- **Fix timeline**: Depends on severity

## Security Considerations

### MCP Server

- The MCP server runs locally by default
- No remote access without explicit configuration
- API keys are stored in environment variables, never in code

### Skills

- Skills execute in the agent's context
- No sandboxing by default
- Review skill code before enabling

### Dependencies

- Minimal dependencies (2 production)
- Regular audits via `npm audit`
- No known vulnerabilities in current dependencies

## Best Practices

1. Keep dependencies updated
2. Use environment variables for secrets
3. Never commit API keys or tokens
4. Run `npm audit` regularly
5. Review skill code before use

## Scope

This policy covers the Vibe-Stack repository and its official packages. It does not cover:

- Third-party skills or plugins
- Custom deployments
- Forks or derivatives
