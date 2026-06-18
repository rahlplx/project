/**
 * Template Engine
 * Simple variable interpolation for markdown templates
 */

/**
 * Render a template with data
 * @param {string} template - Template string with {{variable}} placeholders
 * @param {Object} data - Data object
 * @returns {string} Rendered string
 */
function renderTemplate(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : '';
  });
}

module.exports = { renderTemplate };
