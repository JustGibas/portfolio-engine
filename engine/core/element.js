/**
 * =====================================================================
 * █▀█ █▀█ █▀█ ▀█▀ █▀▀ █▀█ █   █ █▀█   █▀▀ █▄░█ █▀▀ █ █▄░█ █▀▀
 * █▀▀ █▄█ █▀▄ ░█░ █▀░ █▄█ █▄▄ █ █▄█   ██▄ █░▀█ █▄█ █ █░▀█ ██▄
 * 
 * Element.js - Base Element Implementation
 * =====================================================================
 * 
 * @fileoverview 
 * 
 * This file implements the base Element class for UI components. It provides
 * standardized lifecycle methods and utilities for UI elements, enabling
 * consistent behavior across different component types.
 * 
 * ## Key Responsibilities:
 * - Provide common lifecycle hooks (init, render, mount, unmount)
 * - Handle CSS loading and styling
 * - Manage DOM elements and containers
 * - Standardize error handling and fallbacks
 * - Support accessibility features
 * 
 * 
 * ## Implementation Notes:
 * - Uses async/await for initialization
 * - Provides fallback mechanisms for error resilience
 * - Supports ECS integration via optional world parameter
 * 
 * @author Portfolio Engine Team
 * @lastModified Cycle 1.1.1
 */

/**
 * Base Element class that all UI elements should extend
 */
class Element {
    /**
     * Create a new UI element
     * @param {Object} options - Element configuration options
     * @param {HTMLElement} [options.container] - Container for the element
     * @param {Object} [options.world] - ECS world for optional ECS integration
     */
    constructor(options = {}) {
        // Configuration
        this.options = Object.assign({
            container: null,
            world: null,
            id: null,
            className: null,
            createContainer: false,
            cssPath: null
        }, options);
        
        // DOM references
        this.container = this.options.container;
        this.element = null;
        
        // ECS integration (optional)
        this.world = this.options.world;
        this.entity = null;
        
        // State tracking
        this.isInitialized = false;
        this.isMounted = false;
        this.error = null;
    }
    
    /**
     * Initialize the element
     * @param {Object} [options={}] - Additional initialization options
     * @returns {Promise<Element>} This element instance
     */
    async init(options = {}) {
        try {
            // Merge additional options
            this.options = { ...this.options, ...options };
            
            // Ensure container exists if needed
            if (this.options.createContainer && !this.container) {
                this._createContainer();
            }
            
            // Load CSS if specified
            if (this.options.cssPath) {
                await this._loadCSS();
            }
            
            // Element-specific initialization
            await this._initializeElement();
            
            this.isInitialized = true;
            
            return this;
        } catch (error) {
            this._handleError(error, 'init');
            throw error;
        }
    }
    
    /**
     * Render the element
     * Override in subclasses
     * @returns {HTMLElement|string|null} Rendered content
     */
    render() {
        // To be implemented by subclasses
        if (this.container) {
            this.container.innerHTML = `<div class="element-base">Base Element - Override render() method</div>`;
        }
        return this.container;
    }
    
    /**
     * Mount the element to the DOM
     * @param {HTMLElement} [container] - Optional new container to mount to
     * @returns {Element} This element instance
     */
    mount(container) {
        if (container) {
            this.container = container;
        }
        
        if (!this.container) {
            console.error('Cannot mount element: No container specified');
            return this;
        }
        
        try {
            const content = this.render();
            
            if (typeof content === 'string') {
                this.container.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                // Clear container first
                this.container.innerHTML = '';
                this.container.appendChild(content);
            }
            
            this.isMounted = true;
            this._afterMount();
        } catch (error) {
            this._handleError(error, 'mount');
        }
        
        return this;
    }
    
    /**
     * Unmount the element from the DOM
     * @returns {Element} This element instance
     */
    unmount() {
        if (this.container) {
            this.container.innerHTML = '';
            this.isMounted = false;
            this._afterUnmount();
        }
        return this;
    }
    
    /**
     * Update the element
     * @param {Object} [props={}] - New properties to update with
     * @returns {Element} This element instance
     */
    update(props = {}) {
        // Merge new props
        this.options = { ...this.options, ...props };
        
        // Re-render if mounted
        if (this.isMounted) {
            this.mount();
        }
        
        return this;
    }
    
    /**
     * Destroy the element and clean up resources
     */
    destroy() {
        this.unmount();
        
        // Clean up ECS entity if it exists
        if (this.world && this.entity) {
            // Use safe delete pattern to handle different ECS implementations
            if (typeof this.world.destroyEntity === 'function') {
                this.world.destroyEntity(this.entity);
            } else if (typeof this.world.removeEntity === 'function') {
                this.world.removeEntity(this.entity);
            }
        }
        
        // Clear references
        this.container = null;
        this.element = null;
        this.world = null;
        this.entity = null;
        this.isInitialized = false;
        this.isMounted = false;
    }
    
    /**
     * Create a container element
     * @private
     */
    _createContainer() {
        const container = document.createElement('div');
        
        if (this.options.id) {
            container.id = this.options.id;
        }
        
        if (this.options.className) {
            container.className = this.options.className;
        }
        
        document.body.appendChild(container);
        this.container = container;
    }
    
    /**
     * Load CSS for this element
     * @private
     * @returns {Promise<void>}
     */
    async _loadCSS() {
        try {
            // Check if cssLoader is available globally
            if (typeof cssLoader !== 'undefined' && cssLoader.loadLocalCSS) {
                // If no explicit path but we have import.meta.url, use that
                if (!this.options.cssPath && import.meta.url) {
                    await cssLoader.loadLocalCSS(import.meta.url);
                } else if (this.options.cssPath) {
                    // Otherwise use specified path
                    await cssLoader.load(this.options.cssPath);
                }
            } else {
                // Fallback to basic CSS loading
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = this.options.cssPath;
                document.head.appendChild(link);
                
                // Return a promise that resolves when the CSS is loaded
                return new Promise((resolve, reject) => {
                    link.onload = () => resolve();
                    link.onerror = () => reject(new Error(`Failed to load CSS: ${this.options.cssPath}`));
                });
            }
        } catch (error) {
            console.warn(`Failed to load CSS for element:`, error);
        }
    }
    
    /**
     * Element-specific initialization logic
     * @protected
     * @returns {Promise<void>}
     */
    async _initializeElement() {
        // To be implemented by subclasses
    }
    
    /**
     * Called after the element is mounted
     * @protected
     */
    _afterMount() {
        // To be implemented by subclasses
    }
    
    /**
     * Called after the element is unmounted
     * @protected
     */
    _afterUnmount() {
        // To be implemented by subclasses
    }
    
    /**
     * Handle element error
     * @param {Error} error - Error object
     * @param {string} context - Error context
     * @protected
     */
    _handleError(error, context) {
        this.error = {
            message: error.message,
            stack: error.stack,
            context: context,
            timestamp: Date.now()
        };
        
        console.error(`Element error in ${context}:`, error);
        
        // Render error state if we have a container
        if (this.container) {
            this.container.innerHTML = `
                <div class="element-error">
                    <p>Error rendering element</p>
                    <button class="element-retry-btn">Retry</button>
                </div>
            `;
            
            const retryBtn = this.container.querySelector('.element-retry-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => this.init());
            }
        }
    }
    
    /**
     * Create and attach an event bus to this element
     * @protected
     */
    _initEventBus() {
        // Simple event bus implementation
        this.events = {
            _listeners: new Map(),
            
            on(event, callback) {
                if (!this._listeners.has(event)) {
                    this._listeners.set(event, []);
                }
                this._listeners.get(event).push(callback);
            },
            
            off(event, callback) {
                if (!this._listeners.has(event)) return;
                
                if (!callback) {
                    this._listeners.delete(event);
                    return;
                }
                
                const callbacks = this._listeners.get(event);
                const index = callbacks.indexOf(callback);
                if (index !== -1) {
                    callbacks.splice(index, 1);
                }
            },
            
            emit(event, data) {
                if (!this._listeners.has(event)) return;
                
                for (const callback of this._listeners.get(event)) {
                    try {
                        callback(data);
                    } catch (error) {
                        console.error(`Error in event listener for ${event}:`, error);
                    }
                }
            }
        };
    }
    
    /**
     * Set up accessibility attributes
     * @protected
     * @param {HTMLElement} element - Element to enhance
     * @param {Object} options - Accessibility options
     */
    _setupAccessibility(element, options = {}) {
        if (!element) return;
        
        // Apply role
        if (options.role) {
            element.setAttribute('role', options.role);
        }
        
        // Apply ARIA attributes
        if (options.aria) {
            for (const [key, value] of Object.entries(options.aria)) {
                element.setAttribute(`aria-${key}`, value);
            }
        }
        
        // Apply tabindex
        if (options.tabindex !== undefined) {
            element.setAttribute('tabindex', options.tabindex);
        }
    }
}

export { Element };