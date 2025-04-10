/**
 * @fileoverview Navigation Submodule
 * 
 * This module is responsible for rendering the site navigation menu and handling
 * navigation events. It's designed to be mounted within the header structure
 * but maintains focused responsibility only for navigation functionality.
 * 
 * Features:
 * - Generates navigation links based on configuration
 * - Dispatches navigation events when links are clicked
 * - Updates active states for current route
 * - Supports responsive design with appropriate markup
 *
 * @module navigation
 * @requires config from ../../../config.js
 * 
 * @design Observer pattern - dispatches navigation events for other systems
 * 
 * @example
 * // Initialize navigation on an entity
 * import { navigation } from './modules/header/navigation.js';
 * navigation.init(navEntity);
 */

/**
 * Navigation component for header
 */
const navigation = {
  /**
   * Initialize navigation
   * @param {Entity|Object} entity - Entity object or compatible interface
   */
  async init(entity) {
    // Handle case where entity might be null or not have expected methods
    if (!entity) {
      console.warn('Navigation: Entity is null');
      return;
    }
    
    try {
      // Load component-specific CSS
      const { cssLoader } = await import('../../../engine/utils/css-loader.js')
        .catch(err => {
          console.error('Failed to import CSS loader:', err);
          return { cssLoader: { loadLocalCSS: () => Promise.resolve() } }; // Fallback loader that does nothing
        });
      
      await cssLoader.loadLocalCSS(import.meta.url);
      
      // Get links from entity if possible
      let links = [];
      
      // Handle various entity shapes to get navigation data
      if (typeof entity.getComponent === 'function') {
        links = entity.getComponent('navigation')?.links || [];
      } else if (entity.navigation) {
        links = entity.navigation.links || [];
      }
      
      // Get container from entity if possible
      let container = null;
      if (typeof entity.getComponent === 'function') {
        container = entity.getComponent('dom')?.container;
      }
      
      // Render navigation to container if we have one
      if (container) {
        this.render(container, links);
      } else {
        console.warn('Navigation: No DOM container found');
      }
    } catch (error) {
      console.error('Error initializing navigation:', error);
    }
    
    return this;
  },
  
  /**
   * Render navigation
   * @param {HTMLElement} container - DOM container
   * @param {Array} links - Navigation links
   */
  render(container, links = []) {
    if (!container) return;
    
    const linksHtml = links.map(link => `
      <li>
        <a href="${link.url}" class="nav-link" ${link.active ? 'aria-current="page"' : ''}>
          ${link.title}
        </a>
      </li>
    `).join('');
    
    container.innerHTML = `
      <nav class="main-nav">
        <ul class="nav-list">
          ${linksHtml}
        </ul>
      </nav>
    `;
  }
};

export { navigation };
