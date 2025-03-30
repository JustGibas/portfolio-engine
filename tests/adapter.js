/**
 * @fileoverview Test Adapter
 * 
 * This module provides an adapter to convert tests from the old format
 * to the new format for the TestSystem and TestCollector.
 * 
 * @module tests/adapter
 */

/**
 * Convert a test runner to a test suite for the test system
 * @param {Object} testRunner - The old test runner
 * @param {Object} assert - Assertion library
 * @returns {Object} Test suite compatible with the test system
 */
export function adaptTestRunner(testRunner, assert) {
  // Create a new test suite
  const suite = {
    name: 'Converted Tests',
    tests: [],
    beforeAll: null,
    afterAll: null,
    beforeEach: testRunner.beforeEach ? testRunner.beforeEach._fn : null,
    afterEach: testRunner.afterEach ? testRunner.afterEach._fn : null
  };
  
  // Convert tests
  if (testRunner._tests) {
    testRunner._tests.forEach(test => {
      suite.tests.push({
        name: test.name,
        fn: test.fn
      });
    });
  }
  
  return suite;
}

/**
 * Import and convert existing test files to the new format
 * @param {Object} testSystem - TestSystem instance
 * @param {string} path - Path to test file
 * @returns {Promise<Object>} - Registered test suite
 */
export async function importTestFile(testSystem, path) {
  try {
    // Dynamic import the test file
    const module = await import(path);
    
    // Check if the file has a testRunner
    if (module.testRunner) {
      const suite = adaptTestRunner(module.testRunner);
      return testSystem.registerSuite(path.split('/').pop(), suite);
    }
    
    console.warn(`Test file ${path} does not export a testRunner`);
    return null;
  } catch (error) {
    console.error(`Failed to import test file ${path}:`, error);
    return null;
  }
}

/**
 * Create a test suite from a theme-selector style test runner
 * @param {Object} testRunner - The test runner object
 * @param {Object} assert - The assertion object
 * @returns {Object} A test suite compatible with TestSystem
 */
export function createTestSuiteFromRunner(testRunner, assert) {
  const suite = {
    tests: [],
    beforeAll: null,
    afterAll: null,
    beforeEach: null,
    afterEach: null
  };
  
  // Extract beforeEach/afterEach functions if they exist
  if (typeof testRunner.beforeEach === 'function') {
    suite.beforeEach = testRunner.beforeEach;
  }
  
  if (typeof testRunner.afterEach === 'function') {
    suite.afterEach = testRunner.afterEach;
  }
  
  // Extract tests from the test runner
  // Assuming the testRunner has a tests array
  const tests = testRunner.tests || [];
  tests.forEach(test => {
    suite.tests.push({
      name: test.name,
      fn: test.fn
    });
  });
  
  return suite;
}
