/**
 * @fileoverview Error System for ECS
 * 
 * Handles errors through ECS components and entities
 */
import { System } from '../core/system.js';
import { EventSystem } from './eventSystem.js';

// Component Types
const ERROR = 'error';
const ERROR_HANDLER = 'errorHandler';

/**
 * Error System - Manages errors through ECS
 */
class ErrorSystem extends System {
  init(world, config) {
    super.init(world, config);
    
    this.errorLog = [];
    this.handlerCache = new Map(); // context -> entityIds[]
    
    // Use simple defaults instead of complex config
    this.config = {
      logToConsole: true,
      maxLogSize: 100,
      enableDevMode: true  // Whether to enable dev mode for critical errors
    };
    
    // Register with TaskManager instead of using the old scheduler API
    if (this.world.systemManager) {
      try {
        // Get the taskManager from the system manager
        const taskManager = this.world.systemManager.getScheduler();
        if (taskManager) {
          // Make sure early group exists
          if (!taskManager.taskGroups.has('early')) {
            taskManager.createGroup('early', -20); // Higher priority
          }
          
          // Add this system as a task in the early group
          taskManager.addTask(this, {
            name: 'error',
            group: 'early',
            priority: -20,
            enabled: true
          });
          
          console.info('ErrorSystem: Registered with TaskManager in early group');
        } else {
          console.warn('ErrorSystem: TaskManager not available');
        }
      } catch (error) {
        console.warn('ErrorSystem: Failed to register with TaskManager:', error);
      }
    }
    
    // Create default handler entity
    this._createDefaultHandlers();
    
    console.info('ErrorSystem: Initialized');
    return this;
  }
  
  // Create an error entity
  createError(message, code = 'GENERIC_ERROR', context = 'default', data = {}) {
    const entityId = this.world.createEntity();
    
    this.world.addComponent(entityId, ERROR, {
      message,
      code,
      context,
      data,
      timestamp: Date.now(),
      handled: false,
      stack: new Error(message).stack
    });
    
    return entityId;
  }
  
  // Register a handler entity for a specific context
  registerHandler(handlerEntityId, context = 'default') {
    this.world.addComponent(handlerEntityId, ERROR_HANDLER, {
      contexts: [context]
    });
    
    // Invalidate cache
    this._invalidateCache(context);
  }
  
  // Handle an existing error 
  handleError(errorEntityId) {
    const errorComponent = this.world.getComponent(errorEntityId, ERROR);
    if (!errorComponent || errorComponent.handled) return;
    
    // Log the error
    this._logError(errorComponent);
    
    // Track critical errors
    if (this._isCriticalError(errorComponent)) {
      this.hasCriticalErrors = true;
      
      // Enable dev mode automatically for critical errors
      if (this.config.enableDevMode && !localStorage.getItem('devMode')) {
        console.warn('Critical error detected, enabling dev mode automatically');
        localStorage.setItem('devMode', 'true');
        
        // Navigate to DevTools page for debugging
        if (!window.location.hash.includes('devtools')) {
          // Use setTimeout to allow current error handling to complete
          setTimeout(() => {
            window.location.hash = 'devtools';
          }, 100);
        }
      }
    }
    
    // Find appropriate handlers
    const handlers = this._getHandlersForContext(errorComponent.context);
    
    // Mark as handled
    errorComponent.handled = true;
    
    // Send notification to handlers
    for (const handlerEntityId of handlers) {
      this.world.addComponent(handlerEntityId, 'errorNotification', {
        errorEntityId,
        timestamp: Date.now()
      });
    }
    
    // Emit error event if EventSystem exists
    const eventSystem = this._getEventSystem();
    if (eventSystem) {
      const eventType = errorComponent.code ? 
        `error:${errorComponent.code.toLowerCase()}` : 'error:generic';
      
      // Create event data
      const eventData = {
        ...errorComponent,
        entityId: errorEntityId
      };
      
      // Emit through EventSystem
      eventSystem.emit(errorEntityId, eventType, eventData);
      eventSystem.emit(errorEntityId, 'error', eventData); // General error event
    }
  }
  
  /**
   * Determine if an error is critical enough to automatically enable dev mode
   * @private
   * @param {Object} errorComponent - The error component
   * @returns {boolean} Whether the error is considered critical
   */
  _isCriticalError(errorComponent) {
    // Define criteria for critical errors that should trigger dev mode
    const criticalContexts = ['system-failure', 'critical', 'data-corruption'];
    const criticalCodes = ['FATAL_ERROR', 'SYSTEM_FAILURE', 'MODULE_LOAD_FAILURE'];
    
    // Check for critical errors based on context or code
    return criticalContexts.includes(errorComponent.context) || 
           criticalCodes.includes(errorComponent.code);
  }
  
  update() {
    // Find all unhandled errors
    for (const errorEntityId of this.world.getEntitiesWith(ERROR)) {
      const errorComponent = this.world.getComponent(errorEntityId, ERROR);
      if (!errorComponent.handled) {
        this.handleError(errorEntityId);
      }
    }
  }
  
  // Get all handlers for a context (with caching)
  _getHandlersForContext(context) {
    if (this.handlerCache.has(context)) {
      return this.handlerCache.get(context);
    }
    
    const handlers = [];
    
    // Find all entities with ERROR_HANDLER component for this context
    for (const entityId of this.world.getEntitiesWith(ERROR_HANDLER)) {
      const handler = this.world.getComponent(entityId, ERROR_HANDLER);
      if (handler && (handler.contexts.includes(context) || handler.contexts.includes('default'))) {
        handlers.push(entityId);
      }
    }
    
    // Cache result
    this.handlerCache.set(context, handlers);
    return handlers;
  }
  
  _invalidateCache(context) {
    this.handlerCache.delete(context);
  }
  
  _logError(errorComponent) {
    // Add to log
    this.errorLog.push({
      ...errorComponent
    });
    
    // Trim log if needed
    if (this.errorLog.length > this.config.maxLogSize) {
      this.errorLog.shift();
    }
    
    // Console log if enabled
    if (this.config.logToConsole) {
      console.error(`[${errorComponent.code}] ${errorComponent.message}`, 
        errorComponent.data);
    }
  }
  
  _getEventSystem() {
    for (const system of this.world.systems) {
      if (system instanceof EventSystem) {
        return system;
      }
    }
    return null;
  }
  
  _createDefaultHandlers() {
    // Create default error handler entity
    const defaultHandlerEntityId = this.world.createEntity();
    this.registerHandler(defaultHandlerEntityId, 'default');
    
    // Add console logging behavior
    this.world.addComponent(defaultHandlerEntityId, 'script', {
      onError: (error) => {
        // Default behavior is already handled in _logError
      }
    });
    
    // Create module error handler
    const moduleHandlerEntityId = this.world.createEntity();
    this.registerHandler(moduleHandlerEntityId, 'module-loading');
    
    // Add module loading behavior
    this.world.addComponent(moduleHandlerEntityId, 'script', {
      onError: (error) => {
        console.warn('Module loading error:', error.message);
        console.info('Attempting to continue with available modules');
      }
    });
  }
  
  getErrorLog() {
    return [...this.errorLog];
  }
}

export { ErrorSystem, ERROR, ERROR_HANDLER };
