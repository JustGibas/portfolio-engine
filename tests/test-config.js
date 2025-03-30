/**
 * Test Configuration
 * 
 * This file configures test behavior for the Portfolio Engine.
 */

const testConfig = {
  /**
   * Whether tests should run automatically on application startup
   */
  autoRunTests: false,
  
  /**
   * Test suites to include when running all tests
   * Leave empty to include all discovered tests
   */
  includeSuites: [],
  
  /**
   * Test suites to exclude when running all tests
   */
  excludeSuites: [],
  
  /**
   * Logging level for tests
   * - 0: No logging
   * - 1: Basic logging (failures only)
   * - 2: Detailed logging (all tests)
   * - 3: Debug logging (all tests plus internal steps)
   */
  logLevel: 1
};

export default testConfig;
