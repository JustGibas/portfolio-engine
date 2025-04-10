/**
 * =====================================================================
 * Entity.js - ECS Entity Implementation
 * =====================================================================
 * 
 * @fileoverview 
 * 
 * This file implements the Entity class for the ECS architecture. Entities
 * are lightweight identifiers that serve as containers for components.
 * 
 * ## Key Responsibilities:
 * - Provide unique identifier for game objects
 * - Track which components are attached to the entity
 * - Support efficient component lookups
 * 
 * ## Implementation Notes:
 * - Entities are simply containers for a unique ID
 * - Component mask tracks which components are attached to the entity
 * - Extremely lightweight to allow for thousands of entities
 * 
 * @author Portfolio Engine Team
 * @lastModified Cycle 1.1.1
 */

/**
 * Entity - Lightweight container for components.
 * Each entity has a unique ID and a component mask (a Set) for efficient lookups.
 */
class Entity {
  /**
   * Constructs a new Entity with a given unique ID.
   * @param {number} id - The unique identifier for the entity.
   */
  constructor(id) {
    this.id = id;
  }
  
  /**
   * Determines if the entity has a particular component.
   * @param {string} componentType - The name of the component.
   * @returns {boolean} True if the entity contains the component.
   /
  hasComponent(componentType) {
    return this.componentMask.has(componentType);
  }
  
  /**
   * Returns an array of all component types attached to the entity.
   * @returns {Array<string>} List of component type names.
   /
  getComponentTypes() {
    return Array.from(this.componentMask);
  }
  */
}

export { Entity };
