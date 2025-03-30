/**
 * =====================================================================
 * █▀█ █▀█ █▀█ ▀█▀ █▀▀ █▀█ █   █ █▀█   █▀▀ █▄░█ █▀▀ █ █▄░█ █▀▀
 * █▀▀ █▄█ █▀▄ ░█░ █▀░ █▄█ █▄▄ █ █▄█   ██▄ █░▀█ █▄█ █ █░▀█ ██▄
 * =====================================================================
 * app art
 * 
 * @fileoverview Main Application Entry Point
 * 
 * This file initializes the Portfolio Engine, setting up core systems, 
 * loading configurations, and starting the engine loop. It acts as the 
 * entry point for the application and orchestrates the initialization 
 * of various modules and systems.
 * 
 * ## Key Responsibilities:
 * - Initialize the ECS (Entity Component System) and core systems
 * - Load configuration settings and apply them
 * - Start the engine loop and expose debugging tools in development mode
 * - Handle errors gracefully during initialization
 * 
 * ## Application Flow Diagram:
 * 
 * ┌────────────────┐     ┌─────────────────┐     ┌─────────────────┐
 * │                │     │                 │     │                 │
 * │  Import & Init ├────►│  Setup Modules  ├────►│ Start & Config  │
 * │                │     │                 │     │                 │
 * └────────────────┘     └─────────────────┘     └────────┬────────┘
 *                                                         │
 *                                                         ▼
 * ┌────────────────┐     ┌─────────────────┐     ┌─────────────────┐
 * │                │     │                 │     │                 │
 * │   Error Handling   │◄────┤   Engine Loop   │◄────┤  Entity Creation │
 * │                │     │                 │     │                 │
 * └────────────────┘     └─────────────────┘     └─────────────────┘
 * 
 * ## System Architecture:
 * 
 * ┌─────────────────────────────────────────────────────────┐
 * │                    Portfolio Engine                     │
 * │                                                         │
 * │  ┌───────────┐   ┌───────────┐   ┌───────────────────┐  │
 * │  │           │   │           │   │                   │  │
 * │  │    ECS    │◄──┤  Systems  │◄──┤  Entity Creator   │  │
 * │  │           │   │           │   │                   │  │
 * │  └─────┬─────┘   └───────────┘   └───────────────────┘  │
 * │        │                                                │
 * │        ▼                                                │
 * │  ┌───────────┐   ┌───────────┐   ┌───────────────────┐  │
 * │  │           │   │           │   │                   │  │
 * │  │  Modules  │◄──┤   Page    │◄──┤  Engine Loop      │  │
 * │  │           │   │           │   │                   │  │
 * │  └───────────┘   └───────────┘   └───────────────────┘  │
 * │                                                         │
 * └─────────────────────────────────────────────────────────┘
 * 
 * ## Questions for JG:
 * [ ] Does this file work as intended in all environments (development and production)?
 * [ ] Are there any redundant or overly complex sections that could be simplified?
 * [ ] Is the error handling robust enough to cover edge cases?
 * [ ] Are all systems and modules initialized correctly and in the right order?
 * [ ] Is the background project discovery approach efficient or could it be optimized?
 * [ ] Should we add more graceful fallbacks for critical failures?
 * 
 * ## Example Usage:
 * - To start the application, include this file in your HTML and call `initApp()`.
 * - Ensure that the `config.js` file is properly configured before running.
 * 
 * ## Transferred Notes from README:
 * - The application uses a modular architecture with systems like `EventSystem`, 
 *   `ErrorSystem`, and `DevToolsManager`.
 * - Debugging tools are enabled in development mode and can be accessed via the 
 *   `DevTools` overlay.
 * - The engine loop is configured to run at a refresh rate defined in `config.js`.
 * 
 * ## Configuration Flow:
 * ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
 * │ Load Config   │────►│ Apply Theme   │────►│ Discover      │
 * │ Settings      │     │ Settings      │     │ Pages         │
 * └───────────────┘     └───────────────┘     └───────┬───────┘
 *                                                     │
 *                                                     ▼
 * ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
 * │ Start Engine  │◄────┤ Create        │◄────┤ Set Initial   │
 * │ Loop          │     │ Entities      │     │ Route         │
 * └───────────────┘     └───────────────┘     └───────────────┘
 */
import { 
  initializeEngine, 
  EntityCreator,
  SystemRegistry
} from './engine/start.js';
import { EngineLoop } from './engine/loop.js';
import config from './config.js';
import { page } from './modules/page/page.js';

/**
 * Main application initializer function
 */
async function initApp() {
  console.info('Portfolio Engine: Starting initialization...');
  
  try {
    // Initialize the engine core components - this creates all core systems
    const { ecs, eventSystem, moduleRegistry, errorHandler } = initializeEngine(config);
    
    // Add default error handling for missing systems
    if (!moduleRegistry) {
      console.warn('Module registry not available - using fallback implementation');
      // Create minimal implementation to avoid errors
      const fallbackModuleRegistry = {
        register(name, module) {
          console.info(`Registering module ${name} with fallback registry`);
          return this;
        }
      };
      
      // Replace missing registry with fallback
      if (!window.engineFallbacks) window.engineFallbacks = {};
      window.engineFallbacks.moduleRegistry = fallbackModuleRegistry;
      
      // Make it accessible in the current scope
      moduleRegistry = fallbackModuleRegistry;
    }
    
    // Configure module registry for different environments
    if (config.environment === 'development') {
      moduleRegistry.register('analytics', { 
        track: (eventName, data) => console.log(`[Dev Analytics] ${eventName}:`, data)
      });
    }
    
    // Register tests for development mode
    if (config.environment === 'development' || config.advanced?.debug) {
      import('./tests/register-tests.js')
        .then(module => module.registerAllTests(ecs))
        .catch(error => console.warn('Could not register tests:', error));
    }
    
    // Initialize the page module with ECS instance before using it
    await page.init(ecs);
    
    // Conditionally load modules based on feature flags
    if (config.advanced?.features?.newAboutPage) {
      const aboutModule = await import('./pages/about/about-new.js')
        .catch(err => {
          errorHandler.handleError(err, 'module-loading', false);
          return import('./pages/about/about.js'); // Fallback to standard version
        });
      
      moduleRegistry.register('about', aboutModule);
    }
    
    // Set initial theme from local storage or default configuration
    const savedTheme = localStorage.getItem('portfolioTheme') || config.theme?.default;
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Discover available pages through resource discovery - handle errors gracefully
    let sections = [];
    try {
      sections = await page.discoverPages();
    } catch (error) {
      console.warn('Error discovering pages:', error);
      sections = [];
    }
    
    // Add sections to config for backward compatibility with existing modules
    config.sections = sections;
    
    // Start project discovery in the background to improve initial load time
    page.discoverProjects().catch(error => {
      console.warn('Error discovering projects:', error);
    });
    
    console.info(`Configuration loaded with ${sections.length} sections`);
    
    // Create entities based on configuration
    const entityCreator = new EntityCreator(ecs, config);
    entityCreator.createAll();
    
    // Get the initial route from URL hash or config default
    const initialRoute = window.location.hash.substring(1) || config.defaults?.route;
    
    // Ensure content for the initial page is loaded
    try {
      const initialRoute = window.location.hash.slice(1) || 'about';
      console.info(`Setting initial route to: ${initialRoute}`);
      
      // Manually trigger route change if needed
      if (page.eventSystem) {
        const routeEntity = document.querySelector(`[data-route="${initialRoute}"]`);
        if (routeEntity) {
          page.eventSystem.emit('route:change', {
            route: initialRoute,
            entity: { 
              getComponent: () => ({ 
                container: routeEntity.querySelector('.section-container'),
                element: routeEntity
              })
            }
          });
        }
      }
    } catch (error) {
      console.error('Error setting initial route:', error);
    }
    
    // Create and configure the engine loop
    const engineLoop = new EngineLoop({
      targetFPS: config.advanced?.systemRefreshRate || 60,
      useRAF: true
    });
    
    // Add systems to the loop
    engineLoop.addSystems(ecs.systems);
    
    // Set entities getter
    engineLoop.setEntities(() => ecs.entities);
    
    // Start the engine loop
    console.info('Portfolio Engine: Starting engine loop...');
    engineLoop.start();
    
    // Make essential objects available for debugging when in debug mode
    if (config.advanced?.debug) {
      window.ecs = ecs;
      window.engineLoop = engineLoop;
      window.moduleRegistry = moduleRegistry;
      window.errorHandler = errorHandler;
      console.info('Portfolio Engine: Debug mode enabled - core objects exposed to window');
    }
    
    console.info('Portfolio Engine: Initialization complete');
  } catch (error) {
    console.error('Fatal error during initialization:', error);
    
    // Show a simple error message
    document.body.innerHTML = `
      <div class="error-container">
        <h1>Error Starting Portfolio Engine</h1>
        <p>An error occurred while initializing the application:</p>
        <pre>${error.message}\n${error.stack}</pre>
        <p>Please check the console for more details.</p>
      </div>
    `;
  }
}

// Start the application
initApp();
