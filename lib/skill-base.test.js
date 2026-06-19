const { SkillBase } = require('./skill-base.js');

describe('SkillBase', () => {
  let skill;

  beforeEach(() => {
    class TestSkill extends SkillBase {
      constructor() {
        super();
        this.name = 'test-skill';
        this.description = 'Test skill';
        this.category = 'test';
      }

      doSomethingSync(input) {
        return { result: input * 2 };
      }
    }
    skill = new TestSkill();
  });

  describe('async methods', () => {
    test('has async method that returns Promise', async () => {
      const result = await skill.doSomethingAsync(5);
      expect(result).toEqual({ result: 10 });
    });

    test('async method returns Promise that resolves', () => {
      const promise = skill.doSomethingAsync(3);
      expect(promise).toBeInstanceOf(Promise);
      return promise.then(result => {
        expect(result).toEqual({ result: 6 });
      });
    });
  });

  describe('sync methods (delegation pattern)', () => {
    test('has sync method that delegates to async', () => {
      expect(typeof skill.doSomethingSync).toBe('function');
    });

    test('sync method returns same result as async', () => {
      const asyncResult = skill.doSomethingAsync(4);
      const syncResult = skill.doSomethingSync(4);
      return asyncResult.then(asyncRes => {
        expect(syncResult).toEqual(asyncRes);
      });
    });

    test('sync method works without await', () => {
      const result = skill.doSomethingSync(7);
      expect(result).toEqual({ result: 14 });
    });
  });

  describe('base class contract', () => {
    test('has name, description, category', () => {
      expect(skill.name).toBe('test-skill');
      expect(skill.description).toBe('Test skill');
      expect(skill.category).toBe('test');
    });

    test('methods property lists available methods', () => {
      expect(skill.methods).toBeDefined();
      expect(Array.isArray(skill.methods)).toBe(true);
    });
  });
});