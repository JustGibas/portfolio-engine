/**
 * Simple Console Tab Module
 * ======================================================================
 * Provides a simplified, reliable console interface for the DevTools
 */
export class ConsoleTab {
    constructor(devTools) {
        this.devTools = devTools;
        this.logs = [];
        this.maxLogs = 100;
        this.filter = '';
        this.logLevel = 'all';
        this.isCollapsed = false;
        
        // Initialize console interception
        this._setupConsoleInterception();
    }

    /**
     * Renders the console tab UI
     */
    render() {
        return `
            <div class="simple-console">
                <div class="console-header">
                    <div class="console-filters">
                        <input type="text" id="console-filter" placeholder="Filter logs..." value="${this.filter}">
                        <select id="log-level-filter">
                            <option value="all" ${this.logLevel === 'all' ? 'selected' : ''}>All</option>
                            <option value="log" ${this.logLevel === 'log' ? 'selected' : ''}>Log</option>
                            <option value="info" ${this.logLevel === 'info' ? 'selected' : ''}>Info</option>
                            <option value="warn" ${this.logLevel === 'warn' ? 'selected' : ''}>Warning</option>
                            <option value="error" ${this.logLevel === 'error' ? 'selected' : ''}>Error</option>
                        </select>
                        <div class="console-actions">
                            <button id="clear-console" title="Clear console">🗑️ Clear</button>
                            <button id="toggle-view" title="Toggle view">
                                ${this.isCollapsed ? '🔽 Expand' : '🔼 Collapse'}
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="console-output">
                    ${this._renderLogs()}
                </div>
                
                <div class="console-input-container">
                    <div class="console-prompt">></div>
                    <textarea id="console-input" placeholder="Enter commands here..." rows="1"></textarea>
                    <button id="run-command" title="Execute">▶️</button>
                </div>
                
                <div class="console-help">
                    <details>
                        <summary>ℹ️ Console Help</summary>
                        <div class="help-content">
                            <p><strong>Available commands:</strong></p>
                            <ul>
                                <li><code>engine</code> - Access the game engine</li>
                                <li><code>entities</code> - List all entities</li>
                                <li><code>components(entityId)</code> - List components for an entity</li>
                                <li><code>systems</code> - List all systems</li>
                                <li><code>clear()</code> - Clear the console</li>
                                <li><code>help()</code> - Show this help</li>
                            </ul>
                            <p>Example: <code>engine.world.getEntityCount()</code></p>
                        </div>
                    </details>
                </div>
            </div>
        `;
    }

    /**
     * Attaches event listeners to the console UI elements
     */
    attachEventListeners() {
        // Filter input
        const filterInput = document.getElementById('console-filter');
        if (filterInput) {
            filterInput.addEventListener('input', (e) => {
                this.filter = e.target.value.toLowerCase();
                this._updateDisplay();
            });
        }
        
        // Log level filter
        const levelFilter = document.getElementById('log-level-filter');
        if (levelFilter) {
            levelFilter.addEventListener('change', (e) => {
                this.logLevel = e.target.value;
                this._updateDisplay();
            });
        }
        
        // Clear button
        const clearBtn = document.getElementById('clear-console');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this._clearConsole());
        }
        
        // Toggle view button
        const toggleBtn = document.getElementById('toggle-view');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.isCollapsed = !this.isCollapsed;
                this._updateDisplay();
            });
        }
        
        // Console input
        const input = document.getElementById('console-input');
        const runBtn = document.getElementById('run-command');
        
        if (input) {
            // Handle Enter key
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this._executeCommand(input.value);
                    input.value = '';
                } else if (e.key === 'Enter' && e.shiftKey) {
                    // Allow multiline input with Shift+Enter
                }
                
                // Auto-resize the textarea
                setTimeout(() => {
                    input.style.height = 'auto';
                    input.style.height = Math.min(input.scrollHeight, 150) + 'px';
                }, 0);
            });
        }
        
        if (runBtn) {
            runBtn.addEventListener('click', () => {
                const input = document.getElementById('console-input');
                if (input) {
                    this._executeCommand(input.value);
                    input.value = '';
                    input.style.height = 'auto';
                }
            });
        }
        
        // Make log entries expandable
        document.querySelectorAll('.log-entry.expandable').forEach(entry => {
            entry.addEventListener('click', () => {
                entry.classList.toggle('expanded');
            });
        });
    }

    /**
     * Sets up interception of console methods
     */
    _setupConsoleInterception() {
        const methods = ['log', 'info', 'warn', 'error', 'debug'];
        this.originalConsole = {};
        
        methods.forEach(method => {
            this.originalConsole[method] = console[method];
            console[method] = (...args) => {
                this._captureLog(method, args);
                this.originalConsole[method](...args);
            };
        });
        
        // Capture uncaught errors
        window.addEventListener('error', (event) => {
            this._captureLog('error', [event.error || event.message]);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this._captureLog('error', [event.reason || 'Unhandled Promise rejection']);
        });
    }
    
    /**
     * Captures console output and adds it to the logs
     */
    _captureLog(level, args) {
        const timestamp = new Date();
        const content = args.map(arg => this._formatLogItem(arg)).join(' ');
        const isExpandable = args.some(arg => 
            arg !== null && 
            typeof arg === 'object' && 
            Object.keys(arg).length > 0);
        
        const log = {
            id: Date.now() + Math.random().toString(36).substring(2, 9),
            timestamp,
            level,
            content,
            rawContent: args,
            isExpandable
        };
        
        this.logs.push(log);
        
        // Keep logs under control
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // Update display if we're visible
        if (this.devTools.isVisible && this.devTools.activeTab === 'console') {
            this._updateDisplay();
        }
    }
    
    /**
     * Formats a log item for display
     */
    _formatLogItem(item) {
        if (item === null) return 'null';
        if (item === undefined) return 'undefined';
        
        if (item instanceof Error) {
            return `${item.name}: ${item.message}\n${item.stack || ''}`;
        }
        
        if (typeof item === 'object') {
            try {
                return JSON.stringify(item, null, 2);
            } catch (err) {
                return String(item);
            }
        }
        
        return String(item);
    }
    
    /**
     * Renders logs based on current filters
     */
    _renderLogs() {
        if (this.logs.length === 0) {
            return '<div class="empty-log">No logs to display</div>';
        }
        
        const filteredLogs = this.logs.filter(log => {
            // Apply level filter
            if (this.logLevel !== 'all' && log.level !== this.logLevel) {
                return false;
            }
            
            // Apply text filter
            if (this.filter && !log.content.toLowerCase().includes(this.filter)) {
                return false;
            }
            
            return true;
        });
        
        if (filteredLogs.length === 0) {
            return '<div class="empty-log">No logs match the current filters</div>';
        }
        
        return filteredLogs.map(log => {
            const timestamp = log.timestamp.toLocaleTimeString();
            const displayMode = this.isCollapsed && log.isExpandable ? 'collapsed' : '';
            
            return `
                <div class="log-entry level-${log.level} ${log.isExpandable ? 'expandable' : ''} ${displayMode}"
                     data-log-id="${log.id}">
                    <span class="log-time">${timestamp}</span>
                    <span class="log-level">${log.level}</span>
                    <div class="log-content ${log.isExpandable ? 'has-details' : ''}">
                        ${log.isExpandable ? 
                            `<div class="log-summary">${this._getPreview(log.rawContent[0])}</div>
                             <div class="log-details">${log.content}</div>` : 
                            `<div class="log-message">${log.content}</div>`}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Creates a preview for complex objects
     */
    _getPreview(item) {
        if (Array.isArray(item)) {
            return `Array(${item.length}) [${item.slice(0, 3).map(String).join(', ')}${item.length > 3 ? '...' : ''}]`;
        }
        
        if (item instanceof Error) {
            return item.message;
        }
        
        if (item !== null && typeof item === 'object') {
            const constructor = item.constructor.name;
            const keys = Object.keys(item);
            const preview = keys.slice(0, 3).map(k => `${k}: ${String(item[k]).substring(0, 15)}`).join(', ');
            return `${constructor} {${preview}${keys.length > 3 ? '...' : ''}}`;
        }
        
        return String(item);
    }
    
    /**
     * Updates the console display
     */
    _updateDisplay() {
        const output = document.querySelector('.console-output');
        if (output) {
            output.innerHTML = this._renderLogs();
            
            // Reattach event listeners for expandable entries
            document.querySelectorAll('.log-entry.expandable').forEach(entry => {
                entry.addEventListener('click', () => {
                    entry.classList.toggle('expanded');
                });
            });
            
            // Auto-scroll to bottom
            output.scrollTop = output.scrollHeight;
        }
        
        // Update toggle button text
        const toggleBtn = document.getElementById('toggle-view');
        if (toggleBtn) {
            toggleBtn.textContent = this.isCollapsed ? '🔽 Expand' : '🔼 Collapse';
            toggleBtn.title = this.isCollapsed ? 'Expand all logs' : 'Collapse all logs';
        }
    }
    
    /**
     * Clears the console
     */
    _clearConsole() {
        this.logs = [];
        this._updateDisplay();
    }
    
    /**
     * Executes a command entered in the console
     */
    _executeCommand(command) {
        if (!command.trim()) return;
        
        // Special commands
        if (command === 'clear()') {
            this._clearConsole();
            return;
        }
        
        if (command === 'help()') {
            this._captureLog('info', ['Available commands: engine, entities, components(entityId), systems, clear(), help()']);
            return;
        }

        // Helper shortcuts for common engine access
        const modifiedCommand = command
            .replace(/^entities$/i, 'engine.world.getEntities()')
            .replace(/^systems$/i, 'engine.world.getSystems()')
            .replace(/^components\((\d+)\)$/i, 'engine.world.getEntityComponents($1)');
        
        try {
            // Safe command execution context
            const context = {
                engine: window.engine,
                world: window.engine?.world,
                console: this.originalConsole // Use original console to avoid recursive logging
            };
            
            // Create function with provided context
            const keys = Object.keys(context);
            const values = Object.values(context);
            
            // Wrap in try-catch inside the function for safer evaluation
            const fn = new Function(...keys, `
                try {
                    return eval("${modifiedCommand.replace(/"/g, '\\"')}");
                } catch (error) {
                    return error;
                }
            `);
            
            const result = fn(...values);
            
            // Log the command and its result
            this._captureLog('log', [`> ${command}`]);
            
            if (result instanceof Error) {
                this._captureLog('error', [result]);
            } else {
                this._captureLog('info', [result]);
            }
        } catch (error) {
            this._captureLog('log', [`> ${command}`]);
            this._captureLog('error', [error]);
        }
    }
}