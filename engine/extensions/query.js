/**
 * @fileoverview Query Manager for ECS
 * 
 * Provides optimized entity queries with caching
 */
import { World } from '../core/ecs.js';

/**
 * Cached Query - Maintains cache of entities matching component requirements
 */
class Query {
  constructor(world, componentTypes) {
    this.world = world;
    this.componentTypes = componentTypes;
    this.entities = [];
    this.dirty = true;
    
    // Register with world to receive notifications
    world.registerQuery(this);
  }
  
  refresh() {
    if (this.dirty) {
      this.entities = this.world.getEntitiesWith(...this.componentTypes);
      this.dirty = false;
    }
    return this.entities;
  }
  
  markDirty() {
    this.dirty = true;
  }
}

/**
 * Extend World with Query support
 */
World.prototype.createQuery = function(...componentTypes) {
  return new Query(this, componentTypes);
};

World.prototype.registerQuery = function(query) {
  if (!this._queries) this._queries = [];
  this._queries.push(query);
};

// Add hooks to mark queries dirty when entities/components change
const originalAddComponent = World.prototype.addComponent;
World.prototype.addComponent = function(...args) {
  const result = originalAddComponent.apply(this, args);
  if (this._queries) this._queries.forEach(q => q.markDirty());
  return result;
};

export { Query };
