/**
 * @fileoverview Theme Selector Submodule
 * 
 * This module provides the UI for selecting and changing the application theme.
 * @module themeSelector
 * @requires config from ../../../config.js
 * @requires cssLoader from ../../../engine/css-loader.js
 */
import config from '../../../../config.js';
import { cssLoader } from '../../../../engine/css-loader.js';

const themeSelector = {
  async init(entity) {
    // Load component-specific CSS using the new method
    await cssLoader.loadLocalCSS(import.meta.url);
    
    const container = entity.getComponent('dom').container;
    const theme = entity.getComponent('theme');
    
    if (!theme) {
      console.error('Theme component missing from entity');
      return;
    }
    
    // Create theme selector UI
    let themeButtons = '';
    config.theme.availableThemes.forEach(themeName => {
      themeButtons += `<button 
        class="theme-selector__button ${themeName === theme.currentTheme ? 'theme-selector__button--active' : ''}" 
        data-theme="${themeName}"
        aria-label="Switch to ${themeName} theme"
        aria-pressed="${themeName === theme.currentTheme}"
      >${themeName}</button>`;
    });
    
    container.innerHTML = `
      <div class="theme-selector" aria-labelledby="theme-label">
        <span id="theme-label" class="theme-selector__label">Theme:</span>
        <div class="theme-selector__options" role="group" aria-label="Theme options">
          ${themeButtons}
        </div>
      </div>
    `;
    
    // Add event listeners for theme buttons
    const buttons = container.querySelectorAll('.theme-selector__button');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const selectedTheme = button.getAttribute('data-theme');
        
        // Update active button states
        buttons.forEach(btn => {
          btn.classList.remove('theme-selector__button--active');
          btn.setAttribute('aria-pressed', 'false');
        });
        button.classList.add('theme-selector__button--active');
        button.setAttribute('aria-pressed', 'true');
        
        // Dispatch theme change event
        const themeEvent = new CustomEvent('themeChange', {
          detail: { theme: selectedTheme }
        });
        document.dispatchEvent(themeEvent);
        
        // Update component state
        theme.currentTheme = selectedTheme;
        
        // Save to localStorage for persistence
        localStorage.setItem('portfolioTheme', selectedTheme);
      });
    });
    
    console.info('Theme selector initialized with', buttons.length, 'theme options');
  }
};

export { themeSelector };
