/**
 *  DevTools Module
 *======================================================================
 * 
 * Professional DevTools for the Portfolio Engine
 */
import { DevToolsRenderer } from './devtools-render.js';

export class DevTools {
  constructor() {
    console.info('DevTools initialized...');
    this.isVisible = false;
    this.isMinimized = false;
    this.container = null;
    this.autoRefreshInterval = null;
    this.autoRefreshRate = 1000; // 1 second
    this.version = '1.1.0';
    
    // Engine state
    this.engine = null;
    this.world = null;
    this.enginePaused = false;
    
    // Performance monitoring
    this.performanceData = {
      fps: [],
      memory: [],
      systemTimes: {}
    };
    this.isRecordingPerformance = false;
    this.maxDataPoints = 100; // Maximum data points for charts
    
    // Console history
    this.commandHistory = [];
    this.maxCommandHistory = 20;
    
    // Position tracking for drag functionality
    this.position = { x: 20, y: 20 };
    this.dragOffset = { x: 0, y: 0 };
    this.isDragging = false;

    this._loadStyles()
      .then(() => {
        this._createContainer();
        this._initializeUI();
      })
      .catch(err => {
        console.warn('Failed to load DevTools styles:', err);
        this._injectFallbackStyles();
        this._createContainer();
        this._initializeUI();
      });
  }

  // ======================================================================
  // Load Styles
  // ======================================================================

  async _loadStyles() {
    // Check if styles are already loaded
    if (document.getElementById('portfolio-devtools-styles')) {
      return;
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.id = 'portfolio-devtools-styles';
      link.rel = 'stylesheet';
      link.href = './engine/modules/dev-tools/dev-tools.css';
      
      link.onload = () => resolve();
      link.onerror = () => reject(new Error('Failed to load DevTools CSS'));
      
      document.head.appendChild(link);
    });
  }

  _injectFallbackStyles() {
    const style = document.createElement('style');
    style.id = 'portfolio-devtools-styles';
    style.textContent = `
      .devtools-panel {
        position: fixed;
        right: 0;
        top: 0;
        background: var(--card-bg-color, #fff);
        color: var(--text-color, #000);
        border: 1px solid var(--border-color, #ccc);
        border-radius: 8px;
        box-shadow: 0 0 10px var(--shadow-color, rgba(0,0,0,0.5));
        z-index: 9999;
        display: none;
      }
      .devtools-toggle-btn {
        position: fixed;
        right: 20px;
        bottom: 20px;
        padding: 8px;
        border: 1px solid var(--border-color, #ccc);
        border-radius: 4px;
        background: var(--nav-bg-color, #eee);
        color: var(--text-color, #000);
        cursor: pointer;
        z-index: 9998;
      }
      /* Basic styles to keep functionality */
      .tab-content { display: none; }
      .tab-content.active { display: block; }
    `;
    document.head.appendChild(style);
  }

  // ======================================================================
  // Create UI Elements
  // ======================================================================

  _createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'portfolio-devtools';
    this.container.className = 'devtools-panel';
    this.container.style.right = 'auto';
    this.container.style.left = `${this.position.x}px`;
    this.container.style.top = `${this.position.y}px`;
    document.body.appendChild(this.container);
  }

  _initializeUI() {
    // Create toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'devtools-toggle';
    toggleBtn.innerHTML = '🛠️';
    toggleBtn.className = 'devtools-toggle-btn';
    toggleBtn.onclick = () => this.toggle();
    document.body.appendChild(toggleBtn);

    // Initialize renderer
    this.renderer = new DevToolsRenderer(this);
    
    // Initial render
    this.render();
    
    // Set up global event listeners
    this._setupGlobalListeners();
    
    console.info('DevTools ready');
  }

  _setupGlobalListeners() {
    // For dragging functionality with mouse
    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        
        // Keep panel within viewport bounds
        const maxX = window.innerWidth - this.container.offsetWidth;
        const maxY = window.innerHeight - this.container.offsetHeight;
        
        this.position.x = Math.max(0, Math.min(x, maxX));
        this.position.y = Math.max(0, Math.min(y, maxY));
        
        this.container.style.right = 'auto';
        this.container.style.left = `${this.position.x}px`;
        this.container.style.top = `${this.position.y}px`;
      }
    });
    
    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.container.classList.remove('dragging');
      }
    });
    
    // NEW: Touch events for mobile dragging
    document.addEventListener('touchmove', (e) => {
      if (this.isDragging) {
        const touch = e.touches[0];
        const x = touch.clientX - this.dragOffset.x;
        const y = touch.clientY - this.dragOffset.y;
        const maxX = window.innerWidth - this.container.offsetWidth;
        const maxY = window.innerHeight - this.container.offsetHeight;
        this.position.x = Math.max(0, Math.min(x, maxX));
        this.position.y = Math.max(0, Math.min(y, maxY));
        this.container.style.right = 'auto';
        this.container.style.left = `${this.position.x}px`;
        this.container.style.top = `${this.position.y}px`;
        e.preventDefault();
      }
    }, {passive: false});
    document.addEventListener('touchend', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.container.classList.remove('dragging');
      }
    });
    
    // Performance monitoring
    if (window.requestAnimationFrame) {
      this._setupPerformanceMonitoring();
    }
  }

  _startDragging(e) {
    if (this.isMinimized) return;
    
    this.isDragging = true;
    this.container.classList.add('dragging');
    
    const rect = this.container.getBoundingClientRect();
    
    // Handle both mouse and touch events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    this.dragOffset.x = clientX - rect.left;
    this.dragOffset.y = clientY - rect.top;
    
    // Prevent text selection during drag
    if (e.preventDefault) {
      e.preventDefault();
    }
  }

  // ======================================================================
  // Panel Controls
  // ======================================================================

  toggle() {
    this.isVisible = !this.isVisible;
    this.isMinimized = false;
    this.container.classList.remove('minimized');
    this.container.style.display = this.isVisible ? 'block' : 'none';
    if (this.isVisible) this.render();
  }

  // Modify _minimizePanel to enable capture mode instead of a simple toggle
  _minimizePanel() {
    // Hide the devtools panel and enter capture mode
    this.container.style.display = "none";
    this._enableCaptureMode();
  }
  
  // New method: enables capture mode to pick an entity from the page
  _enableCaptureMode() {
    // Create and display a full-page overlay with an instruction message
    const overlay = document.createElement("div");
    overlay.id = "devtools-capture-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.right = "0";
    overlay.style.bottom = "0";
    overlay.style.backgroundColor = "rgba(0,0,0,0.5)"; // need to animate to transition 
    overlay.style.zIndex = "10000";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.color = "#fff";
    overlay.style.fontSize = "20px";
    overlay.innerHTML = "Click on an entity to view details...";
    document.body.appendChild(overlay);
    
    // One-time click handler (capturing phase)
    const captureHandler = (e) => {
      // Remove overlay and event listener
      if (overlay.parentNode) overlay.remove();
      document.removeEventListener("click", captureHandler, true);
      
      // Try to find a parent element with a data-id attribute
      const target = e.target.closest("[data-id]");
      if (target) {
        const id = parseInt(target.getAttribute("data-id"));
        if (!isNaN(id)) {
          this._inspectEntity(id);
        }
      }
      
      // Restore DevTools panel
      this.container.style.display = "block";
    };
    document.addEventListener("click", captureHandler, true);
  }

  render() {
    if (!this.container) return;
    this.renderer.render();
  }

  // ======================================================================
  // Auto-refresh
  // ======================================================================

  startAutoRefresh() {
    this.stopAutoRefresh(); // Clear any existing interval
    this.autoRefreshInterval = setInterval(() => this._refreshAll(), this.autoRefreshRate);
  }

  stopAutoRefresh() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      this.autoRefreshInterval = null;
    }
  }

  updateAutoRefresh() {
    if (this.autoRefreshInterval) {
      this.stopAutoRefresh();
      this.startAutoRefresh();
    }
  }

  // ======================================================================
  // Engine Connection
  // ======================================================================

  _connectToEngine() {
    console.log('Dev tools attempting to connect to engine...');
    
    // Try to find engine in the global scope
    if (window.portfolioEngine) {
      this.engine = window.portfolioEngine;
      this.world = this.engine.world || this.engine;
      
      console.log('Connected to engine successfully!');
      this._updateConnectionStatus(true);
      this._refreshAll();
      this.render();  // force UI update immediately
      return true;
    }
    
    console.warn('Failed to connect - no engine found in global scope');
    this._updateConnectionStatus(false);
    this._showNotification('Failed to connect to engine - not found in global scope', true);
    return false;
  }

  _disconnectFromEngine() {
    if (!this.engine) return;
    
    this.engine = null;
    this.world = null;
    this._updateConnectionStatus(false);
    this._showNotification('Disconnected from engine');
    
    // Stop monitoring if active
    this.stopAutoRefresh();
    this._stopPerformanceRecording();
    
    // Re-render to update UI
    this.render();
  }

  _updateConnectionStatus(connected) {
    // Update UI to show connection status only within the DevTools panel
    const statusElements = this.container.querySelectorAll('.connection-status');
    statusElements.forEach(element => {
      element.className = `connection-status ${connected ? 'connected' : 'disconnected'}`;
      element.textContent = connected ? 'Connected' : 'Disconnected';
    });
    
    // Update additional displays...
    const engineDisplay = document.getElementById('engine-state-display');
    if (engineDisplay) {
      engineDisplay.textContent = connected ? JSON.stringify({
        status: 'Connected',
        engineMode: this.enginePaused ? 'Paused' : 'Running',
        frameCount: this.world.frameCount || 0,
        entityCount: this.world.entityManager?.entities?.size || 0,
        systemCount: this.world.systemManager?.systems?.length || 0
      }, null, 2) : 'Engine not connected. Please connect to view engine data.';
    }
    
    const stateDisplay = document.getElementById('state-display');
    if (stateDisplay) {
      stateDisplay.textContent = connected ? 'Connected to engine. World data available.' :
        'Not connected. Click "Connect" to try again.';
    }
    // Optionally, re-render the UI if connected.
    if (connected) { 
      this.render();
    }
  }

  // ======================================================================
  // Engine Control Methods
  // ======================================================================

  _toggleEnginePause() {
    if (!this.engine || !this.world) {
      this._showNotification('Engine not connected', true);
      return;
    }
    
    try {
      // Toggle pause state
      this.enginePaused = !this.enginePaused;
      
      if (this.enginePaused) {
        // Pause engine
        if (this.engine.stop) {
          this.engine.stop();
          this._showNotification('Engine paused');
        } else {
          this._showNotification('Engine pause method not available', true);
        }
      } else {
        // Resume engine
        if (this.engine.start) {
          this.engine.start();
          this._showNotification('Engine resumed');
        } else {
          this._showNotification('Engine start method not available', true);
        }
      }
      
      // Update UI
      this.render();
      
    } catch (error) {
      this._showNotification(`Error toggling engine: ${error.message}`, true);
    }
  }

  /**
   * Engine loop integration - add step single frame functionality 
   */
  _stepEngine() {
    if (!this.engine || !this.world) {
      this._showNotification('Engine not connected', true);
      return;
    }
    
    try {
      if (this.world.engineLoop) {
        // Temporarily pause the loop
        const wasRunning = this.world.engineLoop.isRunning;
        if (wasRunning) {
          this.world.engineLoop.stop();
        }
        
        // Perform a single manual update
        const deltaTime = this.world.engineLoop.fixedTimeStep;
        
        // Update event system to process events
        const eventSystem = this.world.getSystem('event');
        if (eventSystem && typeof eventSystem.update === 'function') {
          eventSystem.update(deltaTime / 1000);
        }
        
        // Update other systems
        for (const system of this.world.systems.values()) {
          if (system !== eventSystem && typeof system.update === 'function') {
            try {
              system.update(deltaTime / 1000);
            } catch (error) {
              console.error(`Error updating system ${system.constructor.name}:`, error);
            }
          }
        }
        
        this._showNotification('Stepped one frame');
        this._refreshAll();
        
        // Restart if it was running
        if (wasRunning) {
          this.world.engineLoop.start();
        }
      } else {
        this._showNotification('Engine loop not found', true);
      }
    } catch (error) {
      this._showNotification(`Error stepping engine: ${error.message}`, true);
      console.error('Error stepping engine:', error);
    }
  }

  /**
   * Set engine FPS target
   */
  _setEngineFPS(targetFps) {
    if (!this.engine || !this.world || !this.world.engineLoop) {
      this._showNotification('Engine loop not available', true);
      return;
    }
    
    try {
      // Store current running state
      const wasRunning = this.world.engineLoop.isRunning;
      
      // Stop the loop if it's running
      if (wasRunning) {
        this.world.engineLoop.stop();
      }
      
      // Update the target FPS
      this.world.engineLoop.targetFPS = targetFps;
      
      // For fixed timestep, calculate appropriate ms per frame
      this.world.engineLoop.fixedTimeStep = 1000 / targetFps;
      
      // Restart if it was running
      if (wasRunning) {
        this.world.engineLoop.start();
      }
      
      this._showNotification(`Target FPS set to ${targetFps}`);
    } catch (error) {
      this._showNotification(`Error setting FPS: ${error.message}`, true);
    }
  }

  /**
   * Toggle debug mode for the engine loop
   */
  _toggleEngineDebugMode() {
    if (!this.world || !this.world.engineLoop) {
      this._showNotification('Engine loop not available', true);
      return;
    }
    
    try {
      const newDebugState = !this.world.engineLoop.debugMode;
      this.world.engineLoop.setDebugMode(newDebugState);
      this._showNotification(`Engine debug mode ${newDebugState ? 'enabled' : 'disabled'}`);
    } catch (error) {
      this._showNotification(`Error toggling debug mode: ${error.message}`, true);
    }
  }

  /**
   * Get engine performance stats
   */
  _getEngineStats() {
    if (!this.world || !this.world.engineLoop) {
      return {
        fps: 0,
        frameTime: 0,
        updateTime: 0,
        renderTime: 0
      };
    }
    
    return { ...this.world.engineLoop.stats };
  }

  // ======================================================================
  // Data Refresh Methods
  // ======================================================================

  _refreshAll() {
    if (!this.isVisible) return;
    
    this._refreshEngineData();
    this._refreshEntitiesList();
    this._refreshSystemsList();
    this._updatePerformanceData();
  }

  _refreshEngineData() {
    if (!this.world) return;
    
    // Update entity count
    const entityCount = document.getElementById('entity-count');
    if (entityCount) {
      const count = this.world.entityManager?.entities?.size || 0;
      entityCount.textContent = count.toString();
    }
    
    // Update system count
    const systemCount = document.getElementById('system-count');
    if (systemCount) {
      const count = this.world.systemManager?.systems?.length || 0;
      systemCount.textContent = count.toString();
    }
    
    // Update memory display
    const memoryUsage = document.getElementById('memory-usage');
    if (memoryUsage && window.performance && window.performance.memory) {
      const usedHeap = Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024));
      memoryUsage.textContent = `${usedHeap} MB`;
    }
    
    // Update engine state display
    const engineDisplay = document.getElementById('engine-state-display');
    if (engineDisplay) {
      const engineState = {
        status: 'Connected',
        engineMode: this.enginePaused ? 'Paused' : 'Running',
        frameCount: this.world.frameCount || 0,
        entityCount: this.world.entityManager?.entities?.size || 0,
        systemCount: this.world.systemManager?.systems?.length || 0,
        memory: window.performance?.memory ? 
          `${Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024))} MB` : 'Unknown'
      };
      engineDisplay.textContent = JSON.stringify(engineState, null, 2);
    }
    
    // Update original state display from previous code
    const stateDisplay = document.getElementById('state-display');
    if (stateDisplay) {
      const engineState = {
        entityCount: this.world.entityManager?.entities?.size || 0,
        systemCount: this.world.systemManager?.systems?.length || 0,
        connected: true
      };
      stateDisplay.textContent = JSON.stringify(engineState, null, 2);
    }
    
    // NEW: Update Overview tab Entities count if the element exists
    const overviewEntityCount = document.getElementById('overview-entity-count');
    if (overviewEntityCount && this.world && this.world.entityManager) {
      const count = this.world.entityManager.entities?.size || 0;
      overviewEntityCount.textContent = count.toString();
    }
  }

  _refreshSystemsList() {
    if (!this.world) return;
    
    const listElement = document.getElementById('systems-list');
    if (!listElement) return;
    
    try {
      // Handle systems stored in a Map (as in your World class implementation)
      let systemsArray = [];
      
      // Check different possible system storage methods
      if (this.world.systems instanceof Map) {
        // Systems stored directly in world as a Map
        systemsArray = Array.from(this.world.systems.entries())
          .map(([name, system]) => ({ name, system }));
      } 
      else if (this.world.systemManager?.systems instanceof Map) {
        // Systems stored in systemManager as a Map
        systemsArray = Array.from(this.world.systemManager.systems.entries())
          .map(([name, system]) => ({ name, system }));
      }
      else if (Array.isArray(this.world.systemManager?.systems)) {
        // Systems stored in systemManager as an Array
        systemsArray = this.world.systemManager.systems.map((system, index) => ({
          name: system.name || `System_${index}`,
          system
        }));
      }
      
      if (systemsArray.length === 0) {
        listElement.innerHTML = '<tr><td colspan="5">No systems registered</td></tr>';
        return;
      }
      
      listElement.innerHTML = systemsArray.map((item, index) => {
        const { name, system } = item;
        const enabled = system.enabled !== false;
        const priority = system.priority || 0;
        const lastExec = system.lastExecutionTime ? `${system.lastExecutionTime.toFixed(2)}ms` : 'N/A';
        
        return `<tr class="system-row ${enabled ? '' : 'disabled'}">
          <td>${name}</td>
          <td><span class="status-indicator ${enabled ? 'enabled' : 'disabled'}">${enabled ? 'Enabled' : 'Disabled'}</span></td>
          <td>${priority}</td>
          <td>${lastExec}</td>
          <td class="actions">
            <button class="toggle-system" data-index="${index}">${enabled ? 'Disable' : 'Enable'}</button>
            <button class="inspect-system" data-index="${index}">Inspect</button>
          </td>
        </tr>`;
      }).join('');
      
      // Add event listeners for system buttons
      listElement.querySelectorAll('.toggle-system').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.target.dataset.index);
          this._toggleSystem(index);
        });
      });
      
      listElement.querySelectorAll('.inspect-system').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.target.dataset.index);
          this._inspectSystem(index);
        });
      });
      
    } catch (error) {
      listElement.innerHTML = `<tr><td colspan="5">Error loading systems: ${error.message}</td></tr>`;
      console.error('Error refreshing systems list:', error);
    }
  }

  // ======================================================================
  // Entity Management
  // ======================================================================

  _refreshEntitiesList() {
    if (!this.world || !this.world.entityManager) return;
    
    const listElement = document.getElementById('entities-list');
    if (!listElement) return;
    
    try {
      // Get all entity IDs (safely handle potential errors)
      const entityIds = this.world.entityManager.getAllEntityIds?.() || [];
      
      if (entityIds.length === 0) {
        listElement.innerHTML = '<div class="empty-message">No entities found</div>';
        return;
      }
      
      // Generate entity list HTML
      listElement.innerHTML = entityIds.map(id => {
        const entity = this.world.entityManager.getEntity?.(id);
        const componentCount = entity?.components?.length || 0;
        const entityName = entity?.name || `Entity_${id}`;
        
        return `
          <div class="entity-item" data-id="${id}">
            <div class="entity-item-header">
              <span class="entity-name">${entityName}</span>
              <span class="entity-id">ID: ${id}</span>
            </div>
            <div class="entity-item-meta">
              <span class="component-count">${componentCount} components</span>
            </div>
            <div class="entity-item-actions">
              <button class="inspect-entity" data-id="${id}">Inspect</button>
              <button class="delete-entity" data-id="${id}">Delete</button>
            </div>
          </div>`;
      }).join('');
      
      // Add click handlers for entity actions
      listElement.querySelectorAll('.inspect-entity').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.target.dataset.id);
          this._inspectEntity(id);
          e.stopPropagation();
        });
      });
      
      listElement.querySelectorAll('.delete-entity').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.target.dataset.id);
          this._deleteEntity(id);
          e.stopPropagation();
        });
      });
      
      // Make entire item clickable for inspection
      listElement.querySelectorAll('.entity-item').forEach(item => {
        item.addEventListener('click', (e) => {
          if (!e.target.classList.contains('delete-entity') && !e.target.classList.contains('inspect-entity')) {
            const id = parseInt(item.dataset.id);
            this._inspectEntity(id);
          }
        });
      });
      
    } catch (error) {
      listElement.innerHTML = `<div class="error-message">Error loading entities: ${error.message}</div>`;
      console.error('Error refreshing entities list:', error);
    }
  }

  _inspectEntity(id) {
    if (!this.world || !this.world.entityManager) return;
    
    try {
      const entity = this.world.entityManager.getEntity(id);
      if (!entity) {
        this._showNotification(`Entity ID ${id} not found`, true);
        return;
      }
      
      // Update selected entity display
      const nameElement = document.getElementById('selected-entity-name');
      if (nameElement) {
        nameElement.textContent = entity.name || `Entity ${id}`;
      }
      
      // Show entity actions
      const actionsElement = document.getElementById('entity-actions');
      if (actionsElement) {
        actionsElement.style.display = 'flex';
        
        // Set up delete button
        const deleteBtn = actionsElement.querySelector('#delete-entity');
        if (deleteBtn) {
          // Remove old event listener
          const newDeleteBtn = deleteBtn.cloneNode(true);
          deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
          
          // Add new event listener
          newDeleteBtn.addEventListener('click', () => this._deleteEntity(id));
        }
        
        // Set up clone button
        const cloneBtn = actionsElement.querySelector('#clone-entity');
        if (cloneBtn) {
          // Remove old event listener
          const newCloneBtn = cloneBtn.cloneNode(true);
          cloneBtn.parentNode.replaceChild(newCloneBtn, cloneBtn);
          
          // Add new event listener
          newCloneBtn.addEventListener('click', () => this._cloneEntity(id));
        }
      }
      
      // Update inspector
      const inspectorElement = document.getElementById('entity-inspector');
      if (inspectorElement) {
        const components = entity.components || [];
        
        if (components.length === 0) {
          inspectorElement.innerHTML = `
            <div class="inspector-section">
              <h4>Entity ID: ${id}</h4>
              <p>This entity has no components</p>
              <button id="add-component" data-entity-id="${id}">Add Component</button>
            </div>`;
        } else {
          let html = `<div class="inspector-section">
            <h4>Entity ID: ${id}</h4>
            <div class="component-list">`;
            
          components.forEach((component, index) => {
            const componentName = component.constructor?.name || `Component_${index}`;
            html += `
              <div class="component-item">
                <div class="component-header">
                  <h5>${componentName}</h5>
                  <div class="component-controls">
                    <button class="edit-component" data-entity-id="${id}" data-component-index="${index}">Edit</button>
                  </div>
                </div>
                <pre class="component-data">${JSON.stringify(component, null, 2)}</pre>
              </div>`;
          });
          
          html += `
            </div>
            <button id="add-component" data-entity-id="${id}">Add Component</button>
          </div>`;
          
          inspectorElement.innerHTML = html;
          
          // Add event listeners for component buttons
          inspectorElement.querySelectorAll('.edit-component').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const entityId = parseInt(e.target.dataset.entityId);
              const componentIndex = parseInt(e.target.dataset.componentIndex);
              this._editComponent(entityId, componentIndex);
            });
          });
          
          const addComponentBtn = inspectorElement.querySelector('#add-component');
          if (addComponentBtn) {
            addComponentBtn.addEventListener('click', (e) => {
              const entityId = parseInt(e.target.dataset.entityId);
              this._showAddComponentDialog(entityId);
            });
          }
        }
      }
      
    } catch (error) {
      this._showNotification(`Error inspecting entity: ${error.message}`, true);
      console.error('Error inspecting entity:', error);
    }
  }

  _deleteEntity(id) {
    if (!this.world || !this.world.entityManager) return;
    
    try {
      this.world.entityManager.destroyEntity(id);
      this._showNotification(`Entity ${id} deleted`);
      
      // Clear entity inspector if the deleted entity was selected
      const nameElement = document.getElementById('selected-entity-name');
      if (nameElement && nameElement.textContent.includes(`${id}`)) {
        nameElement.textContent = 'No entity selected';
        
        const actionsElement = document.getElementById('entity-actions');
        if (actionsElement) {
          actionsElement.style.display = 'none';
        }
        
        const inspectorElement = document.getElementById('entity-inspector');
        if (inspectorElement) {
          inspectorElement.innerHTML = '<div class="inspector-message">Select an entity to inspect its details</div>';
        }
      }
      
      // Refresh entity list
      this._refreshEntitiesList();
      
    } catch (error) {
      this._showNotification(`Error deleting entity: ${error.message}`, true);
    }
  }

  _cloneEntity(id) {
    if (!this.world || !this.world.entityManager) return;
    
    try {
      const sourceEntity = this.world.entityManager.getEntity(id);
      if (!sourceEntity) {
        this._showNotification(`Source entity ID ${id} not found`, true);
        return;
      }
      
      // Create a new entity
      const newId = this.world.entityManager.createEntity();
      
      // Clone components if possible
      if (sourceEntity.components && Array.isArray(sourceEntity.components)) {
        sourceEntity.components.forEach(component => {
          try {
            // Create a deep copy of the component
            const componentCopy = JSON.parse(JSON.stringify(component));
            
            // Add the component to the new entity
            if (this.world.entityManager.addComponent) {
              this.world.entityManager.addComponent(newId, componentCopy);
            }
          } catch (e) {
            console.warn(`Failed to clone component:`, e);
          }
        });
      }
      
      this._showNotification(`Entity ${id} cloned to ID ${newId}`);
      this._refreshEntitiesList();
      this._inspectEntity(newId);
    } catch (error) {
      this._showNotification(`Error cloning entity: ${error.message}`, true);
    }
  }

  _showEntityCreationDialog() {
    if (!this.world || !this.world.entityManager) {
      this._showNotification('Engine not connected', true);
      return;
    }
    
    // Create modal dialog
    const modal = document.createElement('div');
    modal.className = 'devtools-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Create New Entity</h3>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="entity-name">Entity Name:</label>
            <input type="text" id="new-entity-name" placeholder="Entity name (optional)">
          </div>
        </div>
        <div class="modal-footer">
          <button id="create-entity-btn" class="primary-button">Create</button>
          <button class="cancel-modal">Cancel</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => modal.remove());
    
    const cancelBtn = modal.querySelector('.cancel-modal');
    cancelBtn.addEventListener('click', () => modal.remove());
    
    const createBtn = modal.querySelector('#create-entity-btn');
    createBtn.addEventListener('click', () => {
      const nameInput = modal.querySelector('#new-entity-name');
      const entityName = nameInput.value || `Entity_${Date.now()}`;
      
      try {
        const entityId = this.world.entityManager.createEntity();
        this._showNotification(`Created entity: ${entityName} (ID: ${entityId})`);
        this._refreshEntitiesList();
        this._inspectEntity(entityId);
        modal.remove();
      } catch (error) {
        this._showNotification(`Error creating entity: ${error.message}`, true);
      }
    });
  }

  _filterEntities(searchTerm) {
    if (!searchTerm) {
      // If no search term, show all entities
      this._refreshEntitiesList();
      return;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    const entityItems = document.querySelectorAll('.entity-item');
    
    entityItems.forEach(item => {
      const name = item.querySelector('.entity-name')?.textContent.toLowerCase() || '';
      const id = item.querySelector('.entity-id')?.textContent.toLowerCase() || '';
      
      if (name.includes(searchTermLower) || id.includes(searchTermLower)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }

  _editComponent(entityId, componentIndex) {
    if (!this.world || !this.world.entityManager) return;
    
    try {
      const entity = this.world.entityManager.getEntity(entityId);
      if (!entity || !entity.components || componentIndex >= entity.components.length) {
        this._showNotification('Component not found', true);
        return;
      }
      
      const component = entity.components[componentIndex];
      const componentName = component.constructor?.name || `Component_${componentIndex}`;
      
      // Create modal dialog for component editing
      const modal = document.createElement('div');
      modal.className = 'devtools-modal';
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3>Edit ${componentName}</h3>
            <button class="close-modal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <textarea id="component-json" rows="10" style="width: 100%; font-family: monospace;">${JSON.stringify(component, null, 2)}</textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button id="save-component" class="primary-button">Save Changes</button>
            <button class="cancel-modal">Cancel</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Add event listeners
      modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
      modal.querySelector('.cancel-modal').addEventListener('click', () => modal.remove());
      
      modal.querySelector('#save-component').addEventListener('click', () => {
        try {
          const jsonText = document.getElementById('component-json').value;
          const updatedComponent = JSON.parse(jsonText);
          
          // Update component - this is a simplistic approach
          // In a real app, you'd want to handle component updates through your ECS properly
          entity.components[componentIndex] = updatedComponent;
          
          this._showNotification(`Component updated`);
          modal.remove();
          
          // Refresh entity inspector
          this._inspectEntity(entityId);
        } catch (error) {
          this._showNotification(`Invalid JSON: ${error.message}`, true);
        }
      });
      
    } catch (error) {
      this._showNotification(`Error editing component: ${error.message}`, true);
    }
  }

  _showAddComponentDialog(entityId) {
    // This is a placeholder implementation
    // In a real implementation, you'd show a list of available component types
    
    this._showNotification('Add Component feature coming soon');
  }

  // ======================================================================
  // System Management
  // ======================================================================

  _toggleSystem(index) {
    if (!this.world || !this.world.systemManager) return;
    
    try {
      const system = this.world.systemManager.systems[index];
      if (!system) {
        this._showNotification(`System at index ${index} not found`, true);
        return;
      }
      
      system.enabled = !system.enabled;
      this._showNotification(`${system.name} ${system.enabled ? 'enabled' : 'disabled'}`);
      this._refreshSystemsList();
      
    } catch (error) {
      this._showNotification(`Error toggling system: ${error.message}`, true);
    }
  }

  _inspectSystem(index) {
    if (!this.world || !this.world.systemManager) return;
    
    try {
      const system = this.world.systemManager.systems[index];
      if (!system) {
        this._showNotification(`System at index ${index} not found`, true);
        return;
      }
      
      // Display system details
      const detailsElement = document.getElementById('system-details');
      if (detailsElement) {
        const systemData = {
          name: system.name || `System_${index}`,
          enabled: system.enabled !== false,
          priority: system.priority || 0,
          lastExecutionTime: system.lastExecutionTime ? `${system.lastExecutionTime.toFixed(2)}ms` : 'N/A',
          type: system.constructor?.name || 'Unknown',
          // Filter out non-serializable properties and methods
          data: this._getSerializableObject(system)
        };
        
        detailsElement.textContent = JSON.stringify(systemData, null, 2);
      }
      
    } catch (error) {
      this._showNotification(`Error inspecting system: ${error.message}`, true);
    }
  }

  // Helper to get serializable object data
  _getSerializableObject(obj) {
    if (!obj || typeof obj !== 'object') return {};
    
    const serializable = {};
    
    // Only include data properties, skip functions and special properties
    for (const key in obj) {
      if (
        obj.hasOwnProperty(key) && 
        typeof obj[key] !== 'function' &&
        !key.startsWith('_') &&
        key !== 'world' &&
        key !== 'engine' &&
        key !== 'systems'
      ) {
        try {
          // Try to serialize the value to see if it's JSON-compatible
          JSON.stringify(obj[key]);
          serializable[key] = obj[key];
        } catch (e) {
          // If not serializable, provide a placeholder
          serializable[key] = '[Object]';
        }
      }
    }
    
    return serializable;
  }

  // ======================================================================
  // Performance Monitoring
  // ======================================================================

  _setupPerformanceMonitoring() {
    let lastFrameTime = performance.now();
    let frameCount = 0;
    
    const updateFPS = () => {
      const now = performance.now();
      frameCount++;
      
      // Update FPS every second
      if (now - lastFrameTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastFrameTime));
        
        // Update FPS counter in UI
        const fpsCounter = document.getElementById('fps-counter');
        if (fpsCounter) {
          fpsCounter.textContent = fps;
        }
        
        // Record FPS if monitoring is active
        if (this.isRecordingPerformance) {
          this.performanceData.fps.push({
            time: new Date(),
            value: fps
          });
          
          // Trim data if it exceeds the maximum number of points
          if (this.performanceData.fps.length > this.maxDataPoints) {
            this.performanceData.fps.shift();
          }
          
          // Record memory usage
          if (window.performance && window.performance.memory) {
            const memory = Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024));
            this.performanceData.memory.push({
              time: new Date(),
              value: memory
            });
            
            if (this.performanceData.memory.length > this.maxDataPoints) {
              this.performanceData.memory.shift();
            }
          }
          
          // Update performance chart if visible
          this._updatePerformanceCharts();
        }
        
        // Reset for next second
        frameCount = 0;
        lastFrameTime = now;
      }
      
      requestAnimationFrame(updateFPS);
    };
    
    // Start monitoring
    requestAnimationFrame(updateFPS);
  }

  _startPerformanceRecording() {
    this.isRecordingPerformance = true;
    this.performanceData = {
      fps: [],
      memory: [],
      systemTimes: {}
    };
    this._showNotification('Performance recording started');
  }

  _stopPerformanceRecording() {
    this.isRecordingPerformance = false;
    this._showNotification('Performance recording stopped');
    
    // Final update of charts and metrics
    this._updatePerformanceCharts();
    this._updatePerformanceMetrics();
  }

  _clearPerformanceData() {
    this.performanceData = {
      fps: [],
      memory: [],
      systemTimes: {}
    };
    this._showNotification('Performance data cleared');
    this._updatePerformanceCharts();
  }

  _updatePerformanceCharts() {
    // In a real implementation, we would use a charting library like Chart.js
    // For now, we'll just update performance metrics
    this._updatePerformanceMetrics();
  }

  _updatePerformanceData() {
    // This method is called during auto-refresh to update performance data
    if (this.isRecordingPerformance && this.world) {
      // Record system execution times if available
      if (this.world.systemManager?.systems) {
        this.world.systemManager.systems.forEach(system => {
          if (system.name && system.lastExecutionTime) {
            if (!this.performanceData.systemTimes[system.name]) {
              this.performanceData.systemTimes[system.name] = [];
            }
            
            this.performanceData.systemTimes[system.name].push({
              time: new Date(),
              value: system.lastExecutionTime
            });
            
            // Trim data if needed
            if (this.performanceData.systemTimes[system.name].length > this.maxDataPoints) {
              this.performanceData.systemTimes[system.name].shift();
            }
          }
        });
      }
      
      // Update UI
      this._updatePerformanceMetrics();
    }
  }

  _updatePerformanceMetrics() {
    if (this.performanceData.fps.length === 0) return;
    
    // Calculate FPS statistics
    const fpsValues = this.performanceData.fps.map(item => item.value);
    const avgFps = Math.round(fpsValues.reduce((sum, val) => sum + val, 0) / fpsValues.length);
    const minFps = Math.min(...fpsValues);
    const maxFps = Math.max(...fpsValues);
    
    // Calculate memory statistics
    let currentMemory = 'N/A';
    let peakMemory = 'N/A';
    
    if (this.performanceData.memory.length > 0) {
      const memoryValues = this.performanceData.memory.map(item => item.value);
      currentMemory = `${this.performanceData.memory[this.performanceData.memory.length - 1].value} MB`;
      peakMemory = `${Math.max(...memoryValues)} MB`;
    }
    
    // Update metric elements
    const elements = {
      'avg-fps': avgFps,
      'min-fps': minFps,
      'max-fps': maxFps,
      'current-memory': currentMemory,
      'peak-memory': peakMemory
    };
    
    for (const [id, value] of Object.entries(elements)) {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    }
    
    // Update system performance table
    this._updateSystemPerfTable();
  }
  
  _updateSystemPerfTable() {
    const perfTableBody = document.getElementById('system-perf-list');
    if (!perfTableBody || !this.world) return;
    
    // If no system performance data, show a message
    if (Object.keys(this.performanceData.systemTimes).length === 0) {
      perfTableBody.innerHTML = '<tr><td colspan="4">No performance data available</td></tr>';
      return;
    }
    
    // Otherwise, build the table
    let tableHTML = '';
    
    for (const [systemName, times] of Object.entries(this.performanceData.systemTimes)) {
      if (times.length === 0) continue;
      
      // Calculate average execution time
      const avgTime = times.reduce((sum, item) => sum + item.value, 0) / times.length;
      const lastTime = times[times.length - 1].value;
      
      // Calculate percentage of frame (assuming 16.67ms for 60fps frame)
      const framePercentage = (lastTime / 16.67) * 100;
      
      tableHTML += `
        <tr>
          <td>${systemName}</td>
          <td>${avgTime.toFixed(2)}ms</td>
          <td>${lastTime.toFixed(2)}ms</td>
          <td>${framePercentage.toFixed(1)}%</td>
        </tr>
      `;
    }
    
    perfTableBody.innerHTML = tableHTML;
  }

  // ======================================================================
  // Console Methods
  // ======================================================================

  _executeConsoleCommand(command) {
    if (!command || command.trim() === '') return;
    
    // Add to command history
    this._addToCommandHistory(command);
    
    // Create output entry
    this._appendToConsole(`<div class="console-input">> ${command}</div>`);
    
    try {
      // Try to evaluate the command
      const result = this._evaluateCommand(command);
      
      // Display the result
      if (result !== undefined) {
        let output;
        
        if (typeof result === 'object') {
          try {
            output = JSON.stringify(result, null, 2);
          } catch (e) {
            output = String(result);
          }
        } else {
          output = String(result);
        }
        
        this._appendToConsole(`<div class="console-output-result">${output}</div>`);
      }
    } catch (error) {
      this._appendToConsole(`<div class="console-output-error">Error: ${error.message}</div>`);
    }
    
    // Scroll console to bottom
    const consoleOutput = document.getElementById('console-output');
    if (consoleOutput) {
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
  }

  _evaluateCommand(command) {
    // Define context for command execution
    const context = {
      engine: this.engine,
      world: this.world,
      devTools: this,
      document: document,
      window: window
    };
    
    // Special commands
    if (command.startsWith('!clear')) {
      this._clearConsole();
      return 'Console cleared';
    } else if (command.startsWith('!help')) {
      return this._getHelpText();
    }
    
    // Execute command with context available
    try {
      // Create function with context variables as parameters
      const contextKeys = Object.keys(context);
      const contextValues = Object.values(context);
      
      const func = new Function(...contextKeys, `return ${command}`);
      return func(...contextValues);
    } catch (error) {
      throw new Error(`Evaluation error: ${error.message}`);
    }
  }

  _appendToConsole(html) {
    const consoleOutput = document.getElementById('console-output');
    if (consoleOutput) {
      const entry = document.createElement('div');
      entry.className = 'console-entry';
      entry.innerHTML = html;
      consoleOutput.appendChild(entry);
    }
  }

  _addToCommandHistory(command) {
    // Don't add if command is already at the top of history
    if (this.commandHistory.length > 0 && this.commandHistory[0] === command) {
      return;
    }
    
    // Add to history
    this.commandHistory.unshift(command);
    
    // Limit history size
    if (this.commandHistory.length > this.maxCommandHistory) {
      this.commandHistory.pop();
    }
    
    // Update history UI
    const historySelect = document.getElementById('command-history');
    if (historySelect) {
      // Clear existing options (except the first disabled one)
      while (historySelect.options.length > 1) {
        historySelect.remove(1);
      }
      
      // Add history items
      this.commandHistory.forEach(cmd => {
        const option = document.createElement('option');
        option.value = cmd;
        option.textContent = cmd;
        historySelect.appendChild(option);
      });
    }
  }

  _clearConsole() {
    const consoleOutput = document.getElementById('console-output');
    if (consoleOutput) {
      consoleOutput.innerHTML = '';
    }
  }

  _getHelpText() {
    return `
DevTools Console Help:
---------------------
!clear     - Clear the console
!help      - Show this help

Available objects:
- engine   - Access to the game engine
- world    - Access to the world instance
- devTools - Access to this DevTools instance

Examples:
> world.entityManager.entities.size
> engine.stop()
> devTools._refreshAll()
    `;
  }

  // ======================================================================
  // Helper Methods
  // ======================================================================

  _showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = `devtools-notification ${isError ? 'error' : ''}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }
}
