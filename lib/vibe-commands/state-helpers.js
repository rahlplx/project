const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const STATE_PATH = path.join(PROJECT_ROOT, '.vibe', 'state.json');
const LIFECYCLE_PATH = path.join(PROJECT_ROOT, '.vibe', 'lifecycle.json');
const TELEMETRY_TRACKER = path.join(PROJECT_ROOT, 'lib', 'telemetry-tracker');
const HANDOFFS_DIR = path.join(PROJECT_ROOT, 'docs', 'handoffs');

function readJSON(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function writeJSON(p, d) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf8');
}

function readState() {
  return readJSON(STATE_PATH);
}

function writeState(state) {
  state.updated = new Date().toISOString();
  writeJSON(STATE_PATH, state);
}

function recordTelemetry(commandName) {
  try {
    const { recordCommand } = require(TELEMETRY_TRACKER);
    recordCommand(commandName);
  } catch (e) {
    // telemetry unavailable, silently continue
  }
}

const PHASE_ORDER = [
  'think',
  'plan',
  'break',
  'build',
  'harness',
  'review',
  'ship',
  'retro',
  'learn',
  'evolve',
  'done',
];

const PHASE_TRANSITIONS = {
  think: 'plan',
  plan: 'break',
  break: 'build',
  build: 'harness',
  harness: 'review',
  review: 'ship',
  ship: 'retro',
  retro: 'learn',
  learn: 'evolve',
  evolve: 'done',
  done: null,
};

function validatePhase(commandPhase, state, options = {}) {
  const { allowBacktrack = false } = options;
  const current = state.phase || 'think';
  if (commandPhase === current) return { valid: true, message: null };

  const currentIdx = PHASE_ORDER.indexOf(current);
  const cmdIdx = PHASE_ORDER.indexOf(commandPhase);

  // allowed commands can run anytime
  if (commandPhase === 'done') return { valid: true, message: null };

  // --backtrack: explicitly allow re-entering any earlier phase
  if (allowBacktrack && cmdIdx < currentIdx) {
    return {
      valid: true,
      message: `↺ Backtracking to '${commandPhase}' from '${current}' (--backtrack)`,
    };
  }

  // command matches current or previous phase (can re-run)
  if (cmdIdx <= currentIdx) return { valid: true, message: null };

  if (cmdIdx === currentIdx + 1) {
    // one step ahead — expected to transition
    return { valid: true, nextPhase: commandPhase, message: null };
  }

  return {
    valid: true,
    message: `\u26a0 Current phase is '${current}'. Expected '${commandPhase}'. Use --force to run anyway.`,
  };
}

function advancePhase(state, nextPhase) {
  const target = nextPhase || PHASE_TRANSITIONS[state.phase];
  if (!target) return state;
  state.phase = target;
  state.step = (state.step || 0) + 1;
  return state;
}

function verifyArtifact(artifactPath) {
  const fullPath = path.resolve(PROJECT_ROOT, artifactPath);
  return fs.existsSync(fullPath);
}

function writeHandoff(from, to, phase, context) {
  const template = path.join(HANDOFFS_DIR, 'standard.md');
  let content;
  if (fs.existsSync(template)) {
    content = fs.readFileSync(template, 'utf8');
  } else {
    content =
      '# Standard Handoff\n\n## Metadata\n\n| Field | Value |\n|-------|-------|\n| **From** | {{from}} |\n| **To** | {{to}} |\n| **Phase** | {{phase}} |\n| **Timestamp** | {{timestamp}} |\n\n## Context\n\n**Current State**: {{state}}\n**Relevant Files**: {{files}}\n\n## Deliverable Request\n\n**What is needed**: {{need}}\n\n## Quality Expectations\n\n**Must pass**: {{quality}}\n';
  }

  const timestamp = new Date().toISOString();
  const files = (context.files || []).map(f => `- ${f}`).join('\n');

  content = content
    .replace(/\[Agent Name\]/g, from)
    .replace(/\[YYYY-MM-DDTHH:MM:SSZ\]/g, timestamp)
    .replace(
      /Phase \[N\] -- \[think\/plan\/break\/build\/harness\/review\/ship\/retro\/learn\/evolve\/done\]/g,
      `Phase -- ${phase}`
    )
    .replace(/\[Task description or ID\]/g, context.task || context.goal || phase)
    .replace(/\[Critical \/ High \/ Medium \/ Low\]/g, context.priority || 'Medium')
    .replace(
      /\[What has been completed so far -- be specific\]/g,
      context.state || 'Phase in progress'
    )
    .replace(/- \[file\/path\/1\] -- \[what it contains\]/g, files || '- none')
    .replace(/\[What this work depends on being complete\]/g, context.dependencies || 'None')
    .replace(/\[Technical, timeline, or resource constraints\]/g, context.constraints || 'None')
    .replace(
      /\[Specific, measurable deliverable description\]/g,
      context.need || `${phase} phase completion`
    )
    .replace(
      /\[ \] \[Criterion 1 -- measurable\]/g,
      context.acceptance
        ? context.acceptance.map(c => `- [ ] ${c}`).join('\n')
        : '- [ ] Phase artifacts exist'
    )
    .replace(/\[Links to specs, designs, previous work\]/g, context.refs || 'Internal pipeline')
    .replace(
      /\[Specific quality criteria for this deliverable\]/g,
      context.quality || 'All checks pass'
    )
    .replace(
      /\[What proof of completion looks like\]/g,
      context.evidence || 'Artifacts in state.json'
    )
    .replace(/\[Who receives the output and what format they need\]/g, context.nextReceiver || to);

  const handoffPath = path.join(PROJECT_ROOT, '.vibe', 'handoff.md');
  writeJSON(handoffPath, { content, metadata: { from, to, phase, timestamp } });
  return handoffPath;
}

function getProjectInfo(state) {
  state = state || readState();
  if (!state) return { project: 'Unknown', phase: 'unknown', mode: 'guided' };
  return {
    project: state.project || 'Unknown',
    version: state.version || '0.0.0',
    phase: state.phase || 'unknown',
    step: state.step || 0,
    mode: state.mode || 'guided',
    agent: state.agent || 'unknown',
    skills: state.skills?.total || 0,
    tests: state.infrastructure?.testsPassing || 0,
    harnessChecks: state.infrastructure?.harnessChecks || 0,
    tools: state.infrastructure?.toolsDiscovered || 0,
    maintenance: state.lifecycle?.maintenance_count || 0,
    completed: (state.completed || []).length,
    stateMachine: state.auto_pipeline?.state_machine || [],
  };
}

module.exports = {
  readState,
  writeState,
  recordTelemetry,
  validatePhase,
  advancePhase,
  verifyArtifact,
  writeHandoff,
  getProjectInfo,
  readJSON,
  writeJSON,
  PHASE_ORDER,
  PHASE_TRANSITIONS,
  PROJECT_ROOT,
};
