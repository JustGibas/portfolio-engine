/**
 * @fileoverview Base System class for the Portfolio Engine.
 * Systems extend this class to implement domain-specific behavior.
 * @module System
 */
class System {
  constructor() {
    this.entities = [];
  }

  addEntity(entity) {
    this.entities.push(entity);
  }

  removeEntity(entity) {
    const index = this.entities.indexOf(entity);
    if (index > -1) {
      this.entities.splice(index, 1);
    }
  }

  update(entities) {
    // To be implemented by subclasses
  }

  init(entities) {
    // To be implemented by subclasses
  }
}

export { System };
