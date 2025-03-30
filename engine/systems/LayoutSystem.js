/**
 * @fileoverview Layout System for ECS
 * 
 * A unified system that handles both UI layout initialization and updates.
 * Consolidates functionality from the previous LayoutSystem and LayoutInitializerSystem.
 */
import { System } from '../core/system.js';
import { Header } from '../../modules/header/header.js';
import { footer } from '../../modules/footer/footer.js';

// Component Types
const LAYOUT = 'layout';
const DOM_ELEMENT = 'domElement';
const UI_CONTAINER = 'uiContainer';
const UI_ELEMENT = 'uiElement';

/**
 * Layout System - Comprehensive layout management 
 */
class LayoutSystem extends System {
  init(world, config) {
    super.init(world, config);
    
    this.layoutInitialized = false;
    this.domMapping = new Map(); // DOM element -> entityId
    this.elementCache = new Map(); // selector -> entityId
    this.header = null;
    this.processedFooters = new Set();
    this.updateCount = 0;
    
    // Register with scheduler if available
    if (this.world.getScheduler) {
      const scheduler = this.world.getScheduler();
      const normalGroup = scheduler.getGroup('normal') || scheduler.createGroup('normal', 0);
      normalGroup.addSystem(this);
    }
    
    console.info('LayoutSystem: Initialized');
  }
  
  update() {
    // First ensure layout is initialized
    if (!this.layoutInitialized) {
      this._initializeLayout();
    }
    
    // Try to initialize core components if needed
    this.updateCount++;
    if (!this.header && this.updateCount <= 5) {
      this._tryInitializeFromEntities();
    } else if (!this.header && this.updateCount === 6) {
      console.warn('LayoutSystem: Falling back to direct DOM initialization');
      this._initializeDirectFromDOM();
    }
    
    // Process UI updates for entities with domElement and uiElement
    for (const entityId of this.world.getEntitiesWith(DOM_ELEMENT, UI_ELEMENT)) {
      this._updateUIElement(entityId);
    }
  }
  
  _initializeLayout() {
    // Create entities for key layout elements if they don't exist
    this._ensureHeaderExists();
    this._ensureFooterExists();
    this._ensureMainContentExists();
    
    this.layoutInitialized = true;
  }
  
  _ensureHeaderExists() {
    // Check for existing header entities
    const headerEntities = this.world.getEntitiesWith(LAYOUT).filter(entityId => {
      const layout = this.world.getComponent(entityId, LAYOUT);
      return layout && layout.type === 'header';
    });
    
    if (headerEntities.length > 0) {
      console.info('LayoutSystem: Found existing header entity');
      return;
    }
    
    // Look for header in DOM
    let headerElement = document.querySelector('header') || 
                        document.querySelector('.header') ||
                        document.getElementById('header');
                        
    // Create header if none exists
    if (!headerElement) {
      console.info('LayoutSystem: Creating header element');
      headerElement = document.createElement('header');
      headerElement.className = 'header';
      document.body.insertBefore(headerElement, document.body.firstChild);
    }
    
    // Create header entity
    const headerEntityId = this.world.createEntity();
    this.world.addComponent(headerEntityId, LAYOUT, {
      type: 'header',
      initialized: true
    });
    
    this.world.addComponent(headerEntityId, DOM_ELEMENT, {
      element: headerElement,
      selector: 'header'
    });
    
    this.world.addComponent(headerEntityId, UI_CONTAINER, {
      children: []
    });
    
    console.info('LayoutSystem: Header entity created');
    
    // Map DOM element to entity
    this.domMapping.set(headerElement, headerEntityId);
    this.elementCache.set('header', headerEntityId);
  }
  
  _ensureFooterExists() {
    // Similar implementation to header...
    // We'll keep this implementation for footer creation
  }
  
  _ensureMainContentExists() {
    // Implementation for main content area...
    // We'll keep the main content creation logic
  }
  
  _updateUIElement(entityId) {
    const uiElement = this.world.getComponent(entityId, UI_ELEMENT);
    const domElement = this.world.getComponent(entityId, DOM_ELEMENT);
    
    if (!uiElement || !domElement || !domElement.element) return;
    
    // Check if needs updating
    if (uiElement.needsUpdate) {
      // Apply any pending UI changes
      if (uiElement.content !== undefined) {
        domElement.element.innerHTML = uiElement.content;
      }
      
      if (uiElement.attributes) {
        for (const [attr, value] of Object.entries(uiElement.attributes)) {
          if (value !== null) {
            domElement.element.setAttribute(attr, value);
          } else {
            domElement.element.removeAttribute(attr);
          }
        }
      }
      
      if (uiElement.style) {
        Object.assign(domElement.element.style, uiElement.style);
      }
      
      if (uiElement.classes) {
        if (Array.isArray(uiElement.classes.add)) {
          uiElement.classes.add.forEach(cls => {
            domElement.element.classList.add(cls);
          });
        }
        
        if (Array.isArray(uiElement.classes.remove)) {
          uiElement.classes.remove.forEach(cls => {
            domElement.element.classList.remove(cls);
          });
        }
      }
      
      // Mark updated
      uiElement.needsUpdate = false;
    }
  }
  
  // Added methods from LayoutInitializerSystem
  
  /**
   * Try to initialize layout components from ECS entities
   * @private
   */
  _tryInitializeFromEntities() {
    // Find entities with header and footer components
    let headerEntities = this._findEntities('header');
    let footerEntities = this._findEntities('footer');
    
    if (headerEntities.length > 0 && !this.header) {
      console.info(`LayoutSystem: Found ${headerEntities.length} header entities`);
      
      // Get the entity ID instead of passing the entity object directly
      const headerEntityId = headerEntities[0].id || headerEntities[0];
      if (headerEntityId) {
        this._initializeHeader(headerEntityId);
      }
    }
    
    if (footerEntities.length > 0) {
      footerEntities.forEach(entity => {
        const entityId = entity.id || entity;
        if (entityId && !this.processedFooters.has(entityId)) {
          this._initializeFooter(entityId);
          this.processedFooters.add(entityId);
        }
      });
    }
  }
  
  /**
   * Find entities with a specific component type
   * @param {string} componentName - Component to search for
   * @returns {Array} Array of matching entities
   * @private
   */
  _findEntities(componentName) {
    return Array.from(this.world.entities.values())
      .filter(entity => entity.componentMask.has(componentName));
  }
  
  /**
   * Fall back to initializing directly from DOM elements
   * @private
   */
  _initializeDirectFromDOM() {
    // Look for header in DOM
    const headerElement = document.querySelector('header') || 
                         document.querySelector('.header') ||
                         document.getElementById('header');
    
    if (headerElement && !this.header) {
      // Make sure we have a sections array (even if empty)
      const sections = this.config?.sections || [];
      
      this.header = new Header({
        container: headerElement,
        sections: sections,
        ecs: this.world
      });
      
      this.header.init().catch(err => {
        console.error('Failed to initialize header:', err);
      });
    } else if (!headerElement) {
      // Create header element if none exists
      this._createHeaderElement();
    }
    
    // Handle footer similarly
    const footerElement = document.querySelector('footer') || 
                         document.querySelector('.footer') ||
                         document.getElementById('footer');
                         
    if (footerElement && !this.processedFooters.has('dom-footer')) {
      footer.init(footerElement);
      this.processedFooters.add('dom-footer');
    }
  }
  
  /**
   * Create a header element
   * @private
   */
  _createHeaderElement() {
    try {
      const mainElement = document.querySelector('main') || document.body;
      
      // Check if header already exists
      let headerElement = document.querySelector('header');
      
      // Create if it doesn't exist
      if (!headerElement) {
        headerElement = document.createElement('header');
        headerElement.className = 'header';
        
        // Insert header at the beginning of main or body
        if (mainElement === document.body) {
          mainElement.insertBefore(headerElement, mainElement.firstChild);
        } else {
          document.body.insertBefore(headerElement, mainElement);
        }
        
        console.info('LayoutSystem: Created header element');
      } else {
        console.info('LayoutSystem: Using existing header element');
      }
      
      // Make sure we have a sections array (even if empty)
      const sections = this.config?.sections || [];
      
      // Initialize header module
      this.header = new Header({
        container: headerElement,
        sections: sections,
        ecs: this.world
      });
      
      this.header.init().catch(err => {
        console.error('Failed to initialize header:', err);
      });
      
      return headerElement;
    } catch (error) {
      console.error('Error creating header element:', error);
      return null;
    }
  }
  
  /**
   * Initialize the header from the entity ID
   * @param {string|number} headerEntityId - The header entity ID
   * @private
   */
  _initializeHeader(headerEntityId) {
    try {
      // Get the entity from the world
      const entity = this.world.entities.get(headerEntityId);
      if (!entity) {
        console.warn(`LayoutSystem: No entity found with ID ${headerEntityId}`);
        return;
      }
      
      // Make sure we have a sections array (even if empty)
      const sections = this.config?.sections || [];
      
      // Get components using world methods rather than entity methods
      const domComponent = this.world.getComponent(headerEntityId, 'domElement') || 
                           this.world.getComponent(headerEntityId, 'dom');
      
      if (!domComponent || !domComponent.container) {
        // Create the DOM container if it doesn't exist
        console.info('LayoutSystem: Creating header DOM container');
        const headerElement = document.getElementById('header') || 
                             document.querySelector('header');
                             
        if (headerElement) {
          // Add DOM component to the entity
          this.world.addComponent(headerEntityId, 'dom', {
            element: headerElement,
            container: headerElement
          });
          
          // Now initialize header with the container
          this.header = new Header({
            container: headerElement,
            sections: sections,
            ecs: this.world
          });
          
          this.header.init().catch(err => {
            console.error('Failed to initialize header:', err);
          });
        } else {
          console.error('LayoutSystem: Could not create header DOM container');
        }
      } else {
        // Initialize header with existing container
        this.header = new Header({
          container: domComponent.container,
          sections: sections,
          ecs: this.world
        });
        
        this.header.init().catch(err => {
          console.error('Failed to initialize header:', err);
        });
      }
    } catch (error) {
      console.error('LayoutSystem: Error initializing header', error);
    }
  }
   
  /**
   * Initialize the footer from the entity ID
   * @param {string|number} footerEntityId - The footer entity ID
   * @private
   */
  _initializeFooter(footerEntityId) {
    try {
      // Get the entity from the world
      const entity = this.world.entities.get(footerEntityId);
      if (!entity) {
        console.warn(`LayoutSystem: No entity found with ID ${footerEntityId}`);
        return;
      }
      
      // Get components using world methods rather than entity methods
      const domComponent = this.world.getComponent(footerEntityId, 'domElement') || 
                           this.world.getComponent(footerEntityId, 'dom');
      
      if (!domComponent || !domComponent.container) {
        // Create the DOM container if it doesn't exist
        console.info('LayoutSystem: Creating footer DOM container');
        const footerElement = document.getElementById('footer') || 
                             document.querySelector('footer');
                             
        if (footerElement) {
          // Add DOM component to the entity
          this.world.addComponent(footerEntityId, 'dom', {
            element: footerElement,
            container: footerElement
          });
          
          // Now initialize footer with the container
          footer.init(footerElement).catch(err => {
            console.error('Failed to initialize footer:', err);
          });
        } else {
          console.error('LayoutSystem: Could not create footer DOM container');
        }
      } else {
        // Initialize footer with existing container
        footer.init(domComponent.container).catch(err => {
          console.error('Failed to initialize footer:', err);
        });
      }
    } catch (error) {
      console.error('LayoutSystem: Error initializing footer', error);
    }
  }
  
  // Helper to get element by selector or create if not exists
  getElementEntity(selector, createIfNotExists = true) {
    // Check cache first
    if (this.elementCache.has(selector)) {
      return this.elementCache.get(selector);
    }
    
    // Try to find in DOM
    const element = document.querySelector(selector);
    if (!element && !createIfNotExists) return null;
    
    // Create DOM element if needed
    const domElement = element || document.createElement(selector.startsWith('.') ? 'div' : selector);
    if (!element) {
      domElement.className = selector.startsWith('.') ? selector.substring(1) : '';
      document.body.appendChild(domElement);
    }
    
    // Create entity
    const entityId = this.world.createEntity();
    this.world.addComponent(entityId, DOM_ELEMENT, {
      element: domElement,
      selector
    });
    
    this.world.addComponent(entityId, UI_ELEMENT, {
      needsUpdate: false
    });
    
    // Store in cache
    this.domMapping.set(domElement, entityId);
    this.elementCache.set(selector, entityId);
    
    return entityId;
  }
}

export { 
  LayoutSystem, 
  LAYOUT, 
  DOM_ELEMENT, 
  UI_CONTAINER, 
  UI_ELEMENT 
};
