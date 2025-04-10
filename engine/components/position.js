/**
 * @fileoverview Position component for ECS
 * 
 * Represents a position in 3D space.
 */

/**
 * Default schema for the position component
 */
export const positionSchema = {
  type: 'position',
  properties: {
    x: { type: 'number', default: 0 },
    y: { type: 'number', default: 0 },
    z: { type: 'number', default: 0 }
  }
};

/**
 * Create a position component
 * @param {Object} data - Component data
 * @returns {Object} Position component
 */
export function createPosition(data = {}) {
  return {
    x: data.x !== undefined ? data.x : positionSchema.properties.x.default,
    y: data.y !== undefined ? data.y : positionSchema.properties.y.default,
    z: data.z !== undefined ? data.z : positionSchema.properties.z.default
  };
}

/**
 * Register the position component with a component manager
 * @param {Object} componentManager - The component manager to register with
 */
export function registerPositionComponent(componentManager) {
  if (componentManager && componentManager.registerSchema) {
    componentManager.registerSchema('position', positionSchema);
  } else {
    console.warn('Position component: Could not register schema - no component manager provided');
  }
}