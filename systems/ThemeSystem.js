import { System } from '../engine/system.js';
import config from '../config.js';

class ThemeSystem extends System {
  init(entities) {
    this.entities = entities.filter(entity => entity.getComponent('theme'));
    this.applyTheme(config.theme.default);
  }

  update(entities) {
    // No dynamic updates needed for theme system
  }

  applyTheme(themeName) {
    const theme = config.theme.availableThemes.includes(themeName) ? themeName : config.theme.default;
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export { ThemeSystem };
