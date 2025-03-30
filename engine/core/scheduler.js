/**
 * @fileoverview System Scheduler for ECS
 * 
 * Manages system execution order and grouping
 */

/**
 * System Group - Groups systems for ordered execution
 */
class SystemGroup {
  constructor(name, priority = 0) {
    this.name = name;
    this.priority = priority;
    this.systems = [];
  }
  
  addSystem(system) {
    if (!this.systems.includes(system)) {
      this.systems.push(system);
    }
    return this;
  }
  
  update(deltaTime) {
    for (const system of this.systems) {
      if (system.update) {
        system.update(deltaTime);
      }
    }
  }
}

/**
 * Scheduler - Manages system execution
 */
class Scheduler {
  constructor() {
    this.groups = new Map(); // name -> SystemGroup
  }
  
  createGroup(name, priority = 0) {
    const group = new SystemGroup(name, priority);
    this.groups.set(name, group);
    return group;
  }
  
  getGroup(name) {
    return this.groups.get(name);
  }
  
  update(deltaTime) {
    // Sort groups by priority (higher first)
    const sortedGroups = Array.from(this.groups.values())
      .sort((a, b) => b.priority - a.priority);
      
    // Update each group
    for (const group of sortedGroups) {
      group.update(deltaTime);
    }
  }
}

// Add scheduler to World
import { World } from './ecs.js';
World.prototype.getScheduler = function() {
  if (!this._scheduler) {
    this._scheduler = new Scheduler();
  }
  return this._scheduler;
};

export { Scheduler, SystemGroup };
