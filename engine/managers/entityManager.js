/**
 * =====================================================================
 * EntityManager.js - ECS Entity Management
 * =====================================================================
 * 
 * @fileoverview 
 * 
 * This file implements the EntityManager class which is responsible for creating,
 * tracking, and destroying entities within the ECS architecture.
 * 
 * ## Key Responsibilities:
 * - Create and destroy entities
 * - Track entity lifecycle
 * - Assign and manage entity IDs
 * - Provide entity lookup services
 * 
 * ## Implementation Notes:
 * - Uses a Map for O(1) entity lookup by ID
 * - Manages the entity ID sequence
 * 
 * ## Dependencies:
 * - entity.js: Entity class definition
 * - manager.js: Base manager class
 * 
 * @author Portfolio Engine Team
 * @lastModified Cycle 1.1.1
 */

import { Entity } from '../core/entity.js';
import { Manager } from '../core/manager.js';

/**
 * EntityManager - Manages entity lifecycle
 * @extends Manager
 */
class EntityManager extends Manager {
  /**
   * Create a new entity manager
   * @param {Object} options - Manager options
   * @param {World} options.world - Reference to the world
   */
  constructor(options) {
    super(options);
    this.entities = new Map(); // entityId -> Entity
    this.nextEntityId = 1;
  }
  
  /**
   * Create a new entity
   * @returns {number} The new entity ID
   */
  createEntity() {
    const id = this.nextEntityId++;
    const entity = new Entity(id);
    this.entities.set(id, entity);
  
    return id;
  }
  
  /**
   * Get an entity by ID
   * @param {number} entityId - Entity ID
   * @returns {Entity|undefined} The entity or undefined if not found
   */
  getEntity(entityId) {
    return this.entities.get(entityId);
  }
  
  /**
   * Check if an entity exists
   * @param {number} entityId - Entity ID to check
   * @returns {boolean} True if the entity exists
   */
  hasEntity(entityId) {
    return this.entities.has(entityId);
  }
  
  /**
   * Get all entity IDs
   * @returns {Array<number>} Array of all entity IDs
   */
  getAllEntityIds() {
    return Array.from(this.entities.keys());
  }
  
  /**
   * Get count of all entities
   * @returns {number} Entity count
   */
  getEntityCount() {
    return this.entities.size;
  }
  
  /**
   * Destroy an entity (will be fully removed by World)
   * @param {number} entityId - The entity ID to destroy
   * @returns {boolean} True if the entity was found and marked for destruction
   */
  destroyEntity(entityId) {
    const entity = this.entities.get(entityId);
    if (!entity) return false;
    
    // Emit entity will be destroyed event
    //this.events.emit('entity:destroying', { entityId });
    
    // Remove the entity
    const result = this.entities.delete(entityId);
    
    // Emit entity destroyed event
    if (result) {
      //this.events.emit('entity:destroyed', { entityId });
    }
    
    return result;
  }
  
  /**
   * Clear all entities
   */
  clear() {
    // Emit events for each entity being destroyed
    for (const entityId of this.entities.keys()) {
      //this.events.emit('entity:destroying', { entityId });
      //this.events.emit('entity:destroyed', { entityId });
    }
    
    this.entities.clear();
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    this.clear();
    super.destroy();
  }
}

export { EntityManager };
