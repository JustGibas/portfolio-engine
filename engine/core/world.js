/**
   * =====================================================================
   * World.js - Simple ECS World Container
   * =====================================================================
   * 
   * A minimal container for ECS managers and data. This class is designed
   * to hold references to various managers without implementing logic itself.
   */
  
  /**
   * World - Simple container for ECS elements.
   * Acts primarily as a reference holder for various managers.
   */
  class World {
    /**
     * Creates a new World instance.
     */
    constructor() {
      // These will be set by managers during initialization
      this.entityManager = null;
      this.componentManager = null;
      this.systemManager = null;
      
      // Core data references
      this.entities = new Map();
      this.components = new Map();
      this.systems = new Map();
      this.nextEntityId = 1;
      
      // Internal flags to prevent infinite recursion
      this._isCreatingEvent = false;
      
      console.log('World: Created');
    }
    
    /**
     * Creates a new entity.
     * @param {Object} options - Entity creation options
     * @param {boolean} options.emitEvent - Whether to emit an event (default: true)
     * @param {boolean} options.isEventEntity - Whether this entity is for an event (default: false)
     * @returns {number} New entity ID.
     */
    createEntity(options = {}) {
      const emitEvent = options.emitEvent !== false;
      const isEventEntity = options.isEventEntity === true;
      
      const entityId = this.nextEntityId++;
      this.entities.set(entityId, { 
        id: entityId,
        componentMask: new Set()
      });
      
      // Only emit events if:
      // 1. We're not already in the process of creating an event entity
      // 2. The caller wants to emit an event
      // 3. The event system exists
      if (emitEvent && !this._isCreatingEvent && !isEventEntity && this.getSystem('event')) {
        // Set flag to prevent recursion
        this._isCreatingEvent = true;
        
        try {
          // Emit the entity created event
          this.getSystem('event').emit('entity:created', { entityId });
        } finally {
          // Always reset the flag, even if there's an error
          this._isCreatingEvent = false;
        }
      }
      
      return entityId;
    }

    /**
     * Destroys an existing entity.
     * @param {number} entityId - ID of the entity to remove.
     * @param {Object} options - Entity destruction options
     * @param {boolean} options.emitEvent - Whether to emit an event (default: true)
     * @returns {boolean} True if entity was removed.
     */
    destroyEntity(entityId, options = {}) {
      if (!this.entities.has(entityId)) return false;

      const emitEvent = options.emitEvent !== false;
      
      // Remove all components for this entity
      const entity = this.entities.get(entityId);
      for (const componentType of entity.componentMask) {
        const componentMap = this.components.get(componentType);
        if (componentMap) {
          componentMap.delete(entityId);
        }
      }

      // Remove the entity
      this.entities.delete(entityId);
      
      // Only emit events if not in event creation and caller wants to emit
      if (emitEvent && !this._isCreatingEvent && this.getSystem('event')) {
        // Set flag to prevent recursion
        this._isCreatingEvent = true;
        
        try {
          // Emit the entity destroyed event
          this.getSystem('event').emit('entity:destroyed', { entityId });
        } finally {
          // Always reset the flag, even if there's an error
          this._isCreatingEvent = false;
        }
      }
      
      return true;
    }

    /**
     * Add a system to the world
     * @param {string} name - System name/key
     * @param {Object} system - System instance
     * @returns {World} This world instance for chaining
     */
    addSystem(name, system) {
      this.systems.set(name, system);
      return this;
    }
    
    /**
     * Get a system by name
     * @param {string} name - System name/key
     * @returns {Object|null} System instance or null if not found
     */
    getSystem(name) {
      return this.systems.get(name) || null;
    }
    
    /**
     * Add a component to an entity
     * @param {number} entityId - Entity ID
     * @param {string} componentType - Component type name
     * @param {Object} componentData - Component data
     * @returns {Object} Component data
     */
    addComponent(entityId, componentType, componentData = {}) {
      // Ensure entity exists
      if (!this.entities.has(entityId)) {
        console.warn(`Cannot add component: Entity ${entityId} does not exist`);
        return null;
      }
      
      // Ensure component type map exists
      if (!this.components.has(componentType)) {
        this.components.set(componentType, new Map());
      }
      
      // Add component data
      const componentMap = this.components.get(componentType);
      componentMap.set(entityId, componentData);
      
      // Update entity's component mask
      const entity = this.entities.get(entityId);
      entity.componentMask.add(componentType);
      
      return componentData;
    }
    
    /**
     * Get a component for an entity
     * @param {number} entityId - Entity ID
     * @param {string} componentType - Component type name
     * @returns {Object|null} Component data or null if not found
     */
    getComponent(entityId, componentType) {
      const componentMap = this.components.get(componentType);
      if (!componentMap) return null;
      
      return componentMap.get(entityId) || null;
    }
    
    /**
     * Get entities that have all specified components
     * @param {...string} componentTypes - Component type names
     * @returns {Array<number>} Array of matching entity IDs
     */
    getEntitiesWith(...componentTypes) {
      if (componentTypes.length === 0) return [];
      
      // Find entities with all component types
      return Array.from(this.entities.keys()).filter(entityId => {
        const entity = this.entities.get(entityId);
        return componentTypes.every(type => entity.componentMask.has(type));
      });
    }

    /**
     * Get all entity IDs
     * @returns {Array<number>} Array of entity IDs
     */
    getAllEntityIds() {
      return Array.from(this.entities.keys());
    }

    /**
     * Clean up the world
     */
    destroy() {
      // Signal managers to clean up (if they exist)
      this.entityManager?.destroy?.();
      this.componentManager?.destroy?.();
      this.systemManager?.destroy?.();
      
      // Clear local references
      this.entities.clear();
      this.components.clear();
      this.systems.clear();
      
      console.log('World: Destroyed');
    }
  }
  
  export { World };
