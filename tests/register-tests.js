/**
 * @fileoverview Test Registration Module
 * 
 * This module registers all test suites with the test system.
 * It discovers and loads test files from the project.
 * 
 * @module tests/register-tests
 */
import testConfig from './test-config.js';

/**
 * Register all tests with the test system
 * @param {Object} world - ECS world instance 
 */
export async function registerAllTests(world) {
  console.info('Registering tests...');
  
  try {
    // Make sure test config is applied early - disable auto-run
    console.info('Using test configuration with autoRunTests:', testConfig.autoRunTests);
    
    // Create the test system if it doesn't exist
    let testSystem = world.systems.find(system => system.name === 'TestSystem');
    
    if (!testSystem) {
      const { TestSystem } = await import('../engine/systems/TestSystem.js');
      testSystem = new TestSystem();
      testSystem.init(world);
      world.registerSystem(testSystem);
      console.info('TestSystem created and registered with the world');
    }
    
    // Register test suites but don't run them automatically
    const testModules = await discoverTestModules();
    
    for (const testModule of testModules) {
      try {
        const module = await import(testModule.path);
        if (module._tests) {
          testSystem.registerSuite(testModule.name, module._tests);
        }
      } catch (error) {
        console.warn(`Failed to load test module ${testModule.name}:`, error);
      }
    }
    
    // Only run tests automatically if configured to do so
    if (testConfig.autoRunTests) {
      console.info('Auto-running tests based on configuration...');
      await testSystem.runAllTests();
    } else {
      console.info('Automatic test execution disabled. Use DevTools to run tests.');
    }
    
  } catch (error) {
    console.error('Error registering tests:', error);
  }
}

/**
 * Discover test modules in the project
 * @returns {Promise<Array>} Array of test module metadata
 */
async function discoverTestModules() {
  // This is just a placeholder - in a real implementation,
  // this would scan the filesystem for test files
  return [
    {
      name: 'ThemeSelector',
      path: '../modules/theme-selector/theme-selector.test.js'
    },
    // Add other test modules here
  ];
}
