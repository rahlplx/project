const TaskTracker = require('./index');

describe('TaskTracker', () => {
  it('should create instance with defaults', () => {
    const s = new TaskTracker();
    expect(s.storageKey).toBe('vibe-tracker');
    expect(s.phases).toEqual(['todo', 'in-progress', 'review', 'done']);
  });

  it('should create task with defaults', () => {
    const s = new TaskTracker();
    const task = s.createTask('task1');
    expect(task.name).toBe('task1');
    expect(task.phase).toBe('todo');
    expect(task.id).toBeDefined();
    expect(task.createdAt).toBeDefined();
    expect(task.priority).toBe('medium');
    expect(task.tags).toEqual([]);
  });

  it('should create task in custom phase', () => {
    const s = new TaskTracker();
    const task = s.createTask('task2', { phase: 'in-progress' });
    expect(task.name).toBe('task2');
    expect(task.phase).toBe('in-progress');
  });

  it('should move task to different phase', () => {
    const s = new TaskTracker();
    const task = s.createTask('task1');
    const moved = s.moveToPhase(task.id, 'done');
    expect(moved.phase).toBe('done');
  });

  it('should list created tasks', () => {
    const s = new TaskTracker();
    s.createTask('task1');
    s.createTask('task2');
    const list = s.listTasks();
    expect(list).toHaveLength(2);
    expect(list[0].name).toBe('task1');
    expect(list[1].name).toBe('task2');
  });

  it('should return null for nonexistent task', () => {
    const s = new TaskTracker();
    expect(s.getTask('nonexistent')).toBeNull();
  });

  it('should remove task', () => {
    const s = new TaskTracker();
    const task = s.createTask('task1');
    expect(s.deleteTask(task.id)).toBe(true);
    expect(s.getTask(task.id)).toBeNull();
  });

  it('should return stats with totals and byPhase', () => {
    const s = new TaskTracker();
    s.createTask('task1');
    s.createTask('task2');
    const stats = s.getStats();
    expect(stats.total).toBe(2);
    expect(stats.todo).toBe(2);
    expect(stats.completed).toBe(0);
    expect(stats.byPriority).toBeDefined();
  });

  it('should return progress summary', () => {
    const s = new TaskTracker();
    s.createTask('task1');
    const p = s.getProgress();
    expect(p.total).toBe(1);
    expect(p.byPhase).toBeDefined();
    expect(p.byPhase.todo).toBe(1);
    expect(p.completionRate).toBe(0);
  });

  it('should find tasks by tag', () => {
    const s = new TaskTracker();
    s.createTask('task1', { tags: ['ui', 'frontend'] });
    s.createTask('task2', { tags: ['api'] });
    const tagged = s.listTasks({ tag: 'ui' });
    expect(tagged).toHaveLength(1);
    expect(tagged[0].name).toBe('task1');
  });

  it('should filter tasks by phase', () => {
    const s = new TaskTracker();
    s.createTask('task1');
    s.createTask('task2', { phase: 'done' });
    const todoTasks = s.listTasks({ phase: 'todo' });
    expect(todoTasks).toHaveLength(1);
    expect(todoTasks[0].name).toBe('task1');
  });

  it('should update task status', () => {
    const s = new TaskTracker();
    const task = s.createTask('task1');
    const updated = s.updateStatus(task.id, 'blocked');
    expect(updated.status).toBe('blocked');
  });

  it('should add and complete check items', () => {
    const s = new TaskTracker();
    const task = s.createTask('task1');
    const withItem = s.addCheckItem(task.id, 'do something');
    expect(withItem.checkItems).toHaveLength(1);
    expect(withItem.checkItems[0].text).toBe('do something');
    const completed = s.completeCheckItem(task.id, withItem.checkItems[0].id);
    expect(completed.checkItems[0].done).toBe(true);
  });

  it('should produce ASCII board', () => {
    const s = new TaskTracker();
    s.createTask('task1');
    const board = s.toAscii();
    expect(board).toContain('TODO');
    expect(board).toContain('task1');
  });

  it('should produce JSON output', () => {
    const s = new TaskTracker();
    s.createTask('task1');
    const json = s.toJSON();
    expect(json).toContain('vibe-tracker');
    expect(json).toContain('task1');
  });

  it('should produce Markdown output', () => {
    const s = new TaskTracker();
    s.createTask('task1');
    const md = s.toMarkdown();
    expect(md).toContain('Task Board');
    expect(md).toContain('vibe-tracker');
    expect(md).toContain('task1');
  });
});
