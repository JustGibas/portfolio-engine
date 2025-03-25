import { System } from '../engine/system.js';
import config from '../config.js';

class ThemeSystem extends System {
  init(entities) {
    this.entities = entities.filter(entity => entity.hasComponent('theme'));
    
    // Apply default theme
    this.applyTheme(config.theme.default);
    
    // Listen for theme change events
    document.addEventListener('themeChange', (event) => {
      this.applyTheme(event.detail.theme);
      
      // Update theme component on all entities
      this.entities.forEach(entity => {
        entity.getComponent('theme').currentTheme = event.detail.theme;
      });
    });
  }

  update() {
    // No dynamic updates needed for theme system
  }

  applyTheme(themeName) {
    const theme = config.theme.availableThemes.includes(themeName) ? themeName : config.theme.default;
    document.documentElement.setAttribute('data-theme', theme);
    
    // Store the current theme in local storage for persistence
    localStorage.setItem('portfolio-theme', theme);
    
    // Add theme transition class for smooth transitions
    document.body.classList.add('theme-transition');
    setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, 1000); // Remove class after transition completes
  }
}

export { ThemeSystem };
