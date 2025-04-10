/**
 * @fileoverview DevTools Page
 * 
 * Main DevTools page that provides debugging tools and system information.
 * Accessible via the #devtools route.
 */
import { cssLoader } from '../../engine/modules/css-loader.js';
import config from '../../OLD/config.js';
import { devToolsManager } from '../../engine/modules/dev-tools/dev-tools.js';

const devtools = {
  // Content data for the DevTools page
  content: {
    title: "Developer Tools",
    description: "System debugging and development tools"
  },
  
  // Active tests
  tests: [],
  
  /**
   * Initialize the DevTools page
   * @param {Object} entity - The entity representing this page
   */
  async init(entity) {
    this.entity = entity;
    this.ecs = entity.ecs;
    
    // Load CSS specific to this module
    try {
      await cssLoader.loadLocalCSS(import.meta.url);
    } catch (error) {
      console.warn('Failed to load DevTools page CSS:', error);
    }
    
    // Get the container from the entity
    const container = entity.getComponent('dom')?.container;
    if (!container) {
      console.error('DevTools container not found');
      return this;
    }
    
    // Initialize the devtools manager if it hasn't been yet
    await devToolsManager.init(this.ecs);
    
    // Render the DevTools page
    this.render(container);
    
    return this;
  },
  
  /**
   * Render the DevTools page
   * @param {HTMLElement} container - The container to render into
   */
  render(container) {
    if (!container) return;
    
    container.innerHTML = `
      <div class="devtools-page">
        <h2 class="page-title">${this.content.title}</h2>
        <p class="page-description">${this.content.description}</p>
        
        <div class="devtools-tabs">
          <button class="tab-button active" data-tab="system">System</button>
          <button class="tab-button" data-tab="entities">Entities</button>
          <button class="tab-button" data-tab="components">Components</button>
          <button class="tab-button" data-tab="events">Events</button>
          <button class="tab-button" data-tab="console">Console</button>
          <button class="tab-button" data-tab="tests">Tests</button>
        </div>
        
        <div class="devtools-tab-content">
          <div class="tab-panel active" id="system-panel">
            <h3>System Information</h3>
            <div class="info-card">
              <div class="info-item">
                <span class="info-label">Environment:</span>
                <span class="info-value">${config.environment}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Debug Mode:</span>
                <span class="info-value">${config.advanced.debug ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">System Refresh Rate:</span>
                <span class="info-value">${config.advanced.systemRefreshRate} Hz</span>
              </div>
              <div class="info-item">
                <span class="info-label">Active Systems:</span>
                <span class="info-value" id="active-systems-count">Loading...</span>
              </div>
            </div>
            
            <h3>Active Systems</h3>
            <div class="systems-list" id="systems-list">Loading systems...</div>
          </div>
          
          <div class="tab-panel" id="entities-panel">
            <h3>Entity Explorer</h3>
            <div class="search-bar">
              <input type="text" id="entity-search" placeholder="Search entities...">
              <button id="refresh-entities">Refresh</button>
            </div>
            <div class="entities-list" id="entities-list">Loading entities...</div>
          </div>
          
          <div class="tab-panel" id="components-panel">
            <h3>Component Registry</h3>
            <div class="components-list" id="components-list">Loading components...</div>
          </div>
          
          <div class="tab-panel" id="events-panel">
            <h3>Event Monitor</h3>
            <div class="events-controls">
              <button id="clear-events">Clear Events</button>
              <label><input type="checkbox" id="auto-scroll" checked> Auto-scroll</label>
            </div>
            <div class="events-log" id="events-log"></div>
          </div>
          
          <div class="tab-panel" id="console-panel">
            <h3>DevTools Console</h3>
            <div class="console-output" id="console-output"></div>
            <div class="console-input-container">
              <input type="text" id="console-input" placeholder="Enter command...">
              <button id="execute-command">Execute</button>
            </div>
          </div>
          
          <div class="tab-panel" id="tests-panel">
            <h3>Tests</h3>
            <div class="test-controls">
              <button id="run-all-tests">Run All Tests</button>
              <button id="clear-test-results">Clear Results</button>
            </div>
            <div class="test-categories">
              <div class="test-category">
                <h4>Core Systems</h4>
                <ul class="test-list" id="core-tests-list">
                  <li class="test-item">
                    <span class="test-name">ECS Availability Test</span>
                    <button class="run-test-btn" data-test="ecs-availability">Run</button>
                  </li>
                  <li class="test-item">
                    <span class="test-name">Module System Test</span>
                    <button class="run-test-btn" data-test="module-system">Run</button>
                  </li>
                  <li class="test-item">
                    <span class="test-name">Event System Test</span>
                    <button class="run-test-btn" data-test="event-system">Run</button>
                  </li>
                </ul>
              </div>
              
              <!-- Updated Core Initialization Tests Category -->
              <div class="test-category">
                <h4>Core Initialization Tests</h4>
                <ul class="test-list" id="init-tests-list">
                  <li class="test-item">
                    <span class="test-name">Scheduler Diagnostics</span>
                    <button class="run-test-btn" data-test="scheduler-diagnostics">Run</button>
                  </li>
                  <li class="test-item">
                    <span class="test-name">System Initialization Status</span>
                    <button class="run-test-btn" data-test="system-init-status">Run</button>
                  </li>
                  <li class="test-item">
                    <span class="test-name">Resource Loading Test</span>
                    <button class="run-test-btn" data-test="resource-loading-test">Run</button>
                  </li>
                </ul>
              </div>
              
              <div class="test-category">
                <h4>UI Components</h4>
                <ul class="test-list" id="ui-tests-list">
                  <li class="test-item">
                    <span class="test-name">Header Component Test</span>
                    <button class="run-test-btn" data-test="header-component">Run</button>
                  </li>
                  <li class="test-item">
                    <span class="test-name">Theme Selector Test</span>
                    <button class="run-test-btn" data-test="theme-selector">Run</button>
                  </li>
                </ul>
              </div>
            </div>
            <div class="test-results" id="test-results"></div>
          </div>
        </div>
      </div>
    `;
    
    // Set up tab navigation
    this._setupTabs(container);
    
    // Load initial data
    this._loadSystemInfo();
    this._loadEntities();
    this._loadComponents();
    
    // Set up event listeners
    this._setupEventListeners(container);
    
    // Set up test event listeners
    this._setupTestEventListeners(container);
  },
  
  /**
   * Set up tab navigation
   * @private
   * @param {HTMLElement} container - The container element
   */
  _setupTabs(container) {
    const tabButtons = container.querySelectorAll('.tab-button');
    const tabPanels = container.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        
        // Update active button
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Show active panel
        tabPanels.forEach(panel => panel.classList.remove('active'));
        container.querySelector(`#${tabName}-panel`).classList.add('active');
      });
    });
  },
  
  /**
   * Load system information
   * @private
   */
  _loadSystemInfo() {
    if (!this.ecs) return;
    
    const systemsList = document.getElementById('systems-list');
    const activeSystemsCount = document.getElementById('active-systems-count');
    
    if (systemsList && activeSystemsCount) {
      const systems = this.ecs.systems || [];
      activeSystemsCount.textContent = systems.length;
      
      let systemsHTML = '';
      systems.forEach(system => {
        const name = system.constructor?.name || 'Unknown System';
        const enabled = system.enabled !== false;
        
        systemsHTML += `
          <div class="system-item ${enabled ? 'enabled' : 'disabled'}">
            <span class="system-name">${name}</span>
            <span class="system-status">${enabled ? 'Enabled' : 'Disabled'}</span>
          </div>
        `;
      });
      
      systemsList.innerHTML = systemsHTML || 'No systems found';
    }
  },
  
  /**
   * Load entities information
   * @private
   */
  _loadEntities() {
    if (!this.ecs) return;
    
    const entitiesList = document.getElementById('entities-list');
    
    if (entitiesList) {
      const entities = Array.from(this.ecs.entities?.values() || []);
      
      if (entities.length === 0) {
        entitiesList.innerHTML = 'No entities found';
        return;
      }
      
      let entitiesHTML = '';
      entities.forEach(entity => {
        const id = entity.id || 'unknown';
        const componentTypes = Array.from(entity.componentMask || []).join(', ') || 'none';
        
        entitiesHTML += `
          <div class="entity-item" data-entity-id="${id}">
            <div class="entity-header">
              <span class="entity-id">Entity #${id}</span>
              <button class="entity-expand">+</button>
            </div>
            <div class="entity-details">
              <div class="entity-components">
                <strong>Components:</strong> ${componentTypes}
              </div>
            </div>
          </div>
        `;
      });
      
      entitiesList.innerHTML = entitiesHTML;
      
      // Add event listeners for expand/collapse
      const expandButtons = entitiesList.querySelectorAll('.entity-expand');
      expandButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const entityItem = e.target.closest('.entity-item');
          const details = entityItem.querySelector('.entity-details');
          const isExpanded = details.classList.contains('expanded');
          
          if (isExpanded) {
            details.classList.remove('expanded');
            e.target.textContent = '+';
          } else {
            details.classList.add('expanded');
            e.target.textContent = '-';
          }
        });
      });
    }
  },
  
  /**
   * Load components registry information
   * @private
   */
  _loadComponents() {
    const componentsList = document.getElementById('components-list');
    
    if (componentsList) {
      // Try to get component registry from ECS
      const registry = this.ecs?.getSystem('componentRegistry');
      
      if (!registry || !registry.componentSchemas) {
        componentsList.innerHTML = 'Component registry not available';
        return;
      }
      
      const components = Array.from(registry.componentSchemas.entries());
      
      if (components.length === 0) {
        componentsList.innerHTML = 'No components registered';
        return;
      }
      
      let componentsHTML = '';
      components.forEach(([name, schema]) => {
        componentsHTML += `
          <div class="component-item">
            <div class="component-header">
              <span class="component-name">${name}</span>
              <button class="component-expand">+</button>
            </div>
            <div class="component-details">
              <pre class="component-schema">${JSON.stringify(schema, null, 2)}</pre>
            </div>
          </div>
        `;
      });
      
      componentsList.innerHTML = componentsHTML;
      
      // Add event listeners for expand/collapse
      const expandButtons = componentsList.querySelectorAll('.component-expand');
      expandButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const componentItem = e.target.closest('.component-item');
          const details = componentItem.querySelector('.component-details');
          const isExpanded = details.classList.contains('expanded');
          
          if (isExpanded) {
            details.classList.remove('expanded');
            e.target.textContent = '+';
          } else {
            details.classList.add('expanded');
            e.target.textContent = '-';
          }
        });
      });
    }
  },
  
  /**
   * Set up event listeners
   * @private
   * @param {HTMLElement} container - The container element
   */
  _setupEventListeners(container) {
    // Entity search
    const entitySearch = container.querySelector('#entity-search');
    if (entitySearch) {
      entitySearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const entityItems = container.querySelectorAll('.entity-item');
        
        entityItems.forEach(item => {
          const entityId = item.getAttribute('data-entity-id');
          const entityComponents = item.querySelector('.entity-components').textContent.toLowerCase();
          
          if (entityId.includes(searchTerm) || entityComponents.includes(searchTerm)) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    }
    
    // Refresh entities button
    const refreshEntitiesBtn = container.querySelector('#refresh-entities');
    if (refreshEntitiesBtn) {
      refreshEntitiesBtn.addEventListener('click', () => {
        this._loadEntities();
      });
    }
    
    // Console input
    const consoleInput = container.querySelector('#console-input');
    const executeBtn = container.querySelector('#execute-command');
    const consoleOutput = container.querySelector('#console-output');
    
    if (consoleInput && executeBtn && consoleOutput) {
      const executeCommand = () => {
        const command = consoleInput.value;
        if (!command) return;
        
        // Add command to output
        const commandEl = document.createElement('div');
        commandEl.className = 'console-command';
        commandEl.textContent = '> ' + command;
        consoleOutput.appendChild(commandEl);
        
        // Try to execute command
        try {
          // Use Function constructor to evaluate in global scope
          const result = new Function('return ' + command)();
          
          // Add result to output
          const resultEl = document.createElement('div');
          resultEl.className = 'console-result';
          resultEl.textContent = result !== undefined ? JSON.stringify(result) : 'undefined';
          consoleOutput.appendChild(resultEl);
        } catch (error) {
          // Add error to output
          const errorEl = document.createElement('div');
          errorEl.className = 'console-error';
          errorEl.textContent = error.toString();
          consoleOutput.appendChild(errorEl);
        }
        
        // Clear input and scroll to bottom
        consoleInput.value = '';
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
      };
      
      executeBtn.addEventListener('click', executeCommand);
      consoleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          executeCommand();
        }
      });
    }
    
    // Clear events button
    const clearEventsBtn = container.querySelector('#clear-events');
    const eventsLog = container.querySelector('#events-log');
    if (clearEventsBtn && eventsLog) {
      clearEventsBtn.addEventListener('click', () => {
        eventsLog.innerHTML = '';
      });
    }
  },
  
  /**
   * Set up test event listeners
   * @private
   * @param {HTMLElement} container - The container element
   */
  _setupTestEventListeners(container) {
    // Run all tests button
    const runAllTestsBtn = container.querySelector('#run-all-tests');
    if (runAllTestsBtn) {
      runAllTestsBtn.addEventListener('click', () => {
        this._runAllTests();
      });
    }
    
    // Clear test results button
    const clearTestResultsBtn = container.querySelector('#clear-test-results');
    if (clearTestResultsBtn) {
      clearTestResultsBtn.addEventListener('click', () => {
        const testResults = container.querySelector('#test-results');
        if (testResults) testResults.innerHTML = '';
      });
    }
    
    // Individual test buttons
    const runTestBtns = container.querySelectorAll('.run-test-btn');
    runTestBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const testName = e.target.getAttribute('data-test');
        this._runTest(testName);
      });
    });
  },
  
  /**
   * Run all tests
   * @private
   */
  _runAllTests() {
    const testButtons = document.querySelectorAll('.run-test-btn');
    testButtons.forEach(btn => {
      const testName = btn.getAttribute('data-test');
      this._runTest(testName);
    });
  },
  
  /**
   * Run a specific test
   * @private
   * @param {string} testName - The name of the test to run
   */
  _runTest(testName) {
    const testResults = document.getElementById('test-results');
    if (!testResults) return;
    
    const timestamp = new Date().toLocaleTimeString();
    
    // Define test cases
    const tests = {
      'ecs-availability': () => {
        if (!this.ecs) throw new Error('ECS is not available');
        
        // Check basic ECS functionality
        const entityCount = this.ecs.entities.size;
        const systemCount = this.ecs.systems.length;
        
        return {
          success: true,
          message: `ECS is available with ${entityCount} entities and ${systemCount} systems`
        };
      },
      
      'module-system': () => {
        const moduleSystem = this.ecs.getSystem('module');
        if (!moduleSystem) throw new Error('Module system not found');
        
        // Test loading a simple module
        const testModuleName = 'test-module';
        const testModule = { name: testModuleName, init: () => {} };
        
        moduleSystem.register(testModuleName, testModule);
        const loadedModule = moduleSystem.get(testModuleName);
        
        if (!loadedModule) throw new Error('Failed to retrieve registered module');
        
        return {
          success: true,
          message: 'Module System is functioning correctly'
        };
      },
      
      'event-system': () => {
        const eventSystem = this.ecs.getSystem('event');
        if (!eventSystem) throw new Error('Event system not found');
        
        // Test firing an event
        let eventFired = false;
        const testHandler = () => { eventFired = true; };
        
        eventSystem.on('test-event', testHandler);
        eventSystem.emit('test-event', { test: true });
        eventSystem.off('test-event', testHandler);
        
        if (!eventFired) throw new Error('Event was not received by handler');
        
        return {
          success: true,
          message: 'Event System is functioning correctly'
        };
      },
      
      'header-component': () => {
        const headerElement = document.querySelector('header');
        if (!headerElement) throw new Error('Header element not found in DOM');
        
        // Check for essential header elements
        const navContainer = headerElement.querySelector('[id*="nav"]');
        if (!navContainer) throw new Error('Navigation container not found in header');
        
        return {
          success: true,
          message: 'Header component is present and contains navigation'
        };
      },
      
      'theme-selector': () => {
        // Check if theme related functions exist
        if (typeof document.documentElement.getAttribute('data-theme') !== 'string') {
          throw new Error('Theme attribute not found on document element');
        }
        
        // Test theme change
        const originalTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = originalTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        const changedTheme = document.documentElement.getAttribute('data-theme');
        
        // Restore original theme
        document.documentElement.setAttribute('data-theme', originalTheme);
        
        if (changedTheme !== newTheme) throw new Error('Theme change failed');
        
        return {
          success: true,
          message: `Theme selector functionality working. Current theme: ${originalTheme}`
        };
      },
      
      // Updated tests for core initialization
      'scheduler-diagnostics': () => {
        // Deep inspection of scheduler
        if (!this.ecs) throw new Error('ECS is not available');
        
        const result = {
          hasScheduler: !!this.ecs.scheduler,
          schedulerMethods: this.ecs.scheduler ? Object.keys(this.ecs.scheduler) : [],
          hasGetGroup: this.ecs.scheduler ? typeof this.ecs.scheduler.getGroup === 'function' : false,
          prototype: this.ecs.scheduler ? Object.getPrototypeOf(this.ecs.scheduler) : null
        };
        
        // Format the message
        const message = `
Scheduler Diagnostics:
- Scheduler exists: ${result.hasScheduler}
- getGroup method exists: ${result.hasGetGroup}
- Available methods: ${result.schedulerMethods.join(', ')}
- Missing getGroup may cause ErrorSystem and EventSystem init failures
`;
        
        return {
          success: result.hasScheduler,
          message: message
        };
      },
      
      'system-init-status': () => {
        if (!this.ecs) throw new Error('ECS is not available');
        
        // Get more detailed system status
        const systems = Array.isArray(this.ecs.systems) ? this.ecs.systems : [];
        
        // Format each system with its status
        const systemDetails = systems.map(sys => {
          const name = sys.name || sys.constructor?.name || 'Unknown';
          const initialized = sys._initialized === true;
          const enabled = sys.enabled !== false;
          const hasInit = typeof sys.init === 'function';
          const hasUpdate = typeof sys.update === 'function';
          
          return `${name}: ${initialized ? '✅' : '❌'} initialized, ${enabled ? '✅' : '❌'} enabled, ${hasInit ? '✅' : '❌'} has init()`;
        });
        
        // Count initialized vs non-initialized
        const initializedCount = systems.filter(sys => sys._initialized === true).length;
        
        return {
          success: true,
          message: `Systems initialized: ${initializedCount}/${systems.length}\n\n${systemDetails.join('\n')}`
        };
      },
      
      'resource-loading-test': () => {
        // Test critical resource loading
        const resources = [
          { name: 'Theme Selector', path: '/engine/modules/theme-selector/theme-selector.js', required: false },
          { name: 'Layout System', path: '/engine/systems/layoutSystem.js', required: false },
          { name: 'Module Core', path: '/engine/core/module.js', required: true },
          { name: 'DevTools CSS', path: '/dev-tools.css', required: false }
        ];
        
        // Test if files exist by creating image objects (non-invasive test)
        const results = resources.map(res => {
          const fullPath = `${window.location.origin}${res.path}`;
          
          // Test if path is accessible (doesn't download the file)
          const linkEl = document.createElement('link');
          linkEl.rel = 'prefetch';
          linkEl.href = fullPath;
          
          return {
            name: res.name,
            path: res.path, 
            fullPath: fullPath,
            required: res.required
          };
        });
        
        const message = `
Resource Loading Diagnostics:
${results.map(r => `- ${r.name}: ${r.path} (${r.required ? 'Required' : 'Optional'})
  Full URL: ${r.fullPath}`).join('\n')}

Note: 404 errors for theme-selector.js and layoutSystem.js in console indicate missing files.
`;
        
        return {
          success: true,
          message: message
        };
      }
    };
    
    // Run the selected test
    try {
      if (!tests[testName]) throw new Error(`Test '${testName}' not found`);
      
      const result = tests[testName]();
      
      testResults.innerHTML += `
        <div class="test-result success">
          <div class="test-result-header">
            <span class="test-result-name">${testName}</span>
            <span class="test-result-time">${timestamp}</span>
          </div>
          <div class="test-result-message">${result.message}</div>
        </div>
      `;
    } catch (error) {
      testResults.innerHTML += `
        <div class="test-result failure">
          <div class="test-result-header">
            <span class="test-result-name">${testName}</span>
            <span class="test-result-time">${timestamp}</span>
          </div>
          <div class="test-result-message">${error.message}</div>
        </div>
      `;
    }
    
    // Scroll to the latest result
    testResults.scrollTop = testResults.scrollHeight;
  },
  
  // Lifecycle methods
  mount() {
    // Register for system events
    if (this.ecs) {
      const eventSystem = this.ecs.getSystem('event');
      if (eventSystem) {
        this.eventListener = (data) => this._logEvent(data);
        eventSystem.on('*', this.eventListener);
      }
    }
    
    console.info('DevTools page mounted');
  },
  
  unmount() {
    // Unregister from system events
    if (this.ecs) {
      const eventSystem = this.ecs.getSystem('event');
      if (eventSystem && this.eventListener) {
        eventSystem.off('*', this.eventListener);
      }
    }
    
    console.info('DevTools page unmounted');
  },
  
  /**
   * Log an event to the events panel
   * @private
   * @param {Object} eventData - The event data
   */
  _logEvent(eventData) {
    const eventsLog = document.getElementById('events-log');
    const autoScroll = document.getElementById('auto-scroll');
    
    if (eventsLog) {
      const eventEl = document.createElement('div');
      eventEl.className = 'event-item';
      
      const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);
      const eventType = eventData.type || 'unknown';
      
      eventEl.innerHTML = `
        <span class="event-timestamp">${timestamp}</span>
        <span class="event-type">${eventType}</span>
        <pre class="event-data">${JSON.stringify(eventData, null, 2)}</pre>
      `;
      
      eventsLog.appendChild(eventEl);
      
      // Auto-scroll if enabled
      if (autoScroll && autoScroll.checked) {
        eventsLog.scrollTop = eventsLog.scrollHeight;
      }
    }
  }
};

export { devtools };
