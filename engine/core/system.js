/**
 * =====================================================================
 * █▀█ █▀█ █▀█ ▀█▀ █▀▀ █▀█ █   █ █▀█   █▀▀ █▄░█ █▀▀ █ █▄░█ █▀▀
 * █▀▀ █▄█ █▀▄ ░█░ █▀░ █▄█ █▄▄ █ █▄█   ██▄ █░▀█ █▄█ █ █░▀█ ██▄
 * 
 * @fileoverview Base System Class
 * 
 * This file defines the `System` class, which serves as the base class
 * for all systems in the ECS architecture. Systems encapsulate logic
 * that operates on entities with specific components.
 * 
 * ## Key Responsibilities:
 * - Provide a common interface for all systems
 * - Manage lifecycle methods (`init`, `update`, `mount`, `unmount`)
 * - Facilitate interaction with the ECS world
 * 
 * ## Example Usage:
 * ```javascript
 * class MovementSystem extends System {
 *   update(deltaTime) {
 *     const entities = this.getEntitiesWith('position', 'velocity');
 *     entities.forEach(entityId => {
 *       const position = this.world.getComponent(entityId, 'position');
 *       const velocity = this.world.getComponent(entityId, 'velocity');
 *       position.x += velocity.x * deltaTime;
 *       position.y += velocity.y * deltaTime;
 *     });
 *   }
 * }
 * ```
 * 
 * ## Questions for JG:
 * [ ] Should we add a priority system for system execution order?
 * [ ] Are there any additional lifecycle methods needed?
 */

/**
 * Base System class that all systems should extend.
 * Systems process entities with specific components and encapsulate behavior.
 */
class System {
  /**
   * Constructs a new system.
   * @param {Object} [options={}] - Options for the system.
   * @param {number} [options.priority] - Execution priority (lower runs first).
   * @param {Array<string>} [options.dependencies] - List of required component names.
   */
  constructor(options = {}) {
    this.options = options;
    this.enabled = true;
    this.world = null;
    this.name = this.constructor.name;
    this.priority = options.priority || 0;
    this.dependencies = options.dependencies || [];
    this.groupPriority = 0; // Used by scheduler if set.
    this.systemPriority = 0; // Also set by scheduler.
  }
  
  /**
   * Initializes the system with the world context.
   * @param {Object} world - The ECS world instance.
   * @param {Object} [options={}] - Additional options to merge.
   * @returns {System} The system instance.
   */
  init(world, options = {}) {
    this.world = world;
    this.options = { ...this.options, ...options };
    this.enabled = true;
    return this;
  }
  
  /**
   * Lifecycle method called when the system is activated.
   * Override in subclasses to run setup code.
   */
  mount() {
    // To be implemented by subclasses
  }
  
  /**
   * Called during each update cycle with the elapsed time.
   * Override in subclasses to define system behavior.
   * @param {number} deltaTime - Time since last update.
   */
  update(deltaTime) {
    // Override this method in subclasses.
  }
  
  /**
   * Lifecycle method called when the system is deactivated.
   * Override in subclasses to run teardown code.
   */
  unmount() {
    // To be implemented by subclasses
  }
  
  /**
   * Retrieves a list of entity IDs that have all specified components.
   * @param {...string} componentTypes - Component names to search for.
   * @returns {Array<number>} Array of matching entity IDs.
   */
  getEntitiesWith(...componentTypes) {
    if (this.world && typeof this.world.getEntitiesWith === 'function') {
      return this.world.getEntitiesWith(...componentTypes);
    }
    return [];
  }
  
  /**
   * Emits an event using the world's event system.
   * @param {string} event - The event name.
   * @param {Object} data - Data payload for the event.
   */
  emit(event, data) {
    const eventSystem = this.world?.getSystem('event');
    if (eventSystem && typeof eventSystem.emit === 'function') {
      eventSystem.emit(event, data);
    }
  }
  
  /**
   * Registers an event listener through the world's event system.
   * @param {string} event - The event name.
   * @param {Function} callback - Handler function.
   */
  on(event, callback) {
    const eventSystem = this.world?.getSystem('event');
    if (eventSystem && typeof eventSystem.on === 'function') {
      eventSystem.on(event, callback);
    }
  }
  
  /**
   * Removes an event listener.
   * @param {string} event - The event name.
   * @param {Function} callback - (Optional) Specific handler to remove.
   */
  off(event, callback) {
    const eventSystem = this.world?.getSystem('event');
    if (eventSystem && typeof eventSystem.off === 'function') {
      eventSystem.off(event, callback);
    }
  }
  
  /**
   * Handles errors that occur within the system.
   * Delegates error handling to the error system if available.
   * @param {Error} error - The error instance caught.
   * @param {string} [context='system'] - Description of the error context.
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
  
  /**
   * Registers this system with the world's scheduler.
   * @param {string} groupName - The scheduler group name.
   * @param {number} [priority=0] - Priority within the group.
   */
  registerWithScheduler(groupName, priority = 0) {
    if (!this.world) {
      console.warn(`${this.name}: Cannot register with scheduler - no world assigned`);
      return;
    }
    const scheduler = this.world.getScheduler();
    if (!scheduler) {
      console.warn(`${this.name}: World has no scheduler`);
      return;
    }
    try {
      const group = scheduler.getGroup(groupName) || scheduler.createGroup(groupName);
      group.addSystem(this, priority);
      console.info(`${this.name}: Registered with scheduler in group "${groupName}"`);
    } catch (error) {
      console.error(`${this.name}: Failed to register with scheduler:`, error);
    }
  }
}

export { System };
