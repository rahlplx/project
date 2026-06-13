# Project Wizard

An interactive CLI tool that guides you through creating a comprehensive project specification document.

## Overview

Project Wizard helps vibe coders define their project requirements through an interactive Q&A session, generating a `PROJECT.md` file that serves as the foundation for AI-assisted development.

## Features

- **Interactive CLI** - Step-by-step prompts for project details
- **Smart defaults** - Sensible pre-selected options
- **Conditional questions** - Follow-up questions based on your selections
- **Multiple project types** - Support for web, mobile, API, and more
- **Feature selection** - Choose from common features or add custom ones
- **Deployment targeting** - Configure deployment preferences

## Installation

```bash
npm install inquirer
# or
yarn add inquirer
```

## Usage

```bash
cd /workspace/project/skills/setup/project-wizard
node index.js
```

## What it generates

The wizard creates a `PROJECT.md` file containing:

- **Project metadata** - Name, description, type
- **Tech stack** - Based on your project type
- **Features** - Selected features with configuration details
- **Design preferences** - Visual style and color scheme
- **Deployment targets** - Where you plan to host
- **Additional context** - Timeline, budget, constraints

## Example Output

```markdown
# My Awesome Project

## Overview
A modern web application for task management.

## Project Type
**react-web**

## Features
- User Authentication (OAuth, JWT)
- Database Integration
- Real-time Updates (WebSocket)

## Design
- Visual Style: Modern Minimalist
- Color Scheme: Blue / Professional
```

## Customization

Edit the arrays in `index.js` to:

- Add new project types
- Define custom features
- Set deployment targets
- Configure color schemes

## Dependencies

- [inquirer](https://www.npmjs.com/package/inquirer) - Interactive command-line prompts

## License

MIT