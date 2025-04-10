/**
 * @fileoverview Content component for ECS
 * 
 * Represents the content of a DOM element.
 */

/**
 * Default schema for the content component
 */
export const contentSchema = {
  type: 'content',
  properties: {
    value: { type: 'string', default: '' },
    needsUpdate: { type: 'boolean', default: true }
  }
};

/**
 * Create a content component
 * @param {Object} data - Component data
 * @returns {Object} Content component
 */
export function createContent(data = {}) {
  return {
    value: data.value !== undefined ? data.value : '',
    needsUpdate: data.needsUpdate !== undefined ? data.needsUpdate : true
  };
}

/**
 * Register the content component with a component manager
 * @param {Object} componentManager - The component manager
 */
export function registerContentComponent(componentManager) {
  if (componentManager && componentManager.registerSchema) {
    componentManager.registerSchema('content', contentSchema);
  } else {
    console.warn('Content component: Could not register schema - no component manager provided');
  }
}