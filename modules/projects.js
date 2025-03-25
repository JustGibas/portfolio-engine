const projects = {
  init(entity) {
    const container = entity.getComponent('dom').container;
    
    const projectsData = [
      {
        title: 'Portfolio Engine',
        description: 'A modular, game-inspired system that showcases the evolution of a creative technologist.',
        technologies: ['JavaScript', 'ECS Architecture', 'CSS'],
        image: 'assets/images/portfolio-engine.jpg', // Ensure this file exists, else use a fallback.
        link: '#'
      },
      {
        title: 'Interactive Data Visualization',
        description: 'Dynamic visualization of complex datasets using D3.js and WebGL.',
        technologies: ['D3.js', 'WebGL', 'React'],
        image: 'assets/images/data-viz.jpg', // Ensure this file exists
        link: '#'
      },
      {
        title: 'AI-Powered Chatbot',
        description: 'Natural language processing chatbot with machine learning capabilities.',
        technologies: ['Python', 'TensorFlow', 'NLP'],
        image: 'assets/images/chatbot.jpg', // Ensure this file exists
        link: '#'
      }
    ];
    
    let projectsHtml = '';
    projectsData.forEach(project => {
      const techBadges = project.technologies.map(tech => `<span class="tech-badge">${tech}</span>`).join('');
      
      projectsHtml += `
        <div class="project-card">
          <div class="project-image">
            <img src="${project.image || 'assets/images/placeholder.jpg'}" alt="${project.title}">
          </div>
          <div class="project-content">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
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
  }
};

export { projects };
