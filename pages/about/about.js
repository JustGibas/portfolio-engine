/**
 * @fileoverview About Page
 * 
 * This module defines the structure and content of the About page.
 * Content is primarily loaded from config.js to ensure consistency
 * across the application.
 * 
 * @module about
 * @requires config from ../../config.js
 */
import config from '../../config.js';
import { cssLoader } from '../../engine/utils/css-loader.js';

// Page module implementation
const about = {
  // Content data populated from config
  content: {
    title: "About Me",
    profileImage: config.assets?.userImages?.profile?.path || "assets/images/profile.png",
    fallbackImage: config.assets?.userImages?.profile?.fallback || "https://via.placeholder.com/300x300.png?text=No+Image",
    paragraphs: [
      "Welcome to my portfolio. I am a creative technologist with a passion for developing innovative solutions and pushing the boundaries of technology.",
      "With extensive experience in web development, interactive media, and software engineering, I specialize in creating engaging digital experiences that combine cutting-edge technology with intuitive design.",
      "My approach is rooted in a deep understanding of both technical implementation and user-centered design principles, allowing me to build solutions that are not only functionally robust but also enjoyable to use."
    ],
    // Use site information from config
    details: {
      name: config.site?.author || "Portfolio Author",
      location: config.site?.location || "Location not specified",
      email: config.site?.email || "Email not specified"
    }
  },
  
  // Initialize the about page
  async init(entity) {
    this.entity = entity;
    this.ecs = entity.ecs;
    
    // Load CSS specific to this module
    try {
      await cssLoader.loadLocalCSS(import.meta.url);
    } catch (error) {
      console.warn('Failed to load about page CSS:', error);
    }
    
    // Get container from entity or use DOM fallback
    let container = entity.getComponent('dom')?.container;
    if (!container) {
      container = document.querySelector('#about .section-container');
      console.info('Fallback: Using container from DOM for about page.');
    }
    
    if (container) {
      this.render(container);
    } else {
      console.error('About page container not found.');
    }
    
    return this;
  },
  
  // Render the about page content
  render(container) {
    if (!container) return;
    
    const content = this.content;
    
    container.innerHTML = `
      <div class="about-page">
        <h2 class="page-title">${content.title}</h2>
        
        <div class="about-content">
          <div class="profile-section">
            <img src="${content.profileImage}" alt="${content.details.name}" 
                 class="profile-image" onerror="this.src='${content.fallbackImage}'">
            
            <div class="profile-details">
              <h3>${content.details.name}</h3>
              <p><i class="fas fa-map-marker-alt"></i> ${content.details.location}</p>
              <p><i class="fas fa-envelope"></i> ${content.details.email}</p>
            </div>
          </div>
          
          <div class="about-text">
            ${content.paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('')}
          </div>
        </div>
      </div>
    `;
  },
  
  // Lifecycle methods for the page module system
  mount() {
    console.info('About page mounted');
  },
  
  unmount() {
    console.info('About page unmounted');
  }
};

export { about };
