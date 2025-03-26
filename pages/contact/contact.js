/**
 * @fileoverview Contact Module.
 * 
 * thins need to become Page
 * not a module or its a specific modeulet that defines a page
 * Renders the contact form and manages form functionality.
 * this need sto take date from configuration
 * @module contact
 */
import { cssLoader } from '../../engine/css-loader.js';
import config from '../../config.js';

const contact = {
  async init(container) {
    // Load page-specific CSS
    await cssLoader.loadLocalCSS(import.meta.url);
    
    container.innerHTML = `
      <h2>Contact</h2>
      <form id="contact-form">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name" required>
        
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>
        
        <label for="message">Message:</label>
        <textarea id="message" name="message" required></textarea>
        
        <button type="submit">Send</button>
      </form>
    `;
  }
};

export { contact };
