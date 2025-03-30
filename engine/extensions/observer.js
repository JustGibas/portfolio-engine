/**
 * @fileoverview Component Change Observer for ECS
 * 
 * Extends the World class with capabilities to observe component changes.
 * This is an extension to the core ECS functionality.
 *
 * @module extensions/observer
 * @requires World from ../core/ecs.js
 * 
 * @example
 * // Get the observer
 * const observer = world.getComponentObserver();
 * 
 * // Listen for changes to position components
 * observer.onComponentChanged('position', (entityId, component, changeType) => {
 *   console.log(`Entity ${entityId} position ${changeType}d`);
 * });
 */
import { World } from '../core/ecs.js';

/**
 * Component Observer - Tracks component changes
 */
class ComponentObserver {
  /**
   * Create a new component observer
   * @param {World} world - The world to observe
   */
  constructor(world) {
    this.world = world;
    this.listeners = new Map(); // componentType -> callbacks[]
  }
  
  /**
   * Register a callback for component changes
   * @param {string} componentType - Type of component to observe
   * @param {Function} callback - Function to call when component changes
   */
  onComponentChanged(componentType, callback) {
    if (!this.listeners.has(componentType)) {
      this.listeners.set(componentType, []);
    }
    this.listeners.get(componentType).push(callback);
  }
  
  /**
   * Remove a change listener
   * @param {string} componentType - Type of component being observed
   * @param {Function} [callback] - Specific callback to remove (if omitted, removes all)
   */
  removeChangeListener(componentType, callback) {
    if (!this.listeners.has(componentType)) return;
    
    if (callback) {
      // Remove specific callback
      const callbacks = this.listeners.get(componentType);
      const index = callbacks.indexOf(callback);
      if (index !== -1) callbacks.splice(index, 1);
    } else {
      // Remove all callbacks for this component type
      this.listeners.delete(componentType);
    }
  }
  
  /**
   * Notify listeners of component changes
   * @param {number} entityId - Entity ID
   * @param {string} componentType - Component type
   * @param {Object} component - Component data
   * @param {string} changeType - Type of change ('add', 'update', 'remove')
   */
  notify(entityId, componentType, component, changeType) {
    if (!this.listeners.has(componentType)) return;
    
    const callbacks = this.listeners.get(componentType);
    for (const callback of callbacks) {
      callback(entityId, component, changeType);
    }
  }
}

// Extend World with ComponentObserver support
World.prototype.getComponentObserver = function() {
  if (!this._componentObserver) {
    this._componentObserver = new ComponentObserver(this);
  }
  return this._componentObserver;
};

// Add hooks to World methods to notify observers

// Hook addComponent
const originalAddComponent = World.prototype.addComponent;
World.prototype.addComponent = function(entityId, componentType, componentData) {
  const component = originalAddComponent.call(this, entityId, componentType, componentData);
  
  // Notify observers
  if (this._componentObserver) {
    this._componentObserver.notify(entityId, componentType, component, 'add');
  }
  
  return component;
};

// Hook removeComponent
const originalRemoveComponent = World.prototype.removeComponent;
World.prototype.removeComponent = function(entityId, componentType) {
  // Get component before removal
  const component = this.getComponent(entityId, componentType);
  
  const result = originalRemoveComponent.call(this, entityId, componentType);
  
  // Notify observers if component was removed
  if (result && this._componentObserver) {
    this._componentObserver.notify(entityId, componentType, component, 'remove');
  }
  
  return result;
};

export { ComponentObserver };
