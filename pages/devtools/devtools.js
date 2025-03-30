/**
 * @fileoverview DevTools Page
 * 
 * Main DevTools page that provides debugging tools and system information.
 * Accessible via the #devtools route.
 */
import { cssLoader } from '../../engine/utils/css-loader.js';
import config from '../../config.js';
import { devToolsManager } from '../../modules/dev-tools/dev-tools-manager.js';

const devtools = {
  // Content data for the DevTools page
  content: {
    title: "Developer Tools",
    description: "System debugging and development tools"
  },
  
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
