/**
 * Minimal Jest→node:test compatibility shim.
 * Lets existing Jest-syntax test files run under node:test without rewriting every assertion.
 * Only covers matchers actually used in this codebase — no jest.fn() / jest.mock() support.
 */
const nodeTest = require('node:test');
const assert = require('node:assert/strict');

function buildExpect(actual) {
  const notChain = {
    toBe: expected => assert.notStrictEqual(actual, expected),
    toEqual: expected => {
      let threw = false;
      try {
        assert.deepStrictEqual(actual, expected);
      } catch {
        threw = true;
      }
      if (!threw) {
        assert.fail(`Expected values NOT to be deeply equal:\n  ${JSON.stringify(actual)}`);
      }
    },
    toBeTruthy: () => assert.ok(!actual, `Expected ${actual} to be falsy`),
    toBeFalsy: () => assert.ok(actual, `Expected ${actual} to be truthy`),
    toBeNull: () => assert.notStrictEqual(actual, null),
    toBeUndefined: () => assert.notStrictEqual(actual, undefined),
    toBeDefined: () => assert.strictEqual(actual, undefined),
    toContain: item =>
      assert.ok(
        !(Array.isArray(actual) ? actual.includes(item) : String(actual).includes(item)),
        `Expected ${JSON.stringify(actual)} NOT to contain ${JSON.stringify(item)}`
      ),
    toThrow: () => assert.doesNotThrow(actual),
    toHaveProperty: key =>
      assert.ok(!(key in Object(actual)), `Expected object NOT to have property "${key}"`),
    toMatch: pattern => {
      const re = pattern instanceof RegExp ? pattern : new RegExp(pattern);
      assert.ok(!re.test(String(actual)), `Expected "${actual}" NOT to match ${re}`);
    },
  };

  return {
    not: notChain,

    toBe: expected => assert.strictEqual(actual, expected),
    toEqual: expected => assert.deepStrictEqual(actual, expected),
    toBeTruthy: () => assert.ok(actual),
    toBeFalsy: () => assert.ok(!actual),
    toBeNull: () => assert.strictEqual(actual, null),
    toBeUndefined: () => assert.strictEqual(actual, undefined),
    toBeDefined: () => assert.notStrictEqual(actual, undefined),

    toContain: item =>
      assert.ok(
        Array.isArray(actual) ? actual.includes(item) : String(actual).includes(item),
        `Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(item)}`
      ),

    toHaveLength: n => assert.strictEqual(actual.length, n),

    toBeGreaterThan: n => assert.ok(actual > n, `Expected ${actual} > ${n}`),
    toBeGreaterThanOrEqual: n => assert.ok(actual >= n, `Expected ${actual} >= ${n}`),
    toBeLessThan: n => assert.ok(actual < n, `Expected ${actual} < ${n}`),
    toBeLessThanOrEqual: n => assert.ok(actual <= n, `Expected ${actual} <= ${n}`),
    toBeCloseTo: (expected, precision = 2) => {
      const factor = Math.pow(10, precision);
      assert.ok(
        Math.round(actual * factor) === Math.round(expected * factor),
        `Expected ${actual} to be close to ${expected} (precision ${precision})`
      );
    },

    toMatch: pattern => {
      const re = pattern instanceof RegExp ? pattern : new RegExp(pattern);
      assert.match(String(actual), re);
    },

    toMatchObject: expected => {
      for (const [k, v] of Object.entries(expected)) {
        assert.deepStrictEqual(
          actual[k],
          v,
          `Key "${k}": expected ${JSON.stringify(v)}, got ${JSON.stringify(actual[k])}`
        );
      }
    },

    toHaveProperty: (key, value) => {
      assert.ok(key in Object(actual), `Expected object to have property "${key}"`);
      if (value !== undefined) {
        assert.deepStrictEqual(actual[key], value);
      }
    },

    toBeInstanceOf: cls => assert.ok(actual instanceof cls, `Expected instance of ${cls.name}`),

    toHaveBeenCalledTimes: n =>
      assert.strictEqual(
        actual && actual.mock ? actual.mock.calls.length : -1,
        n,
        `Expected mock to have been called ${n} time(s), got ${actual && actual.mock ? actual.mock.calls.length : 'N/A'}`
      ),
    toHaveBeenCalledWith: (...expected) => {
      const calls = actual && actual.mock ? actual.mock.calls : [];
      const matched = calls.some(
        call =>
          call.length === expected.length &&
          expected.every((e, i) => {
            try {
              assert.deepStrictEqual(call[i], e);
              return true;
            } catch {
              return false;
            }
          })
      );
      assert.ok(matched, `Expected mock to have been called with ${JSON.stringify(expected)}`);
    },

    toThrow: msg => {
      if (typeof actual !== 'function') assert.fail('expect.toThrow requires a function argument');
      if (msg) {
        assert.throws(actual, err => {
          if (!(err instanceof Error)) return false;
          if (msg instanceof RegExp) return msg.test(err.message);
          if (typeof msg === 'function') return err instanceof msg;
          return err.message.includes(msg);
        });
      } else {
        assert.throws(actual);
      }
    },

    resolves: {
      toBe: async expected => assert.strictEqual(await actual, expected),
      toEqual: async expected => assert.deepStrictEqual(await actual, expected),
    },

    rejects: {
      toThrow: async msg => {
        if (msg) {
          await assert.rejects(actual, err => {
            if (!(err instanceof Error)) return false;
            if (msg instanceof RegExp) return msg.test(err.message);
            if (typeof msg === 'function') return err instanceof msg;
            return err.message.includes(msg);
          });
        } else {
          await assert.rejects(actual);
        }
      },
    },
  };
}

// test.each shim — iterates test cases like Jest's table-driven tests
// Cast to any so we can attach .each without TypeScript complaining about the node:test type
const testFn = /** @type {any} */ (nodeTest.test);
testFn.each = items => (name, fn) => {
  for (const item of Array.isArray(items) ? items : [items]) {
    const label =
      typeof name === 'string'
        ? name
            .replace('%s', String(item))
            .replace('%p', JSON.stringify(item))
            .replace('%i', String(item))
        : String(name);
    const args = Array.isArray(item) ? item : [item];
    nodeTest.test(label, async t => fn(...args, t));
  }
};

// describe.each shim
const describeFn = /** @type {any} */ (nodeTest.describe);
describeFn.each = items => (name, fn) => {
  for (const item of Array.isArray(items) ? items : [items]) {
    const label =
      typeof name === 'string'
        ? name.replace('%s', String(item)).replace('%p', JSON.stringify(item))
        : String(name);
    const args = Array.isArray(item) ? item : [item];
    nodeTest.describe(label, () => fn(...args));
  }
};

// Minimal jest.fn() mock for node:test — no spying, just call recording
function jestFn(impl) {
  const calls = [];
  const fn = (...args) => {
    calls.push(args);
    return impl ? impl(...args) : undefined;
  };
  fn.mock = { calls };
  fn.mockReturnValue = val => {
    impl = () => val;
    return fn;
  };
  fn.mockImplementation = newImpl => {
    impl = newImpl;
    return fn;
  };
  fn.mockClear = () => {
    calls.length = 0;
  };
  fn.mockRestore = () => {};
  return fn;
}

module.exports = {
  // node:test primitives (with .each shims)
  describe: describeFn,
  it: nodeTest.it,
  test: testFn,
  before: nodeTest.before,
  after: nodeTest.after,
  beforeEach: nodeTest.beforeEach,
  afterEach: nodeTest.afterEach,
  // Jest aliases
  afterAll: nodeTest.after,
  beforeAll: nodeTest.before,
  // jest-compat expect
  expect: buildExpect,
  // jest mock utilities
  jest: {
    fn: jestFn,
    spyOn: (obj, method) => {
      const original = obj[method];
      const mock = jestFn(original);
      obj[method] = mock;
      mock.mockRestore = () => {
        obj[method] = original;
      };
      return mock;
    },
  },
};
