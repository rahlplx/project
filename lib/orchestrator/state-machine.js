/**
 * VibeNexus Unified State Machine
 * Optimized with VibeNexus 5-Phase Model (SCOPE, BUILD, VERIFY, SHIP, EVOLVE).
 */

const fs = require('fs');
const path = require('path');

const STATE_PATH = path.join(process.cwd(), '.vibenexus', 'state.json');

const PHASES = [
  { name: 'scope', source: 'vibenexus', roles: ['CEO', 'Designer', 'Architect'], layer: 'strategy' },
  { name: 'build', source: 'vibenexus', roles: ['Engineer'], layer: 'execution' },
  { name: 'verify', source: 'vibenexus', roles: ['Reviewer'], layer: 'validation' },
  { name: 'ship', source: 'vibenexus', roles: ['DevOps'], layer: 'delivery' },
  { name: 'evolve', source: 'vibenexus', roles: ['Admin'], layer: 'learning' },
];

const PHASE_ORDER = PHASES.map(p => p.name);

class StateMachine {
  constructor() {
    this.phases = PHASES;
    this.state = this.loadState();
  }

  loadState() {
    try {
      if (fs.existsSync(STATE_PATH)) {
        return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
      }
    } catch (e) { /* fallback */ }
    return { phase: 'scope', step: 0, completed: [] };
  }

  saveState() {
    const dir = path.dirname(STATE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATE_PATH, JSON.stringify(this.state, null, 2));
  }

  transition(toPhase) {
    if (!PHASE_ORDER.includes(toPhase)) throw new Error("Invalid phase");
    this.state.phase = toPhase;
    this.state.step++;
    this.saveState();
    return this.state;
  }
}

module.exports = { StateMachine, PHASES, PHASE_ORDER };
