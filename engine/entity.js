/**
 * @fileoverview Entity Implementation for the Portfolio Engine.
 * 
 * This file defines the Entity class which is a core part of the ECS (Entity-Component-System)
 * architecture. Entities are essentially containers for components - they have no 
 * behavior of their own but serve as identifiers and component holders.
 * 
 * In the ECS pattern:
 * - Entities are just identifiers/containers
 * - Components contain all the data
 * - Systems implement all the behavior/logic
 * 
 * Entities provide methods to add, retrieve, and remove components, making them
 * fully dynamic and composable.
 * 
 * @module Entity
 * 
 * @design Core class in the ECS architecture. Encapsulates the component
 * management logic while keeping entities as lightweight as possible.
 * Follows the composition over inheritance principle.
 */

/**
 * Entity class representing a game entity in the ECS architecture
 */
class Entity {
  /**
   * Create a new entity
   */
  constructor() {
    /**
     * Store of components for this entity
     * @type {Object.<string, any>}
     * @private
     */
    this.components = {};
    
    /**
     * Reference to the parent ECS instance
     * Set by ECS when entity is created
     * @type {ECS|null}
     */
    this.ecs = null;
  }

  /**
   * Add a component to this entity
   * @param {string} name - The name/type of the component
   * @param {any} data - The component data (typically an object)
   * @returns {Entity} This entity for method chaining
   */
  addComponent(name, data) {
    this.components[name] = data;
    return this;
  }

  /**
   * Get a component from this entity by name
   * @param {string} name - The name/type of the component to retrieve
   * @returns {any|undefined} The component data or undefined if not found
   */
  getComponent(name) {
    return this.components[name];
  }

  /**
   * Remove a component from this entity
   * @param {string} name - The name/type of the component to remove
   * @returns {Entity} This entity for method chaining
   */
  removeComponent(name) {
    delete this.components[name];
    return this;
  }

  /**
   * Check if this entity has a component
   * @param {string} name - The name/type of the component to check for
   * @returns {boolean} True if the entity has the component, false otherwise
   */
  hasComponent(name) {
    return this.components.hasOwnProperty(name);
  }
}

export { Entity };
