/**
 * DevTools Renderer Module
 * ======================================================================
 * Handles all rendering operations for the DevTools module
 */
export class DevToolsRenderer {
  constructor(devTools) {
    this.devTools = devTools;
  }

  // ======================================================================
  // Main Render Methods
  // ======================================================================

  render() {
    if (!this.devTools.container) return;
    
    this.devTools.container.innerHTML = `
        <div class="devtools-content">
            ${this._renderHeader()}
            ${this._renderTabs()}
            ${this._renderTabContents()}
            <div class="devtools-footer">
                <span>Engine v${this.devTools.version || '1.0.0'}</span>
                <span class="connection-status ${this.devTools.world ? 'connected' : 'disconnected'}">
                    ${this.devTools.world ? 'Connected' : 'Disconnected'}
                </span>
            </div>
        </div>
    `;

    this._attachEventListeners();
  }

  // ======================================================================
  // Header Rendering
  // ======================================================================

  _renderHeader() {
    return `
        <div class="devtools-header">
            <div class="devtools-title">
                <span class="devtools-grip">⋮⋮</span>
                <h2>DevTools</h2>
            </div>
            <div class="devtools-controls">
                <button id="refresh-devtools" title="Refresh DevTools">🔄</button>
                <button id="minimize-devtools" title="Minimize">🔎</button>
                <button id="close-devtools" title="Close">✕</button>
            </div>
        </div>
    `;
  }

  // ======================================================================
  // Tab Navigation Rendering
  // ======================================================================

  _renderTabs() {
    const tabs = [
        { id: 'overview', icon: '📊', label: 'Overview' },
        { id: 'performance', icon: '📈', label: 'Performance' },
        { id: 'engine', icon: '⚙️', label: 'Engine' },
        { id: 'entities', icon: '🎮', label: 'Entities' },
        { id: 'components', icon: '🧩', label: 'Components' },
        { id: 'systems', icon: '⚡', label: 'Systems' },
        { id: 'event', icon: '📅', label: 'Events'},
        { id: 'console', icon: '💻', label: 'Console' }
    ];

    return `
        <div class="devtools-tabs">
            ${tabs.map(tab => `
                <button class="tab-btn ${tab.id === 'overview' ? 'active' : ''}" 
                        data-tab="${tab.id}" 
                        title="${tab.label}">
                    ${tab.icon} ${tab.label}
                </button>
            `).join('')}
        </div>
    `;
  }

  // ======================================================================
  // Tab Content Rendering
  // ======================================================================

  _renderTabContents() {
    return `
        <div class="tab-contents">
            ${this._renderOverviewTab()}
            ${this._renderEngineTab()}
            ${this._renderEntitiesTab()}
            ${this._renderSystemsTab()}
            ${this._renderPerformanceTab()}
            ${this._renderConsoleTab()}
        </div>
    `;
  }

  _renderOverviewTab() {
    const engineConnected = !!this.devTools.world;
    const memoryUsage = (window.performance && window.performance.memory) 
      ? Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024)) 
      : 'N/A';
    
    const entityCount = engineConnected ? (this.devTools.world.entityManager?.entities?.size || 0) : 0;
    const systemCount = engineConnected ? (this.devTools.world.systemManager?.systems?.length || 0) : 0;
    
    return `
        <div class="tab-content active" id="overview-tab">
            <div class="overview-grid">
                <div class="overview-card">
                    <div class="card-header">Engine Status</div>
                    <div class="card-content">
                        <div class="status-indicator ${engineConnected ? 'online' : 'offline'}">
                            ${engineConnected ? 'Connected' : 'Disconnected'}
                        </div>
                        ${!engineConnected ? 
                            `<button id="connect-engine" class="primary-button">Connect to Engine</button>` : 
                            `<button id="disconnect-engine" class="warning-button">Disconnect</button>`
                        }
                    </div>
                </div>
                
                <div class="overview-card">
                    <div class="card-header">Performance</div>
                    <div class="card-content">
                        <div class="metric">
                            <span>Memory Usage</span>
                            <strong>${memoryUsage} MB</strong>
                        </div>
                        <div class="metric">
                            <span>FPS</span>
                            <strong id="fps-counter">0</strong>
                        </div>
                    </div>
                </div>
                
                <div class="overview-card">
                    <div class="card-header">World Data</div>
                    <div class="card-content">
                        <div class="metric">
                            <span>Entities</span>
                            <strong id="overview-entity-count">${entityCount}</strong>
                        </div>
                        <div class="metric">
                            <span>Systems</span>
                            <strong>${systemCount}</strong>
                        </div>
                    </div>
                </div>
                
                <div class="overview-card">
                    <div class="card-header">Quick Actions</div>
                    <div class="card-content">
                        <div class="button-group">
                            <button id="btn-refresh-data" title="Refresh data">🔄 Refresh</button>
                            <button id="btn-toggle-engine" title="Pause/Resume engine" ${!engineConnected ? 'disabled' : ''}>
                                ⏯️ ${this.devTools.enginePaused ? 'Resume' : 'Pause'}
                            </button>
                        </div>
                        <div class="button-group">
                            <button id="btn-step-engine" title="Step forward one frame" ${!engineConnected ? 'disabled' : ''}>
                                ⏭️ Step
                            </button>
                            <button id="btn-export-data" title="Export debug data">📤 Export</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
  }

  _renderEngineTab() {
    const engineConnected = !!this.devTools.world;
    
    return `
        <div class="tab-content" id="engine-tab">
            <div class="engine-controls">
                <div class="control-group">
                    <label>Engine Controls</label>
                    <div class="button-row">
                        <button id="engine-pause" class="control-button" ${!engineConnected ? 'disabled' : ''}>
                            ${this.devTools.enginePaused ? '▶️ Resume' : '⏸️ Pause'}
                        </button>
                        <button id="engine-step" class="control-button" ${!engineConnected || !this.devTools.enginePaused ? 'disabled' : ''}>
                            ⏭️ Step
                        </button>
                        <button id="engine-restart" class="control-button" ${!engineConnected ? 'disabled' : ''}>
                            🔄 Restart
                        </button>
                    </div>
                </div>
                
                <div class="control-group">
                    <label>Refresh Rate</label>
                    <div class="control-row">
                        <select id="target-fps" ${!engineConnected ? 'disabled' : ''}>
                            <option value="15">15 FPS</option>
                            <option value="30" selected>30 FPS</option>
                            <option value="60">60 FPS</option>
                            <option value="120">120 FPS</option>
                        </select>
                        <button id="apply-fps" ${!engineConnected ? 'disabled' : ''}>Apply</button>
                    </div>
                </div>
                
                <div class="control-group">
                    <label>Auto-Refresh DevTools</label>
                    <div class="control-row">
                        <div class="toggle-switch">
                            <input type="checkbox" id="auto-refresh-toggle">
                            <label for="auto-refresh-toggle"></label>
                        </div>
                        <select id="refresh-rate">
                            <option value="500">0.5s</option>
                            <option value="1000" selected>1s</option>
                            <option value="2000">2s</option>
                            <option value="5000">5s</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="engine-info">
                <h3>Engine Information</h3>
                <div class="info-panel">
                    <pre id="engine-state-display">${engineConnected ? 
                        JSON.stringify({
                            status: 'Connected',
                            engineMode: this.devTools.enginePaused ? 'Paused' : 'Running',
                            frameCount: this.devTools.world.frameCount || 0,
                            entityCount: this.devTools.world.entityManager?.entities?.size || 0,
                            systemCount: this.devTools.world.systemManager?.systems?.length || 0
                        }, null, 2) : 
                        'Engine not connected. Please connect to view engine data.'}</pre>
                </div>
            </div>
        </div>
    `;
  }

  _renderEntitiesTab() {
    const engineConnected = !!this.devTools.world;
    
    return `
        <div class="tab-content" id="entities-tab">
            <div class="split-panel">
                <div class="panel-left">
                    <div class="panel-header">
                        <h3>Entity List</h3>
                        <div class="entity-tools">
                            <input type="search" id="entity-search" placeholder="Search entities...">
                            <button id="create-entity" ${!engineConnected ? 'disabled' : ''}>+ Create</button>
                        </div>
                    </div>
                    <div id="entities-list" class="scrollable-list">
                        ${!engineConnected ? 'Connect to engine to view entities' : 'Loading entities...'}
                    </div>
                </div>
                
                <div class="panel-divider"></div>
                
                <div class="panel-right">
                    <div class="panel-header">
                        <h3 id="selected-entity-name">No entity selected</h3>
                        <div class="entity-actions" id="entity-actions" style="display: none;">
                            <button id="delete-entity" class="danger-button">Delete</button>
                            <button id="clone-entity">Clone</button>
                        </div>
                    </div>
                    <div id="entity-inspector" class="entity-inspector">
                        <div class="inspector-message">Select an entity to inspect its details</div>
                    </div>
                </div>
            </div>
        </div>
    `;
  }

  _renderSystemsTab() {
    const engineConnected = !!this.devTools.world;
    
    return `
        <div class="tab-content" id="systems-tab">
            <div class="systems-header">
                <h3>Active Systems</h3>
                <div class="systems-tools">
                    <button id="refresh-systems" ${!engineConnected ? 'disabled' : ''}>Refresh</button>
                </div>
            </div>
            
            <div class="systems-table-container">
                <table class="systems-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Last Execution</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="systems-list">
                        ${!engineConnected ? 
                            `<tr><td colspan="5">Connect to engine to view systems</td></tr>` : 
                            `<tr><td colspan="5">Loading systems...</td></tr>`}
                    </tbody>
                </table>
            </div>
            
            <div class="system-detail-panel">
                <h3>System Details</h3>
                <pre id="system-details">Select a system to view details</pre>
            </div>
        </div>
    `;
  }

  _renderPerformanceTab() {
    return `
        <div class="tab-content" id="performance-tab">
            <div class="performance-header">
                <h3>Performance Monitoring</h3>
                <div class="perf-controls">
                    <button id="start-recording">Start Recording</button>
                    <button id="clear-data">Clear Data</button>
                </div>
            </div>
            
            <div class="perf-charts">
                <div class="chart-container">
                    <h4>FPS</h4>
                    <canvas id="fps-chart" height="100"></canvas>
                </div>
                <div class="chart-container">
                    <h4>Memory Usage</h4>
                    <canvas id="memory-chart" height="100"></canvas>
                </div>
            </div>
            
            <div class="perf-metrics">
                <div class="metric-card">
                    <div class="metric-title">Average FPS</div>
                    <div class="metric-value" id="avg-fps">0</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Min FPS</div>
                    <div class="metric-value" id="min-fps">0</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Max FPS</div>
                    <div class="metric-value" id="max-fps">0</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Current Memory</div>
                    <div class="metric-value" id="current-memory">0 MB</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Peak Memory</div>
                    <div class="metric-value" id="peak-memory">0 MB</div>
                </div>
            </div>
            
            <div class="perf-table-container">
                <h3>System Performance</h3>
                <table class="perf-table">
                    <thead>
                        <tr>
                            <th>System</th>
                            <th>Avg. Execution Time</th>
                            <th>Last Execution Time</th>
                            <th>% of Frame</th>
                        </tr>
                    </thead>
                    <tbody id="system-perf-list">
                        <tr><td colspan="4">No performance data available</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
  }

  _renderConsoleTab() {
    return `
        <div class="tab-content" id="console-tab">
            <div class="console-wrapper">
                <div class="console-header">
                    <div class="console-controls">
                        <button id="clear-console">Clear</button>
                        <button id="export-logs">Export</button>
                        <div class="log-filter">
                            <label for="log-level">Filter:</label>
                            <select id="log-level">
                                <option value="all">All</option>
                                <option value="info">Info</option>
                                <option value="warn">Warnings</option>
                                <option value="error">Errors</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div id="console-output" class="console-output"></div>
                
                <div class="console-input-wrapper">
                    <span class="console-prompt">></span>
                    <input type="text" id="console-input" placeholder="Enter command...">
                    <button id="execute-command">Run</button>
                </div>
                
                <div class="console-history-toggle">
                    <button id="toggle-history">History ▼</button>
                    <div id="history-panel" class="history-panel" style="display: none;">
                        <select id="command-history" size="5">
                            <option disabled>Command History</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `;
  }

  // ======================================================================
  // Event Listeners
  // ======================================================================

  _attachEventListeners() {
    // Tab switching
    this._attachTabListeners();
    
    // Panel controls
    this._attachPanelControls();
    
    // Engine connection and control
    this._attachEngineControls();
    
    // Entity management
    this._attachEntityControls();
    
    // Performance monitoring
    this._attachPerfMonitoringControls();
    
    // Console functionality
    this._attachConsoleControls();
  }

  _attachTabListeners() {
    const tabs = this.devTools.container.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            // Get all tab contents
            const contents = this.devTools.container.querySelectorAll('.tab-content');
            
            // Remove active class from all tabs and contents
            contents.forEach(content => content.classList.remove('active'));
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            const targetTab = e.target.dataset.tab;
            document.getElementById(`${targetTab}-tab`).classList.add('active');
            e.target.classList.add('active');
            
            // Special handling for certain tabs
            if (targetTab === 'entities' && this.devTools.world) {
                this.devTools._refreshEntitiesList();
            } else if (targetTab === 'systems' && this.devTools.world) {
                this.devTools._refreshSystemsList();
            }
        });
    });
  }

  _attachPanelControls() {
    // Close button
    const closeBtn = this.devTools.container.querySelector('#close-devtools');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.devTools.toggle());
    }
    
    // Minimize button
    const minimizeBtn = this.devTools.container.querySelector('#minimize-devtools');
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', () => this.devTools._minimizePanel());
    }
    
    // Refresh button
    const refreshBtn = this.devTools.container.querySelector('#refresh-devtools');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.devTools._refreshAll());
    }
    
    // Make panel draggable
    const header = this.devTools.container.querySelector('.devtools-header');
    if (header) {
      header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.devtools-controls')) return; // Don't drag when clicking controls
        this.devTools._startDragging(e);
      });
    }
  }

  _attachEngineControls() {
    // Connect to engine button
    const connectBtn = this.devTools.container.querySelector('#connect-engine');
    if (connectBtn) {
      connectBtn.addEventListener('click', () => this.devTools._connectToEngine());
    }
    
    // Disconnect button
    const disconnectBtn = this.devTools.container.querySelector('#disconnect-engine');
    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', () => this.devTools._disconnectFromEngine());
    }
    
    // Engine pause/resume button
    const pauseBtn = this.devTools.container.querySelector('#engine-pause');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.devTools._toggleEnginePause());
    }
    
    // Engine step button
    const stepBtn = this.devTools.container.querySelector('#engine-step');
    if (stepBtn) {
      stepBtn.addEventListener('click', () => this.devTools._stepEngine());
    }
    
    // Apply FPS button
    const applyFpsBtn = this.devTools.container.querySelector('#apply-fps');
    if (applyFpsBtn) {
      applyFpsBtn.addEventListener('click', () => {
        const targetFps = parseInt(document.getElementById('target-fps').value);
        this.devTools._setEngineFPS(targetFps);
      });
    }
    
    // Auto-refresh toggle
    const autoRefreshToggle = this.devTools.container.querySelector('#auto-refresh-toggle');
    if (autoRefreshToggle) {
      autoRefreshToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.devTools.startAutoRefresh();
        } else {
          this.devTools.stopAutoRefresh();
        }
      });
    }
    
    // Refresh rate dropdown
    const refreshRate = this.devTools.container.querySelector('#refresh-rate');
    if (refreshRate) {
      refreshRate.addEventListener('change', (e) => {
        this.devTools.autoRefreshRate = parseInt(e.target.value);
        this.devTools.updateAutoRefresh();
      });
    }
  }

  _attachEntityControls() {
    // Create entity button
    const createEntityBtn = this.devTools.container.querySelector('#create-entity');
    if (createEntityBtn) {
      createEntityBtn.addEventListener('click', () => {
        // Show entity creation dialog
        this.devTools._showEntityCreationDialog();
      });
    }
    
    // Entity search
    const entitySearch = this.devTools.container.querySelector('#entity-search');
    if (entitySearch) {
      entitySearch.addEventListener('input', (e) => {
        this.devTools._filterEntities(e.target.value);
      });
    }
  }

  _attachPerfMonitoringControls() {
    // Start recording button
    const startRecordingBtn = this.devTools.container.querySelector('#start-recording');
    if (startRecordingBtn) {
      startRecordingBtn.addEventListener('click', () => {
        if (startRecordingBtn.textContent === 'Start Recording') {
          this.devTools._startPerformanceRecording();
          startRecordingBtn.textContent = 'Stop Recording';
        } else {
          this.devTools._stopPerformanceRecording();
          startRecordingBtn.textContent = 'Start Recording';
        }
      });
    }
    
    // Clear data button
    const clearDataBtn = this.devTools.container.querySelector('#clear-data');
    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', () => this.devTools._clearPerformanceData());
    }
  }

  _attachConsoleControls() {
    // Execute command button
    const executeBtn = this.devTools.container.querySelector('#execute-command');
    if (executeBtn) {
      executeBtn.addEventListener('click', () => {
        const input = document.getElementById('console-input');
        this.devTools._executeConsoleCommand(input.value);
        input.value = '';
      });
    }
    
    // Console input keypress
    const consoleInput = this.devTools.container.querySelector('#console-input');
    if (consoleInput) {
      consoleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.devTools._executeConsoleCommand(e.target.value);
          e.target.value = '';
        }
      });
    }
    
    // Clear console button
    const clearConsoleBtn = this.devTools.container.querySelector('#clear-console');
    if (clearConsoleBtn) {
      clearConsoleBtn.addEventListener('click', () => this.devTools._clearConsole());
    }
    
    // Toggle history button
    const toggleHistoryBtn = this.devTools.container.querySelector('#toggle-history');
    if (toggleHistoryBtn) {
      toggleHistoryBtn.addEventListener('click', () => {
        const historyPanel = document.getElementById('history-panel');
        const isVisible = historyPanel.style.display !== 'none';
        historyPanel.style.display = isVisible ? 'none' : 'block';
        toggleHistoryBtn.textContent = isVisible ? 'History ▼' : 'History ▲';
      });
    }
    
    // Command history selection
    const commandHistory = this.devTools.container.querySelector('#command-history');
    if (commandHistory) {
      commandHistory.addEventListener('dblclick', (e) => {
        if (e.target.tagName === 'OPTION' && e.target.value) {
          const consoleInput = document.getElementById('console-input');
          if (consoleInput) {
            consoleInput.value = e.target.textContent;
            consoleInput.focus();
          }
        }
      });
    }
  }
}
