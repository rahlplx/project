class SkillBase {
  constructor() {
    if (this.constructor === SkillBase) {
      throw new Error('SkillBase is abstract - extend it');
    }
    this._generateAsyncMethods();
  }

  _generateAsyncMethods() {
    const proto = Object.getPrototypeOf(this);
    const methodNames = Object.getOwnPropertyNames(proto);

    for (const name of methodNames) {
      if (name.endsWith('Sync') && typeof this[name] === 'function') {
        const asyncName = name.replace(/Sync$/, 'Async');
        if (!this[asyncName]) {
          const syncFn = this[name];
          this[asyncName] = function (...args) {
            return Promise.resolve(syncFn.apply(this, args));
          };
        }
      }
    }
  }

  get methods() {
    const methods = [];
    const proto = Object.getPrototypeOf(this);
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (name !== 'constructor' && typeof this[name] === 'function') {
        methods.push(name);
      }
    }
    for (const name of Object.getOwnPropertyNames(this)) {
      if (typeof this[name] === 'function' && !methods.includes(name)) {
        methods.push(name);
      }
    }
    return methods;
  }
}

module.exports = { SkillBase };