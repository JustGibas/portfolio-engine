/**
 * @fileoverview Pure ECS (Entity Component System) Core
 * 
 * This module provides the core ECS implementation with a focus on
 * performance and composability.
 */
import { System } from './system.js';

/**
 * Entity - Simply a unique ID
 */
class Entity {
  constructor(id) {
    this.id = id;
    this.componentMask = new Set(); // Fast component type lookup
  }
}

/**
 * Component - Pure data container
 */
class Component {
  constructor(data = {}) {
    Object.assign(this, data);
  }
}

/**
 * World - Manages all entities and components
 */
class World {
  constructor() {
    this.entities = new Map(); // entityId -> Entity
    this.components = new Map(); // componentType -> Map(entityId -> component)
    this.systems = [];
    this.nextEntityId = 1;
    this.systemRegistry = null; // Will be set by engine initialization
  }
  
  createEntity() {
    const id = this.nextEntityId++;
    const entity = new Entity(id);
    this.entities.set(id, entity);
    return id;
  }
  
  addComponent(entityId, componentType, componentData) {
    // Get entity
    const entity = this.entities.get(entityId);
    if (!entity) throw new Error(`Entity ${entityId} not found`);
    
    // Initialize component storage for this type if needed
    if (!this.components.has(componentType)) {
      this.components.set(componentType, new Map());
    }
    
    // Create and store component
    const component = new Component(componentData);
    this.components.get(componentType).set(entityId, component);
    
    // Update entity's component mask
    entity.componentMask.add(componentType);
    
    return component;
  }
  
  getComponent(entityId, componentType) {
    if (!this.components.has(componentType)) return null;
    return this.components.get(componentType).get(entityId) || null;
  }
  
  removeComponent(entityId, componentType) {
    if (!this.components.has(componentType)) return false;
    
    const componentMap = this.components.get(componentType);
    const result = componentMap.delete(entityId);
    
    if (result) {
      const entity = this.entities.get(entityId);
      if (entity) entity.componentMask.delete(componentType);
    }
    
    return result;
  }
  
  destroyEntity(entityId) {
    const entity = this.entities.get(entityId);
    if (!entity) return false;
    
    // Remove all components for this entity
    for (const [componentType, componentMap] of this.components.entries()) {
      componentMap.delete(entityId);
    }
    
    // Remove the entity
    return this.entities.delete(entityId);
  }
  
  registerSystem(system) {
    system.world = this; // Give system access to the world
    this.systems.push(system);
    
    // If the system has an init method, don't call it here anymore
    // It's now called explicitly by the engine initialization
  }
  
  update(deltaTime) {
    for (const system of this.systems) {
      if (system.update) system.update(deltaTime);
    }
  }
  
  // Get entities with specific components
  getEntitiesWith(...componentTypes) {
    const results = [];
    
    for (const [entityId, entity] of this.entities.entries()) {
      let hasAll = true;
      
      for (const type of componentTypes) {
        if (!entity.componentMask.has(type)) {
          hasAll = false;
          break;
        }
      }
      
      if (hasAll) {
        results.push(entityId);
      }
    }
    
    return results;
  }
  
  /**
   * Get a system by name from the registry
   * @param {string} systemName - The name of the system to retrieve
   * @returns {System|null} The requested system or null if not found
   */
  getSystem(systemName) {
    return this.systemRegistry?.get(systemName) || null;
  }
  
  /**
   * Check if a system exists in the registry
   * @param {string} systemName - The name of the system to check
   * @returns {boolean} True if the system exists
   */
  hasSystem(systemName) {
    return this.systemRegistry?.has(systemName) || false;
  }
}

// Export the World, Entity, and Component classes
export { World, Entity, Component };
