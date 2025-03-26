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
import config from '../../../../config.js';
import { cssLoader } from '../../../../engine/css-loader.js';

const navigation = {
  async init(entity) {
    // Load component-specific CSS
    await cssLoader.loadLocalCSS(import.meta.url);
    
    const container = entity.getComponent('dom').container;
    
    // Filter sections that should appear in navigation
    const navItems = config.sections
      .filter(section => section.showInNav)
      .map(section => ({
        id: section.id,
        title: section.title,
        route: section.route
      }));
    
    // Create navigation HTML
    let navLinks = '';
    navItems.forEach(item => {
      navLinks += `<li><a href="#${item.route}" class="nav-link" data-route="${item.route}">${item.title}</a></li>`;
    });
    
    container.innerHTML = `
      <nav class="main-nav" aria-label="Main Navigation">
        <ul>
          ${navLinks}
        </ul>
      </nav>
    `;
    
    // Add click event listeners to handle navigation
    const links = container.querySelectorAll('.nav-link');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        // Mark this link as active
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Dispatch navigation event for system to handle
        const route = link.getAttribute('data-route');
        const navEvent = new CustomEvent('navigation', {
          detail: { route }
        });
        document.dispatchEvent(navEvent);
      });
    });

    // Set initial active state based on current route
    const currentRoute = window.location.hash.substring(1) || config.defaults.route;
    const activeLink = container.querySelector(`.nav-link[data-route="${currentRoute}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }

    console.info('Navigation module initialized with', navItems.length, 'navigation items');
  }
};

export { navigation };
