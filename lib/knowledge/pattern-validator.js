/**
 * Pattern Validator Module
 * Validates patterns before adding to knowledge base
 */

/**
 * Validate a pattern
 * @param {Object} pattern - Pattern object
 * @returns {Object} Validation result
 */
function validatePattern(pattern) {
  const errors = [];

  if (!pattern.name || pattern.name.trim() === '') {
    errors.push('Name is required');
  }

  if (!pattern.category || pattern.category.trim() === '') {
    errors.push('Category is required');
  }

  if (!pattern.description || pattern.description.trim() === '') {
    errors.push('Description is required');
  }

  if (pattern.confidence !== undefined && (pattern.confidence < 0 || pattern.confidence > 1)) {
    errors.push('Confidence must be between 0 and 1');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = { validatePattern };
