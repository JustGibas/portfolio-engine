/**
 * @fileoverview DOM Element component for ECS
 * 
 * Represents a DOM element in the web page.
 */

/**
 * Default schema for the DOM element component
 */
export const domElementSchema = {
  type: 'domElement',
  properties: {
    element: { type: 'object', required: true }, // The actual DOM element
    container: { type: 'object', default: null }, // Can be used as a container for other elements
    selector: { type: 'string', default: null } // CSS selector that uniquely identifies this element
  }
};

/**
 * Create a DOM element component
 * @param {Object} data - Component data
 * @returns {Object} DOM element component
 */
export function createDOMElement(data = {}) {
  if (!data.element) {
    throw new Error('DOM element component requires an element property');
  }
  
  return {
    element: data.element,
    container: data.container || data.element, // Default to the element itself
    selector: data.selector || null
  };
}

/**
 * Register the DOM element component with a component manager
 * @param {Object} componentManager - The component manager
 */
export function registerDOMElementComponent(componentManager) {
  if (componentManager && componentManager.registerSchema) {
    componentManager.registerSchema('domElement', domElementSchema);
  } else {
    console.warn('DOM element component: Could not register schema - no component manager provided');
  }
}