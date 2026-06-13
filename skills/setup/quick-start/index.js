#!/usr/bin/env node

/**
 * Quick Start - One-command project scaffolding
 * 
 * Usage: node index.js [template-name]
 *   or node index.js to see interactive selection
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// Template definitions
const TEMPLATES = {
  'react-vite': {
    name: 'React + Vite',
    description: 'Modern React app with Vite build tool',
    repo: 'https://github.com/vitejs/vite-app',
    branch: 'main',
    devDeps: ['eslint', 'prettier'],
    envVars: ['VITE_API_URL'],
  },
  'nextjs': {
    name: 'Next.js (App Router)',
    description: 'Full-stack React framework with App Router',
    repo: 'https://github.com/vercel/next.js',
    branch: 'canary',
    devDeps: ['eslint', 'prettier', '@next/font'],
    envVars: ['NEXT_PUBLIC_API_URL', 'DATABASE_URL'],
  },
  'node-api': {
    name: 'Node.js API',
    description: 'Express.js REST API with TypeScript',
    repo: 'https://github.com/NikolaVetnic/express-ts-boilerplate',
    branch: 'main',
    devDeps: ['typescript', '@types/node', 'eslint', 'prettier'],
    envVars: ['PORT', 'DATABASE_URL', 'JWT_SECRET'],
  },
  'fastify-api': {
    name: 'Fastify API',
    description: 'Fast, low-overhead web framework',
    repo: 'https://github.com/fastify/quick-start',
    branch: 'main',
    devDeps: ['typescript', 'eslint', 'prettier'],
    envVars: ['PORT', 'DATABASE_URL'],
  },
  'react-native': {
    name: 'React Native',
    description: 'Cross-platform mobile apps',
    repo: 'https://github.com/NickGerleman/expo-template',
    branch: 'main',
    devDeps: ['eslint', 'prettier'],
    envVars: ['API_URL'],
  },
  'electron': {
    name: 'Electron App',
    description: 'Cross-platform desktop apps with React',
    repo: 'https://github.com/NickGerleman/expo-template',
    branch: 'main',
    devDeps: ['electron', 'electron-builder'],
    envVars: ['VITE_API_URL'],
  },
  'remix': {
    name: 'Remix',
    description: 'Full-stack React framework',
    repo: 'https://github.com/remix-run/remix',
    branch: 'main',
    devDeps: ['eslint', 'prettier'],
    envVars: ['SESSION_SECRET', 'DATABASE_URL'],
  },
  'vue-vite': {
    name: 'Vue + Vite',
    description: 'Vue.js with Composition API',
    repo: 'https://github.com/vuejs/create-vue',
    branch: 'main',
    devDeps: ['eslint', 'prettier'],
    envVars: ['VITE_API_URL'],
  },
  'svelte': {
    name: 'SvelteKit',
    description: 'Svelte with file-based routing',
    repo: 'https://github.com/sveltejs/kit',
    branch: 'main',
    devDeps: ['eslint', 'prettier'],
    envVars: ['PUBLIC_API_URL'],
  },
  'astro': {
    name: 'Astro',
    description: 'Content-focused static site builder',
    repo: 'https://github.com/withastro/astro',
    branch: 'main',
    devDeps: ['astro'],
    envVars: [],
  },
  'cli-tool': {
    name: 'CLI Tool',
    description: 'Node.js CLI with commander.js',
    repo: '',
    files: {
      'package.json': JSON.stringify({
        name: 'my-cli-tool',
        version: '1.0.0',
        description: 'A CLI tool',
        type: 'module',
        bin: { 'my-cli': './bin/index.js' },
        scripts: { start: 'node bin/index.js' },
        dependencies: { commander: '^10.0.0', chalk: '^5.0.0' },
      }, null, 2),
      'bin/index.js': `#!/usr/bin/env node
import { program } from 'commander';
import chalk from 'chalk';

program
  .name('my-cli')
  .description('A CLI tool for automating tasks')
  .version('1.0.0');

program
  .command('run')
  .description('Run the main command')
  .action(() => {
    console.log(chalk.green('Running command...'));
  });

program.parse();
`,
      '.gitignore': `node_modules/
dist/
*.log
.env
`,
      'README.md': `# My CLI Tool

A powerful CLI tool for [use case].

## Installation

\`\`\`bash
npm install -g my-cli-tool
\`\`\`

## Usage

\`\`\`bash
my-cli run
\`\`\`

## Commands

- \`run\` - Execute the main task

## License

MIT
`,
    },
    envVars: [],
  },
};

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(text, color = 'reset') {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`\n${colors.cyan}[${step}]${colors.reset} ${message}`);
}

function generateEnvFile(template) {
  const header = `# Environment Variables for ${template.name}\n# Copy this to .env and fill in your values\n\n`;

  if (template.envVars.length === 0) {
    return header + '# No environment variables required\n';
  }

  const vars = template.envVars.map(v => {
    const example = v.startsWith('NEXT_PUBLIC_') || v.startsWith('VITE_') || v.startsWith('PUBLIC_')
      ? 'your-value-here'
      : 'REPLACE_WITH_REAL_VALUE';
    return `${v}=${example}`;
  }).join('\n');

  return header + vars;
}

function generateReadme(template, projectName) {
  return `# ${projectName}

Built with **${template.name}**

${template.description}

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build
- \`npm test\` - Run tests

## Environment Variables

Copy \`.env.example\` to \`.env\` and configure:

\`\`\`bash
cp .env.example .env
\`\`\`

## Project Structure

\`\`\`
├── src/           # Source files
├── public/        # Static assets
├── tests/         # Test files
├── package.json
└── README.md
\`\`\`

## Resources

- [Official Documentation](https://example.com)
- [Community Discord](https://discord.gg/example)
`;
}

async function createFromFiles(template, projectDir) {
  const files = template.files;

  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(projectDir, filePath);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, content, 'utf8');
    log(`  Created ${filePath}`, 'green');
  }
}

async function cloneRepo(template, projectDir, options) {
  const { name } = template;

  if (options.skipInstall) {
    logStep(3, 'Skipping installation (--skip-install flag)');
  }

  log(`\n${colors.yellow}Note: For ${name}, please run these commands manually:${colors.reset}`);
  log(`  cd ${projectDir}`);
  log(`  npm install`);
  log(`  npm run dev\n`);
}

async function scaffold(options) {
  const { templateKey, projectName, outputDir, skipInstall, list } = options;

  // List templates
  if (list) {
    log('\n📦 Available Templates:\n', 'bright');
    Object.entries(TEMPLATES).forEach(([key, template]) => {
      log(`  ${colors.cyan}${key.padEnd(15)}${colors.reset} - ${template.name}`);
      log(`  ${' '.repeat(18)} ${template.description}\n`);
    });
    return;
  }

  // Validate template key
  if (!templateKey || !TEMPLATES[templateKey]) {
    log(`\n❌ Unknown template: "${templateKey}"`, 'red');
    log('\nRun with --list to see available templates.\n');
    process.exit(1);
  }

  const template = TEMPLATES[templateKey];
  const projectDir = path.join(outputDir, projectName);

  // Check if directory exists
  if (fs.existsSync(projectDir)) {
    log(`\n❌ Directory already exists: ${projectDir}`, 'red');
    log('Please choose a different project name or remove the existing directory.\n');
    process.exit(1);
  }

  // Welcome message
  log('\n🚀 Quick Start - Project Scaffolding', 'bright');
  log(`   Template: ${template.name}`);
  log(`   Project: ${projectName}\n`);

  // Create project directory
  logStep(1, 'Creating project structure...');
  fs.mkdirSync(projectDir, { recursive: true });
  log(`  Created ${projectDir}`, 'green');

  // Scaffold based on template type
  logStep(2, 'Scaffolding files...');

  if (template.files) {
    await createFromFiles(template, projectDir);
    } else if (template.repo) {
      log(`  Cloning from ${template.repo}...`, 'blue');
      try {
        const safeRepo = template.repo.replace(/[^a-zA-Z0-9._:/@-]/g, '');
        execFileSync('git', ['clone', '--depth', '1', '--branch', template.branch, safeRepo, projectDir], {
          stdio: 'pipe',
        });
      log(`  Cloned successfully`, 'green');

      // Remove .git folder for clean start
      fs.rmSync(path.join(projectDir, '.git'), { recursive: true, force: true });
    } catch (error) {
      log(`  Warning: Could not clone repository`, 'yellow');
      log(`  Creating minimal project structure instead...`, 'yellow');
      fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify({
        name: projectName,
        version: '1.0.0',
        private: true,
      }, null, 2), 'utf8');
    }
  }

  // Generate additional files
  logStep(3, 'Generating configuration files...');

  // Create .env.example
  fs.writeFileSync(
    path.join(projectDir, '.env.example'),
    generateEnvFile(template),
    'utf8'
  );
  log('  Created .env.example', 'green');

  // Create README.md
  fs.writeFileSync(
    path.join(projectDir, 'README.md'),
    generateReadme(template, projectName),
    'utf8'
  );
  log('  Created README.md', 'green');

  // Create .gitignore
  if (!fs.existsSync(path.join(projectDir, '.gitignore'))) {
    fs.writeFileSync(
      path.join(projectDir, '.gitignore'),
      'node_modules/\ndist/\n.env\n*.log\n.DS_Store\ncoverage/\n',
      'utf8'
    );
    log('  Created .gitignore', 'green');
  }

  // Install dependencies
  if (!skipInstall && !template.files) {
    logStep(4, 'Installing dependencies...');
    try {
      process.chdir(projectDir);
      log('  Running npm install...', 'blue');

      execFileSync('npm', ['install'], { stdio: 'inherit', cwd: projectDir });

      if (template.devDeps && template.devDeps.length > 0) {
        log('  Installing dev dependencies...', 'blue');
        execFileSync('npm', ['install', '--save-dev', ...template.devDeps], {
          stdio: 'inherit',
          cwd: projectDir,
        });
      }

      log('  Dependencies installed', 'green');
    } catch (error) {
      log(`  Warning: Could not install dependencies automatically`, 'yellow');
      log(`  Please run "npm install" manually in the project directory`, 'yellow');
    }
  }

  // Summary
  log('\n' + '='.repeat(50), 'bright');
  log('\n✅ Project scaffolded successfully!\n', 'green');
  log('Next steps:', 'bright');
  log(`  cd ${projectName}`);
  log('  npm run dev');
  log('\n');
}

function parseArgs(args) {
  const options = {
    templateKey: args[2] || null,
    projectName: 'my-project',
    outputDir: process.cwd(),
    skipInstall: false,
    list: false,
  };

  const rawArgs = args.slice(2);
  let i = 0;

  while (i < rawArgs.length) {
    const arg = rawArgs[i];

    if (arg === '--list' || arg === '-l') {
      options.list = true;
      i++;
    } else if (arg === '--output' || arg === '-o') {
      options.outputDir = rawArgs[++i];
      i++;
    } else if (arg === '--skip-install' || arg === '-s') {
      options.skipInstall = true;
      i++;
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    } else if (!arg.startsWith('-') && !options.templateKey) {
      options.templateKey = arg;
      i++;
    } else if (!arg.startsWith('-') && i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith('-')) {
      options.projectName = rawArgs[++i];
      i++;
    } else {
      i++;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
${colors.bright}Quick Start - One-command Project Scaffolding${colors.reset}

${colors.cyan}Usage:${colors.reset}
  node index.js [template] [project-name] [options]

${colors.cyan}Options:${colors.reset}
  --list, -l          List all available templates
  --output, -o        Set output directory (default: current directory)
  --skip-install, -s  Skip npm install
  --help, -h          Show this help message

${colors.cyan}Examples:${colors.reset}
  node index.js react-vite my-app
  node index.js nextjs my-nextjs-app --output ~/projects
  node index.js --list

${colors.cyan}Available Templates:${colors.reset}
${Object.keys(TEMPLATES).map(t => `  - ${t}`).join('\n')}
`);
}

// Main execution (only when run directly, not when required as module)
if (require.main === module) {
  const options = parseArgs(process.argv);
  scaffold(options)
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error:', error.message);
      process.exit(1);
    });
}
module.exports = { scaffold, TEMPLATES };
