// Basic Test Runner
const testRunner = (() => {
  const tests = [];
  let beforeEachFn = null;
  let afterEachFn = null;
  
  return {
    addTest(name, fn) {
      tests.push({ name, fn });
    },
    
    // Add test grouping feature
    describe(groupName, testDefinitions) {
      const originalTestsLength = tests.length;
      testDefinitions();
      // Prefix all newly added tests with the group name
      for (let i = originalTestsLength; i < tests.length; i++) {
        tests[i].name = `${groupName}: ${tests[i].name}`;
      }
    },
    
    // Add setup/teardown hooks
    beforeEach(fn) {
      beforeEachFn = fn;
    },
    
    afterEach(fn) {
      afterEachFn = fn;
    },
    
    run() {
      console.log('Running Tests...');
      let passed = 0;
      tests.forEach(({ name, fn }) => {
        try {
          // Run setup if defined
          if (beforeEachFn) beforeEachFn();
          
          // Run the actual test
          fn();
          
          console.log(`✅ ${name}`);
          passed++;
        } catch (error) {
          console.error(`❌ ${name}`);
          console.error(error.message);
        } finally {
          // Run teardown if defined
          if (afterEachFn) afterEachFn();
        }
      });
      console.log(`${passed}/${tests.length} tests passed.`);
    }
  };
})();

// Assertion Library
const assert = {
  equal(actual, expected, message = 'Values are not equal') {
    if (actual !== expected) {
      throw new Error(`${message}: Expected ${expected}, but got ${actual}`);
    }
  },
  
  true(value, message = 'Value is not true') {
    if (!value) {
      throw new Error(`${message}: Expected true, but got ${value}`);
    }
  },
  
  false(value, message = 'Value is not false') {
    if (value) {
      throw new Error(`${message}: Expected false, but got ${value}`);
    }
  },
  
  // Add more assertion types
  notEqual(actual, expected, message = 'Values should not be equal') {
    if (actual === expected) {
      throw new Error(`${message}: ${actual} should not equal ${expected}`);
    }
  },
  
  defined(value, message = 'Value is undefined') {
    if (value === undefined) {
      throw new Error(message);
    }
  }
};

// Example of using enhanced test runner features
// Demo for ThemeSelector module tests
testRunner.beforeEach(() => {
  // Setup code that runs before each test
  console.log('Setting up test...');
  // You could reset mocks or create fresh instances here
});

testRunner.describe('ThemeSelector', () => {
  testRunner.addTest('initializes with default theme', () => {
    const selector = new StandaloneThemeSelector({ currentTheme: 'light' });
    assert.equal(selector.currentTheme, 'light', 'Default theme should be light');
  });

  testRunner.addTest('changes theme correctly', () => {
    const selector = new StandaloneThemeSelector({ currentTheme: 'light' });
    selector._changeTheme('dark');
    assert.equal(selector.currentTheme, 'dark', 'Theme should change to dark');
  });

  testRunner.addTest('does not change to the same theme', () => {
    const selector = new StandaloneThemeSelector({ currentTheme: 'light' });
    selector._changeTheme('light');
    assert.equal(selector.currentTheme, 'light', 'Theme should remain light');
  });
});

// Run Tests
testRunner.run();
