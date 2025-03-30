/**
 * @fileoverview Test System
 * 
 * A system that manages test registration and execution.
 * Provides integration with DevTools when available.
 * 
 * @module TestSystem
 * @requires System from '../core/system.js'
 */
import { System } from '../core/system.js';

/**
 * System that manages tests for the portfolio engine
 */
class TestSystem extends System {
  /**
   * Create a new TestSystem
   */
  constructor() {
    super();
    this.suites = {};
    this.enabled = false;
    this.testCollector = null;
    this.devTools = null;
  }

  /**
   * Initialize the test system
   * @param {World} world - The ECS world instance
   * @param {Object} config - Configuration options
   */
  init(world, config = {}) {
    super.init(world, config);
    
    // Register with scheduler if available
    if (this.world.getScheduler) {
      const scheduler = this.world.getScheduler();
      const normalGroup = scheduler.getGroup('normal') || scheduler.createGroup('normal', 0);
      normalGroup.addSystem(this);
    }
    
    // Try to connect to DevTools if needed
    if (config.connectToDevTools !== false) {
      this._connectToDevTools().catch(error => {
        console.warn('TestSystem: Failed to connect to DevTools:', error);
        // Continue despite failure - DevTools is optional
      });
    }
    
    console.info('TestSystem: Initialized');
    return this;
  }

  /**
   * Register a test suite
   * @param {string} name - Suite name
   * @param {Object} tests - Test definitions
   */
  registerSuite(name, tests) {
    const suite = {
      name,
      tests: [],
      beforeAll: tests.beforeAll || null,
      afterAll: tests.afterAll || null,
      beforeEach: tests.beforeEach || null,
      afterEach: tests.afterEach || null
    };

    // Convert test functions to proper format
    if (tests.tests) {
      for (const [testName, testFn] of Object.entries(tests.tests)) {
        suite.tests.push({
          name: testName,
          fn: testFn
        });
      }
    }

    this.suites[name] = suite;
    
    // Register with DevTools if available
    if (this.testCollector) {
      this.testCollector.registerTestSuite(name, suite);
    }

    return suite;
  }

  /**
   * Run a specific test suite
   * @param {string} suiteName - Name of suite to run
   * @returns {Promise<Object>} Test results
   */
  async runSuite(suiteName) {
    const suite = this.suites[suiteName];
    if (!suite) {
      console.warn(`TestSystem: Suite "${suiteName}" not found`);
      return { error: `Suite "${suiteName}" not found` };
    }

    console.log(`TestSystem: Running suite "${suiteName}"`);

    // Use DevTools collector if available, otherwise run manually
    if (this.testCollector && typeof this.testCollector.runSuite === 'function') {
      return this.testCollector.runSuite(suiteName);
    }
    
    return this._runSuiteManually(suite);
  }

  /**
   * Run all registered test suites
   * @returns {Promise<Object>} Test results by suite
   */
  async runAllSuites() {
    const results = {};
    for (const suiteName of Object.keys(this.suites)) {
      results[suiteName] = await this.runSuite(suiteName);
    }
    return results;
  }

  /**
   * Run a test suite manually (without DevTools)
   * @param {Object} suite - Test suite to run
   * @returns {Promise<Object>} Test results
   * @private
   */
  async _runSuiteManually(suite) {
    console.log(`Running test suite: ${suite.name}`);
    
    const results = {
      name: suite.name,
      tests: [],
      passed: 0,
      total: suite.tests.length
    };

    // Run setup if available
    if (typeof suite.beforeAll === 'function') {
      await suite.beforeAll();
    }

    // Run each test
    for (const test of suite.tests) {
      console.log(`  Running test: ${test.name}`);
      
      const result = { name: test.name, passed: false, error: null };
      
      try {
        // Run before each if available
        if (typeof suite.beforeEach === 'function') {
          await suite.beforeEach();
        }
        
        // Run the actual test
        await test.fn();
        result.passed = true;
        results.passed++;
        
        // Run after each if available
        if (typeof suite.afterEach === 'function') {
          await suite.afterEach();
        }
      } catch (error) {
        result.error = error.message || String(error);
        console.error(`  Test failed: ${test.name}`, error);
        
        // Still run afterEach even if test fails
        if (typeof suite.afterEach === 'function') {
          try {
            await suite.afterEach();
          } catch (cleanupError) {
            console.error(`  Error in afterEach:`, cleanupError);
          }
        }
      }
      
      results.tests.push(result);
    }

    // Run teardown if available
    if (typeof suite.afterAll === 'function') {
      await suite.afterAll();
    }

    console.log(`Test suite complete: ${results.passed}/${results.total} tests passed`);
    return results;
  }

  /**
   * Connect to DevTools if available
   * @private
   */
  async _connectToDevTools() {
    try {
      // First try the window.DevTools global
      if (window.DevTools) {
        this.devTools = window.DevTools;
        console.info('TestSystem: Found DevTools in global scope');
      } else {
        // Try to import DevTools dynamically
        try {
          const devToolsModule = await import('../../modules/dev-tools/index.js');
          this.devTools = devToolsModule.DevTools;
          console.info('TestSystem: Imported DevTools module');
        } catch (e) {
          console.warn('TestSystem: Could not import DevTools:', e);
          return;
        }
      }

      // Wait for DevTools to be initialized
      if (this.devTools) {
        // Check if DevTools needs initialization
        if (typeof this.devTools.isInitialized === 'function' ? 
            !this.devTools.isInitialized() : 
            !this.devTools._initialized) {
          
          console.info('TestSystem: Initializing DevTools');
          try {
            await this.devTools.init(this.world, {
              enabled: true,
              defaultCollectors: ['test']
            }).catch(err => {
              console.warn('TestSystem: Error during DevTools initialization:', err);
              // Continue execution despite error
            });
          } catch (e) {
            console.warn('TestSystem: Failed to initialize DevTools:', e);
            // Continue despite error
          }
        }

        // Now try to get the test collector
        try {
          console.info('TestSystem: Getting test collector from DevTools');
          this.testCollector = this.devTools.getCollector('test');
          
          if (!this.testCollector) {
            console.warn('TestSystem: No test collector found in DevTools');
          } else {
            // Register existing test suites with collector
            console.info(`TestSystem: Registering ${Object.keys(this.suites).length} suites with test collector`);
            for (const [name, suite] of Object.entries(this.suites)) {
              this.testCollector.registerTestSuite(name, suite);
            }
            
            console.info('TestSystem: Connected to DevTools successfully');
            this.enabled = true;
          }
        } catch (e) {
          console.warn('TestSystem: Error accessing test collector:', e);
        }
      }
    } catch (error) {
      console.warn('TestSystem: Could not connect to DevTools:', error);
    }
  }

  /**
   * Update method (required for ECS system)
   * @param {number} dt - Time elapsed since last update
   */
  update(dt) {
    // Nothing to do on regular update
  }
}

export { TestSystem };
