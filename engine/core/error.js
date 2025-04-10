/**
 * =====================================================================
 * Error.js - Base Error Class
 * =====================================================================
 * 
 * @fileoverview 
 * 
 * This file implements the base Error class for the portfolio engine.
 * It provides a standardized error structure that can be used across
 * the engine for consistent error handling and reporting.
 * 
 * ## Key Responsibilities:
 * - Provide standardized error structure
 * - Support categorization and contextual information
 * - Enable integration with ErrorSystem
 * - Facilitate error tracking and debugging
 * 
 * ## Architecture Diagram:
 * 
 * ┌─────────────────────────────────────────┐
 * │               EngineError               │
 * │                                         │
 * │  ┌─────────────┐  ┌──────────────────┐  │
 * │  │  Message &  │  │    Contextual    │  │
 * │  │    Code     │  │    Information   │  │
 * │  └─────────────┘  └──────────────────┘  │
 * └─────────────────────────────────────────┘
 * 
 * ## Implementation Notes:
 * - Extends native Error for compatibility
 * - Adds additional metadata fields
 * - Maintains stack trace information
 * - Supports serialization for storage/transmission
 * 
 * @author Portfolio Engine Team
 */

/**
 * Base error class for the engine
 * @extends Error
 */
class EngineError extends Error {
    /**
     * Create a new engine error
     * @param {string} message - Error message
     * @param {Object} options - Error options
     * @param {string} [options.code='RUNTIME_ERROR'] - Error code
     * @param {string} [options.context='default'] - Error context
     * @param {Object} [options.data={}] - Additional error data
     * @param {boolean} [options.isCritical=false] - Whether this is a critical error
     * @param {Error} [options.originalError=null] - Original error if this wraps another error
     */
    constructor(message, options = {}) {
        super(message);

        // Standard Error properties
        this.name = this.constructor.name;
        
        // Custom properties with defaults
        this.code = options.code || 'RUNTIME_ERROR';
        this.context = options.context || 'default';
        this.data = options.data || {};
        this.isCritical = options.isCritical || false;
        this.timestamp = Date.now();
        this.handled = false;
        this.originalError = options.originalError || null;
        
        // Preserve stack trace in Node.js and V8 environments
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
        
        // Save original stack if wrapping another error
        if (this.originalError && this.originalError.stack) {
            this.originalStack = this.originalError.stack;
        }
    }

    /**
     * Mark this error as handled
     * @returns {EngineError} This error instance for chaining
     */
    markAsHandled() {
        this.handled = true;
        return this;
    }

    /**
     * Convert to a plain object suitable for serialization
     * @returns {Object} Serializable error object
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            context: this.context,
            data: this.data,
            isCritical: this.isCritical,
            timestamp: this.timestamp,
            handled: this.handled,
            stack: this.stack,
            originalStack: this.originalStack
        };
    }

    /**
     * Create an EngineError from a plain object or native Error
     * @param {Error|Object} error - Error object or serialized error data
     * @returns {EngineError} New EngineError instance
     */
    static fromError(error) {
        if (error instanceof EngineError) {
            return error;
        }
        
        if (error instanceof Error) {
            return new EngineError(error.message, {
                code: error.code || 'RUNTIME_ERROR',
                context: 'error-conversion',
                originalError: error,
                data: {
                    originalType: error.constructor.name
                }
            });
        }
        
        // Handle serialized error objects
        if (typeof error === 'object') {
            return new EngineError(error.message || 'Unknown error', {
                code: error.code || 'RUNTIME_ERROR',
                context: error.context || 'deserialized',
                data: error.data || {},
                isCritical: error.isCritical || false
            });
        }
        
        // Handle primitive values
        return new EngineError(String(error), {
            context: 'primitive-conversion'
        });
    }

    /**
     * Check if an error is critical
     * @param {string[]} [criticalContexts=['critical', 'system-failure', 'data-corruption']] - Contexts considered critical
     * @param {string[]} [criticalCodes=['FATAL_ERROR', 'SYSTEM_FAILURE', 'MODULE_LOAD_FAILURE']] - Codes considered critical  
     * @returns {boolean} Whether the error is critical
     */
    isCriticalError(
        criticalContexts = ['critical', 'system-failure', 'data-corruption'],
        criticalCodes = ['FATAL_ERROR', 'SYSTEM_FAILURE', 'MODULE_LOAD_FAILURE']
    ) {
        // Already marked as critical
        if (this.isCritical) return true;
        
        // Check by context
        if (criticalContexts.includes(this.context)) return true;
        
        // Check by code
        if (criticalCodes.includes(this.code)) return true;
        
        return false;
    }
}

// Pre-defined error types
class ModuleError extends EngineError {
    constructor(message, options = {}) {
        super(message, {
            code: options.code || 'MODULE_ERROR',
            context: options.context || 'module',
            ...options
        });
    }
}

class SystemError extends EngineError {
    constructor(message, options = {}) {
        super(message, {
            code: options.code || 'SYSTEM_ERROR',
            context: options.context || 'system',
            ...options
        });
    }
}

class ComponentError extends EngineError {
    constructor(message, options = {}) {
        super(message, {
            code: options.code || 'COMPONENT_ERROR',
            context: options.context || 'component',
            ...options
        });
    }
}

export { 
    EngineError,
    ModuleError,
    SystemError,
    ComponentError
};