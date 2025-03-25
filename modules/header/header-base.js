/**
 * @fileoverview Base Header Module.
 * Renders the basic header content and integrates theme selection functionality.
 * @module headerBase
 * @requires config from ../../config.js
 */
import config from '../../config.js';

const headerBase = {
  init(entity) {
    const container = entity.getComponent('dom').container;
    const theme = entity.getComponent('theme');
    
    // Create theme selector buttons HTML
    let themeButtons = '';
    config.theme.availableThemes.forEach(themeName => {
      themeButtons += `<button class="theme-btn ${themeName === theme.currentTheme ? 'active' : ''}" data-theme="${themeName}">${themeName}</button>`;
    });
    
    // Render header with integrated theme selector
    container.innerHTML = `
      <div class="header">
        <h1>Welcome to My Portfolio</h1>
        <div class="theme-selector">
          <span>Theme:</span>
          <div class="theme-options">
            ${themeButtons}
          </div>
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

export { headerBase };
