/**
 * @fileoverview Event System for ECS
 * 
 * Handles events through ECS components and entities
 */
import { System } from '../core/system.js';

// Component Types
const EVENT_EMITTER = 'eventEmitter';
const EVENT_LISTENER = 'eventListener';
const EVENT = 'event';
const EVENT_NOTIFICATION = 'eventNotification';

/**
 * Event System - Manages event creation and dispatch
 */
class EventSystem extends System {
  init() {
    this.listenerCache = new Map(); // eventType -> entityIds[]
    this.pendingEvents = [];
    
    // Register with scheduler if available
    if (this.world.getScheduler) {
      const scheduler = this.world.getScheduler();
      const earlyGroup = scheduler.createGroup('early', -10);
      earlyGroup.addSystem(this);
    }
    
    console.info('EventSystem: Initialized');
  }
  
  // Create events programmatically
  createEvent(type, data = {}) {
    const entityId = this.world.createEntity();
    this.world.addComponent(entityId, EVENT, {
      type,
      data,
      timestamp: Date.now(),
      processed: false
    });
    return entityId;
  }
  
  // Register a listener
  addListener(entityId, eventType, priority = 0) {
    const listener = this.world.getComponent(entityId, EVENT_LISTENER);
    if (listener) {
      // Add this event type to existing listener
      if (!listener.types.includes(eventType)) {
        listener.types.push(eventType);
      }
    } else {
      // Create new listener component
      this.world.addComponent(entityId, EVENT_LISTENER, {
        types: [eventType],
        priority
      });
    }
    
    // Invalidate cache
    this._invalidateCache(eventType);
  }
  
  // Remove listener
  removeListener(entityId, eventType) {
    const listener = this.world.getComponent(entityId, EVENT_LISTENER);
    if (!listener) return;
    
    if (eventType) {
      // Remove specific event type
      const index = listener.types.indexOf(eventType);
      if (index >= 0) {
        listener.types.splice(index, 1);
        this._invalidateCache(eventType);
      }
    } else {
      // Remove all event types
      const types = [...listener.types];
      listener.types = [];
      types.forEach(type => this._invalidateCache(type));
    }
  }
  
  // Emit an event from a specific entity
  emitFromEntity(sourceEntityId, eventType, eventData = {}) {
    const eventEntityId = this.createEvent(eventType, eventData);
    
    // Store reference to source entity
    const eventComponent = this.world.getComponent(eventEntityId, EVENT);
    if (eventComponent) {
      eventComponent.sourceEntityId = sourceEntityId;
    }
    
    this.pendingEvents.push(eventEntityId);
    return eventEntityId;
  }
  
  update() {
    // Process any pending events
    const events = [...this.pendingEvents];
    this.pendingEvents = [];
    
    for (const eventEntityId of events) {
      this._processEvent(eventEntityId);
    }
  }
  
  // Get all listeners for an event type (with caching)
  _getListenersForType(eventType) {
    if (this.listenerCache.has(eventType)) {
      return this.listenerCache.get(eventType);
    }
    
    const listeners = [];
    
    // Find all entities with EVENT_LISTENER component that listen for this type
    for (const entityId of this.world.getEntitiesWith(EVENT_LISTENER)) {
      const listener = this.world.getComponent(entityId, EVENT_LISTENER);
      if (listener && listener.types.includes(eventType)) {
        listeners.push({
          entityId,
          priority: listener.priority || 0
        });
      }
    }
    
    // Sort by priority (higher first)
    listeners.sort((a, b) => b.priority - a.priority);
    
    // Cache result
    this.listenerCache.set(eventType, listeners);
    return listeners;
  }
  
  _invalidateCache(eventType) {
    this.listenerCache.delete(eventType);
  }
  
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
        timestamp: Date.now()
      });
    }
    
    // Handle event bubbling for namespaced events
    if (type.includes(':')) {
      const parts = type.split(':');
      parts.pop();
      if (parts.length > 0) {
        const parentType = parts.join(':');
        this.emitFromEntity(eventComponent.sourceEntityId, parentType, data);
      }
    }
  }
  
  // Global event bus API for backward compatibility
  on(eventType, callback, priority = 0) {
    // Create a listener entity for this callback
    const entityId = this.world.createEntity();
    
    // Store the callback in a script component
    this.world.addComponent(entityId, 'script', {
      handleEvent: (data) => callback(data)
    });
    
    // Add as event listener
    this.addListener(entityId, eventType, priority);
    
    return entityId; // Return entity ID for removal
  }
  
  off(entityId) {
    // Remove all listeners for this entity
    this.removeListener(entityId);
    
    // Destroy the entity
    this.world.destroyEntity(entityId);
  }
  
  emit(eventType, data) {
    // Create a temporary entity to emit the event
    const sourceEntityId = this.world.createEntity();
    
    // Emit and get event entity ID
    const eventEntityId = this.emitFromEntity(sourceEntityId, eventType, data);
    
    // Clean up source entity after processing
    this.world.destroyEntity(sourceEntityId);
    
    return eventEntityId;
  }
}

export { EventSystem, EVENT_EMITTER, EVENT_LISTENER, EVENT, EVENT_NOTIFICATION };
