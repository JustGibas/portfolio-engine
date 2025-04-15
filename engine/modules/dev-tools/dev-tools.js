/**
 * DevTools Module
 * ======================================================================
 * Professional DevTools for the Portfolio Engine
 */

export class DevTools {
    constructor() {
        // Core properties
        this.version = '1.0.0';
        this.isVisible = false;
        this.isDragging = false;
        this.position = { x: 20, y: 20 };
        this.world = null;
        this.enginePaused = false;

        // Auto-refresh properties
        this.autoRefreshRate = 1000;
        this.autoRefreshInterval = null;

        // Tab management properties 
        this.loadedTabs = new Map();
        this.activeTab = null;

        // Initialize UI
        this._loadStyles()
            .then(() => this._initializeDevTools())
            .catch(err => {
                console.warn('Failed to load DevTools styles:', err);
                this._injectFallbackStyles();
                this._initializeDevTools();
            });
    }

    // ======================================================================
    // Tab Management Methods
    // ======================================================================

    async loadTab(tabId) {
        if (this.loadedTabs.has(tabId)) {
            return this.loadedTabs.get(tabId);
        }

        try {
            const module = await import(`./tabs/${tabId}/${tabId}-tab.js`);
            await this._loadTabStyles(tabId);

            const TabClass = module.default || Object.values(module)[0];
            const tab = new TabClass(this);
            this.loadedTabs.set(tabId, tab);
            
            return tab;
        } catch (error) {
            console.error(`Failed to load tab ${tabId}:`, error);
            throw error;
        }
    }

    async activateTab(tabId) {
        const tab = await this.loadTab(tabId);
        
        if (this.activeTab) {
            document.querySelector(`.tab-btn[data-tab="${this.activeTab}"]`)?.classList.remove('active');
            document.getElementById(`${this.activeTab}-tab`)?.classList.remove('active');
        }

        this.activeTab = tabId;
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`)?.classList.add('active');
        
        const tabContent = document.getElementById(`${tabId}-tab`);
        if (tabContent) {
            tabContent.innerHTML = tab.render();
            tabContent.classList.add('active');
            tab.attachEventListeners?.();
        }

        return tab;
    }

    async _loadTabStyles(tabId) {
        const linkId = `devtools-${tabId}-styles`;
        if (document.getElementById(linkId)) {
            return;
        }

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            link.href = `./engine/modules/dev-tools/tabs/${tabId}/${tabId}-tab.css`;
            
            link.onload = () => resolve();
            link.onerror = () => reject(new Error(`Failed to load ${tabId} tab CSS`));
            
            document.head.appendChild(link);
        });
    }

    // ======================================================================
    // Rendering Methods
    // ======================================================================

    render() {
        if (!this.container) return;
        
        this.container.innerHTML = this._generateDevToolsHTML();
        this._attachEventListeners();
        
        // Load the default overview tab
        this.activateTab('overview');
    }

    _generateDevToolsHTML() {
        return `
            <div class="devtools-content">
                ${this._renderHeader()}
                ${this._renderTabs()}
                <div class="tab-contents">
                    <div class="tab-content" id="overview-tab"></div>
                    <div class="tab-content" id="performance-tab"></div>
                    <div class="tab-content" id="engine-tab"></div>
                    <div class="tab-content" id="entities-tab"></div>
                    <div class="tab-content" id="components-tab"></div>
                    <div class="tab-content" id="systems-tab"></div>
                    <div class="tab-content" id="events-tab"></div>
                    <div class="tab-content" id="tasks-tab"></div>
                    <div class="tab-content" id="console-tab"></div>
                </div>
                <div class="devtools-footer">
                    <span>Engine v${this.version || '1.0.0'}</span>
                    <span class="connection-status ${this.world ? 'connected' : 'disconnected'}">
                        ${this.world ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
            </div>
        `;
    }

    _renderHeader() {
        return `
            <div class="devtools-header">
                <div class="devtools-title">
                    <span class="devtools-grip">⋮⋮</span>
                    <h2>DevTools</h2>
                </div>
                <div class="devtools-controls">
                    <button id="refresh-devtools" title="Refresh DevTools">🔄</button>
                    <button id="inspect-devtools" title="inspect tool">🔎</button>
                    <button id="close-devtools" title="Close">✕</button>
                </div>
            </div>
        `;
    }

    _renderTabs() {
        const tabs = [
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'performance', icon: '📈', label: 'Performance' },
            { id: 'engine', icon: '⚙️', label: 'Engine' },
            { id: 'entities', icon: '🎮', label: 'Entities' },
            { id: 'components', icon: '🧩', label: 'Components' },
            { id: 'systems', icon: '⚡', label: 'Systems' },
            { id: 'events', icon: '📅', label: 'Events' },
            { id: 'tasks', icon: '🗂️', label: 'Tasks' },
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

    _attachEventListeners() {
        this._attachTabListeners();
        this._attachPanelControls();
    }

    _attachTabListeners() {
        const tabs = this.container.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', async (e) => {
                const targetTab = e.target.dataset.tab;
                await this.activateTab(targetTab);
            });
        });
    }

    _attachPanelControls() {
        // Close button
        const closeBtn = this.container.querySelector('#close-devtools');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.toggle());
        }
        
        // Refresh button
        const refreshBtn = this.container.querySelector('#refresh-devtools');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this._refreshAll());
        }
        
        // Make header draggable with both mouse and touch events
        const header = this.container.querySelector('.devtools-header');
        if (header) {
            header.addEventListener('mousedown', (e) => {
                if (e.target.closest('.devtools-controls')) return;
                this._startDragging(e);
            });
            
            header.addEventListener('touchstart', (e) => {
                if (e.target.closest('.devtools-controls')) return;
                this._startDragging(e);
            }, { passive: true });
        }
        
        // Prevent default touch behavior inside the tab contents
        const tabContents = this.container.querySelector('.tab-contents');
        if (tabContents) {
            // This ensures touch events in tab content don't affect the main page
            tabContents.addEventListener('touchmove', (e) => {
                e.stopPropagation();
            }, { passive: true });
        }
    }

    _startDragging(e) {
        if (e.target.closest('.devtools-controls')) return;
        
        this.isDragging = true;
        this.container.classList.add('dragging');
        
        // Handle both mouse and touch events
        if (e.type === 'touchstart') {
            this.dragStart = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        } else {
            this.dragStart = {
                x: e.clientX,
                y: e.clientY
            };
        }
        
        this.dragStartPos = {
            x: this.position.x,
            y: this.position.y
        };
    }

    _handleDragMove(e) {
        if (!this.isDragging) return;
        
        let clientX, clientY;
        
        // Handle both mouse and touch events
        if (e.type === 'touchmove') {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
            e.preventDefault(); // Prevent scrolling while dragging on touch devices
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const deltaX = clientX - this.dragStart.x;
        const deltaY = clientY - this.dragStart.y;
        
        this.position.x = this.dragStartPos.x + deltaX;
        this.position.y = this.dragStartPos.y + deltaY;
        
        // Keep the panel within viewport bounds
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const panelWidth = this.container.offsetWidth;
        const panelHeight = this.container.offsetHeight;
        
        // Ensure the panel doesn't go off-screen
        this.position.x = Math.max(0, Math.min(this.position.x, viewportWidth - 80));
        this.position.y = Math.max(0, Math.min(this.position.y, viewportHeight - 80));
        
        this.container.style.left = `${this.position.x}px`;
        this.container.style.top = `${this.position.y}px`;
    }

    _endDragging() {
        if (this.isDragging) {
            this.isDragging = false;
            this.container.classList.remove('dragging');
        }
    }

    _setupGlobalListeners() {
        // Mouse dragging functionality
        document.addEventListener('mousemove', this._handleDragMove.bind(this));
        document.addEventListener('mouseup', this._endDragging.bind(this));
        
        // Touch dragging functionality for mobile devices
        document.addEventListener('touchmove', this._handleDragMove.bind(this), { passive: false });
        document.addEventListener('touchend', this._endDragging.bind(this));
        document.addEventListener('touchcancel', this._endDragging.bind(this));
        
        // Track touch start position for better scrolling detection
        document.addEventListener('touchstart', (e) => {
            if (this.isVisible && e.touches.length === 1) {
                this._lastTouchY = e.touches[0].clientY;
            }
        }, { passive: true });
        
        // Handle window resize to keep panel within viewport
        window.addEventListener('resize', () => {
            if (this.container) {
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const panelWidth = this.container.offsetWidth;
                const panelHeight = this.container.offsetHeight;
                
                // Adjust position if needed
                if (this.position.x + panelWidth > viewportWidth) {
                    this.position.x = Math.max(0, viewportWidth - panelWidth);
                    this.container.style.left = `${this.position.x}px`;
                }
                if (this.position.y + panelHeight > viewportHeight) {
                    this.position.y = Math.max(0, viewportHeight - panelHeight);
                    this.container.style.top = `${this.position.y}px`;
                }
            }
        });
    }

    _preventBodyScrolling(enable) {
        // No need for overlay or complex DOM manipulation
        // Just clean event handling using mathematics
        if (enable) {
            // We only need this for mobile devices
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            if (isMobile) {
                // Add a global touchmove handler that mathematically determines
                // if the touch is within DevTools bounds
                if (!this._globalTouchHandler) {
                    this._globalTouchHandler = this._handleGlobalTouch.bind(this);
                    document.addEventListener('touchmove', this._globalTouchHandler, { passive: false });
                }
            }
        } else {
            // Clean up when DevTools is closed
            if (this._globalTouchHandler) {
                document.removeEventListener('touchmove', this._globalTouchHandler);
                this._globalTouchHandler = null;
            }
        }
    }
    
    _handleGlobalTouch(e) {
        // Only interfere with touch events if DevTools is visible
        if (!this.isVisible) return;
        
        // Get touch coordinates
        const touch = e.touches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        
        // Get DevTools boundaries
        const rect = this.container.getBoundingClientRect();
        
        // Check if the touch is within DevTools bounds
        const isInsideDevTools = (
            x >= rect.left &&
            x <= rect.right &&
            y >= rect.top &&
            y <= rect.bottom
        );
        
        // If touch is inside DevTools, prevent page scroll
        if (isInsideDevTools) {
            // Let the individual scrollable elements inside DevTools handle their own scrolling
            // Only prevent default if the touch started on a non-scrollable element
            const target = document.elementFromPoint(x, y);
            if (target) {
                // Check if the target or any of its parents is a scrollable element inside DevTools
                let isScrollable = false;
                let element = target;
                
                while (element && this.container.contains(element)) {
                    // Check if element is scrollable
                    const style = window.getComputedStyle(element);
                    const overflow = style.getPropertyValue('overflow') || 
                                    style.getPropertyValue('overflow-y');
                                    
                    const hasScroll = element.scrollHeight > element.clientHeight;
                    
                    if ((overflow === 'auto' || overflow === 'scroll') && hasScroll) {
                        // Check if we're at the top or bottom of the scrollable area
                        const isAtTop = element.scrollTop <= 0;
                        const isAtBottom = element.scrollTop + element.clientHeight >= element.scrollHeight;
                        
                        // If we're at the boundary, we might need to let the parent handle it
                        if ((isAtTop && this._lastTouchY > y) || (isAtBottom && this._lastTouchY < y)) {
                            // At boundary, moving in a direction that should be handled by parent
                        } else {
                            isScrollable = true;
                            break;
                        }
                    }
                    
                    element = element.parentElement;
                }
                
                // If we're on a non-scrollable element inside DevTools, prevent default
                if (!isScrollable) {
                    e.preventDefault();
                }
            }
        }
        
        // Store the current touch position for delta calculations
        this._lastTouchY = y;
    }

    toggle() {
        this.isVisible = !this.isVisible;
        this.container.style.display = this.isVisible ? 'block' : 'none';
        
        // Add mobile-specific touch handling only when needed
        if (this.isVisible) {
            // Check if it's a mobile device
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            // For mobile devices, optimize the display
            if (isMobile) {
                // Position the panel for better mobile viewing
                this.position = { x: 5, y: 5 };
                this.container.style.left = '5px';
                this.container.style.top = '5px';
                this.container.style.width = 'calc(100vw - 10px)';
                this.container.style.height = 'calc(80vh - 10px)'; // Slightly smaller to allow some access to the page
                
                this._preventBodyScrolling(true);
            }
            
            this._refreshAll();
            this.startAutoRefresh();
        } else {
            // Clean up when DevTools is closed
            this._preventBodyScrolling(false);
            this.stopAutoRefresh();
        }
    }

    // ======================================================================
    // Initialization Methods
    // ======================================================================

    _initializeDevTools() {
        this._createContainer();
        this._createToggleButton();
        this.render();
        this._setupGlobalListeners();
        console.info('DevTools ready');
    }

    _createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'portfolio-devtools';
        this.container.className = 'devtools-panel';
        this.container.style.right = 'auto';
        this.container.style.left = `${this.position.x}px`;
        this.container.style.top = `${this.position.y}px`;
        document.body.appendChild(this.container);
    }

    _createToggleButton() {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'devtools-toggle';
        toggleBtn.innerHTML = '🛠️';
        toggleBtn.className = 'devtools-toggle-btn';
        toggleBtn.onclick = () => this.toggle();
        document.body.appendChild(toggleBtn);
    }

    // ======================================================================
    // Load Styles
    // ======================================================================

    async _loadStyles() {
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
            .tab-content { display: none; }
            .tab-content.active { display: block; }
        `;
        document.head.appendChild(style);
    }

    // ======================================================================
    // Panel Controls
    // ======================================================================

    _minimizePanel() {
        this.container.style.display = "none";
        this._enableCaptureMode();
    }
    
    _enableCaptureMode() {
        document.body.style.cursor = 'crosshair';
        const clickHandler = (e) => {
            e.preventDefault();
            document.body.style.cursor = '';
            document.removeEventListener('click', clickHandler);
            this.container.style.display = 'block';
            
            const element = e.target;
            if (element) {
                this._inspectElement(element);
            }
        };
        document.addEventListener('click', clickHandler);
    }

    // ======================================================================
    // Auto-refresh Functionality
    // ======================================================================

    startAutoRefresh() {
        this.stopAutoRefresh();
        this.autoRefreshInterval = setInterval(() => {
            this._refreshAll();
        }, this.autoRefreshRate);
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    updateAutoRefresh() {
        if (this.autoRefreshInterval) {
            this.startAutoRefresh();
        }
    }

    // ======================================================================
    // Engine Controls
    // ======================================================================

    _connectToEngine() {
        // Implementation depends on your engine
        this.world = window.engine?.world;
        this._refreshAll();
        this.render();
    }

    _disconnectFromEngine() {
        this.world = null;
        this._refreshAll();
        this.render();
    }

    _toggleEnginePause() {
        if (!this.world) return;
        
        this.enginePaused = !this.enginePaused;
        if (this.enginePaused) {
            window.engine?.stop();
        } else {
            window.engine?.start();
        }
        this._refreshAll();
    }

    _stepEngine() {
        if (!this.world || !this.enginePaused) return;
        
        window.engine?.step();
        this._refreshAll();
    }

    _setEngineFPS(fps) {
        if (!this.world) return;
        
        window.engine?.setTargetFPS(fps);
        this._refreshAll();
    }

    // ======================================================================
    // Data Refresh
    // ======================================================================

    _refreshAll() {
        if (!this.isVisible) return;
        
        this._refreshEngineData();
        this._refreshEntitiesList();
        this._refreshSystemsList();
        this._updatePerformanceData();
    }

    _refreshEngineData() {
        // This will be called by the Overview tab
        if (!this.world) return;
        
        const tab = this.loadedTabs.get('overview');
        if (tab) {
            document.getElementById('overview-tab').innerHTML = tab.render();
            tab.attachEventListeners();
        }
    }

    _refreshEntitiesList() {
        if (!this.world) return;
        
        const tab = this.loadedTabs.get('entities');
        if (tab) {
            document.getElementById('entities-tab').innerHTML = tab.render();
            tab.attachEventListeners();
        }
    }

    _refreshSystemsList() {
        if (!this.world) return;
        
        const tab = this.loadedTabs.get('systems');
        if (tab) {
            document.getElementById('systems-tab').innerHTML = tab.render();
            tab.attachEventListeners();
        }
    }

    _updatePerformanceData() {
        if (!this.world) return;
        
        const tab = this.loadedTabs.get('performance');
        if (tab) {
            tab.updateMetrics();
        }
    }

    // ======================================================================
    // Utility Methods
    // ======================================================================

    _showNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.className = `devtools-notification${isError ? ' error' : ''}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
}
