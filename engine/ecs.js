/**
 * @fileoverview ECS Core Controller.
 * 
 * This file implements the core Entity-Component-System (ECS) architecture controller,
 * which serves as the foundation for the Portfolio Engine. The ECS controller manages 
 * the creation and lifecycle of entities and the execution of systems.
 * 
 * The ECS pattern separates:
 * - Entities (objects in the application)
 * - Components (data attached to entities)
 * - Systems (logic that operates on entities with specific components)
 * 
 * This separation allows for highly modular and maintainable code where:
 * - Entities are just IDs/containers
 * - Components are pure data with no behavior
 * - Systems encapsulate all behavior and logic
 * 
 * @module ECS
 * @requires Entity from ./entity.js
 * 
 * @design Core class in the ECS architecture. Creates a clean separation 
 * between entities, components, and systems. Entities created here will
 * be operated on by systems registered via registerSystem().
 */

import { Entity } from './entity.js';

/**
 * The ECS controller manages entities and systems
 * within the application architecture
 */
class ECS {
  /**
   * Create a new ECS controller instance
   */
  constructor() {
    /**
     * Array of all entities in the application
     * @type {Entity[]}
     */
    this.entities = [];

    /**
     * Array of all systems that operate on entities
     * @type {System[]}
     */
    this.systems = [];
  }

  /**
   * Create a new entity and add it to the ECS
   * @returns {Entity} The newly created entity
   */
  createEntity() {
    const entity = new Entity(); 
    // Add a reference to this ECS instance to allow entity to access the ECS
    entity.ecs = this;
    this.entities.push(entity);
    return entity;
  }

  /**
   * Register a system with the ECS to process entities
   * @param {System} system - System instance that will operate on entities
   */
  registerSystem(system) {
    // Store reference to this ECS in the system
    if (system.setContext) {
      system.setContext({ ecs: this });
    }
    this.systems.push(system);
  }

  /**
   * Initialize all systems and start the update loop
   */
  start() {
    // Initialize all systems with the current set of entities
    this.systems.forEach(system => {
      if (typeof system.init === 'function') {
        system.init(this.entities);
      }
    });
    
    // Start the update loop
    this.update();
  }

  /**
   * Update loop that runs all systems on each animation frame
   * This is the main driver of all system logic in the application
   */
  update() {
    // Update all systems with the current set of entities
    this.systems.forEach(system => {
      if (typeof system.update === 'function') {
        system.update(this.entities);
      }
    });
    
    // Continue the update loop
    requestAnimationFrame(this.update.bind(this));
  }
}

export { ECS };
