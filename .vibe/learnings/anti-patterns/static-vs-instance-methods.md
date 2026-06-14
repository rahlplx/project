# Anti-Pattern: Static vs Instance Method Confusion

## Symptom
Methods designed as static are called with `this.` context, causing runtime errors or undefined `this` references.

## Root Cause
Inconsistent mental model about whether a method belongs to the class (static) or an instance. TypeScript/JavaScript allows both but mixing causes confusion.

## How vibe-stack Should Catch It
1. **Method design decision** - At implementation time, ask: "Does this method need instance state?"
   - No → make it static
   - Yes → make it instance method
2. **Consistent calling convention** - Static methods called as `ClassName.method()`, instance as `this.method()`
3. **Test validation** - Tests should call methods the same way production code does

## Example
```javascript
// BAD - designed as static but called with this
class TokenOptimizer {
  static wrapResult(result) { return { content: [{ type: 'text', text: JSON.stringify(result) }] }; }
}
// Caller: this.wrapResult(data) ← WRONG

// GOOD - consistent static calls
class TokenOptimizer {
  static wrapResult(result) { return { content: [{ type: 'text', text: JSON.stringify(result) }] }; }
}
// Caller: TokenOptimizer.wrapResult(data) ← CORRECT
```

## Incident
vibe-stack, 2026-06-14: TokenOptimizer.wrapResult/wrapError designed as static but initially called with `this.` in MCPAdapter. Fixed to static calls.

## Prevention
- Document static vs instance convention in coding standards
- ESLint rule `class-methods-use-this` can flag instance methods that don't use `this`
- Tests should verify calling convention matches design
