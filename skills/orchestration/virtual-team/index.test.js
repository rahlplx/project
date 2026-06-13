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
});
