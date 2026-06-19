const { describe, test, expect } = require('../jest-compat');

const { UTILITY_CATALOG, getUtilitiesByCategory, getUtilityByName } = require('./utility-catalog');

describe('utility catalog', () => {
  test('UTILITY_CATALOG has required categories', () => {
    expect(UTILITY_CATALOG).toHaveProperty('auth');
    expect(UTILITY_CATALOG).toHaveProperty('api');
    expect(UTILITY_CATALOG).toHaveProperty('ui');
    expect(UTILITY_CATALOG).toHaveProperty('billing');
    expect(UTILITY_CATALOG).toHaveProperty('permissions');
  });

  test('each category has repos array', () => {
    Object.values(UTILITY_CATALOG).forEach(category => {
      expect(Array.isArray(category.repos)).toBe(true);
      expect(category.repos.length).toBeGreaterThan(0);
    });
  });

  test('each repo has required fields', () => {
    Object.values(UTILITY_CATALOG).forEach(category => {
      category.repos.forEach(repo => {
        expect(repo).toHaveProperty('name');
        expect(repo).toHaveProperty('url');
        expect(repo).toHaveProperty('stars');
        expect(repo).toHaveProperty('license');
        expect(repo).toHaveProperty('description');
      });
    });
  });

  test('getUtilitiesByCategory returns repos for valid category', () => {
    const authUtils = getUtilitiesByCategory('auth');
    expect(Array.isArray(authUtils)).toBe(true);
    expect(authUtils.length).toBeGreaterThan(0);
  });

  test('getUtilitiesByCategory returns empty for invalid category', () => {
    const invalid = getUtilitiesByCategory('invalid');
    expect(Array.isArray(invalid)).toBe(true);
    expect(invalid.length).toBe(0);
  });

  test('getUtilityByName finds a utility', () => {
    const result = getUtilityByName('NextAuth.js');
    expect(result).toBeDefined();
    expect(result.name).toBe('NextAuth.js');
  });

  test('getUtilityByName returns null for not found', () => {
    const result = getUtilityByName('NonExistent');
    expect(result).toBeNull();
  });

  test('auth category has at least 7 repos', () => {
    expect(UTILITY_CATALOG.auth.repos.length).toBeGreaterThanOrEqual(7);
  });

  test('api category has at least 7 repos', () => {
    expect(UTILITY_CATALOG.api.repos.length).toBeGreaterThanOrEqual(7);
  });

  test('ui category has at least 7 repos', () => {
    expect(UTILITY_CATALOG.ui.repos.length).toBeGreaterThanOrEqual(7);
  });

  test('billing category has at least 7 repos', () => {
    expect(UTILITY_CATALOG.billing.repos.length).toBeGreaterThanOrEqual(7);
  });

  test('permissions category has at least 7 repos', () => {
    expect(UTILITY_CATALOG.permissions.repos.length).toBeGreaterThanOrEqual(7);
  });
});
