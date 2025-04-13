/**
 * @fileoverview About Page
 * 
 * This module defines the structure and content of the About page.
 * Content is primarily loaded from config.js to ensure consistency
 * across the application.
 */
import { cssLoader } from '../../engine/modules/css-loader.js';

// Page module implementation
const aboutPage = {
  // Content data for the page
  content: {
    title: "About Me",
    profileImage: "/assets/images/profile.png",
    fallbackImage: "https://via.placeholder.com/300x300.png?text=No+Image",
    paragraphs: [
      "Welcome to my portfolio. I am a creative technologist with a passion for developing innovative solutions and pushing the boundaries of technology.",
      "With extensive experience in web development, interactive media, and software engineering, I specialize in creating engaging digital experiences that combine cutting-edge technology with intuitive design.",
      "My approach is rooted in a deep understanding of both technical implementation and user-centered design principles, allowing me to build solutions that are not only functionally robust but also enjoyable to use."
    ],
    details: {
      name: "Portfolio Author",
      location: "Location not specified",
      email: "email@example.com"
    }
  },
  
  /**
   * Initialize the about page
   * @param {Object} entity - The entity representing this page
   */
  async init(entity) {
    this.entity = entity;
    this.world = entity.world || window.portfolioEngine?.world;
    
    // Load CSS specific to this module
    try {
      await cssLoader.loadLocalCSS(import.meta.url);
      console.info('About page CSS loaded');
    } catch (error) {
      console.warn('Failed to load about page CSS:', error);
    }
    
    // Get the container from the entity
    const container = entity.getComponent?.('domElement')?.container || 
                      entity.getComponent?.('dom')?.container ||
                      document.querySelector('.page-container');
    
    if (!container) {
      console.error('About page: Container not found');
      return this;
    }
    
    // Render the page content
    this.render(container);
    
    return this;
  },
  
  /**
   * Render the about page content
   * @param {HTMLElement} container - The container to render into
   */
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
  
  // Lifecycle methods
  mount() {
    console.info('About page mounted');
  },
  
  unmount() {
    console.info('About page unmounted');
  }
};

export default aboutPage;
