#!/usr/bin/env node
const path = require('path');

// ── Bootstrap: load all vibe commands ──────────────────────────
const cmdDir = path.resolve(__dirname, '..', 'lib', 'vibe-commands');
const { register, validatePhase } = require(path.join(cmdDir, 'index'));
const { readState, writeState, recordTelemetry, advancePhase, writeHandoff, writeJSON } = require(
  path.join(cmdDir, 'state-helpers')
);
const { showHelp } = require(path.join(cmdDir, 'help'));
// ⚡ Bolt: orchestrator + tracer loaded lazily inside dispatch — not at startup

// ── Helper: load a handler module ──────────────────────────────
function loadHandler(name) {
  try {
    return require(path.join(cmdDir, name));
  } catch (e) {
    return null;
  }
}

// ── Register all commands ──────────────────────────────────────
const commandDefs = [
  // Phase commands (with 5-phase workflow aliases)
  {
    name: 'think',
    phase: 'think',
    desc: 'Problem definition, user analysis, solution sketch, MVP, success metrics',
    category: 'phase',
    aliases: ['scope'],
  },
  {
    name: 'explain',
    phase: 'think',
    desc: 'Capture intent and generate PROJECT.md + PRD.md from plain-language input',
    category: 'phase',
  },
  {
    name: 'plan',
    phase: 'plan',
    desc: 'Multi-perspective review, risk assessment, acceptance criteria',
    category: 'phase',
  },
  {
    name: 'break',
    phase: 'break',
    desc: 'Milestone to task decomposition with sizing',
    category: 'phase',
  },
  {
    name: 'design',
    phase: 'break',
    desc: 'UI generation and approval via Stitch MCP',
    category: 'phase',
    conditional: true,
  },
  {
    name: 'build',
    phase: 'build',
    desc: 'RED-GREEN-REFACTOR TDD implementation per task',
    category: 'phase',
  },
  {
    name: 'harness',
    phase: 'harness',
    desc: 'Production readiness validation (15 checks)',
    category: 'phase',
    aliases: ['verify'],
  },
  {
    name: 'review',
    phase: 'review',
    desc: 'Multi-perspective code review, security audit',
    category: 'phase',
  },
  {
    name: 'qa',
    phase: 'review',
    desc: 'Browser-based UI testing with Chromium',
    category: 'phase',
    conditional: true,
  },
  {
    name: 'ship',
    phase: 'ship',
    desc: 'Release engineering: git, push, PR, deploy',
    category: 'phase',
  },
  {
    name: 'retro',
    phase: 'retro',
    desc: 'What went well, what didnt, action items',
    category: 'phase',
  },
  {
    name: 'learn',
    phase: 'learn',
    desc: 'Self-improvement: patterns, anti-patterns, quality scores',
    category: 'phase',
  },
  {
    name: 'evolve',
    phase: 'evolve',
    desc: 'Auto-evolve rules, retire underperformers',
    category: 'phase',
  },
  {
    name: 'done',
    phase: 'done',
    desc: 'Pipeline complete — summary and next steps',
    category: 'phase',
  },

  // Utility commands
  {
    name: 'telemetry',
    phase: null,
    desc: 'Usage diagnostics: status, trends, errors, stuck, export',
    category: 'utility',
  },
  {
    name: 'status',
    phase: null,
    desc: 'Read state.json, render status dashboard',
    category: 'utility',
  },
  {
    name: 'help',
    phase: null,
    desc: 'Show command reference and current status',
    category: 'utility',
    aliases: ['?'],
  },
  {
    name: 'detect',
    phase: null,
    desc: 'Auto-detect project stack (framework, build, test)',
    category: 'utility',
  },
  {
    name: 'install',
    phase: null,
    desc: 'Install rules/skills into Cursor, Windsurf, or Claude Code (--cursor|--windsurf|--claude-code|--all)',
    category: 'utility',
  },

  // Orchestration commands
  {
    name: 'auto',
    phase: null,
    desc: 'Full pipeline state machine: think through done',
    category: 'orchestration',
  },
  {
    name: 'quick',
    phase: 'harness',
    desc: 'Compressed workflow: harness, review, ship in sequence',
    category: 'orchestration',
  },
  {
    name: 'resume',
    phase: null,
    desc: 'Session recovery from state.json and handoff',
    category: 'orchestration',
  },
  {
    name: 'maintenance',
    phase: null,
    desc: 'Run full auto-maintenance cycle (harness→evolve)',
    category: 'orchestration',
  },
];

for (const def of commandDefs) {
  register(def.name, {
    // ⚡ Bolt: getter defers require() until the command is actually invoked
    get handler() {
      return loadHandler(def.name) || noopHandler(def.name);
    },
    phase: def.phase,
    description: def.desc,
    ref: def.conditional ? null : `references/vibe-${def.name}.md`,
    aliases: def.aliases || [],
    conditional: def.conditional || false,
    category: def.category || 'phase',
  });
}

function noopHandler(name) {
  return {
    handler: (args, state) => {
      console.log(`  [${name}] Reference: references/vibe-${name}.md`);
      console.log(
        `  [${name}] Phase documentation is available. Run with an AI agent for full interactive flow.`
      );
      return { status: 'reference-only' };
    },
  };
}

// ── CLI Dispatch ───────────────────────────────────────────────
const { getCommand } = require(path.join(cmdDir, 'index'));
const mode = process.argv[2];

// Help
if (!mode || mode === '--help' || mode === '-h') {
  showHelp(process.argv[3]);
  process.exit(0);
}

// Status shorthand
if (mode === '--status' || mode === 'status') {
  const cmd = getCommand('status');
  if (cmd && cmd.handler) {
    cmd.handler.handler(process.argv.slice(2), readState());
    process.exit(0);
  }
}

// Vibe commands
const cmd = getCommand(mode);
if (cmd) {
  const state = readState();

  // Parse flags before args
  const rawArgs = process.argv.slice(3);
  const allowBacktrack = rawArgs.includes('--backtrack');
  const args = rawArgs.filter(a => a !== '--backtrack');

  // Phase validation (warn, don't block)
  const phaseCheck = validatePhase(mode, state, { allowBacktrack });
  if (phaseCheck.message) {
    console.log(phaseCheck.message);
  }

  // Record telemetry
  // ⚡ Bolt: Consolidated telemetry update returns lifecycle state, avoiding a reload later
  const lc = recordTelemetry(`vibe:${mode}`);

  // ⚡ Bolt: only load orchestrator + run enrichment for phase commands
  const { getTracer } = require(path.join(__dirname, '..', 'lib', 'telemetry', 'otel-tracer'));
  const projectRoot = path.resolve(__dirname, '..');
  const tracer = getTracer('vibe-cli', projectRoot);
  // Root span — requestId scopes the full user request for trace correlation
  const requestId = require('crypto').randomBytes(8).toString('hex');
  const span = tracer.startSpan(`cmd.${mode}`, {
    phase: cmd.phase || 'utility',
    requestId,
    command: mode,
  });

  let enriched = null;
  if (cmd.category !== 'utility') {
    const { RoleLoader, ContextManager, QueryEnricher, announceSkills } = require(
      path.join(__dirname, '..', 'lib', 'orchestrator')
    );

    // Show active virtual-team roles for this phase
    if (cmd.phase) {
      const roles = new RoleLoader().getRolesForPhase(cmd.phase);
      if (roles.length) console.log(`  Team: ${roles.join(', ')}`);
    }

    const queryText = args.join(' ') || state.goal || mode;

    // Seed GoalBlock so QueryEnricher GOAL_BLOCK source has data
    // think with explicit args always refreshes the goal block (clears stale session context)
    try {
      const ctx = new ContextManager();
      const newGoal = args.join(' ').trim();
      if (mode === 'think' && newGoal) {
        ctx.writeGoalBlock('think', newGoal, "Run 'vibe plan' when ready");
      } else if (!ctx.readGoalBlock() && state.goal) {
        ctx.writeGoalBlock(cmd.phase || 'utility', state.goal, `Continue via 'vibe ${mode}'`);
      }
    } catch {
      /* degrade */
    }

    // Pass root span so enricher child spans share traceId
    enriched = new QueryEnricher(projectRoot).enrich(queryText, { parentSpan: span });
    if (enriched.skills.length) {
      const phrase = announceSkills(enriched.skills);
      if (phrase) console.log(`  \x1b[2m${phrase}\x1b[0m`);
    }
    span.setAttribute('skills', enriched.skills.join(','));
    span.setAttribute('confidence', enriched.confidence);
    if (enriched.selectedTemplate) {
      const t = enriched.selectedTemplate;
      span.setAttribute('template', `${t.category}/${t.id}`);
    }
    // Make enriched context available to handlers (activates the dead-code pipeline)
    state._enriched = enriched;
  }

  // Execute handler
  if (cmd.handler) {
    const result = cmd.handler.handler(args, state);
    span.setAttribute('status', (result && result.status) || 'ok').end();

    // Check lifecycle threshold — spawn auto-maintain if due (detached, non-blocking)
    // ⚡ Bolt: Using the lifecycle object (lc) from earlier consolidated update
    if (lc) {
      try {
        const threshold = lc.triggers?.interaction_threshold || 10;
        const cooldownMs = 60000;
        const lastTs = lc.last_maintenance_ts || 0;
        const dayRuns = lc.today_maintenance_count || 0;
        const today = new Date().toDateString();
        const lastDay = lc.last_maintenance_day || '';
        const runsToday = lastDay === today ? dayRuns : 0;
        if (
          lc.interaction_count >= threshold &&
          Date.now() - lastTs > cooldownMs &&
          runsToday < 50
        ) {
          const maintainPath = path.join(projectRoot, '.vibe', 'lifecycle', 'auto-maintain.js');
          if (!require('fs').existsSync(maintainPath)) break;
          const { spawn } = require('child_process');
          const child = spawn(process.execPath, [maintainPath], { detached: true, stdio: 'ignore' });
          child.unref();

          // Reset counter + record timestamp
          lc.interaction_count = 0;
          lc.last_maintenance_ts = Date.now();
          lc.last_maintenance_day = today;
          lc.today_maintenance_count = runsToday + 1;

          writeJSON(path.join(projectRoot, '.vibe', 'lifecycle.json'), lc);
        }
      } catch {
        /* auto-maintain spawn is best-effort, never block CLI */
      }
    }

    // Advance phase if applicable
    if (phaseCheck.nextPhase) {
      advancePhase(state, phaseCheck.nextPhase);
      writeState(state);
    }

    // Write handoff on phase transition
    if (cmd.phase && state.phase !== cmd.phase) {
      const { StateMachine, ContextManager: CM } = require(
        path.join(__dirname, '..', 'lib', 'orchestrator')
      );
      const next = state.phase || 'done';
      const stateMachine = new StateMachine();

      // Iron Law (lib/orchestrator/context-manager.js): write a full handoff
      // between major layer transitions; a lightweight one otherwise.
      if (stateMachine.needsHandoff(cmd.phase, next)) {
        new CM().writeHandoff(
          cmd.phase,
          next,
          `${cmd.phase} phase completed via '${mode}'. Goal: ${state.goal || 'n/a'}`
        );
      } else {
        writeHandoff('vibe-cli', 'next-agent', next, {
          state: `${cmd.phase} phase completed`,
          phase: next,
          goal: state.goal || '',
          task: mode,
          files: [],
          need: `Proceed to ${next} phase`,
        });
      }
    }

    if (result && result.exitCode) process.exit(result.exitCode);
    process.exit(0);
  }
}

// ── Legacy skill dispatch ──────────────────────────────────────
// If not a vibe command, fall through to existing skill loader
try {
  require('./vibe-stack');
} catch (e) {
  console.error('Unknown command: ' + mode);
  console.error('Run: npx vibe-stack help');
  process.exit(1);
}
