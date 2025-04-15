/**
 * @fileoverview Main Header Component
 * 
 * A header component that can be positioned at various locations
 * on the screen (top, bottom, left, right) and serves as a container for 
 * multiple UI modules like navigation, dropdown menus and theme selectors.
 * 
 * ARCHITECTURAL DESIGN:
 * This header implements a composable container pattern where:
 * 
 * 1. The Header creates the DOM structure
 * 2. It provides mount points for child modules (navbar, theme selector, etc)
 * 3. Each child module is responsible for its own rendering and behavior
 * 
 * EXTENSIBILITY:
 * - Additional dropdown sections can be registered at runtime
 * - Fallback mechanisms ensure core functionality even when components fail
 * 
 * This file demonstrates how to build flexible UI components that can adapt
 * to different contexts and remain resilient to failures.
 */
import { cssLoader } from '../../modules/css-loader.js';
import { Navbar } from '../navigation/navbar.js';
//import { Hotbar } from '../hotbar/hotbar.js';
import { HeaderDropdown } from '../dropdown/dropdown.js';
//import { ThemeSelector } from '../../modules/theme-selector/theme-selector.js';

class Header {
  /**
   * Create a new header
   * @param {Object} options - Configuration options
   * @param {HTMLElement} options.container - Header container element
   * @param {Object} options.ecs - ECS instance for creating subentities
   
   */
  constructor(options = {}) {
    this.options = Object.assign({
      container: null,
      // in engine we use world
      ecs: null,
      // headerConfig: depricated
      headerConfig: null,
      // Animation configuration
      autoCollapseDelay:3500, // Time in ms before auto-collapse
      enableCollapse: true, // Whether to enable the collapsible behavior
      initiallyCollapsed: false // Start collapsed or expanded
    }, options);
    
    this.container = this.options.container;
    this.ecs = this.options.ecs;
    this.dropdown = null;
    this.dropdownTrigger = null;
    
    // Animation state
    this.isCollapsed = this.options.initiallyCollapsed;
    this.collapseTimer = null;
    
    // Store references to module containers
    this.moduleContainers = new Map();
    
    // Component registry for modules
    this.modules = new Map();
    
    // Initialize with a default configuration first to ensure it exists
    this.headerConfig = this._getDefaultHeaderConfig();
    
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
            { id: 'title', type: 'title', text: String(this.id) || 'Portfolio' },
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
      // Create the header structure
      this._createHeaderStructure();
      
      // Initialize modules
      await this._initializeModules();

      // Initialize collapsible behavior if enabled
      if (this.options.enableCollapse) {
        this._initializeCollapseBehavior();
      }
      
      console.info('Header initialized with configured modules');
    } catch (error) {
      console.error('Error initializing header:', error);
      // Fallback to simple structure if configuration fails
      this._createSimpleHeaderStructure();
      
      // Try to initialize basic modules even after fallback
      try {
        await this._initializeBasicModules();
        
        // Initialize collapsible behavior for fallback header too
        if (this.options.enableCollapse) {
          this._initializeCollapseBehavior();
        }
      } catch (innerError) {
        console.error('Failed to initialize basic modules:', innerError);
      }
    }
    
    return this;
  }
  
  /**
   * Initialize collapsible header behavior with ECS integration
   * @private
   */
  _initializeCollapseBehavior() {
    // Set the initial state
    if (this.isCollapsed) {
      this.collapseHeader();
    } else {
      this.expandHeader();
      this._startCollapseTimer();
    }
    
    // Add event listeners for hover, touch, and click
    this.container.addEventListener('mouseenter', () => this.expandHeader());
    this.container.addEventListener('mouseleave', () => this._startCollapseTimer());
    this.container.addEventListener('touchstart', (e) => {
      if (this.isCollapsed) {
        e.preventDefault(); // Prevent default only when collapsed
        this.expandHeader();
      } else {
        this._startCollapseTimer();
      }
    });
    
    // When collapsed, click expands
    this.container.addEventListener('click', (e) => {
      if (this.isCollapsed) {
        e.preventDefault();
        e.stopPropagation();
        this.expandHeader();
      }
    });
    
    // Document-level click handler to collapse when clicking elsewhere
    document.addEventListener('click', (e) => {
      if (!this.isCollapsed && !this.container.contains(e.target)) {
        this.collapseHeader();
      }
    });
    
    // Add ECS integration if available
    if (this.ecs) {
      this._registerHeaderAnimationComponent();
    }
  }
  
  /**
   * Register header animation component with the ECS system
   * @private
   */
  _registerHeaderAnimationComponent() {
    // Create animation component for the header if animation system exists
    if (this.ecs.getSystem('animationSystem')) {
      // Get entity ID or create a new entity for the header
      const headerEntityId = this.container.getAttribute('data-entity-id') || 
                           this.ecs.createEntity('header');
                           
      // Add or update the animation component
      this.ecs.addComponent(headerEntityId, 'animation', {
        element: this.container,
        properties: {
          collapsed: this.isCollapsed,
          expanding: false,
          lastInteraction: Date.now()
        },
        transitions: {
          // Update easing functions to match our CSS transitions
          toCollapsed: { duration: 600, easing: 'cubic-bezier(0.25, 0.1, 0.6, 1.0)' },
          toExpanded: { duration: 500, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
        }
      });
      
      // Make sure the container has the entity ID for future reference
      this.container.setAttribute('data-entity-id', headerEntityId);
    }
  }
  
  /**
   * Update animation component in ECS system
   * @private
   * @param {Object} properties - Animation properties to update
   */
  _updateAnimationComponent(properties) {
    if (!this.ecs) return;
    
    const headerEntityId = this.container.getAttribute('data-entity-id');
    if (headerEntityId && this.ecs.hasComponent(headerEntityId, 'animation')) {
      const animComponent = this.ecs.getComponent(headerEntityId, 'animation');
      Object.assign(animComponent.properties, properties);
    }
  }
  
  /**
   * Start the timer to auto-collapse the header
   * @private
   */
  _startCollapseTimer() {
    // Clear any existing timer
    this._clearCollapseTimer();
    
    // Only start timer if not collapsed
    if (!this.isCollapsed) {
      this.collapseTimer = setTimeout(() => {
        this.collapseHeader();
      }, this.options.autoCollapseDelay);
      
      // Update animation component if using ECS
      this._updateAnimationComponent({
        lastInteraction: Date.now()
      });
    }
  }
  
  /**
   * Clear the auto-collapse timer
   * @private
   */
  _clearCollapseTimer() {
    if (this.collapseTimer) {
      clearTimeout(this.collapseTimer);
      this.collapseTimer = null;
    }
  }
  
  /**
   * Collapse the header into a bubble - starts slow and accelerates
   */
  collapseHeader() {
    if (this.isCollapsed) return;
    
    this._clearCollapseTimer();
    this.isCollapsed = true;
    
    // Remove any inline styles that might interfere with our CSS
    this.container.style.width = '';
    this.container.style.left = '';
    this.container.style.right = '';
    this.container.style.top = '';
    this.container.style.position = '';
    
    // Add collapsing-state class for slow-start-fast-end transition
    this.container.classList.add('collapsing-state');
    
    // Add the collapsed class
    this.container.classList.add('collapsed');
    this.container.classList.remove('expanding');
    this.container.classList.remove('expanding-state');
    
    // Update animation component if using ECS
    this._updateAnimationComponent({
      collapsed: true,
      expanding: false
    });
    
    // Remove the transition class after animation completes
    setTimeout(() => {
      this.container.classList.remove('collapsing-state');
    }, 600); // Match to collapse transition duration (0.6s)
    
    // Dispatch custom event
    this.container.dispatchEvent(new CustomEvent('header:collapse', {
      bubbles: true,
      detail: { header: this }
    }));
  }
  
  /**
   * Expand the header to full size - quick start with smooth deceleration
   */
  expandHeader() {
    if (!this.isCollapsed) return;
    
    this._clearCollapseTimer();
    this.isCollapsed = false;
    
    // Remove any inline styles that might interfere with our CSS
    this.container.style.width = '';
    this.container.style.left = '';
    this.container.style.right = '';
    this.container.style.top = '';
    this.container.style.position = '';
    
    // Add expanding-state class for fast-start-slow-end transition
    this.container.classList.add('expanding-state');
    
    // Update classes
    this.container.classList.remove('collapsed');
    this.container.classList.add('expanding');
    this.container.classList.remove('collapsing-state');
    
    // After transition completes, remove the expanding class
    setTimeout(() => {
      this.container.classList.remove('expanding');
      
      // Update animation component if using ECS
      this._updateAnimationComponent({
        collapsed: false,
        expanding: false
      });
      
    }, 500); // Match to expand transition duration (0.5s)
    
    // After all transitions complete, remove the state class
    setTimeout(() => {
      this.container.classList.remove('expanding-state');
    }, 550); // Slightly longer than the main transition
    
    // Initially mark as expanding for animation component
    this._updateAnimationComponent({
      collapsed: false,
      expanding: true,
      lastInteraction: Date.now()
    });
    
    // Dispatch custom event
    this.container.dispatchEvent(new CustomEvent('header:expand', {
      bubbles: true,
      detail: { header: this }
    }));
    
    // Start collapse timer
    this._startCollapseTimer();
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
        <h1>Portfolio Engine</h1>
        <nav id="header-nav-container" class="header-navigation"></nav>
        <div class="header-controls">
          <div id="header-theme-container"></div>
          <button id="header-menu-btn" class="header-menu-button" aria-label="Open menu">
            <span class="header-menu-icon">☰</span>
          </button>
        </div>
      </div>
    `;
    
    // Make sure we add the header class for styling
    if (!this.container.classList.contains('header')) {
      this.container.classList.add('header');
    }
    
    // Make title clickable to navigate to home
    const title = this.container.querySelector('h1');
    if (title) {
      title.addEventListener('click', () => {
        window.location.hash = '';
      });
    }
    
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
    
    // Make sure container has the header class for styling
    if (!this.container.classList.contains('header')) {
      this.container.classList.add('header');
    }
    
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
        element.textContent = "Portfolio Engine";
        
        // Make title clickable to navigate to home
        element.addEventListener('click', () => {
          window.location.hash = '';
        });
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
    // Implement a simple theme selector without external dependencies
    this._initializeBasicThemeSelector(container);
  }
  
  /**
   * Initialize a very basic theme selector as last resort
   * @param {HTMLElement} container - Container element
   * @private
   */
  _initializeBasicThemeSelector(container) {
    try {
      // Get current theme from localStorage or default to light
      const currentTheme = localStorage.getItem('portfolioTheme') || 'light';
      
      // Set the theme on the document
      document.documentElement.setAttribute('data-theme', currentTheme);
      
      // Create a simple toggle button
      const button = document.createElement('button');
      button.className = 'theme-toggle-btn';
      button.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
      button.setAttribute('aria-label', 'Toggle theme');
      
      // Add click event
      button.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('portfolioTheme', newTheme);
        button.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
        
        // Dispatch a theme change event
        const event = new CustomEvent('theme:changed', { 
          detail: { theme: newTheme } 
        });
        document.dispatchEvent(event);
      });
      
      // Add the button to the container
      container.innerHTML = '';
      container.appendChild(button);
      
      console.info('Basic theme selector initialized');
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
      // Create a simple theme section for the dropdown
      const themeSectionElement = document.createElement('div');
      themeSectionElement.className = 'dropdown-section';
      themeSectionElement.innerHTML = `
        <h3>Theme</h3>
        <div class="theme-options">
          <button class="theme-option" data-theme="light">Light</button>
          <button class="theme-option" data-theme="dark">Dark</button>
        </div>
      `;
      
      // Add event listeners to theme buttons
      const themeButtons = themeSectionElement.querySelectorAll('.theme-option');
      themeButtons.forEach(button => {
        button.addEventListener('click', () => {
          const theme = button.getAttribute('data-theme');
          document.documentElement.setAttribute('data-theme', theme);
          localStorage.setItem('portfolioTheme', theme);
          
          // Highlight the active theme
          themeButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          
          // Update the theme toggle button
          const themeToggle = document.querySelector('.theme-toggle-btn');
          if (themeToggle) {
            themeToggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
          }
          
          // Dispatch event
          const event = new CustomEvent('theme:changed', { 
            detail: { theme } 
          });
          document.dispatchEvent(event);
          
          // Close dropdown
          if (this.dropdown) {
            this.dropdown.close();
          }
        });
      });
      
      // Highlight current theme
      const currentTheme = localStorage.getItem('portfolioTheme') || 'light';
      const activeButton = themeSectionElement.querySelector(`[data-theme="${currentTheme}"]`);
      if (activeButton) {
        activeButton.classList.add('active');
      }
      
      // Add the section to dropdown
      if (this.dropdown && this.dropdown.addSection) {
        this.dropdown.addSection('themes', {
          render: () => themeSectionElement
        });
        
        console.info('Added theme section to dropdown');
      }
      
      // Skip further registrations for now
      // We'll implement these properly later
      
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
