/**
 * Unified State Machine
 * Combines gsd context stabilization with gstack phase transitions
 */

const fs = require('fs');
const path = require('path');

const STATE_PATH = path.join(process.cwd(), '.vibe', 'state.json');

const PHASES = [
  { name: 'think', source: 'gstack', roles: ['CEO', 'Designer'], layer: 'strategy' },
  { name: 'plan', source: 'gstack', roles: ['Engineer', 'Reviewer'], layer: 'strategy' },
  { name: 'detect', source: 'vibe-stack', roles: [], layer: 'foundation' },
  { name: 'break', source: 'gsd', roles: ['Architect'], layer: 'planning' },
  { name: 'design', source: 'gstack', roles: ['Designer'], layer: 'planning' },
  { name: 'build', source: 'superpowers', roles: [], layer: 'execution' },
  { name: 'harness', source: 'vibe-stack', roles: [], layer: 'validation' },
  { name: 'review', source: 'gstack+superpowers', roles: ['Reviewer'], layer: 'validation' },
  { name: 'qa', source: 'gstack', roles: [], layer: 'validation' },
  { name: 'ship', source: 'gstack', roles: [], layer: 'delivery' },
  { name: 'retro', source: 'gstack', roles: [], layer: 'learning' },
  { name: 'learn', source: 'vibe-stack', roles: [], layer: 'learning' },
  { name: 'evolve', source: 'vibe-stack', roles: [], layer: 'learning' },
  { name: 'done', source: 'vibe-stack', roles: [], layer: 'complete' },
];

const LAYERS = {
  strategy: { name: 'Strategy', color: 'blue' },
  foundation: { name: 'Foundation', color: 'green' },
  planning: { name: 'Planning', color: 'yellow' },
  execution: { name: 'Execution', color: 'red' },
  validation: { name: 'Validation', color: 'purple' },
  delivery: { name: 'Delivery', color: 'cyan' },
  learning: { name: 'Learning', color: 'magenta' },
  complete: { name: 'Complete', color: 'white' },
};

class StateMachine {
  constructor() {
    this.phases = PHASES;
    this.layers = LAYERS;
    this.state = this.loadState();
  }

  loadState() {
    try {
      if (fs.existsSync(STATE_PATH)) {
        const data = fs.readFileSync(STATE_PATH, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load state:', error.message);
    }
    return this.getDefaultState();
  }

  getDefaultState() {
    return {
      phase: 'think',
      step: 0,
      mode: 'auto',
      completed: [],
      auto_pipeline: {
        state_machine: this.phases.map(p => p.name),
      },
    };
  }

  saveState() {
    try {
      const dir = path.dirname(STATE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(STATE_PATH, JSON.stringify(this.state, null, 2));
    } catch (error) {
      console.error('Failed to save state:', error.message);
    }
  }

  getCurrentPhase() {
    return this.state.phase;
  }

  getPhaseInfo(phaseName) {
    return this.phases.find(p => p.name === phaseName);
  }

  getLayerForPhase(phaseName) {
    const phase = this.getPhaseInfo(phaseName);
    if (!phase) return null;
    return this.layers[phase.layer];
  }

  canTransition(fromPhase, toPhase, options = {}) {
    const { allowBacktrack = false } = options;
    const fromIndex = this.phases.findIndex(p => p.name === fromPhase);
    const toIndex = this.phases.findIndex(p => p.name === toPhase);

    if (fromIndex === -1 || toIndex === -1) {
      return false;
    }

    if (allowBacktrack) {
      return true;
    }

    const fromLayer = this.phases[fromIndex].layer;
    const toLayer = this.phases[toIndex].layer;

    if (fromLayer === toLayer) {
      return true;
    }

    const layerOrder = Object.keys(this.layers);
    const fromLayerIndex = layerOrder.indexOf(fromLayer);
    const toLayerIndex = layerOrder.indexOf(toLayer);

    return toLayerIndex === fromLayerIndex + 1;
  }

  transition(toPhase, options = {}) {
    const currentPhase = this.getCurrentPhase();

    if (!this.canTransition(currentPhase, toPhase, options)) {
      throw new Error(`Cannot transition from ${currentPhase} to ${toPhase}`);
    }

    this.state.phase = toPhase;
    this.state.step++;
    this.state.completed.push(`${currentPhase}-complete`);
    this.saveState();

    return {
      from: currentPhase,
      to: toPhase,
      step: this.state.step,
      layer: this.getLayerForPhase(toPhase),
    };
  }

  needsHandoff(fromPhase, toPhase) {
    const fromLayer = this.getLayerForPhase(fromPhase);
    const toLayer = this.getLayerForPhase(toPhase);
    return fromLayer !== toLayer;
  }

  getRolesForPhase(phaseName) {
    const phase = this.getPhaseInfo(phaseName);
    return phase ? phase.roles : [];
  }

  getProgress() {
    const currentIndex = this.phases.findIndex(p => p.name === this.state.phase);
    const total = this.phases.length;
    const completed = this.state.completed.length;

    return {
      current: this.state.phase,
      currentIndex,
      total,
      completed,
      percentage: Math.round((completed / total) * 100),
    };
  }
}

module.exports = { StateMachine, PHASES, LAYERS };
