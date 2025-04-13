/**
 * @fileoverview Projects Page
 * 
 * This module defines the structure and content of the Projects page,
 * showing a collection of projects.
 */
import { cssLoader } from '../../engine/modules/css-loader.js';

const projectsPage = {
  // Content data for the projects page
  content: {
    title: "My Projects",
    intro: "Here's a selection of projects I've worked on. Each project demonstrates different skills and technologies."
  },
  
  // Sample projects data (in a real app, this would come from a database or API)
  projects: [
    {
      id: "portfolio-engine",
      title: "Portfolio Engine",
      description: "A component-based engine for creating interactive portfolios with minimal configuration.",
      image: "/assets/images/placeholder.jpg",
      technologies: ["JavaScript", "CSS", "HTML", "ECS"],
      link: "#portfolio-engine"
    },
    {
      id: "task-scheduler",
      title: "Task Scheduler System",
      description: "A robust task scheduling system with dependency management and priority handling.",
      image: "/assets/images/placeholder.jpg",
      technologies: ["JavaScript", "Promise API", "Async/Await"],
      link: "#task-scheduler"
    },
    {
      id: "theme-manager",
      title: "Theme Manager",
      description: "A theming system that supports light, dark, and custom themes with dynamic switching.",
      image: "/assets/images/placeholder.jpg",
      technologies: ["CSS Variables", "JavaScript", "LocalStorage"],
      link: "#theme-manager"
    }
  ],
  
  /**
   * Initialize the projects page
   * @param {Object} entity - The entity representing this page
   */
  async init(entity) {
    this.entity = entity;
    this.world = entity.world || window.portfolioEngine?.world;
    
    // Load CSS specific to this module
    try {
      await cssLoader.loadLocalCSS(import.meta.url);
      console.info('Projects page CSS loaded');
    } catch (error) {
      console.warn('Failed to load projects page CSS:', error);
    }
    
    // Get the container from the entity
    const container = entity.getComponent?.('domElement')?.container || 
                      entity.getComponent?.('dom')?.container ||
                      document.querySelector('.page-container');
    
    if (!container) {
      console.error('Projects page: Container not found');
      return this;
    }
    
    // Render the page content
    this.render(container);
    
    return this;
  },
  
  /**
   * Render the projects page content
   * @param {HTMLElement} container - The container to render into
   */
  render(container) {
    if (!container) return;
    
    const content = this.content;
    
    // Start with page header
    container.innerHTML = `
      <div class="projects-page">
        <h2 class="page-title">${content.title}</h2>
        <p class="page-intro">${content.intro}</p>
        
        <div class="projects-grid" id="projects-grid">
          ${this._renderProjectCards()}
        </div>
      </div>
    `;
    
    // Add click handlers to project cards
    this._addEventListeners(container);
  },
  
  /**
   * Render project cards HTML
   * @private
   * @returns {string} HTML for project cards
   */
  _renderProjectCards() {
    if (!this.projects || this.projects.length === 0) {
      return '<p class="no-projects">No projects found.</p>';
    }
    
    return this.projects.map(project => `
      <div class="project-card" data-project-id="${project.id}">
        <div class="project-image">
          <img src="${project.image}" alt="${project.title}" onerror="this.src='assets/images/placeholder.jpg'">
        </div>
        <div class="project-info">
          <h3>${project.title}</h3>
          <p>${this._truncateText(project.description, 100)}</p>
          <div class="project-technologies">
            ${(project.technologies || []).map(tech => 
              `<span class="tech-badge">${tech}</span>`
            ).join('')}
          </div>
          <a href="${project.link}" class="project-link">View Project</a>
        </div>
      </div>
    `).join('');
  },
  
  /**
   * Add event listeners to project elements
   * @private
   * @param {HTMLElement} container - The container with project elements
   */
  _addEventListeners(container) {
    const projectCards = container.querySelectorAll('.project-card');
    projectCards.forEach(card => {
      card.addEventListener('click', (event) => {
        // Prevent navigation if clicking on the link directly
        if (event.target.tagName === 'A') return;
        
        const projectId = card.dataset.projectId;
        this._showProjectDetails(projectId);
      });
    });
  },
  
  /**
   * Show detailed view of a project
   * @private
   * @param {string} projectId - The ID of the project to show
   */
  _showProjectDetails(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return;
    
    // Navigate to project detail page if available
    window.location.hash = project.link.substring(1);
  },
  
  /**
   * Helper to truncate text to a specific length
   * @private
   * @param {string} text - The text to truncate
   * @param {number} maxLength - Maximum length before truncation
   * @returns {string} Truncated text
   */
  _truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },
  
  // Lifecycle methods
  mount() {
    console.info('Projects page mounted');
  },
  
  unmount() {
    console.info('Projects page unmounted');
  }
};

export default projectsPage;
