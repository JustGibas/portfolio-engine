/**
 * =====================================================================
 * Component.js - Base Component Class for ECS Architecture
 * =====================================================================
 * 
 * @fileoverview 
 * 
 * This file implements the base Component class and ComponentSchema
 * for the ECS architecture.
 */

/**
 * Component - Base class for all ECS components
 */
class Component {
  /**
   * Create a new component
   * @param {Object} data - Initial component data
   */
  constructor(data = {}) {
    // Copy all properties from data
    Object.assign(this, data);
  }
  
  /**
   * Clone this component
   * @returns {Component} A new component with the same data
   */
  clone() {
    return new this.constructor(this);
  }
  
  /**
   * Reset the component to default values
   * @param {Object} defaultValues - Default values to reset to
   */
  reset(defaultValues = {}) {
    // Clear existing properties
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        delete this[key];
      }
    }
    
    // Apply default values
    Object.assign(this, defaultValues);
  }
  
  /**
   * Serialize the component to JSON
   * @returns {Object} Serialized component data
   */
  serialize() {
    const serialized = {};
    
    // Only serialize own properties (not prototype methods)
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        serialized[key] = this[key];
      }
    }
    
    return serialized;
  }
}

/**
 * ComponentSchema - Defines component structure and validation
 */
class ComponentSchema {
  /**
   * Create a new component schema
   * @param {Object} schema - Schema definition
   * @param {Object} schema.properties - Property definitions
   * @param {Array} schema.required - Required property names
   */
  constructor(schema = {}) {
    this.properties = schema.properties || {};
    this.required = schema.required || [];
    this.defaults = {};
    
    // Extract default values from properties
    for (const [key, prop] of Object.entries(this.properties)) {
      if ('default' in prop) {
        this.defaults[key] = prop.default;
      }
    }
  }
  
  /**
   * Create a component based on this schema
   * @param {Object} data - Component data
   * @returns {Component} New component instance
   */
  createComponent(data = {}) {
    // Apply defaults then override with provided data
    const componentData = {
      ...this.defaults,
      ...data
    };
    
    // Validate required fields
    for (const field of this.required) {
      if (!(field in componentData)) {
        throw new Error(`Missing required field '${field}' in component data`);
      }
    }
    
    // Validate types if specified
    for (const [key, value] of Object.entries(componentData)) {
      const propDef = this.properties[key];
      if (propDef && propDef.type) {
        this.validateType(key, value, propDef.type);
      }
    }
    
    return new Component(componentData);
  }
  
  /**
   * Validate a value against an expected type
   * @param {string} key - Property name
   * @param {*} value - Property value
   * @param {string|Array} expectedType - Expected type or types
   */
  validateType(key, value, expectedType) {
    // Handle array of types (union type)
    if (Array.isArray(expectedType)) {
      const valid = expectedType.some(type => this.checkType(value, type));
      if (!valid) {
        throw new TypeError(
          `Property '${key}' should be one of types: ${expectedType.join(', ')}`
        );
      }
      return;
    }
    
    // Handle single type
    if (!this.checkType(value, expectedType)) {
      throw new TypeError(
        `Property '${key}' should be of type '${expectedType}', got '${typeof value}'`
      );
    }
  }
  
  /**
   * Check if a value matches an expected type
   * @param {*} value - Value to check
   * @param {string} type - Type to check against
   * @returns {boolean} True if value matches type
   */
  checkType(value, type) {
    switch (type.toLowerCase()) {
      case 'string': return typeof value === 'string';
      case 'number': return typeof value === 'number' && !isNaN(value);
      case 'boolean': return typeof value === 'boolean';
      case 'object': return typeof value === 'object' && value !== null;
      case 'array': return Array.isArray(value);
      case 'function': return typeof value === 'function';
      case 'null': return value === null;
      case 'any': return true;
      default: return false;
    }
  }
}

export { Component, ComponentSchema };