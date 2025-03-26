/**
 * @fileoverview Projects Page
 * 
 * This module defines the projects showcase page that dynamically 
 * loads and displays project data from the projects directory.
 * 
 * @module projects
 * @requires page from ../modules/page.js
 */
import { page } from '../../modules/page/page.js';
import { cssLoader } from '../../engine/css-loader.js';

const projects = {
  async init(entity) {
    // Load page-specific CSS
    await cssLoader.loadLocalCSS(import.meta.url);
    
    const container = entity.getComponent('dom').container;
    
    // Show loading state
    container.innerHTML = `
      <h2>My Projects</h2>
      <div class="loading-projects">
        <div class="loading-spinner"></div>
        <p>Loading projects...</p>
      </div>
    `;
    
    try {
      // Load projects data dynamically
      const projectsData = await page.getProjects();
      
      if (projectsData.length === 0) {
        container.innerHTML = `
          <h2>My Projects</h2>
          <div class="no-projects">
            <p>No projects found. Add project folders to the pages/projects directory.</p>
          </div>
        `;
        return;
      }
      
      this.render(container, projectsData);
    } catch (error) {
      console.error('Failed to load projects:', error);
      container.innerHTML = `
        <h2>My Projects</h2>
        <div class="error-message">
          <p>Failed to load projects. Please try again later.</p>
          <p>Error: ${error.message}</p>
        </div>
      `;
    }
  },
  
  render(container, projectsData) {
    let projectsHtml = '';
    
    projectsData.forEach(project => {
      const techBadges = project.technologies && project.technologies.length > 0
        ? project.technologies.map(tech => `<span class="tech-badge">${tech}</span>`).join('')
        : '<span class="tech-badge">JavaScript</span>';
      
      projectsHtml += `
        <div class="project-card" data-project-id="${project.id}">
          <div class="project-image">
            <img src="${project.image}" 
                 alt="${project.title}" 
                 onerror="this.onerror=null; this.src='assets/images/placeholder.jpg'">
          </div>
          <div class="project-content">
            <h3>${project.title}</h3>
            <p>${project.description.substring(0, 150)}${project.description.length > 150 ? '...' : ''}</p>
            <div class="project-tech">
              ${techBadges}
            </div>
            <a href="${project.link}" class="project-link">View Project</a>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = `
      <h2>My Projects</h2>
      <div class="projects-grid">
        ${projectsHtml}
      </div>
    `;
    
    // Add event listeners to project cards for potential expanded view
    const projectCards = container.querySelectorAll('.project-card');
    projectCards.forEach(card => {
      card.addEventListener('click', (e) => {
        // Only handle clicks on the card itself, not on links
        if (!e.target.closest('a.project-link')) {
          const projectId = card.getAttribute('data-project-id');
          const project = projectsData.find(p => p.id === projectId);
          
          if (project && project.readme) {
            this.showProjectDetail(container, project);
          }
        }
      });
    });
  },
  
  showProjectDetail(container, project) {
    // Store the current grid for going back
    this._previousContent = container.innerHTML;
    
    container.innerHTML = `
      <div class="project-detail">
        <div class="project-detail-header">
          <button class="back-button">&larr; Back to Projects</button>
          <h2>${project.title}</h2>
        </div>
        
        <div class="project-detail-content">
          <div class="project-detail-image">
            <img src="${project.image}" 
                 alt="${project.title}" 
                 onerror="this.onerror=null; this.src='assets/images/placeholder.jpg'">
          </div>
          
          <div class="project-detail-info">
            <div class="project-tech">
              ${project.technologies.map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
            </div>
            
            <div class="project-readme">
              ${project.readme || project.description}
            </div>
            
            <a href="${project.link}" class="project-link">View Project</a>
          </div>
        </div>
      </div>
    `;
    
    // Add back button handler
    const backButton = container.querySelector('.back-button');
    if (backButton) {
      backButton.addEventListener('click', () => {
        container.innerHTML = this._previousContent;
        
        // Re-add event listeners after restoring content
        const projectCards = container.querySelectorAll('.project-card');
        projectCards.forEach(card => {
          card.addEventListener('click', (e) => {
            if (!e.target.closest('a.project-link')) {
              const projectId = card.getAttribute('data-project-id');
              const project = projectsData.find(p => p.id === projectId);
              
              if (project && project.readme) {
                this.showProjectDetail(container, project);
              }
            }
          });
        });
      });
    }
  },
  
  // Lifecycle methods
  mount() {
    console.log('Projects page mounted');
  },
  
  unmount() {
    console.log('Projects page unmounted');
    // Clean up any event listeners if needed
  }
};

export { projects };
