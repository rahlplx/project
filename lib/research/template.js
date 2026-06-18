/**
 * Research Template
 * Generates MARKET_RESEARCH.md from research data
 */

/**
 * Generate market research markdown
 * @param {Object} data - Research data
 * @returns {string} Markdown content
 */
function generateResearchMd(data) {
  const lines = [];

  lines.push(`# Market Research: ${data.projectName}`);
  lines.push('');
  lines.push(`*Generated: ${data.researchDate}*`);
  lines.push('');

  lines.push('## Market Overview');
  lines.push('');
  lines.push(data.marketOverview || 'No market overview available');
  lines.push('');

  lines.push('## Competitor Analysis');
  lines.push('');
  if (data.competitors && data.competitors.length > 0) {
    data.competitors.forEach(comp => {
      lines.push(`### ${comp.name}`);
      lines.push(`- URL: ${comp.url}`);
      lines.push(`- Strengths: ${comp.strengths.join(', ')}`);
      lines.push(`- Weaknesses: ${comp.weaknesses.join(', ')}`);
      lines.push('');
    });
  } else {
    lines.push('No competitors analyzed');
    lines.push('');
  }

  lines.push('## Open Source Tools');
  lines.push('');
  if (data.openSourceTools && data.openSourceTools.length > 0) {
    data.openSourceTools.forEach(tool => {
      lines.push(`### ${tool.name}`);
      lines.push(`- Repo: ${tool.repo}`);
      lines.push(`- Stars: ${tool.stars}`);
      lines.push(`- License: ${tool.license}`);
      lines.push(`- Description: ${tool.description}`);
      lines.push('');
    });
  } else {
    lines.push('No open source tools identified');
    lines.push('');
  }

  lines.push('## Recommendations');
  lines.push('');
  if (data.recommendations && data.recommendations.length > 0) {
    data.recommendations.forEach(rec => {
      lines.push(`- ${rec}`);
    });
  } else {
    lines.push('No recommendations');
  }
  lines.push('');

  lines.push('## Risks');
  lines.push('');
  if (data.risks && data.risks.length > 0) {
    data.risks.forEach(risk => {
      lines.push(`- ${risk}`);
    });
  } else {
    lines.push('No risks identified');
  }
  lines.push('');

  lines.push('## Next Steps');
  lines.push('');
  if (data.nextSteps && data.nextSteps.length > 0) {
    data.nextSteps.forEach(step => {
      lines.push(`- ${step}`);
    });
  } else {
    lines.push('No next steps defined');
  }
  lines.push('');

  return lines.join('\n');
}

module.exports = { generateResearchMd };
