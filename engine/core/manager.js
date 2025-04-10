/**
 * =====================================================================
 * Manager.js - Base Manager Class for ECS
 * =====================================================================
 * 
 * @fileoverview
 * 
 * This file defines the base Manager class that all ECS managers extend.
 * It establishes common patterns and shared functionality.
 * 
 * ## Key Responsibilities:
 * - Provide common initialization pattern
 * - Standardize destruction/cleanup
 * - Link to the World container
 * 
 * @author Portfolio Engine Team
 * @lastModified Cycle 1.1.1
 */

/**
 * Base Manager class that all specialized managers extend
 */
class Manager {
  /**
   * Create a new manager
   * @param {Object} options - Manager configuration
   * @param {World} options.world - Reference to the world container
   */
  constructor({ world }) {
    this.world = world;
    this.name = this.constructor.name;
    
    console.log(`${this.name}: Created`);
  }
    
  /**
   * Initialize the manager (called after all managers are created)
   */
  initialize() {
    // Base implementation does nothing
    console.log(`${this.name}: Initialized`);
  }
  
  /**
   * Clean up resources and prepare for shutdown
   */
  destroy() {
    console.log(`${this.name}: Destroyed`);
  }
}

export { Manager };