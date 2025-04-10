import { Component, ComponentSchema } from '../core/component.js';

/**
 * Schema for Transform component
 */
const transformSchema = new ComponentSchema({
  properties: {
    position: { type: 'object', default: { x: 0, y: 0, z: 0 } },
    rotation: { type: 'object', default: { x: 0, y: 0, z: 0 } },
    scale: { type: 'object', default: { x: 1, y: 1, z: 1 } },
    parent: { type: ['number', 'null'], default: null }
  }
});

/**
 * TransformComponent - Represents position, rotation and scale in 3D space
 * @extends Component
 */
class TransformComponent extends Component {
  constructor(data = {}) {
    super({
      ...transformSchema.defaults,
      ...data
    });
  }
  
  /**
   * Set position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   */
  setPosition(x, y, z = 0) {
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
  }
  
  /**
   * Set rotation
   * @param {number} x - X rotation
   * @param {number} y - Y rotation
   * @param {number} z - Z rotation
   */
  setRotation(x, y, z = 0) {
    this.rotation.x = x;
    this.rotation.y = y;
    this.rotation.z = z;
  }
  
  /**
   * Set scale
   * @param {number} x - X scale
   * @param {number} y - Y scale
   * @param {number} z - Z scale
   */
  setScale(x, y, z = 1) {
    this.scale.x = x;
    this.scale.y = y;
    this.scale.z = z;
  }
}

export { TransformComponent, transformSchema };