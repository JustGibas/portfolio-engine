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
