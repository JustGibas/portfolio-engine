/**
 * @fileoverview Layout Initializer System
 * 
 * This system is responsible for initializing persistent layout components
 * like the header and footer. It finds entities with specific layout component
 * tags and connects them with their corresponding UI modules.
 * 
 * Each layout region (header, footer) is handled through a consistent pattern
 * that makes it easy to add new layout regions in the future.
 * 
 * @module LayoutInitializerSystem
 * @requires System from ../system.js
 * @requires headerBase from ../../modules/header/header-base.js
 * @requires footer from ../../modules/footer.js
 * 
 * @design Single Responsibility - Each initialization follows the same pattern
 * 
 * @example
 * // Register the system
 * import { LayoutInitializerSystem } from './systems/LayoutInitializerSystem.js';
 * ecs.registerSystem(new LayoutInitializerSystem());
 */
import { System } from '../system.js';
import { headerBase } from '../../modules/header/header-base/header-base.js';
import { footer } from '../../modules/footer/footer.js';

/**
 * Layout Initializer System implementation
 */
class LayoutInitializerSystem extends System {
  constructor() {
    super();
    // Map of component types to their initializer functions
    this.initializers = {
      'header': this.initializeHeader.bind(this),
      'footer': this.initializeFooter.bind(this)
    };
  }
  
  /**
   * Initialize all layout components
   * @param {Entity[]} entities - All entities in the ECS
   */
  init(entities) {
    console.info('LayoutInitializer: Starting layout component initialization');
    
    // Process each layout component type
    Object.keys(this.initializers).forEach(componentType => {
      const entity = entities.find(e => e.hasComponent(componentType));
      
      if (entity) {
        console.info(`LayoutInitializer: Found ${componentType} entity, initializing`);
        try {
          this.initializers[componentType](entity);
        } catch (error) {
          console.error(`LayoutInitializer: Failed to initialize ${componentType}`, error);
        }
      } else {
        console.warn(`LayoutInitializer: No ${componentType} entity found`);
      }
    });
    
    console.info('LayoutInitializer: Layout initialization complete');
  }
  
  /**
   * Initialize the header component
   * @param {Entity} entity - The header entity
   * @private
   */
  initializeHeader(entity) {
    headerBase.init(entity);
    console.info('LayoutInitializer: Header initialized');
  }
  
  /**
   * Initialize the footer component
   * @param {Entity} entity - The footer entity
   * @private
   */
  initializeFooter(entity) {
    const container = entity.getComponent('dom')?.container;
    if (container) {
      footer.init(container);
      console.info('LayoutInitializer: Footer initialized');
    } else {
      console.error('LayoutInitializer: Footer entity has no DOM container');
    }
  }
  
  /**
   * Update method - minimal since initialization is the primary concern
   */
  update() {
    // Most of the work happens during init
    // This could potentially check for dynamically added layout components
  }
}

export { LayoutInitializerSystem };
