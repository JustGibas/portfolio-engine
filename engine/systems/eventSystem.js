/**
 * @fileoverview Event System for ECS
 * 
 * This system handles the processing of events in our ECS architecture.
 * It treats events as entities with components, following pure ECS principles.
 */
import { System } from '../core/system.js';
import { 
  EVENT, 
  EVENT_LISTENER, 
  EVENT_EMITTER, 
  EVENT_NOTIFICATION,
  createEventComponent
} from '../components/event.js';

/**
 * Event System - Manages event creation and dispatch
 */
class EventSystem extends System {
  /**
   * Initialize the event system
   * @param {Object} world - ECS world instance
   * @param {Object} options - System options
   * @returns {EventSystem} This system instance
   */
  init(world, options = {}) {
    super.init(world, options);
    
    // Queue for processing events
    this.eventQueue = [];
    
    // Cache for listener lookups (eventType -> array of listeners)
    this.listenerCache = new Map();
    
    // Listener for wildcard events (listen to all events)
    this.wildcardListeners = [];
    
    // Debug mode can be enabled to log events
    this.debugMode = options.debugMode || false;
    
    console.info('EventSystem: Initialized');
    return this;
  }
  
  /**
   * Update method called each frame
   * Processes all events in the queue
   */
  update() {
    // Skip if no events to process
    if (this.eventQueue.length === 0) return;
    
    // Process events in the order they were added
    const eventsToProcess = [...this.eventQueue];
    this.eventQueue = [];
    
    for (const eventEntityId of eventsToProcess) {
      this._processEvent(eventEntityId);
    }
    
    // Invalid the listener cache occasionally to ensure we pick up new listeners
    if (Math.random() < 0.05) { // ~5% chance each frame
      this._invalidateListenerCache();
    }
  }
  
  /**
   * Process a single event
   * @param {number} eventEntityId - Entity ID of the event
   * @private
   */
  _processEvent(eventEntityId) {
    const eventComponent = this.world.getComponent(eventEntityId, EVENT);
    if (!eventComponent || eventComponent.processed) return;
    
    let { type, data } = eventComponent;
    // If event type is not a string, convert it and log a warning.
    if (typeof type !== 'string') {
      console.warn('EventSystem: Event type is not a string, converting:', type);
      type = String(type);
      eventComponent.type = type; // Update the component value.
    }
    
    const listeners = this._getListenersForType(type);
    
    // Mark as processed
    eventComponent.processed = true;
    
    // Notify listeners
    for (const { entityId } of listeners) {
      this.world.addComponent(entityId, EVENT_NOTIFICATION, {
        eventType: type,
        eventData: data,
        eventEntityId,
        sourceEntityId: eventComponent.sourceEntityId,
        timestamp: Date.now(),
        processed: false
      });
    }
    
    // Also call direct callbacks if they exist
    for (const { callback } of listeners) {
      if (typeof callback === 'function') {
        try {
          callback(data, {
            type,
            eventEntityId,
            sourceEntityId: eventComponent.sourceEntityId
          });
        } catch (error) {
          console.error(`EventSystem: Error in listener callback for "${type}":`, error);
        }
      }
    }
    
    if (this.debugMode) {
      console.log(`EventSystem: Processed event "${type}" with ${listeners.length} listeners`);
    }
  }
  
  /**
   * Get all listeners for a specific event type
   * @param {string} eventType - Type of event
   * @returns {Array} Array of listener objects
   * @private
   */
  _getListenersForType(eventType) {
    // Check cache first
    if (this.listenerCache.has(eventType)) {
      return this.listenerCache.get(eventType);
    }
    
    // Find all entities with EVENT_LISTENER component
    const listenerEntities = this.world.getEntitiesWith(EVENT_LISTENER);
    const matchingListeners = [];
    
    // Filter for listeners that match this event type
    for (const entityId of listenerEntities) {
      const listener = this.world.getComponent(entityId, EVENT_LISTENER);
      if (!listener) continue;
      
      // Check if this listener matches the event type (or is a wildcard)
      if (listener.eventType === eventType || listener.eventType === '*') {
        matchingListeners.push({
          entityId,
          callback: listener.callback,
          priority: listener.priority || 0
        });
      }
    }
    
    // Sort by priority (higher priorities first)
    matchingListeners.sort((a, b) => b.priority - a.priority);
    
    // Store in cache for future lookups
    this.listenerCache.set(eventType, matchingListeners);
    
    return matchingListeners;
  }
  
  /**
   * Clear the listener cache
   * @private
   */
  _invalidateListenerCache() {
    this.listenerCache.clear();
  }
  
  /**
   * Create and emit an event
   * @param {string} type - Type of event
   * @param {Object} data - Event data
   * @param {number} sourceEntityId - Entity that emitted the event
   * @returns {number} ID of the created event entity
   */
  emit(type, data = {}, sourceEntityId = null) {
    // Create a new entity for this event with the isEventEntity flag set to true
    const eventEntityId = this.world.createEntity({
      isEventEntity: true, // Important to prevent recursive event emission
      emitEvent: false // Don't emit an event for creating an event entity
    });
    
    // Add the event component
    this.world.addComponent(eventEntityId, EVENT, {
      type,
      data,
      processed: false,
      timestamp: Date.now(),
      sourceEntityId
    });
    
    // Add to the processing queue
    this.eventQueue.push(eventEntityId);
    
    if (this.debugMode) {
      console.log(`EventSystem: Emitted event "${type}" with data:`, data);
    }
    
    return eventEntityId;
  }
  
  /**
   * Add an event listener
   * @param {string} eventType - Type of event to listen for
   * @param {Function} callback - Function to call when event is received
   * @param {number} priority - Priority of listener (higher is processed first)
   * @returns {number} ID of the created listener entity
   */
  on(eventType, callback, priority = 0) {
    // Create a new entity for this listener
    const listenerEntityId = this.world.createEntity();
    
    // Add the listener component
    this.world.addComponent(listenerEntityId, EVENT_LISTENER, {
      eventType,
      callback,
      priority
    });
    
    // Invalidate listener cache when new listeners are added
    this._invalidateListenerCache();
    
    if (this.debugMode) {
      console.log(`EventSystem: Added listener for "${eventType}" with priority ${priority}`);
    }
    
    return listenerEntityId;
  }
  
  /**
   * Remove an event listener
   * @param {string} eventType - Type of event
   * @param {Function} callback - Callback function to remove
   * @returns {boolean} True if listener was removed
   */
  off(eventType, callback) {
    // Find matching listener entities
    const listenerEntities = this.world.getEntitiesWith(EVENT_LISTENER);
    let removed = false;
    
    for (const entityId of listenerEntities) {
      const listener = this.world.getComponent(entityId, EVENT_LISTENER);
      
      // Check if this is the listener we want to remove
      if (listener && 
          listener.eventType === eventType && 
          (!callback || listener.callback === callback)) {
        // Remove the entity
        this.world.removeEntity(entityId);
        removed = true;
      }
    }
    
    // Invalidate cache if any listeners were removed
    if (removed) {
      this._invalidateListenerCache();
    }
    
    return removed;
  }
  
  /**
   * Add a one-time event listener
   * @param {string} eventType - Type of event to listen for
   * @param {Function} callback - Function to call when event is received
   * @returns {number} ID of the created listener entity
   */
  once(eventType, callback) {
    // Create a wrapper that will remove itself after being called
    const onceWrapper = (data, eventInfo) => {
      // Call the original callback
      callback(data, eventInfo);
      
      // Remove this listener
      this.off(eventType, onceWrapper);
    };
    
    // Add the wrapped listener
    return this.on(eventType, onceWrapper);
  }
  
  /**
   * Enable or disable debug mode
   * @param {boolean} enabled - Whether debug mode should be enabled
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    console.log(`EventSystem: Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }
}

export { EventSystem };
