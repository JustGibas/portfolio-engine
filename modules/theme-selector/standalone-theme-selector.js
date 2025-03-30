/**
 * @fileoverview Standalone Theme Selector Component
 * 
 * A self-contained theme selector component that can work without ECS integration.
 * Provides UI for selecting between different visual themes (light, dark, etc.)
 * and persists the user's selection.
 * 
 * FEATURES:
 * - Works independently without external dependencies
 * - Loads its own CSS
 * - Saves theme preference to localStorage
 * - Provides customization options
 * - Supports custom theme sets
 * - Accessible UI with proper ARIA attributes
 */
import config from '../../config.js';
import { cssLoader } from '../../engine/utils/css-loader.js';

/**
 * Standalone Theme Selector
 * 
 * A self-contained theme selector that can be used in any context
 * without requiring ECS or other framework dependencies.
 */
class StandaloneThemeSelector {
  /**
   * Create a standalone theme selector
   * @param {Object} options - Configuration options
   * @param {HTMLElement} options.container - Container element
   * @param {String} options.currentTheme - Current theme
   * @param {Array} options.availableThemes - Available themes
   * @param {Function} options.onChange - Callback when theme changes
   */
  constructor(options = {}) {
    this.options = Object.assign({
      container: null,
      currentTheme: 'light',
      availableThemes: ['light', 'dark'],
      onChange: null
    }, options);
    
    this.container = this.options.container;
    this.currentTheme = this.options.currentTheme;
    this._loadCSS();
  }
  
  async _loadCSS() {
    try {
      await cssLoader.loadLocalCSS(import.meta.url.replace('standalone-theme-selector.js', 'theme-selector.css'));
    } catch (error) {
      console.warn('Could not load theme selector CSS:', error);
    }
  }
  
  render() {
    if (!this.container) return;
    
    let themeBtns = '';
    this.options.availableThemes.forEach(theme => {
      const isActive = theme === this.currentTheme;
      themeBtns += `
        <button class="theme-btn ${isActive ? 'active' : ''}" 
                data-theme="${theme}"
                aria-pressed="${isActive}"
                aria-label="Switch to ${theme} theme">
          ${theme.charAt(0).toUpperCase() + theme.slice(1)}
        </button>
      `;
    });
    
    this.container.innerHTML = `
      <div class="theme-selector">
        <div class="theme-selector__options">
          ${themeBtns}
        </div>
      </div>
    `;
    
    // Add event listeners
    const buttons = this.container.querySelectorAll('.theme-btn');
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
  }
  
  _changeTheme(theme) {
    if (theme === this.currentTheme) return;
    
    this.currentTheme = theme;
    
    // Update the document theme
    document.documentElement.setAttribute('data-theme', theme);
    
    // Save the theme preference
    localStorage.setItem('portfolioTheme', theme);
    
    // Call onChange callback if provided
    if (typeof this.options.onChange === 'function') {
      this.options.onChange(theme);
    }
  }
}

export { StandaloneThemeSelector };
