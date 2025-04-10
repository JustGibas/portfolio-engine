/**
 * =====================================================================
 * Error Handler Module
 * =====================================================================
 * 
 * Provides centralized error handling functionality for the application,
 * integrating with ErrorSystem when available.
 */
import { Module } from '../core/module.js';
import { EngineError } from '../core/error.js';
import { EventSystem } from './EventSystem.js';

/**
 * Error Handler Module - Centralized error handling
 * @extends Module
 */
export class ErrorHandlerModule extends Module {
    /**
     * Initialize the error handler module
     * @protected
     * @returns {Promise<void>}
     */
    async _initializeModule() {
        this.errors = [];
        this.maxLogSize = 100;
        
        // Set up global error handling
        this.setupGlobalHandlers();
        
        // Connect to error system if available
        this._connectToErrorSystem();
        
        // Always expose to window for easier access
        window.errorHandler = this;
        
        console.info('ErrorHandlerModule: Initialized');
    }
    
    /**
     * Initialize with a world object
     * @param {Object} world - The world object
     * @returns {Promise<ErrorHandlerModule>} This module instance
     */
    async initWithWorld(world) {
        this.world = world;
        await this.init();
        return this;
    }
    
    /**
     * Handle an error
     * @param {Error|string} error - The error or error message
     * @param {string} [context='global'] - The error context
     * @param {Object} [data={}] - Additional error data
     * @returns {Object} Error object created
     */
    handleError(error, context = 'global', data = {}) {
        const errorObj = this.createErrorObject(error, context, data);
        
        // Log to console
        console.error(`[${context}] ${errorObj.message}`, data, errorObj.stack);
        
        // Add to log with timestamp
        this.errors.push(errorObj);
        
        // Trim log if needed
        if (this.errors.length > this.maxLogSize) {
            this.errors.shift();
        }
        
        // Forward to ErrorSystem if available
        const errorSystem = this._getErrorSystem();
        if (errorSystem) {
            const errorEntityId = errorSystem.createError(
                errorObj.message, 
                errorObj.code || 'RUNTIME_ERROR', 
                context, 
                data
            );
            
            errorSystem.handleError(errorEntityId);
        }
        
        // Dispatch custom error event
        const errorEvent = new CustomEvent('app:error', {
            detail: errorObj
        });
        window.dispatchEvent(errorEvent);
        
        // Update UI if visible
        if (this.isVisible && this.container) {
            this.render();
        }
        
        return errorObj;
    }
    
    /**
     * Create a standardized error object
     * @private
     * @param {Error|string} error - The error or error message
     * @param {string} context - Error context
     * @param {Object} data - Additional error data
     * @returns {Object} Standardized error object
     */
    createErrorObject(error, context, data) {
        // Use EngineError for better integration
        if (error instanceof EngineError) {
            return error;
        }
        
        const isErrorInstance = error instanceof Error;
        
        return {
            message: isErrorInstance ? error.message : String(error),
            stack: isErrorInstance ? error.stack : new Error().stack,
            context,
            data,
            code: data.code || 'RUNTIME_ERROR',
            timestamp: Date.now(),
            handled: false
        };
    }
    
    /**
     * Connect to the ErrorSystem from the world
     * @private
     */
    _connectToErrorSystem() {
        const errorSystem = this._getErrorSystem();
        if (errorSystem) {
            console.info('ErrorHandlerModule: Connected to ErrorSystem');
            
            // Register this module as an error handler
            const moduleEntityId = this.world.createEntity();
            this.entity = moduleEntityId;
            
            errorSystem.registerHandler(moduleEntityId, 'global');
            
            // Add script component to handle errors
            this.world.addComponent(moduleEntityId, 'script', {
                onError: (error) => {
                    // Already handled by handleError
                }
            });
        }
    }
    
    /**
     * Get the ErrorSystem from the world
     * @private
     * @returns {Object|null} The ErrorSystem instance or null
     */
    _getErrorSystem() {
        if (!this.world) return null;
        return this.world.getSystem ? this.world.getSystem('error') : null;
    }
    
    /**
     * Set up global unhandled error and promise rejection handlers
     */
    setupGlobalHandlers() {
        // Handle uncaught errors
        window.addEventListener('error', (event) => {
            this.handleError(
                event.error || new Error(event.message), 
                'uncaught-error',
                { 
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                }
            );
            
            // Don't prevent default handling
            return false;
        });
        
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            const error = event.reason instanceof Error ? 
                event.reason : new Error(String(event.reason));
            
            this.handleError(error, 'unhandled-promise', {
                promise: event.promise
            });
            
            // Don't prevent default handling
            return false;
        });
    }
    
    /**
     * Get all logged errors
     * @returns {Array} Array of error objects
     */
    getErrors() {
        return [...this.errors];
    }
    
    /**
     * Clear all logged errors
     */
    clearErrors() {
        this.errors = [];
        
        // Update UI if visible
        if (this.isVisible && this.container) {
            this.render();
        }
    }
    
    /**
     * Render the error handler UI
     */
    render() {
        if (!this.container) return;
        
        // Create a simple UI for displaying errors
        let errorHtml = '';
        
        if (this.errors.length === 0) {
            errorHtml = '<p>No errors logged</p>';
        } else {
            errorHtml = `
                <div class="error-controls">
                    <button id="clear-errors">Clear Errors</button>
                    <span>${this.errors.length} error(s)</span>
                </div>
                <div class="error-list">
                    ${this.errors.map(error => this._formatErrorForDisplay(error)).join('')}
                </div>
            `;
        }
        
        this.container.innerHTML = `
            <h2>Error Handler</h2>
            <div class="error-container">
                ${errorHtml}
            </div>
        `;
        
        // Add event listeners
        const clearBtn = this.container.querySelector('#clear-errors');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearErrors());
        }
    }
    
    /**
     * Format an error for display in the UI
     * @private
     * @param {Object} error - Error object
     * @returns {string} HTML representation of the error
     */
    _formatErrorForDisplay(error) {
        const time = new Date(error.timestamp).toLocaleTimeString();
        const context = error.context || 'unknown';
        const code = error.code || 'UNKNOWN';
        
        return `
            <div class="error-item">
                <div class="error-header">
                    <span class="error-time">${time}</span>
                    <span class="error-context">${context}</span>
                    <span class="error-code">${code}</span>
                </div>
                <div class="error-message">${error.message}</div>
                <details>
                    <summary>Stack trace</summary>
                    <pre class="error-stack">${error.stack || 'No stack trace available'}</pre>
                </details>
            </div>
        `;
    }
    
    /**
     * Called when module is shown
     * @protected
     */
    _onShow() {
        // Update the UI with current errors
        this.render();
    }
    
    /**
     * Destroy the module
     */
    destroy() {
        // Remove the global reference if we created one
        if (window.errorHandler === this) {
            delete window.errorHandler;
        }
        
        // Clear errors
        this.errors = [];
        
        // Call parent destroy
        super.destroy();
    }
    
    /**
     * Connect to ErrorSystem - kept for backward compatibility
     * @param {Object} errorSystem - ErrorSystem instance
     * @deprecated Use initWithWorld() instead
     */
    connectErrorSystem(errorSystem) {
        console.warn('ErrorHandlerModule: connectErrorSystem is deprecated, use initWithWorld() instead');
        if (errorSystem && !this._getErrorSystem()) {
            this.world = errorSystem.world;
            this._connectToErrorSystem();
        }
    }
}

// Create singleton instance with simple options
const errorHandler = new ErrorHandlerModule(null, {
    name: 'ErrorHandler',
    version: '1.1.0',
    description: 'Centralized error handling for the application',
    createUI: true
});

export default errorHandler;
