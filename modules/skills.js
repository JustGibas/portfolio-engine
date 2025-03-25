/**
 * @fileoverview Skills Module for Portfolio Engine
 * 
 * This module implements the skills section of the portfolio, showcasing
 * professional skills with interactive visualizations. It displays a list
 * of skills with progress bars representing proficiency levels and
 * supports animations when the section comes into view.
 * 
 * @module skills
 * @requires Entity Component System
 * 
 * @design Uses a data-driven approach to render skills with a consistent
 * visual presentation. Implements progressive animations for engagement.
 * 
 * @example
 * // Initialize the skills module with an entity
 * import { skills } from './modules/skills.js';
 * const skillsEntity = ecs.createEntity();
 * skillsEntity.addComponent('dom', { container: document.getElementById('skills') });
 * skills.init(skillsEntity);
 */

const skills = {
  /**
   * Initialize the skills module
   * @param {Object} entity - The entity with dom component
   */
  init(entity) {
    const container = entity.getComponent('dom').container;
    

    //JG dont like this part showing skill by procentages show thet there is a limit wich there is not
    // Define skills data structure
    // This could be moved to a separate data file or loaded dynamically
    const skillsData = [
      { name: 'JavaScript', level: 90 },
      { name: 'HTML/CSS', level: 85 },
      { name: 'React', level: 80 },
      { name: 'Node.js', level: 75 },
      { name: 'Python', level: 70 },
      { name: 'UI/UX Design', level: 65 }
    ];
    
    // Generate HTML for skills
    let skillsHtml = '';
    skillsData.forEach(skill => {
      skillsHtml += `
        <div class="skill-item">
          <div class="skill-info">
            <span class="skill-name">${skill.name}</span>
            <span class="skill-percentage">${skill.level}%</span>
          </div>
          <div class="skill-bar">
            <div class="skill-progress" style="width: 0%"></div>
          </div>
        </div>
      `;
    });
    
    // Render the skills container
    container.innerHTML = `
      <h2>My Skills</h2>
      <div class="skills-container">
        ${skillsHtml}
      </div>
    `;
    
    // Set up animation when element comes into view
    this.setupAnimations(container, skillsData);
  },
  
  /**
   * Setup animations for skill bars
   * @param {HTMLElement} container - The DOM container
   * @param {Array} skillsData - Array of skill objects
   */
  setupAnimations(container, skillsData) {
    // Use Intersection Observer to detect when skills come into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Animate skill bars when they come into view
          const skillBars = container.querySelectorAll('.skill-progress');
          skillBars.forEach((bar, index) => {
            setTimeout(() => {
              bar.style.width = `${skillsData[index].level}%`;
            }, index * 100); // Stagger animations
          });
          
          // Disconnect observer after animation is triggered
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 }); // Trigger when 20% of element is visible
    
    // Observe the skills container
    observer.observe(container);
  }
};

export { skills };
