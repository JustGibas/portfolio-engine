// Test Runner and Assertions (reuse from theme-selector.test.js)
// ...existing code...

// Tests for ECS World
testRunner.addTest('World can register and retrieve systems', () => {
  const world = new World();
  const mockSystem = { name: 'TestSystem' };
  world.registerSystem(mockSystem);

  assert.true(world.hasSystem('TestSystem'), 'System should be registered');
  assert.equal(world.getSystem('TestSystem'), mockSystem, 'System should be retrievable');
});

testRunner.addTest('World can create and retrieve entities', () => {
  const world = new World();
  const entityId = world.createEntity();

  assert.true(world.entities.has(entityId), 'Entity should exist in the world');
});

testRunner.addTest('World can add and retrieve components', () => {
  const world = new World();
  const entityId = world.createEntity();
  const componentData = { health: 100 };

  world.addComponent(entityId, 'Health', componentData);
  const retrievedComponent = world.getComponent(entityId, 'Health');

  assert.equal(retrievedComponent.health, 100, 'Component data should match');
});

// Run Tests
testRunner.run();
