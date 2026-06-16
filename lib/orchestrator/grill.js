/**
 * Grill
 * Structured clarifying-question protocol for ambiguous requests, fired before
 * work starts instead of after misalignment shows up (mattpocock/skills' /grill-me).
 */

const VAGUE_SIGNALS = [
  {
    id: 'no_scope',
    pattern: /\b(make|build|create)\b.*\b(it|this|an? app|a website|a page)\b/i,
    question: 'What specific feature or page should this cover — the whole thing, or one part?'
  },
  {
    id: 'no_success_criteria',
    pattern: /\b(better|nicer|cleaner|improve|fix it|fix this)\b/i,
    question: 'What does "done" look like here — faster, fewer bugs, nicer visually, or something else?'
  },
  {
    id: 'no_audience',
    pattern: /\b(app|website|product|dashboard|tool)\b/i,
    question: 'Who is this for, and what do they need to be able to do with it?'
  }
];

const MIN_WORD_COUNT = 6;

class Grill {
  needsGrilling(request) {
    const text = String(request || '').trim();
    const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const vague = VAGUE_SIGNALS.some((signal) => signal.pattern.test(text));
    return wordCount < MIN_WORD_COUNT || vague;
  }

  generateQuestions(request) {
    const text = String(request || '');
    const matched = VAGUE_SIGNALS.filter((signal) => signal.pattern.test(text)).map((s) => s.question);

    if (matched.length === 0 && this.needsGrilling(text)) {
      return [
        'What specifically should this do?',
        'Any constraints — existing tech stack, deadline, or things to avoid?'
      ];
    }
    return matched;
  }

  grill(request) {
    const needsGrilling = this.needsGrilling(request);
    return {
      needsGrilling,
      questions: needsGrilling ? this.generateQuestions(request) : []
    };
  }
}

module.exports = { Grill, VAGUE_SIGNALS };
