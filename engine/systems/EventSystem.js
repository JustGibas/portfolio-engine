/**
 * @fileoverview Event System for Portfolio Engine
 * 
 * This system manages centralized event handling and communication between
 * different parts of the application. It acts as a message broker that allows
 * components to communicate without direct dependencies.
 * 
 * @module EventSystem
 * @requires System from ../system.js
 * @requires config from ../../config.js
 * 
 * @design Observer Pattern - Components subscribe to events they're interested in.
 */
import { System } from '../system.js';
import config from '../../config.js';

/**
 * Event System implementation
 */
const eventSystem = {
  events: {},
  config: null,

  /**
   * Initialize the event system
   * @param {Object} configObj - The application configuration
   */
  init(configObj) {
    this.config = configObj;
    console.info('Event System: Initialized');
    
    // Set up document-level event listeners for core events
    document.addEventListener('navigation', this.handleNavigation.bind(this));
    document.addEventListener('themeChange', this.handleThemeChange.bind(this));
    
    console.info('Event System: Core event listeners registered');
  },
  
  /**
   * Handle navigation events
   * @param {CustomEvent} event - The navigation event
   */
  handleNavigation(event) {
    const route = event.detail.route;
    console.info(`Event System: Navigation event received for route: ${route}`);
    // The actual navigation handling will be done by other systems that listen for this event
  },
  
  /**
   * Handle theme change events
   * @param {CustomEvent} event - The theme change event
   */
  handleThemeChange(event) {
    const theme = event.detail.theme;
    console.info(`Event System: Theme change event received for theme: ${theme}`);
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
  }
};

export { eventSystem };
