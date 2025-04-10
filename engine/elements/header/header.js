/**
 * @fileoverview Main Header Component
 * 
 * A configurable header component that can be positioned at various locations
 * on the screen (top, bottom, left, right) and serves as a container for 
 * multiple UI modules like navigation, dropdown menus and theme selectors.
 * 
 * ARCHITECTURAL DESIGN:
 * This header implements a composable container pattern where:
 * 
 * 1. The Header creates the DOM structure based on configuration
 * 2. It provides mount points for child modules (navbar, theme selector, etc)
 * 3. Each child module is responsible for its own rendering and behavior
 * 4. Configuration can be provided via config file or directly as options
 * 
 * EXTENSIBILITY:
 * - New UI elements can be added via configuration without changing code
 * - Additional dropdown sections can be registered at runtime
 * - Fallback mechanisms ensure core functionality even when components fail
 * 
 * This file demonstrates how to build flexible UI components that can adapt
 * to different contexts and remain resilient to failures.
 */
import { cssLoader } from '../../modules/css-loader.js';
import { Navbar } from '../navbar/navbar.js';
import { HeaderDropdown } from '../dropdown/dropdown.js';
import { ThemeSelector } from '../../modules/theme-selector/theme-selector.js';
import { registerDefaultDropdownSections } from '../dropdown/dropdown-manager.js';

class Header {
  /**
   * Create a new header
   * @param {Object} options - Configuration options
   * @param {HTMLElement} options.container - Header container element
   * @param {Object} options.ecs - ECS instance for creating subentities
   * @param {Object} options.headerConfig - Custom header configuration
   */
  constructor(options = {}) {
    this.options = Object.assign({
      container: null,
      ecs: null,
      headerConfig: null
    }, options);
    
    this.container = this.options.container;
    this.ecs = this.options.ecs;
    this.dropdown = null;
    this.dropdownTrigger = null;
    
    // Store references to module containers
    this.moduleContainers = new Map();
    
    // Component registry for modules
    this.modules = new Map();
    
    // Initialize with a default configuration first to ensure it exists
    this.headerConfig = this._getDefaultHeaderConfig();
    
    // Then try to override with user config if available
    if (this.options.headerConfig) {
      this.headerConfig = this.options.headerConfig;
    } else if (config.uiModules?.header) {
      this.headerConfig = config.uiModules.header;
    }
    
    // Ensure sections array exists
    if (!this.headerConfig.sections || !Array.isArray(this.headerConfig.sections)) {
      console.warn('Header: No valid sections array in configuration, using default');
      this.headerConfig.sections = this._getDefaultHeaderConfig().sections;
    }
  }
  
  /**
   * Get default header configuration
   * @private
   * @returns {Object} Default configuration object
   */
  _getDefaultHeaderConfig() {
    return {
      position: 'top',
      sections: [
        { 
          id: 'content',
          type: 'container',
          className: 'header-content', 
          children: [
            { id: 'title', type: 'title', text: config.site?.title || 'Portfolio' },
            { id: 'navbar', type: 'navigation', className: 'header-navigation' },
            {
              id: 'controls',
              type: 'container',
              className: 'header-controls',
              children: [
                { id: 'theme', type: 'theme-selector' },
                { 
                  id: 'menu-button', 
                  type: 'dropdown-trigger',
                  className: 'header-menu-button',
                  ariaLabel: 'Open menu',
                  icon: '☰'
                }
              ]
            }
          ]
        }
      ]
    };
  }
  
  /**
   * Initialize the header
   */
  async init() {
    // Check if container exists
    if (!this.container) {
      console.error('Header initialization failed: No container provided');
      return this;
    }
    
    // Load component-specific CSS using the loadLocalCSS method
    await cssLoader.loadLocalCSS(import.meta.url);
    
    try {
      // Create the header structure based on configuration
      this._createHeaderStructure();
      
      // Initialize modules based on configuration
      await this._initializeModules();
      
      console.info('Header initialized with configured modules');
    } catch (error) {
      console.error('Error initializing header:', error);
      // Fallback to simple structure if configuration fails
      this._createSimpleHeaderStructure();
      
      // Try to initialize basic modules even after fallback
      try {
        await this._initializeBasicModules();
      } catch (innerError) {
        console.error('Failed to initialize basic modules:', innerError);
      }
    }
    
    return this;
  }
  
  /**
   * Initialize just the basic modules after falling back to simple structure
   * @private
   */
  async _initializeBasicModules() {
    // Find containers in the simple structure
    this.navContainer = this.container.querySelector('#header-nav-container');
    this.themeContainer = this.container.querySelector('#header-theme-container');
    this.dropdownTrigger = this.container.querySelector('#header-menu-btn');
    
    // Initialize navbar
    if (this.navContainer) {
      try {
        const navbar = new Navbar({ container: this.navContainer });
        await navbar.init();
        this.modules.set('navbar', navbar);
      } catch (error) {
        console.error('Error initializing navbar:', error);
        this._renderFallbackNavigation(this.navContainer);
      }
    }
    
    // Initialize other basic modules
    if (this.themeContainer) {
      await this._initializeThemeSelector(this.themeContainer);
    }
    
    if (this.dropdownTrigger) {
      await this._initializeDropdown();
    }
  }
  
  /**
   * Create a simple header structure as fallback
   * @private
   */
  _createSimpleHeaderStructure() {
    // Simple header structure without depending on configuration
    this.container.innerHTML = `
      <div class="header-content">
        <h1>${config.site?.title || "Portfolio"}</h1>
        <nav id="header-nav-container" class="header-navigation"></nav>
        <div class="header-controls">
          <div id="header-theme-container"></div>
          <button id="header-menu-btn" class="header-menu-button" aria-label="Open menu">
            <span class="header-menu-icon">☰</span>
          </button>
        </div>
      </div>
    `;
    
    this.navContainer = this.container.querySelector('#header-nav-container');
    this.themeContainer = this.container.querySelector('#header-theme-container');
    this.dropdownTrigger = this.container.querySelector('#header-menu-btn');
  }
  
  /**
   * Create the header structure based on configuration
   * @private
   */
  _createHeaderStructure() {
    // Reset the container
    this.container.innerHTML = '';
    
    // Apply header position from config
    if (this.headerConfig.position) {
      this.container.style.position = 'fixed';
      this.container.style[this.headerConfig.position] = '0';
      this.container.style.left = '0';
      this.container.style.width = '100%';
      this.container.style.zIndex = '1000';
    }
    
    // Create DOM structure from config
    if (this.headerConfig.sections && Array.isArray(this.headerConfig.sections)) {
      this.headerConfig.sections.forEach(section => {
        const sectionElement = this._createSectionElement(section);
        if (sectionElement) {
          this.container.appendChild(sectionElement);
        }
      });
    } else {
      throw new Error('Invalid header configuration: sections array is missing');
    }
  }
  
  /**
   * Recursively create section elements from configuration
   * @param {Object} sectionConfig - Section configuration
   * @returns {HTMLElement} The created element
   * @private
   */
  _createSectionElement(sectionConfig) {
    let element;
    
    switch(sectionConfig.type) {
      case 'container':
        element = document.createElement('div');
        if (sectionConfig.className) {
          element.className = sectionConfig.className;
        }
        
        // Process children recursively
        if (sectionConfig.children && Array.isArray(sectionConfig.children)) {
          sectionConfig.children.forEach(childConfig => {
            const childElement = this._createSectionElement(childConfig);
            if (childElement) {
              element.appendChild(childElement);
            }
          });
        }
        break;
        
      case 'title':
        element = document.createElement('h1');
        element.textContent = sectionConfig.text;
        break;
        
      case 'navigation':
        element = document.createElement('nav');
        if (sectionConfig.className) {
          element.className = sectionConfig.className;
        }
        element.id = 'header-nav-container';
        break;
        
      case 'theme-selector':
        element = document.createElement('div');
        element.id = 'header-theme-container';
        break;
        
      case 'dropdown-trigger':
        element = document.createElement('button');
        element.className = sectionConfig.className || 'dropdown-trigger';
        element.setAttribute('aria-label', sectionConfig.ariaLabel || 'Open menu');
        element.id = 'header-menu-btn';
        
        const iconElement = document.createElement('span');
        iconElement.className = 'header-menu-icon';
        iconElement.textContent = sectionConfig.icon || '☰';
        element.appendChild(iconElement);
        
        this.dropdownTrigger = element;
        break;
        
      default:
        console.warn(`Unknown section type: ${sectionConfig.type}`);
        return null;
    }
    
    // Store reference to the container for this module
    if (sectionConfig.id) {
      this.moduleContainers.set(sectionConfig.id, element);
      
      // Add any custom attributes
      if (sectionConfig.attributes) {
        Object.entries(sectionConfig.attributes).forEach(([name, value]) => {
          element.setAttribute(name, value);
        });
      }
    }
    
    return element;
  }
  
  /**
   * Initialize all modules based on configuration
   * @private
   */
  async _initializeModules() {
    // Initialize navbar
    const navContainer = this.moduleContainers.get('navbar') || this.container.querySelector('#header-nav-container');
    if (navContainer) {
      try {
        const navbar = new Navbar({ container: navContainer });
        await navbar.init();
        this.modules.set('navbar', navbar);
      } catch (error) {
        console.error('Error initializing navbar:', error);
        this._renderFallbackNavigation(navContainer);
      }
    }
    
    // Initialize theme selector
    const themeContainer = this.moduleContainers.get('theme') || this.container.querySelector('#header-theme-container');
    if (themeContainer) {
      await this._initializeThemeSelector(themeContainer);
    }
    
    // Initialize dropdown
    if (this.dropdownTrigger) {
      await this._initializeDropdown();
    }
  }
  
  /**
   * Initialize the theme selector
   * @param {HTMLElement} container - Container element for theme selector
   * @private
   */
  async _initializeThemeSelector(container) {
    try {
      // Check if ECS is properly initialized and has the required methods
      const isEcsValid = this.ecs && 
                        typeof this.ecs.createEntity === 'function' && 
                        this.ecs.createEntity() && 
                        typeof this.ecs.createEntity().addComponent === 'function';
      
      if (isEcsValid) {
        // Use ECS integration approach
        const themeEntity = this.ecs.createEntity();
        themeEntity.addComponent('dom', { container });
        themeEntity.addComponent('theme', { 
          currentTheme: localStorage.getItem('portfolioTheme') || config.theme?.default 
        });
        
        // Initialize theme selector using the singleton
        if (window.themeSelector && typeof window.themeSelector.init === 'function') {
          await window.themeSelector.init(themeEntity);
        } else {
          // Import theme selector dynamically if not already available
          const module = await import('../../modules/theme-selector/theme-selector.js');
          if (module.themeSelector && typeof module.themeSelector.init === 'function') {
            await module.themeSelector.init(themeEntity);
          }
        }
        this.themeEntity = themeEntity;
      } else {
        // Use standalone approach
        const module = await import('../../modules/theme-selector/theme-selector.js');
        if (module.ThemeSelector) {
          const standaloneThemeSelector = new module.ThemeSelector({
            container,
            currentTheme: localStorage.getItem('portfolioTheme') || config.theme?.default,
            availableThemes: config.theme?.availableThemes
          });
          standaloneThemeSelector.render();
          this.modules.set('theme', standaloneThemeSelector);
        }
      }
    } catch (error) {
      console.error('Error initializing theme selector:', error);
      // Try a basic theme selector as last resort
      this._initializeBasicThemeSelector(container);
    }
  }
  
  /**
   * Initialize a very basic theme selector as last resort
   * @param {HTMLElement} container - Container element
   * @private
   */
  _initializeBasicThemeSelector(container) {
    try {
      const currentTheme = localStorage.getItem('portfolioTheme') || 'light';
      const button = document.createElement('button');
      button.className = 'theme-toggle-btn';
      button.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
      button.setAttribute('aria-label', 'Toggle theme');
      
      button.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('portfolioTheme', newTheme);
        button.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
      });
      
      container.innerHTML = '';
      container.appendChild(button);
    } catch (err) {
      console.error('Failed to initialize basic theme selector', err);
    }
  }
  
  /**
   * Initialize the dropdown menu
   * @private
   */
  async _initializeDropdown() {
    try {
      this.dropdown = new HeaderDropdown({
        container: this.container,
        trigger: this.dropdownTrigger,
        position: this.headerConfig.dropdownPosition || 'bottom-right',
        closeOnClickOutside: true
      });
      
      // Register sections
      await this._registerDropdownModules();
    } catch (error) {
      console.error('Error initializing dropdown:', error);
    }
  }
  
  /**
   * Register built-in dropdown modules
   * @private
   */
  async _registerDropdownModules() {
    try {
      // Create theme selector for dropdown
      const themeSelector = new ThemeSelector({
        onChange: (theme) => {
          document.documentElement.setAttribute('data-theme', theme);
          localStorage.setItem('portfolioTheme', theme);
        },
        currentTheme: localStorage.getItem('portfolioTheme') || config.theme.default,
        availableThemes: config.theme.availableThemes
      });
      
      // Add theme selector to dropdown
      this.dropdown.addSection('themes', themeSelector);
      
      // Register default sections (settings and links)
      registerDefaultDropdownSections(this.dropdown);
      
      // Load additional dropdown modules from config
      if (this.headerConfig.dropdownModules && Array.isArray(this.headerConfig.dropdownModules)) {
        for (const moduleConfig of this.headerConfig.dropdownModules) {
          try {
            if (moduleConfig.id === 'devtools' && config.advanced?.debug) {
              const { DevToolsSection } = await import('../dropdown/devtools/devtools.js');
              const devTools = new DevToolsSection();
              this.dropdown.addSection('devtools', devTools);
            } else if (moduleConfig.path) {
              // Dynamic import of custom modules
              const module = await import(moduleConfig.path);
              if (module.default && typeof module.default.render === 'function') {
                this.dropdown.addSection(moduleConfig.id, module.default);
              }
            }
          } catch (err) {
            console.warn(`Failed to load dropdown module ${moduleConfig.id}:`, err);
          }
        }
      }
    } catch (error) {
      console.error('Failed to register dropdown modules:', error);
    }
  }
  
  /**
   * Register a module for the header
   * @param {string} id - Module identifier
   * @param {Object} module - Module instance
   */
  registerModule(id, module) {
    this.modules.set(id, module);
    const container = this.moduleContainers.get(id);
    
    if (container && module.render) {
      const content = module.render();
      if (content) {
        if (typeof content === 'string') {
          container.innerHTML = content;
        } else if (content instanceof HTMLElement) {
          container.appendChild(content);
        }
      }
    }
  }
  
  /**
   * Register a dropdown module
   * @param {string} id - Module identifier
   * @param {Object} module - Module with render method
   */
  registerDropdownModule(id, module) {
    if (this.dropdown) {
      this.dropdown.addSection(id, module);
    } else {
      console.warn(`Dropdown not initialized yet, can't register module ${id}`);
    }
  }
  
  /**
   * Render fallback navigation
   * @param {HTMLElement} container - Container for navigation
   * @private
   */
  _renderFallbackNavigation(container) {
    if (!container) return;
    
    container.innerHTML = '';
    
    const defaultSections = ['about', 'projects', 'contact'];
    defaultSections.forEach(section => {
      const btn = document.createElement('button');
      btn.className = 'nav-btn';
      btn.textContent = section.charAt(0).toUpperCase() + section.slice(1);
      btn.setAttribute('data-route', section);
      btn.addEventListener('click', () => {
        window.location.hash = section;
      });
      container.appendChild(btn);
    });
  }
}

export { Header };
