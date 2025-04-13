/**
 * ContainerComponent - Enhanced component for managing child entities
 * 
 * This component turns a regular entity into a container that can hold child entities.
 * It maintains parent-child relationships and provides a way to create "mini worlds"
 * within the ECS architecture.
 */

// Re-export from layoutSystem.js for consistency
export const UI_CONTAINER = 'uiContainer';

/**
 * Create a container component data object
 * @param {Object} options - Container configuration
 * @param {Array<number>} [options.children=[]] - Initial child entity IDs
 * @param {string} [options.layout='vertical'] - Layout type ('vertical', 'horizontal', 'grid')
 * @param {Object} [options.style={}] - Container-specific styling
 * @returns {Object} Container component data
 */
export function createContainerComponent(options = {}) {
  return {
    children: options.children || [],
    layout: options.layout || 'vertical',
    style: options.style || {},
    created: Date.now(),
    updated: Date.now(),
    pendingUpdates: false
  };
}

/**
 * Add a child entity to a container
 * @param {Object} world - World instance
 * @param {number} containerId - Parent container entity ID
 * @param {number} childId - Child entity ID
 * @returns {boolean} Success status
 */
export function addChildToContainer(world, containerId, childId) {
  // Get the container component
  const container = world.getComponent(containerId, UI_CONTAINER);
  if (!container) {
    console.warn(`Container component not found on entity ${containerId}`);
    return false;
  }
  
  // Add child ID if not already present
  if (!container.children.includes(childId)) {
    container.children.push(childId);
    container.updated = Date.now();
    container.pendingUpdates = true;
    
    // Update parent reference on the child if possible
    // This allows bidirectional traversal of the entity hierarchy
    const domElement = world.getComponent(childId, 'domElement');
    if (domElement) {
      domElement.parentEntityId = containerId;
    }
    
    return true;
  }
  
  return false;
}

/**
 * Get all child entities of a container
 * @param {Object} world - World instance
 * @param {number} containerId - Container entity ID
 * @returns {Array<number>} Child entity IDs
 */
export function getContainerChildren(world, containerId) {
  const container = world.getComponent(containerId, UI_CONTAINER);
  return container ? [...container.children] : [];
}