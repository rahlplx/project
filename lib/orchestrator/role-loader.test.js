const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { RoleLoader, ROLES, PHASE_ROLES } = require('./role-loader');

describe('RoleLoader', () => {
  let roleLoader;

  beforeEach(() => {
    roleLoader = new RoleLoader();
  });

  it('should initialize with empty loaded roles', () => {
    assert.strictEqual(roleLoader.loadedRoles.size, 0);
    assert.strictEqual(roleLoader.usedTokens, 0);
  });

  it('should load roles for phase', () => {
    const roles = roleLoader.loadForPhase('think');
    assert.ok(Array.isArray(roles));
    assert.ok(roles.length > 0);
    assert.ok('name' in roles[0]);
  });

  it('should unload roles', () => {
    roleLoader.loadForPhase('think');
    const initialTokens = roleLoader.usedTokens;

    roleLoader.unload(['CEO']);
    assert.ok(roleLoader.usedTokens < initialTokens);
  });

  it('should unload all roles', () => {
    roleLoader.loadForPhase('think');
    roleLoader.unloadAll();

    assert.strictEqual(roleLoader.loadedRoles.size, 0);
    assert.strictEqual(roleLoader.usedTokens, 0);
  });

  it('should get loaded roles', () => {
    roleLoader.loadForPhase('think');
    const loadedRoles = roleLoader.getLoadedRoles();

    assert.ok(Array.isArray(loadedRoles));
    assert.ok(loadedRoles.length > 0);
  });

  it('should get token usage', () => {
    roleLoader.loadForPhase('think');
    const usage = roleLoader.getTokenUsage();

    assert.ok('used' in usage);
    assert.ok('budget' in usage);
    assert.ok('remaining' in usage);
    assert.ok('percentage' in usage);
  });

  it('should get role by name', () => {
    const role = roleLoader.getRole('CEO');
    assert.strictEqual(role.name, 'CEO');
    assert.ok('description' in role);
    assert.ok('tokenCost' in role);
  });

  it('should get all roles', () => {
    const allRoles = roleLoader.getAllRoles();
    assert.ok(Array.isArray(allRoles));
    assert.ok(allRoles.length > 0);
  });

  it('should get roles for phase', () => {
    const roles = roleLoader.getRolesForPhase('think');
    assert.ok(Array.isArray(roles));
    assert.ok(roles.includes('CEO'));
    assert.ok(roles.includes('Designer'));
  });

  it('should check if role is loaded', () => {
    roleLoader.loadForPhase('think');
    assert.strictEqual(roleLoader.isRoleLoaded('CEO'), true);
    assert.strictEqual(roleLoader.isRoleLoaded('DevOps'), false);
  });

  it('should get role context', () => {
    const context = roleLoader.getRoleContext('CEO');
    assert.strictEqual(typeof context, 'string');
    assert.ok(context.includes('CEO'));
    assert.ok(context.includes('Strategy'));
  });

  it('should get loaded role contexts', () => {
    roleLoader.loadForPhase('think');
    const contexts = roleLoader.getLoadedRoleContexts();

    assert.strictEqual(typeof contexts, 'string');
    assert.ok(contexts.includes('CEO'));
  });
});

describe('ROLES', () => {
  it('should have all required roles', () => {
    assert.ok('CEO' in ROLES);
    assert.ok('Designer' in ROLES);
    assert.ok('Engineer' in ROLES);
    assert.ok('Architect' in ROLES);
    assert.ok('Reviewer' in ROLES);
    assert.ok('QA' in ROLES);
    assert.ok('DevOps' in ROLES);
  });

  it('should have required properties for each role', () => {
    Object.values(ROLES).forEach(role => {
      assert.ok('name' in role);
      assert.ok('description' in role);
      assert.ok('tokenCost' in role);
      assert.ok('phases' in role);
    });
  });
});

describe('PHASE_ROLES', () => {
  it('should have roles for all phases', () => {
    assert.ok('think' in PHASE_ROLES);
    assert.ok('plan' in PHASE_ROLES);
    assert.ok('break' in PHASE_ROLES);
    assert.ok('build' in PHASE_ROLES);
    assert.ok('review' in PHASE_ROLES);
    assert.ok('ship' in PHASE_ROLES);
    assert.ok('retro' in PHASE_ROLES);
  });

  it('should have array of roles for each phase', () => {
    Object.values(PHASE_ROLES).forEach(roles => {
      assert.ok(Array.isArray(roles));
    });
  });
});
