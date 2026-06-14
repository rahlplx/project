#!/usr/bin/env node

class Guardrails {
  constructor(config = {}) {
    this.name = 'guardrails';
    this.version = '1.0.0';
    this.description = 'Safety confirmations for destructive actions — prevents accidents';
    this.config = config;
  }

  check(action, context = {}) {
    if (!action) return { allowed: false, reason: 'No action specified.' };

    const guardrails = this._getGuardrails();
    const matched = guardrails.filter(g => g.pattern.test(action));

    if (matched.length === 0) {
      return { allowed: true, action, reason: 'No guardrails triggered.', confirmations: [] };
    }

    const confirmations = matched.map(g => ({
      id: g.id,
      title: g.title,
      message: g.message,
      required: g.required,
      autoBlock: g.autoBlock
    }));

    const blocked = matched.filter(g => g.autoBlock).length > 0;

    return {
      allowed: !blocked,
      action,
      blocked,
      reason: blocked ? 'Action blocked by guardrail. Review confirmations.' : 'Action allowed with confirmations.',
      confirmations,
      timestamp: new Date().toISOString()
    };
  }

  _getGuardrails() {
    return [
      {
        id: 'G01', autoBlock: false, required: true,
        pattern: /delete|remove|rm|unlink/i,
        title: 'Delete Confirmation',
        message: 'This action deletes something permanently. Are you sure?'
      },
      {
        id: 'G02', autoBlock: false, required: true,
        pattern: /drop|truncate|clear/i,
        title: 'Database Modification',
        message: 'This modifies database data. Have you backed up?'
      },
      {
        id: 'G03', autoBlock: true, required: true,
        pattern: /rm\s+-rf|format|dd\s+if=|shutdown|reboot/i,
        title: 'Dangerous System Command',
        message: 'This command can destroy system data. It is blocked by default.'
      },
      {
        id: 'G04', autoBlock: false, required: false,
        pattern: /deploy|publish|release/i,
        title: 'Deploy Confirmation',
        message: 'This will deploy to production. Tests passing?'
      },
      {
        id: 'G05', autoBlock: false, required: false,
        pattern: /override|force|--yes/i,
        title: 'Force Flag',
        message: 'Using force/override. This may skip important checks.'
      },
      {
        id: 'G06', autoBlock: false, required: true,
        pattern: /reset|wipe|nuke/i,
        title: 'Reset Confirmation',
        message: 'This resets or wipes data. This cannot be undone.'
      },
      {
        id: 'G07', autoBlock: false, required: false,
        pattern: /chmod|chown|sudo/i,
        title: 'Permission Change',
        message: 'This changes file permissions or runs with elevated privileges.'
      },
      {
        id: 'G08', autoBlock: false, required: true,
        pattern: /overwrite|replace/i,
        title: 'Overwrite Confirmation',
        message: 'This will overwrite existing files or data.'
      },
      {
        id: 'G09', autoBlock: false, required: true,
        pattern: /spec\s+file/i,
        title: 'Spec File Operation',
        message: 'This operates on a spec file. Confirm the spec is backed up and changes are intentional.'
      },
      {
        id: 'G10', autoBlock: false, required: true,
        pattern: /acceptance.criteri/i,
        title: 'Acceptance Criteria Check',
        message: 'This affects acceptance criteria. Verify criteria still reflect stakeholder intent.'
      },
      {
        id: 'G11', autoBlock: true, required: true,
        pattern: /decompos|break.?down/i,
        title: 'Decomposition Gate',
        message: 'Decomposition changes task structure. This is auto-blocked; review the plan first.'
      },
      {
        id: 'G12', autoBlock: false, required: false,
        pattern: /drift|mismatch/i,
        title: 'Spec Drift Detection',
        message: 'Spec drift detected between versions. Review diffs before proceeding.'
      },
      {
        id: 'G13', autoBlock: true, required: true,
        pattern: /override.?spec|spec.?override/i,
        title: 'Spec Override',
        message: 'Overriding spec definitions is auto-blocked. This can break traceability.'
      },
      {
        id: 'G14', autoBlock: false, required: true,
        pattern: /milestone.?spec|check.?milestone|milestone.?check/i,
        title: 'Milestone Spec Check',
        message: 'This checks milestone against spec. Confirm milestone aligns with current spec.'
      }
    ];
  }

  confirm(guardrailId, action) {
    return {
      confirmed: true,
      guardrailId,
      action,
      timestamp: new Date().toISOString(),
      message: 'Confirmation recorded. Proceeding with action.'
    };
  }

  toJSON() {
    return {
      name: this.name,
      version: this.version,
      description: this.description,
      guardrails: this._getGuardrails().map(g => ({ id: g.id, title: g.title, autoBlock: g.autoBlock })),
      usage: 'Call check(action) before destructive operations, confirm(id) after user approval.'
    };
  }
}

if (require.main === module) {
  const skill = new Guardrails();
  const action = process.argv.slice(2).join(' ') || 'delete production database';
  console.log(JSON.stringify(skill.check(action), null, 2));
}

module.exports = Guardrails;
