import { Component, ComponentSchema } from '../core/component.js';

/**
 * Physics component identifier
 * Handles physics properties like velocity, acceleration, collisions
 */
export const PHYSICS = 'physics';

/**
 * Schema for the physics component
 */
export const physicsSchema = new ComponentSchema({
  velocity: { 
    type: 'object', 
    default: { x: 0, y: 0, z: 0 } 
  },
  acceleration: { 
    type: 'object', 
    default: { x: 0, y: 0, z: 0 } 
  },
  mass: { 
    type: 'number', 
    default: 1.0 
  },
  friction: {
    type: 'number',
    default: 0.1
  },
  restitution: {
    type: 'number',
    default: 0.2
  },
  collider: {
    type: 'object',
    default: {
      type: 'box',
      width: 1,
      height: 1,
      depth: 1
    }
  },
  kinematic: { 
    type: 'boolean', 
    default: false 
  }
});

/**
 * Example usage:
 * 
 * // Adding a physics component to an entity
 * world.addComponent(entityId, PHYSICS, {
 *   velocity: { x: 5, y: 0, z: 0 },
 *   mass: 2.0,
 *   collider: {
 *     type: 'circle',
 *     radius: 25
 *   }
 * });
 */
