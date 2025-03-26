/**
 * @fileoverview Error Handling System
 * 
 * This module provides centralized error handling for the application.
 * It standardizes error logging, display, and recovery strategies.
 * 
 * @module errorHandler
 * @requires config from ../config.js
 * 
 * @design Observer Pattern - Allows listening for error events
 */
import config from '../config.js';

const errorHandler = {
  /**
   * Error event listeners
   * @private
   */
  _listeners: [],
  
  /**
   * Error log history (for debug mode)
   * @private
   */
  _errorLog: [],
  
  /**
   * Initialize the error handler
   * @param {Object} options - Configuration options
   */
  init(options = {}) {
    this.options = {
      debug: config.advanced?.debug || false,
      logErrors: true,
      maxLogSize: 100,
      ...options
    };
    
    // Set up global error handling
    window.addEventListener('error', this._handleGlobalError.bind(this));
    window.addEventListener('unhandledrejection', this._handlePromiseRejection.bind(this));
    
    console.info('ErrorHandler: Initialized', this.options.debug ? 'in debug mode' : '');
  },
  
  /**
   * Handle a caught error
   * @param {Error} error - The error object
   * @param {string} context - Context where the error occurred
   * @param {boolean} fatal - Whether the error is fatal to the application
   */
  handleError(error, context = 'general', fatal = false) {
    // Create standardized error object
    const errorInfo = {
      error,
      message: error.message || 'Unknown error',
      stack: error.stack,
      context,
      fatal,
      timestamp: new Date(),
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    };
    
    // Log the error
    if (this.options.logErrors) {
      this._logError(errorInfo);
    }
    
    // Notify listeners
    this._notifyListeners(errorInfo);
    
    // Display to user if appropriate
    if (fatal || this.options.debug) {
      this._displayError(errorInfo);
    }
    
    return errorInfo;
  },
  
  /**
   * Log error to console and error log
   * @private
   * @param {Object} errorInfo - Error information object
   */
  _logError(errorInfo) {
    const { context, error, message } = errorInfo;
    
    // Console log with context
    console.error(`[${context}] ${message}`, error);
    
    // Keep in memory log if debug is enabled
    if (this.options.debug) {
      this._errorLog.push(errorInfo);
      
      // Trim log if it gets too large
      if (this._errorLog.length > this.options.maxLogSize) {
        this._errorLog.shift();
      }
    }
  },
  
  /**
   * Display error to the user
   * @private
   * @param {Object} errorInfo - Error information object
   */
  _displayError(errorInfo) {
    const { message, context, fatal } = errorInfo;
    
    // Create or update error container
    let errorContainer = document.getElementById('global-error-container');
    
    if (!errorContainer) {
      // Create error container if it doesn't exist
      errorContainer = document.createElement('div');
      errorContainer.id = 'global-error-container';
      errorContainer.className = 'error-container global';
      document.body.appendChild(errorContainer);
    }
    
    // Create error element
    const errorElement = document.createElement('div');
    errorElement.className = `error-message ${fatal ? 'fatal' : ''}`;
    errorElement.innerHTML = `
      <h3>${fatal ? 'Fatal Error' : 'Error'}: ${context}</h3>
      <p>${message}</p>
      ${this.options.debug ? `<details><summary>View Details</summary><pre>${errorInfo.stack}</pre></details>` : ''}
      ${fatal ? '<p>Please refresh the page to continue.</p>' : '<button class="dismiss-btn">Dismiss</button>'}
    `;
    
    // Add dismiss functionality
    if (!fatal) {
      const dismissBtn = errorElement.querySelector('.dismiss-btn');
      if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
          errorElement.remove();
          // Remove container if empty
          if (errorContainer.children.length === 0) {
            errorContainer.remove();
          }
        });
      }
    }
    
    // Add to container
    errorContainer.appendChild(errorElement);
    
    // Auto remove non-fatal errors after a timeout
    if (!fatal && !this.options.debug) {
      setTimeout(() => {
        errorElement.remove();
        // Remove container if empty
        if (errorContainer.children.length === 0) {
          errorContainer.remove();
        }
      }, 5000);
    }
  },
  
  /**
   * Handle global window errors
   * @private
   * @param {ErrorEvent} event - Error event
   */
  _handleGlobalError(event) {
    this.handleError(
      event.error || new Error(event.message || 'Unknown error'),
      'uncaught',
      false
    );
    
    // Prevent default handling
    event.preventDefault();
  },
  
  /**
   * Handle unhandled promise rejections
   * @private
   * @param {PromiseRejectionEvent} event - Promise rejection event
   */
  _handlePromiseRejection(event) {
    const error = event.reason instanceof Error ? 
      event.reason : 
      new Error(String(event.reason) || 'Promise rejected');
      
    this.handleError(error, 'promise', false);
    
    // Prevent default handling
    event.preventDefault();
  },
  
  /**
   * Add error listener
   * @param {Function} callback - Function to call when errors occur
   */
  addEventListener(callback) {
    if (typeof callback === 'function' && !this._listeners.includes(callback)) {
      this._listeners.push(callback);
    }
  },
  
  /**
   * Remove error listener
   * @param {Function} callback - Listener to remove
   */
  removeEventListener(callback) {
    const index = this._listeners.indexOf(callback);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  },
  
  /**
   * Notify all listeners about an error
   * @private
   * @param {Object} errorInfo - Error information object
   */
  _notifyListeners(errorInfo) {
    this._listeners.forEach(listener => {
      try {
        listener(errorInfo);
      } catch (err) {
        console.error('Error in error handler listener', err);
      }
    });
  },
  
  /**
   * Get the error log (debug only)
   * @returns {Array} Array of error objects
   */
  getErrorLog() {
    return [...this._errorLog];
  },
  
  /**
   * Clear the error log
   */
  clearErrorLog() {
    this._errorLog = [];
  }
};

export { errorHandler };
