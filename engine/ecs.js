/**
 * @fileoverview ECS Controller.
 * Manages entities and systems for the Portfolio Engine.
 * @module ECS
 * @requires Entity from ./entity.js
 */

import { Entity } from './entity.js';

class ECS {
  constructor() {
    this.entities = [];
    this.systems = [];
  }

  createEntity() {
    const entity = new Entity(); // now Entity has hasComponent method etc.
    this.entities.push(entity);
    return entity;
  }

  registerSystem(system) {
    this.systems.push(system);
  }

  start() {
    this.systems.forEach(system => system.init(this.entities));
    this.update();
  }

  update() {
    this.systems.forEach(system => system.update(this.entities));
    requestAnimationFrame(this.update.bind(this));
  }
}

export { ECS };
