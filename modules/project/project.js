class ProjectCard {
    constructor(project) {
        this.title = project.title;
        this.description = project.description;
        this.imageUrl = project.imageUrl;
        this.technologies = project.technologies || [];
        this.githubUrl = project.githubUrl;
        this.liveUrl = project.liveUrl;
    }

    createCard() {
        const card = document.createElement('div');
        card.className = 'project-card';
        
        card.innerHTML = `
            <img src="${this.imageUrl}" alt="${this.title}" class="project-image">
            <div class="project-content">
                <h3 class="project-title">${this.title}</h3>
                <p class="project-description">${this.description}</p>
                <div class="project-technologies">
                    ${this.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                <div class="project-links">
                    ${this.githubUrl ? `<a href="${this.githubUrl}" target="_blank" class="github-link">GitHub</a>` : ''}
                    ${this.liveUrl ? `<a href="${this.liveUrl}" target="_blank" class="live-link">Live Demo</a>` : ''}
                </div>
            </div>
        `;

        return card;
    }
}

export default ProjectCard;