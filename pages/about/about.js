/**
 * @fileoverview About Page
 * 
 * This module defines the structure and content of the About page.
 * Content is primarily loaded from config.js to ensure consistency
 * across the application.
 * 
 * @module about
 * @requires config from ../config.js
 */
import config from '../../config.js';
import { cssLoader } from '../../engine/css-loader.js';

// Page module implementation
const about = {
  // Content data populated from config
  content: {
    title: "About Me",
    profileImage: "assets/images/profile.jpg",
    fallbackImage: "https://via.placeholder.com/300x300?text=Profile+Image",
    paragraphs: [
      "Welcome to my portfolio. I am a creative technologist with a passion for developing innovative solutions and pushing the boundaries of technology.",
      "With extensive experience in web development, interactive media, and software engineering, I specialize in creating engaging digital experiences that combine cutting-edge technology with intuitive design.",
      "My approach is rooted in a deep understanding of both technical implementation and user-centered design principles, allowing me to build solutions that are not only functionally robust but also enjoyable to use."
    ],
    // Use site information from config
    details: {
      name: config.site.author,
      location: config.site.location || "Location not specified",
      email: config.site.email || "Email not specified"
    }
  },
  
  // Initialize the about page
  async init(entity) {
    // Load page-specific CSS using the new method
    await cssLoader.loadLocalCSS(import.meta.url);
    
    const container = entity.getComponent('dom').container;
    this.render(container);
  },
  
  // Render the about page content
  render(container) {
    // Generate paragraphs HTML
    const paragraphsHtml = this.content.paragraphs
      .map(paragraph => `<p>${paragraph}</p>`)
      .join('');
    
    // Generate details HTML
    const detailsHtml = Object.entries(this.content.details)
      .map(([key, value]) => `
        <div class="detail-item">
          <span class="detail-label">${key.charAt(0).toUpperCase() + key.slice(1)}:</span>
          <span class="detail-value">${value}</span>
        </div>
      `)
      .join('');
    
    // Render complete page
    container.innerHTML = `
      <div class="about-container">
        <h2>${this.content.title}</h2>
        <div class="about-content">
          <div class="about-image">
            <img src="${this.content.profileImage}" 
                 alt="Profile Image" 
                 onerror="this.onerror=null; this.src='${this.content.fallbackImage || config.site.socialProfileImage}'">
          </div>
          <div class="about-text">
            ${paragraphsHtml}
            <div class="about-details">
              ${detailsHtml}
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
  // Lifecycle methods for the page module system
  mount() {
    console.log('About page mounted');
  },
  
  unmount() {
    console.log('About page unmounted');
  }
};

export { about };
