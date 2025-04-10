/**
 * =====================================================================
 * Portfolio Engine Module Class
 * =====================================================================
 * @fileoverview Base Module Class
 * 
 * This file defines the core Module class that serves as the foundation
 * for all modules in the Portfolio Engine. It provides a standard interface
 * and lifecycle methods that all modules should implement.
 */

/**
 * Base Module class that all modules should extend
 */
class Module {
    /**
     * Create a new module
     * @param {Object} world - The world instance this module will operate within
     * @param {Object} [options={}] - Module options
     */
    constructor(world, options = {}) {
        /**
         * World reference
         * @type {Object}
         */
        this.world = world;
        
        /**
         * Module name
         * @type {string}
         */
        this.name = options.name || this.constructor.name;
        
        /**
         * Module version
         * @type {string}
         */
        this.version = options.version || '1.0.0';
        
        /**
         * Module description
         * @type {string}
         */
        this.description = options.description || '';
        
        /**
         * Module dependencies
         * @type {Array<string>}
         */
        this.dependencies = options.dependencies || [];
        
        /**
         * Module configuration
         * @type {Object}
         */
        this.config = options.config || {};
        
        /**
         * Module state
         * @type {string}
         */
        this.state = 'created';
        
        /**
         * Entity associated with this module
         * @type {Object}
         */
        this.entity = null;
        
        /**
         * Error state
         * @type {Object}
         */
        this.error = null;
        
        /**
         * Module internal state storage
         * @type {Object}
         * @private
         */
        this._state = {};
        
        /**
         * UI-related properties (optional)
         */
        this.isVisible = false;
        this.container = null;
        this._initialized = false;
        
        // Log creation
        console.log(`${this.name}: Module created`);
    }

    /**
     * Initialize the module
     * @param {Object} [options={}] - Additional initialization options
     * @returns {Promise<Module>} This module instance
     */
    async init(options = {}) {
        try {
            // Merge additional options with existing config
            this.config = { ...this.config, ...options };
            
            // Create UI container if needed
            if (this.config.createUI) {
                this._createContainer();
                // Load CSS if available
                this._loadStyles();
            }
            
            // Initialize module-specific logic
            await this._initializeModule();
            
            this._initialized = true;
            this.state = 'initialized';
            console.log(`${this.name}: Initialized successfully`);
            return this;
        } catch (error) {
            this._handleError(error, 'init');
            throw error;
        }
    }
    
    /**
     * Create a container for the module's UI
     * @protected
     */
    _createContainer() {
        if (this.container) return;
        
        this.container = document.createElement('div');
        this.container.id = `${this.name.toLowerCase()}-container`;
        this.container.style.position = 'fixed';
        this.container.style.zIndex = '9998';
        this.container.style.transition = 'transform 0.3s ease-in-out';
        
        // Apply styles from config or use defaults
        const styles = this.config.styles || this._getDefaultStyles();
        Object.entries(styles).forEach(([prop, value]) => {
            this.container.style[prop] = value;
        });
        
        document.body.appendChild(this.container);
    }
    
    /**
     * Get default styles for the container
     * @protected
     * @returns {Object} CSS style properties and values
     */
    _getDefaultStyles() {
        return {
            top: '0',
            right: '0',
            width: '300px',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            color: 'white',
            padding: '10px',
            boxSizing: 'border-box',
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px',
            transform: 'translateX(100%)',
        };
    }
    
    /**
     * Load external CSS file for styling
     * @protected
     */
    _loadStyles() {
        const cssPath = this.config.cssPath || `./${this.name.toLowerCase()}.css`;
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssPath;
        link.onerror = () => console.error(`${this.name}: Failed to load ${cssPath}`);
        document.head.appendChild(link);
    }
    
    /**
     * Show the module's UI
     */
    show() {
        if (this.container) {
            this.container.style.transform = 'translateX(0)';
            this.isVisible = true;
            this._onShow();
        }
    }
    
    /**
     * Hide the module's UI
     */
    hide() {
        if (this.container) {
            this.container.style.transform = 'translateX(100%)';
            this.isVisible = false;
            this._onHide();
        }
    }
    
    /**
     * Toggle the module's UI visibility
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    /**
     * Create a toggle button for the module
     * @protected
     * @param {Object} options - Button options
     */
    _createToggleButton(options = {}) {
        const button = document.createElement('button');
        button.textContent = options.text || '🔧';
        button.id = options.id || `${this.name.toLowerCase()}-toggle`;
        
        const buttonStyles = options.styles || {
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            zIndex: '9999',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        };
        
        Object.entries(buttonStyles).forEach(([prop, value]) => {
            button.style[prop] = value;
        });
        
        button.addEventListener('click', () => this.toggle());
        
        document.body.appendChild(button);
        return button;
    }
    
    /**
     * Module-specific initialization logic
     * @protected
     */
    async _initializeModule() {
        // Override in subclass
    }
    
    /**
     * Called when module is shown
     * @protected
     */
    _onShow() {
        // Override in subclass if needed
    }
    
    /**
     * Called when module is hidden
     * @protected
     */
    _onHide() {
        // Override in subclass if needed
    }
    
    /**
     * Render module content
     * Override this in subclasses
     */
    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <h2>${this.name}</h2>
            <p>Base module - extend and override render() to customize</p>
        `;
    }
    
    /**
     * Update module state - called on each frame when active
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime) {
        // To be implemented by subclasses
    }
    
    /**
     * Handle an error that occurs inside the module.
     * Stores error details, logs them, and shows a simple error UI with a retry button.
     * @protected
     * @param {Error} error - The error object.
     * @param {string} context - Description for the error context.
     */
    _handleError(error, context) {
        // Save error metadata for debugging purposes.
        this.error = {
            message: error.message,
            stack: error.stack,
            context: context,
            timestamp: Date.now()
        };
        
        console.error(`Module ${this.name} error in ${context}:`, error);
        
        // If the module has a UI container, display an error message with a Retry button.
        if (this.container) {
            this.container.innerHTML = `
                <div class="module-error">
                    <h2>${this.name} (Error)</h2>
                    <div>
                        <button id="retry-init">Retry</button>
                    </div>
                    <hr>
                    <h3>Error Information</h3>
                    <pre>${error.message}</pre>
                </div>
            `;
            
            // Attach a click event handler to the retry button to attempt re-initialization.
            const retryBtn = this.container.querySelector('#retry-init');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => this.init());
            }
        }
    }
    
    /**
     * Check if module is initialized
     * @returns {boolean} True if initialized
     */
    isInitialized() {
        return this._initialized;
    }
    
    /**
     * Destroy the module
     */
    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this._initialized = false;
        this.state = 'destroyed';
        console.log(`${this.name}: Module destroyed`);
    }
    
    /**
     * Get module metadata
     * @returns {Object} Module metadata
     */
    getMetadata() {
        return {
            name: this.name,
            version: this.version,
            description: this.description,
            dependencies: this.dependencies,
            state: this.state,
            hasError: this.error !== null
        };
    }
}

export { Module };