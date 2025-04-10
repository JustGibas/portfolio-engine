/**
 * =====================================================================
 * ComponentManager.js - ECS Component Management
 * =====================================================================
 * 
 * @fileoverview 
 * 
 * This file implements the ComponentManager class which is responsible for
 * handling component registration, addition, removal, and access.
 * 
 * It extends the base Manager class to maintain consistent interfaces 
 * across all managers in the engine.
 */

import { Manager } from '../core/manager.js';
import { Component, ComponentSchema } from '../core/component.js';

/**
 * ComponentManager - Manages component lifecycle and access
 * @extends Manager
 */
class ComponentManager extends Manager {
  /**
   * Create a new component manager
   * @param {Object} options - Manager options
   * @param {Object} options.world - World reference
   */
  constructor({ world }) {
    // Initialize base Manager class
    super({ world });
    
    // Component manager properties
    this.components = new Map(); // componentType -> Map(entityId -> component)
    this._componentSchemas = new Map(); // componentType -> ComponentSchema
    
    // Reference to dependencies
    this.entityManager = world?.entityManager;
    //this._events = world?.eventBus;
    
    // Optional callback when components change
    this.onComponentChange = null;
    
    // Example implementation for component schema registration
    this.schemas = new Map();
  }
  
  /**
   * Initialize the component manager
   * @param {Object} options - Initialization options
   * @returns {ComponentManager} This manager instance for chaining
   */
  init(options = {}) {
    super.init(options);
    console.log('ComponentManager: Initialized');
    return this;
  }
  
  /**
   * Register a component type
   * @param {string} componentType - The type name
   * @param {Object} schema - Component schema definition
   * @returns {ComponentManager} This manager for chaining
   */
  registerComponent(componentType, schema = {}) {
    if (this._componentSchemas.has(componentType)) {
      console.warn(`ComponentManager: Component "${componentType}" already registered`);
      return this;
    }
    
    // Create schema
    const componentSchema = new ComponentSchema(schema);
    this._componentSchemas.set(componentType, componentSchema);
    
    // Create storage for this component type
    this.components.set(componentType, new Map());
    
    console.log(`ComponentManager: Registered component "${componentType}"`);
    return this;
  }
  
  /**
   * Check if a component type is registered
   * @param {string} componentType - The component type to check
   * @returns {boolean} True if registered
   */
  hasComponentType(componentType) {
    return this._componentSchemas.has(componentType);
  }
  
  /**
   * Get a component schema
   * @param {string} componentType - The component type
   * @returns {ComponentSchema|null} The schema or null
   */
  getComponentSchema(componentType) {
    return this._componentSchemas.get(componentType) || null;
  }
  
  /**
   * Add a component to an entity
   * @param {number} entityId - The entity ID
   * @param {string} componentType - The component type
   * @param {Object} componentData - The component data
   * @returns {Component} The created component
   */
  addComponent(entityId, componentType, componentData = {}) {
    // Check if entity exists
    const entity = this.entityManager.getEntity(entityId);
    if (!entity) {
      throw new Error(`Cannot add component to non-existent entity ${entityId}`);
    }
    
    // Get component storage for this type
    const componentMap = this.components.get(componentType);
    if (!componentMap) {
      // Auto-register component type if not registered
      this.registerComponent(componentType);
    }
    
    // Create component
    let component;
    
    // Use schema validation if available
    const schema = this._componentSchemas.get(componentType);
    if (schema) {
      component = schema.createComponent(componentData);
    }
    // Create without validation
    else {
      component = new Component(componentData);
    }
    
    // Store component
    this.components.get(componentType).set(entityId, component);
    
    // Update entity's component mask
    entity.componentMask.add(componentType);
    
    // Notify about component change
    if (this.onComponentChange) {
      this.onComponentChange(entityId, entity);
    }
    
    // Emit component added event
    if (this._events) {
      this._events.emit('component:added', { 
        entityId, 
        componentType, 
        component 
      });
    }
    
    return component;
  }
  
  /**
   * Get a component from an entity
   * @param {number} entityId - The entity ID
   * @param {string} componentType - The component type
   * @returns {Component|null} The component or null if not found
   */
  getComponent(entityId, componentType) {
    const componentMap = this.components.get(componentType);
    if (!componentMap) return null;
    
    return componentMap.get(entityId) || null;
  }
  
  /**
   * Remove a component from an entity
   * @param {number} entityId - The entity ID
   * @param {string} componentType - The component type
   * @returns {boolean} True if component was removed
   */
  removeComponent(entityId, componentType) {
    const entity = this.entityManager.getEntity(entityId);
    if (!entity) return false;
    
    const componentMap = this.components.get(componentType);
    if (!componentMap || !componentMap.has(entityId)) return false;
    
    // Remove from storage
    componentMap.delete(entityId);
    
    // Update entity's component mask
    entity.componentMask.delete(componentType);
    
    // Notify about component change
    if (this.onComponentChange) {
      this.onComponentChange(entityId, entity);
    }
    
    // Emit component removed event
    if (this._events) {
      this._events.emit('component:removed', { 
        entityId, 
        componentType 
      });
    }
    
    return true;
  }
  
  /**
   * Check if an entity has a component
   * @param {number} entityId - The entity ID
   * @param {string} componentType - The component type
   * @returns {boolean} True if entity has component
   */
  hasComponent(entityId, componentType) {
    const componentMap = this.components.get(componentType);
    if (!componentMap) return false;
    
    return componentMap.has(entityId);
  }
  
  /**
   * Get all entities that have a specific component
   * @param {string} componentType - The component type
   * @returns {Array<number>} Array of entity IDs
   */
  getEntitiesWithComponent(componentType) {
    const componentMap = this.components.get(componentType);
    if (!componentMap) return [];
    
    return Array.from(componentMap.keys());
  }
  
  /**
   * Get all components for an entity
   * @param {number} entityId - The entity ID
   * @returns {Object} Map of componentType -> component
   */
  getAllComponents(entityId) {
    const result = {};
    
    for (const [componentType, componentMap] of this.components.entries()) {
      const component = componentMap.get(entityId);
      if (component) {
        result[componentType] = component;
      }
    }
    
    return result;
  }
  
  /**
   * Reset the manager
   * @returns {ComponentManager} This manager instance for chaining
   */
  reset() {
    super.reset();
    
    // Clear all components
    for (const componentMap of this.components.values()) {
      componentMap.clear();
    }
    
    return this;
  }
  
  /**
   * Clear all components and release resources
   * @returns {ComponentManager} This manager instance for chaining
   */
  clear() {
    super.clear();
    
    this.components.clear();
    this._componentSchemas.clear();
    
    return this;
  }

  /**
   * Register a schema
   * @param {string} name - The schema name
   * @param {Object} schema - The schema definition
   */
  registerSchema(name, schema) {
    this.schemas.set(name, schema);
  }

  /**
   * Validate a component against its schema
   * @param {string} name - The component name
   * @param {Object} data - The component data
   * @returns {boolean} True if valid, false otherwise
   */
  validateComponent(name, data) {
    const schema = this.schemas.get(name);
    if (!schema) return true; // No schema = no validation
    
    // Validate each property against schema
    for (const [prop, config] of Object.entries(schema.properties)) {
      if (data[prop] === undefined) {
        if (config.required) return false;
        data[prop] = config.default;
      } else if (typeof data[prop] !== config.type) {
        return false;
      }
    }
    
    return true;
  }
}

export { ComponentManager };
