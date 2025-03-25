/**
 * @fileoverview Theme Selector Module.
 * Provides a UI to choose a theme and dispatches theme change events.
 * @module theme-selector
 * @requires config from ../config.js
 */
import config from '../config.js';

const themeSelector = {
  init(entity) {
    const container = entity.getComponent('dom').container;
    const theme = entity.getComponent('theme');
    
    // Create theme selector UI
    let themeButtons = '';
    config.theme.availableThemes.forEach(themeName => {
      themeButtons += `<button class="theme-btn ${themeName === theme.currentTheme ? 'active' : ''}" data-theme="${themeName}">${themeName}</button>`;
    });
    
    container.innerHTML = `
      <div class="theme-selector">
        <span>Theme:</span>
        <div class="theme-options">
          ${themeButtons}
        </div>
      </div>
    `;
    
    // Add event listeners for theme buttons
    const buttons = container.querySelectorAll('.theme-btn');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const selectedTheme = button.getAttribute('data-theme');
        
        // Update active button
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Dispatch theme change event
        const themeEvent = new CustomEvent('themeChange', {
          detail: { theme: selectedTheme }
        });
        document.dispatchEvent(themeEvent);
        
        // Update component state
        theme.currentTheme = selectedTheme;
      });
    });
  }
};

export { themeSelector };
