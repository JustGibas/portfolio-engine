/**
 * @fileoverview Component Registry System
 * 
 * This system manages component registration and validation across the engine.
 * It ensures components adhere to their registered schemas and provides
 * validation services to other systems.
 * 
 * @module ComponentRegistrySystem
 * @requires System from '../core/system.js'
 */
import { System } from '../core/system.js';

/**
 * Component Registry System implementation
 */
class ComponentRegistrySystem extends System {
  /**
   * Create a new ComponentRegistrySystem
   */
  constructor() {
    super();
    this.componentSchemas = new Map();
  }
  
  /**
   * Initialize the component registry system
   */
  init(world, config) {
    super.init(world, config);
    
    // Register with scheduler if available
    if (this.world.getScheduler) {
      const scheduler = this.world.getScheduler();
      const earlyGroup = scheduler.getGroup('early') || scheduler.createGroup('early', -10);
      earlyGroup.addSystem(this);
    }
    
    console.info('ComponentRegistrySystem: Initialized');
    return this;
  }

  /**
   * Register a component schema
   * @param {string} type - Component type name
   * @param {Object} schema - Schema object defining component structure
   * @returns {ComponentRegistrySystem} This system for method chaining
   */
  registerComponent(type, schema) {
    if (!type || typeof type !== 'string') {
      throw new Error('Component type must be a non-empty string');
    }
    
    if (!schema || typeof schema !== 'object') {
      throw new Error(`Schema for component type '${type}' must be an object`);
    }
    
    this.componentSchemas.set(type, schema);
    console.info(`ComponentRegistrySystem: Registered component type '${type}'`);
    return this;
  }

  /**
   * Validate component data against its registered schema
   * @param {string} type - The component type name
   * @param {Object} data - Component data to validate
   * @returns {Object} Validation result with valid flag and any errors
   */
  validateComponent(type, data) {
    const schema = this.componentSchemas.get(type);
    
    if (!schema) {
      console.warn(`ComponentRegistrySystem: No schema registered for component type '${type}'`);
      return { valid: true }; // We don't fail validation if no schema exists
    }
    
    const errors = [];
    
    // Check required properties
    for (const [key, propSchema] of Object.entries(schema)) {
      if (propSchema.required && (data[key] === undefined || data[key] === null)) {
        errors.push(`Required property '${key}' missing`);
      }
      
      // Check type if specified and the property exists
      if (propSchema.type && data[key] !== undefined) {
        const valueType = Array.isArray(data[key]) ? 'array' : typeof data[key];
        
        if (valueType !== propSchema.type) {
          errors.push(`Property '${key}' has wrong type. Expected ${propSchema.type}, got ${valueType}`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get a list of all registered component types
   * @returns {Array<string>} Array of component type names
   */
  getRegisteredComponents() {
    return Array.from(this.componentSchemas.keys());
  }
  
  /**
   * Clear the component registry (useful for testing)
   */
  clearRegistry() {
    this.componentSchemas.clear();
    return this;
  }
  
  /**
   * System update method (not used for this system)
   */
  update() {
    // This system doesn't need per-frame updates
  }
}

// Create a singleton instance to use for validation
const componentRegistry = new ComponentRegistrySystem();

/**
 * Helper function to validate a component without needing a direct instance
 * @param {string} type - The component type
 * @param {Object} data - The component data to validate
 * @returns {Object} Validation result
 */
function validateComponent(type, data) {
  return componentRegistry.validateComponent(type, data);
}

export { ComponentRegistrySystem, validateComponent };
