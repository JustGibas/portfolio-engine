/**
 * @fileoverview Test Integration Example
 * 
 * This module demonstrates how to integrate existing tests with the new TestSystem.
 * 
 * @module tests/test-integration
 */
import { TestSystem } from '../engine/systems/TestSystem.js';
import { createTestSuiteFromRunner } from './adapter.js';

/**
 * Initialize the test system and register it with the ECS world
 * @param {Object} world - ECS world instance
 * @returns {TestSystem} The test system instance
 */
export function initializeTestSystem(world) {
  const testSystem = new TestSystem();
  testSystem.init(world);
  world.registerSystem(testSystem);
  return testSystem;
}

/**
 * Register existing theme selector tests with the test system
 * @param {TestSystem} testSystem - TestSystem instance
 */
export async function registerThemeSelectorTests(testSystem) {
  // Import the test file
  const themeTests = await import('./modules/theme-selector/theme-selector.test.js');
  
  // Get the testRunner and assert objects
  const { testRunner, assert } = themeTests;
  
  // Create a test suite from the test runner
  const suite = createTestSuiteFromRunner(testRunner, assert);
  
  // Register the suite with the test system
  testSystem.registerSuite('ThemeSelector', {
    tests: suite.tests,
    beforeEach: suite.beforeEach,
    afterEach: suite.afterEach
  });
}

/**
 * Add a UI button to run tests
 * @param {TestSystem} testSystem - TestSystem instance
 */
export function addTestRunButton(testSystem) {
  // Create a button in the UI to run tests
  const button = document.createElement('button');
  button.textContent = 'Run Tests';
  button.style.position = 'fixed';
  button.style.bottom = '10px';
  button.style.right = '10px';
  button.style.zIndex = '1000';
  button.style.padding = '8px 12px';
  button.style.backgroundColor = '#4CAF50';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  
  button.onclick = () => {
    testSystem.runAllTests().then(results => {
      console.log('Test results:', results);
    });
  };
  
  document.body.appendChild(button);
}
