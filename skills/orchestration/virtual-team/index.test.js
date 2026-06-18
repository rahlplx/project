const VirtualTeam = require('./index');

describe('VirtualTeam', () => {
  it('should create instance', () => {
    const s = new VirtualTeam();
    expect(s.name).toBe('virtual-team');
  });

  it('should assign roles', () => {
    const s = new VirtualTeam();
    const r = s.assign('ceo', 'launch strategy');
    expect(r.assigned).toBe(true);
    expect(r.role).toBe('CEO');
  });

  it('should brainstorm from all roles', () => {
    const s = new VirtualTeam();
    const r = s.brainstorm('new feature');
    expect(r).toHaveLength(5);
  });

  it('should return error for unknown role', () => {
    const s = new VirtualTeam();
    const r = s.assign('pm', 'plan sprint');
    expect(r.error).toContain('Unknown role');
  });

  it('should handle empty task description', () => {
    const s = new VirtualTeam();
    const r = s.assign('engineer', '');
    expect(r.assigned).toBe(true);
    expect(r.response).toContain('Tech review for');
  });

  it('should brainstorm with empty input', () => {
    const s = new VirtualTeam();
    const r = s.brainstorm('');
    expect(r).toHaveLength(5);
    r.forEach(item => expect(item.assigned).toBe(true));
  });

  it('should return role metadata on assign', () => {
    const s = new VirtualTeam();
    const r = s.assign('qa', 'test checkout flow');
    expect(r).toHaveProperty('focus');
    expect(r).toHaveProperty('style');
    expect(r.focus).toContain('Edge cases');
    expect(r.style).toContain('Detail-oriented');
  });

  it('should allow all roles to be assigned', () => {
    const s = new VirtualTeam();
    const roles = ['ceo', 'designer', 'engineer', 'qa', 'security'];
    roles.forEach(role => {
      const r = s.assign(role, 'test task');
      expect(r.assigned).toBe(true);
      expect(r.role).toBeTruthy();
      expect(r.focus).toBeTruthy();
    });
  });
});
