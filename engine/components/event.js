/**
 * @fileoverview Event Component for ECS
 * 
 * This file defines the component types and schemas for the event system.
 * In an ECS architecture, events are treated as entities with components.
 */

/**
 * Event component - represents an individual event
 * Attached to an entity that represents the event itself
 */
const EVENT = 'event';

/**
 * Event listener component - represents an entity that listens for events
 * Entities with this component will receive event notifications
 */
const EVENT_LISTENER = 'eventListener';

/**
 * Event emitter component - optional component for entities that emit events
 * Can be used to track event sources
 */
const EVENT_EMITTER = 'eventEmitter';

/**
 * Event notification component - temporarily attached to listener entities
 * When an event is processed, notifications are added to relevant listeners
 */
const EVENT_NOTIFICATION = 'eventNotification';

/**
 * Default schema for the event component
 */
const eventSchema = {
  type: EVENT,
  properties: {
    type: { type: 'string', required: true },
    data: { type: 'object', default: {} },
    processed: { type: 'boolean', default: false },
    timestamp: { type: 'number', default: 0 },
    sourceEntityId: { type: 'number', default: null }
  }
};

/**
 * Default schema for the event listener component
 */
const eventListenerSchema = {
  type: EVENT_LISTENER,
  properties: {
    eventType: { type: 'string', required: true },
    callback: { type: 'function', required: true },
    priority: { type: 'number', default: 0 }
  }
};

/**
 * Default schema for the event emitter component
 */
const eventEmitterSchema = {
  type: EVENT_EMITTER,
  properties: {
    eventTypes: { type: 'array', default: [] }
  }
};

/**
 * Default schema for the event notification component
 */
const eventNotificationSchema = {
  type: EVENT_NOTIFICATION,
  properties: {
    eventType: { type: 'string', required: true },
    eventData: { type: 'object', default: {} },
    eventEntityId: { type: 'number', required: true },
    sourceEntityId: { type: 'number', default: null },
    timestamp: { type: 'number', default: 0 },
    processed: { type: 'boolean', default: false }
  }
};

/**
 * Helper function to create an event component
 * @param {string} type - Type of event
 * @param {Object} data - Event data
 * @param {number} sourceEntityId - ID of entity that emitted the event
 * @returns {Object} Event component
 */
function createEventComponent(type, data = {}, sourceEntityId = null) {
  return {
    type,
    data,
    processed: false,
    timestamp: Date.now(),
    sourceEntityId
  };
}

/**
 * Helper function to create an event listener component
 * @param {string} eventType - Type of event to listen for
 * @param {Function} callback - Function to call when event is received
 * @param {number} priority - Priority of listener (higher is processed first)
 * @returns {Object} Event listener component
 */
function createEventListenerComponent(eventType, callback, priority = 0) {
  return {
    eventType,
    callback,
    priority
  };
}

/**
 * Register all event components with a component manager
 * @param {Object} componentManager - The component manager
 */
function registerEventComponents(componentManager) {
  if (!componentManager || typeof componentManager.registerSchema !== 'function') {
    console.warn('Cannot register event components: invalid component manager');
    return;
  }
  
  componentManager.registerSchema(EVENT, eventSchema);
  componentManager.registerSchema(EVENT_LISTENER, eventListenerSchema);
  componentManager.registerSchema(EVENT_EMITTER, eventEmitterSchema);
  componentManager.registerSchema(EVENT_NOTIFICATION, eventNotificationSchema);
}

export { 
  EVENT, 
  EVENT_LISTENER, 
  EVENT_EMITTER, 
  EVENT_NOTIFICATION,
  eventSchema,
  eventListenerSchema,
  eventEmitterSchema,
  eventNotificationSchema,
  createEventComponent,
  createEventListenerComponent,
  registerEventComponents
};