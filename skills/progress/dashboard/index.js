#!/usr/bin/env node

class Dashboard {
  constructor(config = {}) {
    this.name = 'dashboard';
    this.version = '1.0.0';
    this.description = 'Visual project progress dashboard — reads tracker data and renders status';
  }

  generateReport(trackerData = {}) {
    const tasks = trackerData.tasks || [];
    const phases = trackerData.phases || ['todo', 'in-progress', 'review', 'done'];
    const projectName = trackerData.projectName || 'Project';

    const counts = {};
    phases.forEach(p => {
      counts[p] = 0;
    });
    tasks.forEach(t => {
      const status = t.status || 'todo';
      counts[status] = (counts[status] || 0) + 1;
    });

    const total = tasks.length;
    const done = counts.done || 0;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    const phaseReport = phases.map(phase => ({
      phase,
      count: counts[phase] || 0,
      pct: total > 0 ? Math.round(((counts[phase] || 0) / total) * 100) : 0,
    }));

    const blockers = tasks.filter(t => t.blocker === true && t.status !== 'done').length;

    return {
      project: projectName,
      progress,
      summary: { total, done, remaining: total - done, blockers },
      phases: phaseReport,
      timeline: this._estimateTimeline(done, total),
      recommendations: this._generateRecommendations(progress, blockers, total, done),
      timestamp: new Date().toISOString(),
    };
  }

  _estimateTimeline(done, total) {
    if (total === 0) return { estimatedCompletion: 'Unknown', remainingDays: 0 };
    const remaining = total - done;
    const velocity = done > 0 ? done / 1 : 0.5;
    const days = velocity > 0 ? Math.ceil(remaining / velocity) : 'Unknown';
    return {
      completed: done,
      remaining,
      estimatedCompletion:
        typeof days === 'number' ? `${days} day${days !== 1 ? 's' : ''}` : 'Unknown',
      note: 'Estimate based on completed work. Adjusts as more tasks finish.',
    };
  }

  _generateRecommendations(progress, blockers, total, done) {
    const recs = [];
    if (blockers > 0)
      {recs.push({
        priority: 'high',
        message: `${blockers} blocker(s) need attention before shipping`,
      });}
    if (progress < 25)
      {recs.push({
        priority: 'info',
        message: 'Early stage — focus on defining and completing the first milestone',
      });}
    else if (progress < 50)
      {recs.push({
        priority: 'info',
        message: 'Building momentum — keep completing tasks one at a time',
      });}
    else if (progress < 75)
      {recs.push({
        priority: 'info',
        message: 'More than halfway — start reviewing completed work for quality',
      });}
    else if (progress < 100)
      {recs.push({
        priority: 'info',
        message: 'Almost done — run the done-checklist before shipping',
      });}
    else
      {recs.push({
        priority: 'success',
        message: 'All tasks complete! Run done-checklist and deploy.',
      });}
    if (total > 0 && done === 0)
      {recs.push({
        priority: 'warning',
        message: 'No completed tasks yet. Try breaking work into smaller pieces.',
      });}
    return recs;
  }

  renderAscii(data) {
    const barWidth = 20;
    const filled = Math.round((data.progress / 100) * barWidth);
    const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
    const lines = [
      `  ${data.project}`,
      `  ${bar} ${data.progress}%`,
      `  ${data.summary.done}/${data.summary.total} tasks complete`,
      data.summary.blockers > 0 ? `  ⚠ ${data.summary.blockers} blocker(s)` : '',
      '',
      '  Phase Breakdown:',
      ...data.phases.map(
        p =>
          `    ${p.phase}: ${'█'.repeat(p.pct > 0 ? Math.max(1, Math.round(p.pct / 5)) : 0)} ${p.count}`
      ),
      '',
      '  Recommendations:',
      ...data.recommendations.map(r => `    [${r.priority}] ${r.message}`),
    ].filter(Boolean);
    return lines.join('\n');
  }

  toJSON() {
    return {
      name: this.name,
      version: this.version,
      description: this.description,
      input: 'Expects trackerData object with tasks array and phases',
    };
  }
}

if (require.main === module) {
  const skill = new Dashboard();
  const sampleData = {
    projectName: 'My Project',
    tasks: [
      { id: '1', title: 'Setup', status: 'done' },
      { id: '2', title: 'Design', status: 'in-progress' },
      { id: '3', title: 'Build', status: 'todo' },
      { id: '4', title: 'Test', status: 'todo' },
    ],
  };
  const report = skill.generateReport(sampleData);
  console.log(skill.renderAscii(report));
}

module.exports = Dashboard;
