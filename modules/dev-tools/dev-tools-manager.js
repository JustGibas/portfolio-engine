/**
 * @fileoverview DevTools Manager
 * 
 * Manages DevTools functionality and provides a consistent API
 * for the DevTools page and overlay panel.
 */
import { cssLoader } from '../../engine/utils/css-loader.js';
import config from '../../config.js';

/**
 * DevTools Manager
 * Coordinates DevTools functionality and manages the DevTools overlay panel
 */
class DevToolsManager {
  constructor() {
    this.initialized = false;
    this.enabled = false;
    this.ecs = null;
    this.overlay = null;
    this.eventListeners = [];
    
    // Console history
    this.consoleHistory = {
      commands: [],
      position: -1,
      maxSize: 50
    };
    
    // Event log
    this.eventLog = [];
    this.maxEventLogSize = 200;
    
    // Tracked entities
    this.trackedEntities = new Set();
    
    // DevTools panels state
    this.panels = {
      entityExplorer: { visible: false },
      console: { visible: false },
      eventMonitor: { visible: false }
    };
  }
  
  /**
   * Initialize the DevTools Manager
   * @param {Object} ecs - The ECS instance
   */
  async init(ecs) {
    if (this.initialized) return this;
    
    this.ecs = ecs;
    
    try {
      // Load CSS for overlay panel
      await cssLoader.load('./modules/dev-tools/dev-tools.css');
      
      // Create DevTools overlay container if it doesn't exist
      await this._createOverlay();
      
      // Connect to event system
      await this._connectToEventSystem();
      
      // Set initialized flag
      this.initialized = true;
      
      // Check if DevTools should be enabled by default
      if (localStorage.getItem('devMode') === 'true' || (config.environment === 'development' && config.advanced?.debug)) {
        this.enable();
      }
      
      console.info('DevTools Manager initialized');
      return this;
    } catch (error) {
      console.error('Failed to initialize DevTools Manager:', error);
      return this;
    }
  }
  
  /**
   * Enable DevTools
   */
  enable() {
    if (!this.initialized) return false;
    
    this.enabled = true;
    this._updateOverlayVisibility();
    
    // Register for events if not already registered
    this._connectToEventSystem();
    
    console.info('DevTools enabled');
    return true;
  }
  
  /**
   * Disable DevTools
   */
  disable() {
    if (!this.initialized) return false;
    
    this.enabled = false;
    this._updateOverlayVisibility();
    
    // Disconnect event listeners
    this._disconnectFromEventSystem();
    
    console.info('DevTools disabled');
    return true;
  }
  
  /**
   * Toggle DevTools enabled state
   */
  toggle() {
    return this.enabled ? this.disable() : this.enable();
  }
  
  /**
   * Show a specific DevTools panel
   * @param {string} panelName - Name of the panel to show
   */
  showPanel(panelName) {
    if (!this.panels[panelName]) return false;
    
    // Enable DevTools if not already enabled
    if (!this.enabled) this.enable();
    
    // Show the specified panel
    this.panels[panelName].visible = true;
    this._updatePanels();
    
    return true;
  }
  
  /**
   * Hide a specific DevTools panel
   * @param {string} panelName - Name of the panel to hide
   */
  hidePanel(panelName) {
    if (!this.panels[panelName]) return false;
    
    // Hide the specified panel
    this.panels[panelName].visible = false;
    this._updatePanels();
    
    return true;
  }
  
  /**
   * Log an event
   * @param {Object} eventData - Event data
   */
  logEvent(eventData) {
    if (!this.initialized || !this.enabled) return;
    
    const event = {
      timestamp: new Date(),
      ...eventData
    };
    
    this.eventLog.push(event);
    
    // Trim event log if it gets too large
    if (this.eventLog.length > this.maxEventLogSize) {
      this.eventLog.shift();
    }
    
    // Update event monitor panel if visible
    this._updateEventMonitor(event);
  }
  
  /**
   * Execute a command in the console
   * @param {string} command - Command to execute
   * @returns {*} Result of the command
   */
  executeCommand(command) {
    if (!this.initialized) return;
    
    // Add command to history
    this._addToCommandHistory(command);
    
    // Try to execute command
    try {
      // Use Function constructor to evaluate in global scope
      const result = new Function('return ' + command)();
      
      // Add command and result to console panel
      this._addToConsole({
        type: 'command',
        content: command
      });
      
      this._addToConsole({
        type: 'result',
        content: result !== undefined ? JSON.stringify(result) : 'undefined'
      });
      
      return result;
    } catch (error) {
      // Add error to console panel
      this._addToConsole({
        type: 'error',
        content: error.toString()
      });
      
      return null;
    }
  }
  
  /**
   * Track an entity
   * @param {string|number} entityId - ID of the entity to track
   */
  trackEntity(entityId) {
    if (!this.initialized) return;
    
    this.trackedEntities.add(entityId);
    console.info(`DevTools: Tracking entity ${entityId}`);
  }
  
  /**
   * Untrack an entity
   * @param {string|number} entityId - ID of the entity to untrack
   */
  untrackEntity(entityId) {
    if (!this.initialized) return;
    
    this.trackedEntities.delete(entityId);
    console.info(`DevTools: No longer tracking entity ${entityId}`);
  }
  
  /**
   * Get information about the ECS world
   * @returns {Object} ECS world information
   */
  getWorldInfo() {
    if (!this.initialized || !this.ecs) return {};
    
    const systemNames = (this.ecs.systems || [])
      .map(system => system.constructor?.name || 'Unknown System');
    
    const entityCount = this.ecs.entities?.size || 0;
    
    return {
      systemCount: systemNames.length,
      systemNames: systemNames,
      entityCount: entityCount,
      trackedEntities: Array.from(this.trackedEntities)
    };
  }
  
  /**
   * Create DevTools overlay
   * @private
   */
  async _createOverlay() {
    // Check if overlay already exists
    if (this.overlay) return;
    
    // Create overlay container
    this.overlay = document.createElement('div');
    this.overlay.className = 'devtools-overlay';
    this.overlay.innerHTML = `
      <div class="devtools-header">
        <div class="devtools-title">DevTools</div>
        <div class="devtools-controls">
          <button class="devtools-toggle-btn" id="devtools-toggle-entity-explorer">Entities</button>
          <button class="devtools-toggle-btn" id="devtools-toggle-console">Console</button>
          <button class="devtools-toggle-btn" id="devtools-toggle-event-monitor">Events</button>
          <button class="devtools-close-btn" id="devtools-close">&times;</button>
        </div>
      </div>
      <div class="devtools-panels">
        <div id="entity-explorer-panel" class="devtools-panel">
          <h3>Entity Explorer</h3>
          <div class="panel-content" id="entity-explorer-content"></div>
        </div>
        <div id="console-panel" class="devtools-panel">
          <h3>Console</h3>
          <div class="console-container">
            <div class="console-output" id="overlay-console-output"></div>
            <div class="console-input-container">
              <input type="text" id="overlay-console-input" placeholder="Enter command...">
              <button id="overlay-execute-command">Run</button>
            </div>
          </div>
        </div>
        <div id="event-monitor-panel" class="devtools-panel">
          <h3>Event Monitor</h3>
          <div class="panel-content" id="event-monitor-content"></div>
        </div>
      </div>
    `;
    
    // Add overlay to document body
    document.body.appendChild(this.overlay);
    
    // Set up event listeners for overlay
    this._setupOverlayListeners();
    
    // Initially hide overlay (will be shown if DevTools is enabled)
    this._updateOverlayVisibility();
  }
  
  /**
   * Set up event listeners for overlay
   * @private
   */
  _setupOverlayListeners() {
    if (!this.overlay) return;
    
    // Close button
    const closeBtn = this.overlay.querySelector('#devtools-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.disable());
    }
    
    // Toggle buttons
    const entityExplorerToggle = this.overlay.querySelector('#devtools-toggle-entity-explorer');
    if (entityExplorerToggle) {
      entityExplorerToggle.addEventListener('click', () => this._togglePanel('entityExplorer'));
    }
    
    const consoleToggle = this.overlay.querySelector('#devtools-toggle-console');
    if (consoleToggle) {
      consoleToggle.addEventListener('click', () => this._togglePanel('console'));
    }
    
    const eventMonitorToggle = this.overlay.querySelector('#devtools-toggle-event-monitor');
    if (eventMonitorToggle) {
      eventMonitorToggle.addEventListener('click', () => this._togglePanel('eventMonitor'));
    }
    
    // Console command execution
    const consoleInput = this.overlay.querySelector('#overlay-console-input');
    const executeBtn = this.overlay.querySelector('#overlay-execute-command');
    
    if (consoleInput && executeBtn) {
      executeBtn.addEventListener('click', () => {
        const command = consoleInput.value;
        if (!command) return;
        
        this.executeCommand(command);
        consoleInput.value = '';
        consoleInput.focus();
      });
      
      consoleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const command = consoleInput.value;
          if (!command) return;
          
          this.executeCommand(command);
          consoleInput.value = '';
        } else if (e.key === 'ArrowUp') {
          this._navigateCommandHistory(-1);
          e.preventDefault();
        } else if (e.key === 'ArrowDown') {
          this._navigateCommandHistory(1);
          e.preventDefault();
        }
      });
    }
  }
  
  /**
   * Connect to ECS event system
   * @private
   */
  async _connectToEventSystem() {
    if (!this.ecs) return;
    
    const eventSystem = this.ecs.getSystem('event');
    if (!eventSystem) return;
    
    // Listen for all events if not already listening
    if (!this.eventListeners.some(listener => listener.type === '*')) {
      const listener = (data) => this.logEvent(data);
      eventSystem.on('*', listener);
      
      this.eventListeners.push({
        type: '*',
        handler: listener
      });
    }
  }
  
  /**
   * Disconnect from ECS event system
   * @private
   */
  _disconnectFromEventSystem() {
    if (!this.ecs) return;
    
    const eventSystem = this.ecs.getSystem('event');
    if (!eventSystem) return;
    
    // Remove all registered event listeners
    this.eventListeners.forEach(({ type, handler }) => {
      eventSystem.off(type, handler);
    });
    
    this.eventListeners = [];
  }
  
  /**
   * Update overlay visibility
   * @private
   */
  _updateOverlayVisibility() {
    if (!this.overlay) return;
    
    if (this.enabled) {
      this.overlay.classList.add('visible');
    } else {
      this.overlay.classList.remove('visible');
    }
  }
  
  /**
   * Toggle a panel
   * @param {string} panelName - Name of the panel to toggle
   * @private
   */
  _togglePanel(panelName) {
    if (!this.panels[panelName]) return;
    
    this.panels[panelName].visible = !this.panels[panelName].visible;
    this._updatePanels();
  }
  
  /**
   * Update panels visibility
   * @private
   */
  _updatePanels() {
    if (!this.overlay) return;
    
    // Entity Explorer panel
    const entityExplorerPanel = this.overlay.querySelector('#entity-explorer-panel');
    if (entityExplorerPanel) {
      if (this.panels.entityExplorer.visible) {
        entityExplorerPanel.classList.add('visible');
        this._updateEntityExplorer();
      } else {
        entityExplorerPanel.classList.remove('visible');
      }
    }
    
    // Console panel
    const consolePanel = this.overlay.querySelector('#console-panel');
    if (consolePanel) {
      if (this.panels.console.visible) {
        consolePanel.classList.add('visible');
      } else {
        consolePanel.classList.remove('visible');
      }
    }
    
    // Event Monitor panel
    const eventMonitorPanel = this.overlay.querySelector('#event-monitor-panel');
    if (eventMonitorPanel) {
      if (this.panels.eventMonitor.visible) {
        eventMonitorPanel.classList.add('visible');
      } else {
        eventMonitorPanel.classList.remove('visible');
      }
    }
    
    // Update toggle buttons
    const entityExplorerToggle = this.overlay.querySelector('#devtools-toggle-entity-explorer');
    if (entityExplorerToggle) {
      entityExplorerToggle.classList.toggle('active', this.panels.entityExplorer.visible);
    }
    
    const consoleToggle = this.overlay.querySelector('#devtools-toggle-console');
    if (consoleToggle) {
      consoleToggle.classList.toggle('active', this.panels.console.visible);
    }
    
    const eventMonitorToggle = this.overlay.querySelector('#devtools-toggle-event-monitor');
    if (eventMonitorToggle) {
      eventMonitorToggle.classList.toggle('active', this.panels.eventMonitor.visible);
    }
  }
  
  /**
   * Update entity explorer panel
   * @private
   */
  _updateEntityExplorer() {
    if (!this.overlay || !this.panels.entityExplorer.visible) return;
    
    const content = this.overlay.querySelector('#entity-explorer-content');
    if (!content || !this.ecs) return;
    
    const entities = Array.from(this.ecs.entities?.values() || []);
    if (entities.length === 0) {
      content.innerHTML = 'No entities found';
      return;
    }
    
    let html = '';
    entities.forEach(entity => {
      const id = entity.id || 'unknown';
      const isTracked = this.trackedEntities.has(id);
      const componentTypes = Array.from(entity.componentMask || []).join(', ') || 'none';
      
      html += `
        <div class="entity-item ${isTracked ? 'tracked' : ''}" data-entity-id="${id}">
          <div class="entity-header">
            <span class="entity-id">Entity #${id}</span>
            <button class="entity-track-btn" title="${isTracked ? 'Stop tracking' : 'Track entity'}">${isTracked ? '👁️' : '👁️‍🗨️'}</button>
          </div>
          <div class="entity-details">
            <div class="entity-components">
              <strong>Components:</strong> ${componentTypes}
            </div>
          </div>
        </div>
      `;
    });
    
    content.innerHTML = html;
    
    // Add event listeners for track buttons
    const trackButtons = content.querySelectorAll('.entity-track-btn');
    trackButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const entityItem = e.target.closest('.entity-item');
        const entityId = entityItem.getAttribute('data-entity-id');
        
        if (this.trackedEntities.has(entityId)) {
          this.untrackEntity(entityId);
          button.textContent = '👁️‍🗨️';
          button.title = 'Track entity';
          entityItem.classList.remove('tracked');
        } else {
          this.trackEntity(entityId);
          button.textContent = '👁️';
          button.title = 'Stop tracking';
          entityItem.classList.add('tracked');
        }
      });
    });
  }
  
  /**
   * Update event monitor with new event
   * @param {Object} eventData - Event data
   * @private
   */
  _updateEventMonitor(eventData) {
    if (!this.overlay || !this.panels.eventMonitor.visible) return;
    
    const content = this.overlay.querySelector('#event-monitor-content');
    if (!content) return;
    
    const eventEl = document.createElement('div');
    eventEl.className = 'event-item';
    
    const timestamp = eventData.timestamp.toISOString().split('T')[1].slice(0, 12);
    const eventType = eventData.type || 'unknown';
    
    eventEl.innerHTML = `
      <span class="event-timestamp">${timestamp}</span>
      <span class="event-type">${eventType}</span>
      <pre class="event-data">${JSON.stringify(eventData, null, 2)}</pre>
    `;
    
    content.appendChild(eventEl);
    
    // Auto-scroll to bottom
    content.scrollTop = content.scrollHeight;
  }
  
  /**
   * Add a message to the console panel
   * @param {Object} message - Console message
   * @private
   */
  _addToConsole(message) {
    if (!this.overlay) return;
    
    const consoleOutput = this.overlay.querySelector('#overlay-console-output');
    if (!consoleOutput) return;
    
    const messageEl = document.createElement('div');
    messageEl.className = `console-${message.type}`;
    
    if (message.type === 'command') {
      messageEl.textContent = '> ' + message.content;
    } else {
      messageEl.textContent = message.content;
    }
    
    consoleOutput.appendChild(messageEl);
    
    // Auto-scroll to bottom
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }
  
  /**
   * Add command to command history
   * @param {string} command - Command to add
   * @private
   */
  _addToCommandHistory(command) {
    // Don't add if same as last command
    if (this.consoleHistory.commands.length > 0 && 
        this.consoleHistory.commands[this.consoleHistory.commands.length - 1] === command) {
      return;
    }
    
    this.consoleHistory.commands.push(command);
    
    // Trim history if it gets too large
    if (this.consoleHistory.commands.length > this.consoleHistory.maxSize) {
      this.consoleHistory.commands.shift();
    }
    
    // Reset position to end of history
    this.consoleHistory.position = this.consoleHistory.commands.length;
  }
  
  /**
   * Navigate command history
   * @param {number} direction - Direction to navigate (-1 for up, 1 for down)
   * @private
   */
  _navigateCommandHistory(direction) {
    const inputEl = this.overlay.querySelector('#overlay-console-input');
    if (!inputEl || this.consoleHistory.commands.length === 0) return;
    
    // Calculate new position
    let newPosition = this.consoleHistory.position + direction;
    
    // Clamp to valid range
    newPosition = Math.max(-1, Math.min(newPosition, this.consoleHistory.commands.length - 1));
    
    if (newPosition === -1) {
      // -1 position means empty input
      inputEl.value = '';
    } else {
      // Set input to history command
      inputEl.value = this.consoleHistory.commands[newPosition];
    }
    
    // Update position
    this.consoleHistory.position = newPosition;
    
    // Set cursor to end of input
    setTimeout(() => {
      inputEl.selectionStart = inputEl.selectionEnd = inputEl.value.length;
    }, 0);
  }
}

// Create singleton instance
const devToolsManager = new DevToolsManager();

// Expose to window for debugging
if (window) {
  window.DevTools = devToolsManager;
}

export { devToolsManager };
