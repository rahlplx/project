# Quick Start

One-command project scaffolding for vibe coders. Get your project up and running in seconds.

## Overview

Quick Start provides pre-configured project templates with sensible defaults, so you can focus on building rather than setting up.

## Features

- **10+ Project Templates** - React, Next.js, Vue, Svelte, Node APIs, and more
- **Zero Configuration** - Sensible defaults out of the box
- **Optional Dependencies** - Skip npm install if you prefer
- **Best Practices** - ESLint, Prettier, and environment configs included

## Installation

```bash
# No installation required - run directly
node index.js --help
```

## Usage

### Interactive Mode

```bash
node index.js
# Then select a template and project name
```

### One-liner Mode

```bash
# Scaffold a React app named "my-app"
node index.js react-vite my-app

# Scaffold a Next.js project in a specific directory
node index.js nextjs my-nextjs-app --output ~/projects

# List all available templates
node index.js --list
```

## Available Templates

| Template       | Description                            |
| -------------- | -------------------------------------- |
| `react-vite`   | Modern React with Vite build tool      |
| `nextjs`       | Full-stack React with App Router       |
| `node-api`     | Express.js REST API with TypeScript    |
| `fastify-api`  | High-performance Fastify web framework |
| `react-native` | Cross-platform mobile apps             |
| `electron`     | Cross-platform desktop apps            |
| `remix`        | Full-stack React framework             |
| `vue-vite`     | Vue.js with Composition API            |
| `svelte`       | SvelteKit with file-based routing      |
| `astro`        | Content-focused static site builder    |
| `cli-tool`     | Node.js CLI with commander.js          |

## Options

| Flag                 | Description                  |
| -------------------- | ---------------------------- |
| `--list, -l`         | Show all available templates |
| `--output, -o`       | Set output directory         |
| `--skip-install, -s` | Skip npm install step        |
| `--help, -h`         | Show help message            |

## Examples

### Web Development

```bash
# React app with Vite
node index.js react-vite my-webapp

# Next.js with App Router
node index.js nextjs my-saas

# Vue with Vite
node index.js vue-vite my-vue-app
```

### Backend

```bash
# Express API
node index.js node-api my-api

# Fastify API
node index.js fastify-api my-microservice
```

### Mobile & Desktop

```bash
# React Native
node index.js react-native my-mobile-app

# Electron desktop app
node index.js electron my-desktop-app
```

### Full-Stack

```bash
# Remix full-stack
node index.js remix my-fullstack-app
```

### CLI Tools

```bash
# Create a CLI tool
node index.js cli-tool my-cli

# Install globally and use
cd my-cli
npm install -g
my-cli run
```

## What Gets Created

Each template includes:

```
project-name/
├── src/                  # Source files
├── public/               # Static assets (where applicable)
├── tests/                # Test files
├── package.json          # Dependencies & scripts
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore patterns
├── README.md             # Project documentation
└── [config files]        # ESLint, Prettier, etc.
```

## Environment Variables

Templates include `.env.example` files with recommended variables:

```bash
# Copy to .env and fill in your values
cp .env.example .env
```

## Customization

### Adding New Templates

Edit `index.js` and add to the `TEMPLATES` object:

```javascript
'custom-template': {
  name: 'Custom Template',
  description: 'What it does',
  repo: 'https://github.com/user/repo',
  branch: 'main',
  devDeps: ['eslint'],
  envVars: ['API_KEY'],
}
```

### Modifying Existing Templates

Templates that use `files` property are defined inline.
Templates that use `repo` property are cloned from GitHub.

## Troubleshooting

### "Template not found"

Run `node index.js --list` to see valid template names.

### Installation fails

Use `--skip-install` and run `npm install` manually:

```bash
node index.js react-vite my-app --skip-install
cd my-app
npm install
```

### Permission errors

On Unix systems, you may need to make the file executable:

```bash
chmod +x index.js
```

## License

MIT
