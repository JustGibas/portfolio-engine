/**
 * @fileoverview Engine Bootstrap System
 * 
 * Simplified central orchestrator for initializing the Portfolio Engine.
 */
import { World } from './core/ecs.js';
import { System } from './core/system.js';
import { EventSystem } from './systems/EventSystem.js';
import { ErrorSystem } from './systems/ErrorSystem.js';
import { LayoutSystem } from './systems/LayoutSystem.js';
import { ModuleSystem } from './systems/ModuleSystem.js';
import { ComponentRegistrySystem } from './systems/ComponentRegistrySystem.js';
import { ResourceDiscoverySystem } from './systems/ResourceDiscoverySystem.js';
import { Scheduler } from './core/scheduler.js';
import { EntityCreator } from './utils/EntityCreator.js';
import { SystemRegistry } from './core/SystemRegistry.js';

// Core systems in dependency order
const CORE_SYSTEMS = [
  'error',
  'event', 
  'componentRegistry',
  'layout',
  'module',
  'resourceDiscovery'
];

/**
 * Initialize the engine with required systems
 * @param {Object} config - The engine configuration
 * @returns {Object} Object containing initialized systems and ECS
 */
function initializeEngine(config) {
  console.info('Engine: Starting bootstrap process...');
  
  // Create ECS instance
  const ecs = new World();
  
  // Ensure scheduler is available
  const scheduler = ecs.getScheduler();
  
  // Create core systems
  const systems = {
    error: new ErrorSystem(),
    event: new EventSystem(),
    componentRegistry: new ComponentRegistrySystem(),
    layout: new LayoutSystem(),
    module: new ModuleSystem(),
    resourceDiscovery: new ResourceDiscoverySystem()
  };
  
  // Create SystemRegistry and attach to World for global access
  const systemRegistry = new SystemRegistry(systems);
  ecs.systemRegistry = systemRegistry;
  
  // Initialize and register systems
  for (const systemKey of CORE_SYSTEMS) {
    try {
      // Register with ECS first
      ecs.registerSystem(systems[systemKey]);
      
      // Then initialize separately (with world and config)
      if (systems[systemKey].init) {
        systems[systemKey].init(ecs, config);
      }
      
      console.info(`Engine: Initialized and registered ${systemKey} system`);
    } catch (error) {
      console.error(`Engine: Failed to initialize ${systemKey} system:`, error);
    }
  }
  
  console.info('Engine: Core systems initialized');
  
  // Return the initialized engine components
  return {
    ecs,
    systems,
    systemRegistry,
    errorHandler: systems.error,
    eventSystem: systems.event,
    moduleRegistry: systems.module,
    resourceDiscovery: systems.resourceDiscovery
  };
}

// Export required components
export { initializeEngine, System, Scheduler, EntityCreator, SystemRegistry };
