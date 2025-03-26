/**
 * @fileoverview Application Entry Point for Portfolio Engine.
 * 
 * This file serves as the orchestrator for the Portfolio Engine, initializing
 * all required systems and starting the application.
 * 
 * The architecture follows an Entity-Component-System (ECS) pattern, now with
 * modular systems that each handle a specific responsibility:
 * 
 * 1. EventSystem - Centralized event handling and communication
 * 2. EntityCreator - Creates entities based on configuration
 * 3. ModuleLoader - Handles dynamic loading of page modules
 * 
 * This modular approach provides:
 * - Better separation of concerns
 * - Easier maintenance and extension
 * - Cleaner, more readable code
 * 
 * @module app
 * @requires ECS from ./engine/ecs.js
 * @requires config from ./config.js
 * @requires {eventSystem, EntityCreator, ModuleLoader} from ./engine/systems/index.js
 * @requires page from ./modules/page.js
 * 
 * @design Architecture Pattern: Entity-Component-System (ECS) with modular systems
 */
import { ECS } from './engine/ecs.js';
import config from './config.js';
import { page } from './modules/page/page.js';
// Import systems from the systems registry
import { eventSystem, EntityCreator, ModuleLoader, LayoutInitializerSystem } from './engine/systems/bootstrap.js';

/**
 * Main application initializer function
 */
async function initApp() {
  console.info('Portfolio Engine: Starting initialization...');
  
  // Create the ECS instance
  const ecs = new ECS();
  
  // Register the LayoutInitializerSystem with the ECS
  ecs.registerSystem(new LayoutInitializerSystem());
  
  // Set initial theme from local storage or default
  const savedTheme = localStorage.getItem('portfolioTheme') || config.theme.default;
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Initialize the event system
  eventSystem.init(config);
  
  try {
    // Discover available pages
    const sections = await page.discoverPages();
    
    // Add sections to config for backward compatibility
    config.sections = sections;
    
    // Also start project discovery in the background
    // This will be available when the projects page is loaded
    page.discoverProjects().catch(error => {
      console.warn('Project discovery encountered an issue:', error);
      // Non-fatal error, continue with application startup
    });
    
    console.info(`Configuration: ${sections.length} sections, ${config.theme.availableThemes.length} themes`);
    
    // Create entities based on configuration
    const entityCreator = new EntityCreator(ecs, config);
    entityCreator.createAll();
    
    // Initialize the module loader
    const moduleLoader = new ModuleLoader(ecs);
    
    // Get the initial route from URL or config
    const initialRoute = window.location.hash.substring(1) || config.defaults.route;
    
    // Start the module loader with the initial route
    moduleLoader.init(eventSystem, initialRoute);
    
    // Start the ECS update loop
    console.info('Portfolio Engine: Starting ECS system...');
    ecs.start();
    
    // Make the ECS instance available for debugging
    window.ecs = ecs;
    
    console.info('Portfolio Engine: Initialization complete');
  } catch (error) {
    console.error('Portfolio Engine: Initialization failed', error);
  }
}

// Initialize the application
initApp();
