class ECS {
  constructor() {
    this.entities = [];
    this.systems = [];
  }

  createEntity() {
    const entity = new Entity();
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

class Entity {
  constructor() {
    this.components = {};
  }

  addComponent(name, data) {
    this.components[name] = data;
  }

  getComponent(name) {
    return this.components[name];
  }
}

export { ECS, Entity };
