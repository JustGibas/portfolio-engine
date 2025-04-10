import { Component, ComponentSchema } from '../core/component.js';

/**
 * Appearance component identifier
 * Controls how an entity looks visually
 */
export const APPEARANCE = 'appearance';

/**
 * Schema for the appearance component
 */
export const appearanceSchema = new ComponentSchema({
  visible: { 
    type: 'boolean', 
    default: true
  },
  shape: {
    type: 'string',
    default: 'rectangle',
  },
  color: {
    type: 'string',
    default: '#FFFFFF'
  },
  opacity: {
    type: 'number',
    default: 1.0
  },
  size: {
    type: 'object',
    default: { width: 100, height: 100 }
  },
  image: {
    type: 'string',
    default: null
  },
  layer: {
    type: 'number',
    default: 0
  }
});

/**
 * Example usage:
 * 
 * // Adding an appearance component to an entity
 * world.addComponent(entityId, APPEARANCE, {
 *   shape: 'circle',
 *   color: '#FF0000',
 *   size: { width: 50, height: 50 }
 * });
 */
