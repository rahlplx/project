/**
 * Anti-Rationalization
 * Excuse-to-rebuttal table for skipping a quality gate (agent-skills concept).
 */

const EXCUSE_TABLE = [
  {
    id: 'just_a_prototype',
    pattern: /just a prototype|quick (proof of concept|poc)|throwaway code/i,
    excuse: "It's just a prototype, quality gates don't matter yet.",
    rebuttal: 'Prototypes become production code more often than not. The gate cost is the same either way; skipping it now just defers the cost to someone with less context.'
  },
  {
    id: 'add_tests_later',
    pattern: /add tests later|test(s)? (afterward|after the fact)|write tests next/i,
    excuse: "I'll add tests later, once the feature is stable.",
    rebuttal: 'Tests written after the fact verify what the code happens to do, not what it should do. Write the test first while the intended behavior is still explicit.'
  },
  {
    id: 'user_in_a_hurry',
    pattern: /user('s| is) in a hurry|no time|deadline (today|tomorrow)|ship(ping)? fast/i,
    excuse: "The user's in a hurry, skip the checklist this once.",
    rebuttal: 'A skipped security or correctness check that causes a rollback costs more time than the check itself. Speed comes from not having to redo the work.'
  },
  {
    id: 'looks_fine',
    pattern: /looks fine|seems to work|probably works|works on my machine/i,
    excuse: 'It looks fine / seems to work, no need to verify further.',
    rebuttal: 'Code can execute without errors and still contain a security hole, a logic bug, or an accessibility failure. "Ran without crashing" is not a passing condition.'
  },
  {
    id: 'small_change',
    pattern: /small change|tiny (fix|tweak)|one[- ]line (fix|change)/i,
    excuse: "It's a small change, doesn't need the full review.",
    rebuttal: 'Blast radius is not proportional to diff size. A one-line change to an auth check or a shared config can be the highest-risk change in the codebase.'
  }
];

class AntiRationalization {
  checkRationalization(text) {
    const found = EXCUSE_TABLE.filter(entry => entry.pattern.test(String(text || '')));
    return {
      flagged: found.length > 0,
      matches: found.map(({ id, excuse, rebuttal }) => ({ id, excuse, rebuttal }))
    };
  }

  getTable() {
    return EXCUSE_TABLE.map(({ id, excuse, rebuttal }) => ({ id, excuse, rebuttal }));
  }

  getRebuttal(id) {
    const entry = EXCUSE_TABLE.find(e => e.id === id);
    return entry ? entry.rebuttal : null;
  }
}

module.exports = { AntiRationalization, EXCUSE_TABLE };
