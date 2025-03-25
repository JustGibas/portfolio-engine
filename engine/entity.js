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

  removeComponent(name) {
    delete this.components[name];
  }

  hasComponent(name) {
    return this.components.hasOwnProperty(name);
  }
}

export { Entity };
