/**
 * @fileoverview Projects Page
 * 
 * This module defines the structure and content of the Projects page,
 * showing a collection of projects discovered by ResourceDiscoverySystem.
 * 
 * @module projects
 */
import { cssLoader } from '../../engine/utils/css-loader.js';
import config from '../../config.js';

const projects = {
  // Content data for the projects page
  content: {
    title: "My Projects",
    intro: "Here's a selection of projects I've worked on. Each project demonstrates different skills and technologies."
  },
  
  // Initialize the projects page
  async init(entity) {
    this.entity = entity;
    this.ecs = entity.ecs;
    this.projects = [];
    
    // Load CSS specific to this module
    try {
      await cssLoader.loadLocalCSS(import.meta.url);
    } catch (error) {
      console.warn('Failed to load projects page CSS:', error);
    }
    
    // Get the container from the entity
    const container = entity.getComponent('dom')?.container;
    
    // Load projects
    try {
      await this._loadProjects();
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
    
    // Render if container exists
    if (container) {
      this.render(container);
    }
    
    return this;
  },
  
  // Load projects from page module or config
  async _loadProjects() {
    // Try to get projects from page module
    try {
      const pageModule = this.ecs?.getSystem('module')?.getModuleInstance('page');
      if (pageModule) {
        this.projects = await pageModule.instance.getProjects();
        return;
      }
    } catch (error) {
      console.warn('Failed to load projects from page module:', error);
    }
    
    // Fallback to config
    this.projects = config.projects || [];
  },
  
  // Render the projects page content
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
  
  // Render project cards HTML
  _renderProjectCards() {
    if (!this.projects || this.projects.length === 0) {
      return '<p class="no-projects">No projects found.</p>';
    }
    
    return this.projects.map(project => `
      <div class="project-card" data-project-id="${project.id}">
        <div class="project-image">
          <img src="${project.image}" alt="${project.title}" onerror="this.src='assets/images/placeholder-project.jpg'">
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
  
  // Add event listeners to project elements
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
  
  // Show detailed view of a project
  _showProjectDetails(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return;
    
    // In a real implementation, this would display a modal or navigate to a detail page
    console.info(`Showing details for project: ${project.title}`);
    
    // Navigate to project detail page if available
    window.location.hash = project.link;
  },
  
  // Helper to truncate text to a specific length
  _truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },
  
  // Lifecycle methods for the page module system
  mount() {
    console.info('Projects page mounted');
  },
  
  unmount() {
    // Clean up event listeners if needed
    console.info('Projects page unmounted');
  }
};

export { projects };
