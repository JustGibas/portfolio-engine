/**
 * @fileoverview Fallback Implementations for Engine Components
 * 
 * This file provides simple fallback implementations for core engine components
 * to ensure the application can continue working even when parts of the ECS fail.
 */

/**
 * Create a minimal ECS fallback
 * @returns {Object} A minimal ECS implementation
 */
export function createFallbackECS() {
  const entities = new Map();
  let nextEntityId = 1;
  
  return {
    // Entity management
    createEntity() {
      const entityId = nextEntityId++;
      const entity = {
        id: entityId,
        components: new Map(),
        hasComponent(type) {
          return this.components.has(type);
        },
        getComponent(type) {
          return this.components.get(type);
        },
        addComponent(type, data) {
          this.components.set(type, data);
          return data;
        },
        removeComponent(type) {
          return this.components.delete(type);
        }
      };
      entities.set(entityId, entity);
      return entity;
    },
    
    // System handling
    systems: [],
    getSystem(name) {
      return this.systems.find(sys => sys.name === name);
    },
    
    // Exposing entities
    entities,
    
    // Simple event system
    emit(eventType, data) {
      console.log(`[Fallback Event] ${eventType}:`, data);
      document.dispatchEvent(new CustomEvent(eventType, { detail: data }));
    },
    on(eventType, callback) {
      const handler = (e) => callback(e.detail);
      document.addEventListener(eventType, handler);
      return handler;
    },
    off(eventType, handler) {
      document.removeEventListener(eventType, handler);
    }
  };
}

/**
 * Create a global fallback if core ECS systems are unavailable
 */
export function ensureFallbacks() {
  if (!window.ecs) {
    window.ecs = createFallbackECS();
    console.warn('Created fallback ECS implementation');
  }
}
