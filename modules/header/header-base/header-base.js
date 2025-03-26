/**
 * @fileoverview Header Base Module
 * 
 * This module defines the structure and layout of the site header.
 * It acts as a container for header submodules like navigation and theme selector,
 * managing their placement and integration within the header structure.
 * 
 * The header consists of a title section, navigation menu area, and theme controls area.
 * Actual navigation and theme functionality are delegated to their respective submodules.
 * 
 * @module headerBase
 * @requires config from ../../config.js
 * 
 * @design Container pattern - provides mounting points for submodules
 * 
 * @example
 * // Initialize the header on an entity
 * import { headerBase } from './modules/header/header-base.js';
 * headerBase.init(headerEntity);
 */
import config from '../../../config.js';
import { navigation } from '../submodules/navigaton/navigation.js';
import { themeSelector } from '../submodules/theme-selector/theme-selector.js';
import { cssLoader } from '../../../engine/css-loader.js';

const headerBase = {
  async init(entity) {
    // Load component-specific CSS
    await cssLoader.loadLocalCSS(import.meta.url);
    
    const container = entity.getComponent('dom').container;
    
    // Create the header structure with areas for submodules
    container.innerHTML = `
      <div class="header">
        <div class="header-content">
          <h1>${config.site.title || "Portfolio"}</h1>
          <div id="header-nav-container"></div>
          <div id="header-theme-container"></div>
        </div>
      </div>
    `;
    
    // Create subentities for the navigation and theme selector
    const navContainer = container.querySelector('#header-nav-container');
    const themeContainer = container.querySelector('#header-theme-container');
    
    // Create and attach a navigation subentity
    const navEntity = entity.ecs.createEntity();
    navEntity.addComponent('dom', { container: navContainer });
    navigation.init(navEntity);
    
    // Create and attach a theme selector subentity
    const themeEntity = entity.ecs.createEntity();
    themeEntity.addComponent('dom', { container: themeContainer });
    themeEntity.addComponent('theme', { 
      currentTheme: localStorage.getItem('portfolioTheme') || config.theme.default 
    });
    themeSelector.init(themeEntity);
    
    console.info('Header base initialized with navigation and theme selector submodules');
  }
};

export { headerBase };
