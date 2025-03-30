/**
 * @fileoverview Footer Module.
 * Renders the footer content for the portfolio.
 * @module footer
 */
import { cssLoader } from '../../engine/utils/css-loader.js';
import config from '../../config.js';

class Footer {
  constructor() {
    this.container = null;
  }

  async init(container) {
    this.container = container;
    
    // Load component-specific CSS
    await cssLoader.loadLocalCSS(import.meta.url);
    
    this.render();
  }

  render() {
    if (this.container) {
      const currentYear = new Date().getFullYear();
      const author = config.site.author;
      
      this.container.innerHTML = `
        <footer>
          <p>&copy; ${currentYear} ${author}. All rights reserved.</p>
        </footer>
      `;
    }
  }
}

export const footer = new Footer();
