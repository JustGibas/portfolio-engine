/**
 * @fileoverview Entity Creator Utility
 * 
 * A utility class that helps create entities from configuration.
 * This separates entity creation logic from the main bootstrap process.
 */

/**
 * Utility class for creating entities from configuration
 */
class EntityCreator {
  /**
   * Create a new EntityCreator
   * @param {World} ecs - The ECS World instance
   * @param {Object} config - Application configuration
   */
  constructor(ecs, config) {
    this.ecs = ecs;
    this.config = config;
    this.entityFactories = new Map();
    this._registerDefaultFactories();
  }

  /**
   * Create all standard entities defined in configuration
   */
  createAll() {
    this.createHeader();
    this.createSections();
    this.createFooter();
    console.info('EntityCreator: Created all standard entities');
    return this;
  }

  /**
   * Register a custom entity factory function
   * @param {string} entityType - Type of entity to create
   * @param {Function} factory - Factory function that creates the entity
   * @returns {EntityCreator} This instance for chaining
   */
  registerFactory(entityType, factory) {
    if (typeof factory !== 'function') {
      throw new Error(`Factory for "${entityType}" must be a function`);
    }
    this.entityFactories.set(entityType, factory);
    return this;
  }
  
  /**
   * Create an entity using a registered factory
   * @param {string} entityType - Type of entity to create
   * @param {Object} data - Data to pass to the factory
   * @returns {number} The created entity ID
   */
  createEntity(entityType, data = {}) {
    const factory = this.entityFactories.get(entityType);
    if (!factory) {
      throw new Error(`No factory registered for entity type: ${entityType}`);
    }
    return factory.call(this, data);
  }

  /**
   * Create the header entity
   * @returns {number} The header entity ID
   */
  createHeader() {
    return this.createEntity('header');
  }

  /**
   * Create section entities for all configured sections
   * @returns {Array<number>} Array of created entity IDs
   */
  createSections() {
    const entityIds = [];
    
    if (this.config.sections && Array.isArray(this.config.sections)) {
      this.config.sections.forEach(section => {
        const sectionEntityId = this.createEntity('section', section);
        entityIds.push(sectionEntityId);
      });
    }
    
    return entityIds;
  }

  /**
   * Create the footer entity
   * @returns {number} The footer entity ID
   */
  createFooter() {
    return this.createEntity('footer');
  }
  
  /**
   * Register default entity factories
   * @private
   */
  _registerDefaultFactories() {
    // Header factory
    this.registerFactory('header', () => {
      const entityId = this.ecs.createEntity();
      this.ecs.addComponent(entityId, 'layout', { type: 'header' });
      this.ecs.addComponent(entityId, 'header', { title: this.config.site.title });
      return entityId;
    });
    
    // Section factory
    this.registerFactory('section', (section) => {
      const entityId = this.ecs.createEntity();
      
      this.ecs.addComponent(entityId, 'section', { 
        id: section.id,
        title: section.title
      });
      this.ecs.addComponent(entityId, 'route', { path: section.route });
      this.ecs.addComponent(entityId, 'module', { name: section.id });
      
      // Find DOM element for this section
      const sectionElement = document.getElementById(section.id) || 
                           document.querySelector(`[data-route="${section.route}"]`);
      
      if (sectionElement) {
        this.ecs.addComponent(entityId, 'dom', { container: sectionElement });
      }
      
      return entityId;
    });
    
    // Footer factory
    this.registerFactory('footer', () => {
      const entityId = this.ecs.createEntity();
      this.ecs.addComponent(entityId, 'layout', { type: 'footer' });
      this.ecs.addComponent(entityId, 'footer', { copyright: this.config.site.copyright });
      return entityId;
    });
  }
}

export { EntityCreator };
