/**
 * @fileoverview Theme Selector Component
 * 
 * Provides UI for selecting and changing the application theme.
 * Works as a plugin for the header dropdown system.
 * 
 * ARCHITECTURAL NOTE:
 * This component demonstrates the plugin implementation pattern that should be
 * followed across the repository. Key characteristics:
 * 
 * 1. Implements a render() method returning an HTMLElement
 * 2. Encapsulates its own functionality and state
 * 3. Accepts configuration through constructor options
 * 4. Manages its own event handling
 * 5. Provides callbacks for communication with parent components
 * 
 * When implementing plugins for container components, follow this pattern:
 * - Implement the required interface (render method)
 * - Contain all logic within the plugin
 * - Use callbacks for communicating with parent components
 * - Load your own dependencies (like CSS)
 */
import { cssLoader } from '../../utils/css-loader.js';
import config from '../../../config.js';

// Simple singleton implementation for theme selector
const themeSelector = {
  async init(entity) {
    // Load component-specific CSS
    await cssLoader.loadLocalCSS(import.meta.url);
    
    // Get container from entity
    const container = entity.getComponent('dom').container;
    
    // Get current theme from entity or localStorage
    const currentTheme = entity.getComponent('theme')?.currentTheme || 
                          localStorage.getItem('portfolioTheme') || 
                          config.theme.default;
    
    // Create simple theme selector buttons
    let themeBtns = '';
    config.theme.availableThemes.forEach(theme => {
      const isActive = theme === currentTheme;
      themeBtns += `
        <button class="theme-btn ${isActive ? 'active' : ''}" 
                data-theme="${theme}"
                aria-pressed="${isActive}"
                aria-label="Switch to ${theme} theme">
          ${theme.charAt(0).toUpperCase() + theme.slice(1)}
        </button>
      `;
    });
    
    container.innerHTML = `
      <div class="theme-selector">
        <div class="theme-selector__options">
          ${themeBtns}
        </div>
      </div>
    `;
    
    // Add event listeners
    const buttons = container.querySelectorAll('.theme-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        this._changeTheme(theme);
        buttons.forEach(b => {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-pressed', b === btn);
        });
      });
    });
  },
  
  /**
   * Change theme and update UI
   * @param {string} theme - Theme name
   * @private
   */
  _changeTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolioTheme', theme);
  }
};

// Also export ThemeSelector class for dropdown plugin usage
class ThemeSelector {
  /**
   * Create a new theme selector
   * @param {Object} options - Configuration options
   * @param {Function} options.onChange - Callback when theme changes
   * @param {String} options.currentTheme - Current theme
   * @param {Array} options.availableThemes - List of available themes
   */
  constructor(options = {}) {
    this.options = Object.assign({
      onChange: null,
      currentTheme: 'light',
      availableThemes: ['light', 'dark'],
      compact: false
    }, options);
    
    // Internal state
    this.currentTheme = this.options.currentTheme;
    
    // Load component CSS
    this._loadCSS();
  }
  
  /**
   * Load component CSS
   * @private
   */
  async _loadCSS() {
    try {
      // Load theme-selector specific CSS
      await cssLoader.loadLocalCSS(import.meta.url);
    } catch (error) {
      console.warn('Could not load theme selector CSS:', error);
    }
  }
  
  /**
   * Render the theme selector
   * @returns {HTMLElement} The rendered element
   * 
   * NOTE: This method demonstrates the standard plugin render interface
   * that should be implemented by all plugins across the repository.
   * Every plugin should implement a render() method that returns an HTMLElement.
   */
  render() {
    const container = document.createElement('div');
    container.className = 'dropdown-section theme-selector-section';
    
    // Create section header
    const header = document.createElement('h3');
    header.className = 'dropdown-section-title';
    header.textContent = 'Theme';
    container.appendChild(header);
    
    // Create theme options
    const themeOptions = document.createElement('div');
    themeOptions.className = 'theme-options';
    
    // Add theme buttons
    this.options.availableThemes.forEach(theme => {
      const themeButton = document.createElement('button');
      themeButton.className = `theme-option ${theme === this.currentTheme ? 'active' : ''}`;
      themeButton.setAttribute('data-theme', theme);
      themeButton.setAttribute('aria-label', `Switch to ${theme} theme`);
      themeButton.setAttribute('aria-pressed', theme === this.currentTheme);
      themeButton.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
      
      // Add click handler
      themeButton.addEventListener('click', () => this._changeTheme(theme));
      
      themeOptions.appendChild(themeButton);
    });
    
    container.appendChild(themeOptions);
    
    return container;
  }
  
  /**
   * Change the current theme
   * @param {String} theme - Theme to set
   * @private
   */
  _changeTheme(theme) {
    if (theme === this.currentTheme) return;
    
    this.currentTheme = theme;
    
    // Call onChange callback if provided
    if (this.options.onChange) {
      this.options.onChange(theme);
    }
    
    // Update UI
    this._updateUI();
  }
  
  /**
   * Update UI to match current state
   * @private
   */
  _updateUI() {
    // Find all theme buttons and update active state
    const themeButtons = document.querySelectorAll('.theme-option');
    themeButtons.forEach(button => {
      const isActive = button.getAttribute('data-theme') === this.currentTheme;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', isActive);
    });
  }
  
  /**
   * Set compact mode for mobile
   * @param {Boolean} isCompact - Whether to use compact mode
   */
  setCompactMode(isCompact) {
    const themeSection = document.querySelector('.theme-selector-section');
    if (themeSection) {
      themeSection.classList.toggle('compact', isCompact);
    }
  }
}

export { themeSelector, ThemeSelector };
