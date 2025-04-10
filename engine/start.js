/**
 * =====================================================================
 * Portfolio Engine: Start.js - Initialization Process
 * =====================================================================
 * This file handles the startup sequence of the game engine.
 * It initializes all core systems in the proper order.
 */

import { LoadingIndicator } from './modules/loading-indicator.js';
import { World } from './core/world.js';

/**
 * Starts the engine with sensible defaults
 * @returns {Promise<Object>} - Engine instance
 */
export async function startEngine() {
  console.info('Starting Portfolio Engine...');
  try {
    // ======================================================================
    // PHASE 1: PREPARE THE ENVIRONMENT
    // ======================================================================
    // Create loading indicator to show startup progress
    window.loadingIndicator = LoadingIndicator();
    window.loadingIndicator.updateProgress(5, 'Starting engine...');
    
    // ======================================================================
    // PHASE 2: CREATE THE WORLD
    // ======================================================================
    // The world is the main container for all website entities and systems 
    const world = new World();
    window.loadingIndicator.updateProgress(15, 'World created');
    
    // ======================================================================
    // PHASE 3:
    // ======================================================================
    // These managers handle the core functionality of the engine
    
 
    console.info(' Manager part ');
    // Entity Manager - Creates and tracks world entities
    const { EntityManager } = await import('./managers/entityManager.js');
    const entityManager = new EntityManager({ world });
    world.entityManager = entityManager;
    window.loadingIndicator.updateProgress(25, 'Entity manager ready');
    
    // Component Manager - Manages components that define entity behavior
    const { ComponentManager } = await import('./managers/componentManager.js');
    const componentManager = new ComponentManager({ world });
    world.componentManager = componentManager;
    window.loadingIndicator.updateProgress(35, 'Component manager ready');

    // System Manager - Handles all the systems that update the game state
    const { SystemManager } = await import('./managers/systemManager.js');
    const systemManager = new SystemManager({ world });
    world.systemManager = systemManager;
    window.loadingIndicator.updateProgress(45, 'System manager ready');

    
    // ======================================================================
    // PHASE 4: REGISTER COMPONENTS
    // ======================================================================
    // These  handle the core functionality of the engine
    
    console.info(' Component part ');
    // Register event components
    const { registerEventComponents } = await import('./components/event.js');
    registerEventComponents(componentManager);
    window.loadingIndicator.updateProgress(40, 'Event components registered');
    
    // Register content component
    const { registerContentComponent } = await import('./components/content.js');
    registerContentComponent(componentManager);
    window.loadingIndicator.updateProgress(42, 'Content component registered');
    
    // Register DOM element component
    const { registerDOMElementComponent } = await import('./components/domElement.js');
    registerDOMElementComponent(componentManager);
    window.loadingIndicator.updateProgress(44, 'DOM element component registered');
    
    // Register page component
    const { registerPageComponent } = await import('./components/page.js');
    registerPageComponent(componentManager);
    window.loadingIndicator.updateProgress(46, 'Page component registered');
    
    // ======================================================================
    // PHASE 5:
    // ======================================================================
    // These  handle the core functionality of the engine

    console.info(' System part ');
    // Register and initialize the Event System
    const { EventSystem } = await import('./systems/eventSystem.js');
    const eventSystem = new EventSystem();
    world.addSystem('event', eventSystem);
    eventSystem.init(world);
    window.loadingIndicator.updateProgress(50, 'Event system ready');
    
    

    // Register and initialize the Render System
    const { RenderSystem } = await import('./systems/renderSystem.js');
    const renderSystem = new RenderSystem();
    world.addSystem('render', renderSystem);
    renderSystem.init(world);
    window.loadingIndicator.updateProgress(55, 'Render system ready');

    
    
    // Register and initialize the Page System
    const { PageSystem } = await import('./systems/pageSystem.js');
    const pageSystem = new PageSystem();
    world.addSystem('page', pageSystem);
    pageSystem.init(world);
    window.loadingIndicator.updateProgress(60, 'Page system ready');
    
    
    // Register and initialize the Layout System
    const { LayoutSystem } = await import('./systems/layoutSystem.js');
    const layoutSystem = new LayoutSystem();
    world.addSystem('layout', layoutSystem);
    layoutSystem.init(world);
    window.loadingIndicator.updateProgress(65, 'Layout system ready');
   
    
    // ======================================================================
    // PHASE 6: INITIALIZE ALL SYSTEMS
    // ======================================================================
    // After registration, all systems need to be initialized
    //window.loadingIndicator.updateProgress(80, 'Initializing systems...');
    //await systemManager.initializeSystems();
    //window.loadingIndicator.updateProgress(90, 'Systems initialized');
    
    // ======================================================================
    // PHASE 7: CREATE ENGINE INTERFACE AND RETURN
    // ======================================================================
    // Create a simple API for controlling the engine
    const engine = {
      // World instance containing all entities and systems
      world: world,
      
      // Start the engine main loop
      start: function() {
        console.info('Engine starting...');
        if (world.engineLoop) {
          world.engineLoop.start();
        }
        
        // Start the page system to load initial page
        const pageSystem = world.getSystem('page');
        if (pageSystem) {
          pageSystem.start();
        }
        
        // Emit event if event system exists
        const eventSystem = world.getSystem('event');
        if (eventSystem) {
          eventSystem.emit('engine:started', { timestamp: Date.now() });
        }
      },
      
      // Stop the engine
      stop: function() {
        console.info('Engine stopping...');
        if (world.engineLoop) {
          world.engineLoop.stop();
        }
        
        // Emit event if event system exists
        const eventSystem = world.getSystem('event');
        if (eventSystem) {
          eventSystem.emit('engine:stopped', { timestamp: Date.now() });
        }
      },
      
    };

    // Register globally for DevTools to find
    window.portfolioEngine = engine;

    // ======================================================================
    // PHASE 8: CREATE THE MAIN LOOP
    // ======================================================================
    // The main loop updates all systems each frame
    const { EngineLoop } = await import('./loop.js');
    const engineLoop = new EngineLoop({
      world,
      fixedTimeStep: 16.666, // 60 FPS
      maxUpdatesPerFrame: 5,
      useRAF: true  // Use requestAnimationFrame for smooth rendering
    });
    world.engineLoop = engineLoop;
    window.loadingIndicator.updateProgress(65, 'Engine loop ready');
    
    //======================================================================
    // Done
    //====================================================================

    // Hide the loading screen and return the engine
    window.loadingIndicator.updateProgress(100, 'Ready!');
    
    // Short pause to show 100% complete
    await new Promise(resolve => setTimeout(resolve, 300));
    window.loadingIndicator.hideInitialLoading();
    console.info('Engine startup complete!');
    
    // Return the engine instance for use in the application
    return engine;
    // error handling
  } catch (error) {
    console.error('Fatal error during engine startup:', error);
    window.loadingIndicator?.updateProgress(100, 'Startup failed!', true);
    console.error('Error details:', error.stack || error);
    
    // Re-throw the error so it can be caught by higher-level code
    throw error;
  }
}