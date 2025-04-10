/**
 * @fileoverview Page component for ECS
 * 
 * Represents a page in the application.
 */

/**
 * Default schema for the page component
 */
export const pageSchema = {
  type: 'page',
  properties: {
    route: { type: 'string', required: true },
    active: { type: 'boolean', default: false },
    title: { type: 'string', default: '' },
    metadata: { type: 'object', default: {} }
  }
};

/**
 * Create a page component
 * @param {Object} data - Component data
 * @returns {Object} Page component
 */
export function createPage(data = {}) {
  if (!data.route) {
    throw new Error('Page component requires a route property');
  }
  
  return {
    route: data.route,
    active: data.active !== undefined ? data.active : false,
    title: data.title || '',
    metadata: data.metadata || {}
  };
}

/**
 * Register the page component with a component manager
 * @param {Object} componentManager - The component manager
 */
export function registerPageComponent(componentManager) {
  if (componentManager && componentManager.registerSchema) {
    componentManager.registerSchema('page', pageSchema);
  } else {
    console.warn('Page component: Could not register schema - no component manager provided');
  }
}
