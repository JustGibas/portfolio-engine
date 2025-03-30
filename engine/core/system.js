/**
 * @fileoverview Base System Class
 * 
 * Base class for all systems in the ECS architecture.
 * Provides common functionality and lifecycle methods.
 */

/**
 * Base System class that all systems should extend
 */
class System {
  /**
   * Initialize the system with the world and options
   * @param {Object} world - The ECS world instance
   * @param {Object} options - System-specific options
   */
  init(world, options = {}) {
    this.world = world;
    this.options = options;
    this.enabled = true;
  }
  
  /**
   * Called when system is activated - override in subclasses
   */
  mount() {
    // To be implemented by subclasses
  }
  
  /**
   * Update method called each frame - override in subclasses
   * @param {number} deltaTime - Time elapsed since last update
   */
  update(deltaTime) {
    // To be implemented by subclasses
  }
  
  /**
   * Called when system is deactivated - override in subclasses
   */
  unmount() {
    // To be implemented by subclasses
  }
  
  /**
   * Enable the system
   */
  enable() {
    this.enabled = true;
  }
  
  /**
   * Disable the system
   */
  disable() {
    this.enabled = false;
  }
  
  /**
   * Get entities with specified components
   * @param {...string} componentTypes - Component types to check for
   * @returns {Array} Array of entity IDs
   */
  getEntitiesWith(...componentTypes) {
    if (this.world && typeof this.world.getEntitiesWith === 'function') {
      return this.world.getEntitiesWith(...componentTypes);
    }
    return [];
  }
  
  /**
   * Emit an event through the event system
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emit(event, data) {
    const eventSystem = this.world?.getSystem('event');
    if (eventSystem && typeof eventSystem.emit === 'function') {
      eventSystem.emit(event, data);
    }
  }
  
  /**
   * Listen for an event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   */
  on(event, callback) {
    const eventSystem = this.world?.getSystem('event');
    if (eventSystem && typeof eventSystem.on === 'function') {
      eventSystem.on(event, callback);
    }
  }
  
  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event handler (optional)
   */
  off(event, callback) {
    const eventSystem = this.world?.getSystem('event');
    if (eventSystem && typeof eventSystem.off === 'function') {
      eventSystem.off(event, callback);
    }
  }
  
  /**
   * Handle system error
   * @param {Error} error - Error object
   * @param {string} context - Error context
   */
  handleError(error, context = 'system') {
    const errorSystem = this.world?.getSystem('error');
    if (errorSystem) {
      const errorId = errorSystem.createError(
        error.message,
        error.code || 'SYSTEM_ERROR',
        context,
        { originalError: error, system: this.constructor.name }
      );
      errorSystem.handleError(errorId);
    } else {
      console.error(`${this.constructor.name} error (${context}):`, error);
    }
  }
}

export { System };
