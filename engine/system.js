/**
 * @fileoverview System Base Class for Portfolio Engine
 * 
 * This file defines the core System class that all concrete system implementations
 * extend. It establishes the contract that systems must follow to integrate
 * with the ECS architecture.
 * 
 * @module System
 * 
 * @design Base class in the ECS architecture.
 */

/**
 * Abstract base System class that concrete systems should extend
 */
class System {
  /**
   * Create a new System
   */
  constructor() {
    /**
     * List of entities this system is processing
     * @type {Entity[]}
     */
    this.entities = [];
    
    /**
     * System execution context containing ECS reference
     * @type {Object|null}
     */
    this.context = null;
  }

  /**
   * Set the system's execution context
   * @param {Object} context - Context object containing ECS reference
   * @returns {System} This system for method chaining
   */
  setContext(context) {
    this.context = context;
    return this;
  }

  /**
   * Remove an entity from this system's processing list
   * @param {Entity} entity - The entity to remove
   */
  removeEntity(entity) {
    const index = this.entities.indexOf(entity);
    if (index > -1) {
      this.entities.splice(index, 1);
    }
  }

  /**
   * Update method called on each animation frame
   * Must be implemented by concrete system classes
   * @param {Entity[]} entities - All entities in the ECS
   */
  update(entities) {
    // To be implemented by subclasses
    throw new Error("System.update() method must be implemented by subclass");
  }

  /**
   * Initialize the system with the current set of entities
   * Called once when the system is first registered
   * @param {Entity[]} entities - All entities in the ECS
   */
  init(entities) {
    // To be implemented by subclasses
    // Default implementation does nothing
  }
}

export { System };
