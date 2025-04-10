import { Component, ComponentSchema } from '../core/component.js';

/**
 * Input component identifier
 * Marks an entity as interactive and defines how it responds to input
 */
export const INPUT = 'input';

/**
 * Schema for the input component
 */
export const inputSchema = new ComponentSchema({
  clickable: { 
    type: 'boolean', 
    default: false 
  },
  draggable: { 
    type: 'boolean', 
    default: false 
  },
  hoverable: { 
    type: 'boolean', 
    default: false 
  },
  focusable: { 
    type: 'boolean', 
    default: false 
  },
  keyboardControls: {
    type: 'boolean',
    default: false
  },
  controlMapping: {
    type: 'object',
    default: {}
  },
  // Track current state
  isHovered: {
    type: 'boolean',
    default: false
  },
  isPressed: {
    type: 'boolean',
    default: false
  },
  isFocused: {
    type: 'boolean',
    default: false
  }
});

/**
 * Example usage:
 * 
 * // Adding an input component to an entity
 * world.addComponent(entityId, INPUT, {
 *   clickable: true,
 *   draggable: true,
 *   controlMapping: {
 *     'click': 'select',
 *     'drag': 'move'
 *   }
 * });
 */
