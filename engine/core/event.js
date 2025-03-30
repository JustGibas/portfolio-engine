/**
 * Event class representing a discrete event in the engine.
 * Acts similarly to an entity but is focused on event handling.
 */
class Event {
  constructor(type, data = {}) {
    this.id = Event.generateId();
    this.type = type;
    this.data = data;
    this.timestamp = Date.now();
    this.subscribers = new Set(); // Listeners for this event
    this.processed = false;
  }
  
  /**
   * Subscribe a callback function to this event.
   * @param {Function} callback - Function to call upon dispatch
   */
  subscribe(callback) {
    this.subscribers.add(callback);
  }
  
  /**
   * Unsubscribe a callback function from this event.
   * @param {Function} callback - Function to remove
   */
  unsubscribe(callback) {
    this.subscribers.delete(callback);
  }
  
  /**
   * Dispatch the event to all subscribers.
   */
  dispatch() {
    for (const callback of this.subscribers) {
      try {
        callback(this);
      } catch (error) {
        console.error(`Event "${this.type}" processing error:`, error);
      }
    }
    this.processed = true;
  }
  
  /**
   * Generate a unique event ID.
   * @returns {string} Unique ID
   */
  static generateId() {
    return `event-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { Event };