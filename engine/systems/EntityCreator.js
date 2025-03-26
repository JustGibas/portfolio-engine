/**
 * @fileoverview Entity Creator System
 * 
 * This system is responsible for creating entities based on configuration.
 * It processes the application configuration and creates the appropriate
 * entities with their components for each section, header, footer, etc.
 * 
 * @module EntityCreator
 * @requires System from ../system.js
 * @requires Entity from ../entity.js
 * 
 * @design Factory Pattern - Creates entities based on their type and configuration
 * Builder Pattern - Constructs complex entity hierarchies
 * 
 * @example
 * // Create and use the EntityCreator
 * import { EntityCreator } from './systems/EntityCreator.js';
 * const creator = new EntityCreator(ecs, config);
 * creator.createAll();
 */
import { System } from '../system.js';

/**
 * Entity Creator System implementation
 */
class EntityCreator extends System {
  /**
   * Create a new EntityCreator system
   * @param {ECS} ecs - The ECS instance
   * @param {Object} config - The application configuration
   */
  constructor(ecs, config) {
    super();
    this.ecs = ecs;
    this.config = config;
  }
  
  /**
   * Create all entities defined in the configuration
   */
  createAll() {
    console.info('EntityCreator: Creating entities from configuration');
    this.createHeaderEntity();
    this.createSectionEntities();
    this.createFooterEntity();
    console.info('EntityCreator: All entities created successfully');
  }
  
  /**
   * Create the header entity
   * @returns {Entity} The created header entity
   */
  createHeaderEntity() {
    console.info('EntityCreator: Creating header entity');
    const header = document.getElementById('header');
    if (!header) {
      console.error('Header element not found in DOM');
      return null;
    }
    
    const headerEntity = this.ecs.createEntity();
    headerEntity.addComponent('dom', { container: header });
    headerEntity.addComponent('header', { title: this.config.site.title });
    
    return headerEntity;
  }
  
  /**
   * Create entities for all sections in the configuration
   * @returns {Entity[]} Array of created section entities
   */
  createSectionEntities() {
    console.info(`EntityCreator: Creating ${this.config.sections.length} section entities`);
    const sectionEntities = [];
    
    this.config.sections.forEach(sectionConfig => {
      const section = document.getElementById(sectionConfig.id);
      if (!section) {
        console.warn(`Section element not found for ID: ${sectionConfig.id}`);
        return;
      }
      
      const container = section.querySelector('.section-container') || section;
      
      const entity = this.ecs.createEntity();
      entity.addComponent('dom', { container });
      entity.addComponent('route', { path: sectionConfig.route });
      entity.addComponent('module', { name: sectionConfig.module });
      
      sectionEntities.push(entity);
    });
    
    return sectionEntities;
  }
  
  /**
   * Create the footer entity
   * @returns {Entity} The created footer entity
   */
  createFooterEntity() {
    console.info('EntityCreator: Creating footer entity');
    const footer = document.getElementById('footer');
    if (!footer) {
      console.error('Footer element not found in DOM');
      return null;
    }
    
    const footerEntity = this.ecs.createEntity();
    footerEntity.addComponent('dom', { container: footer });
    footerEntity.addComponent('footer', { 
      copyright: `© ${new Date().getFullYear()} ${this.config.site.author}` 
    });
    
    return footerEntity;
  }
  
  /**
   * System update method (not used for this system)
   */
  update() {
    // This system doesn't need an update method as it only runs once at startup
  }
}

export { EntityCreator };
