const skills = {
  init(entity) {
    const container = entity.getComponent('dom').container;
    
    const skillsData = [
      { name: 'JavaScript', level: 90 },
      { name: 'HTML/CSS', level: 85 },
      { name: 'React', level: 80 },
      { name: 'Node.js', level: 75 },
      { name: 'Python', level: 70 },
      { name: 'UI/UX Design', level: 65 }
    ];
    
    let skillsHtml = '';
    skillsData.forEach(skill => {
      skillsHtml += `
        <div class="skill-item">
          <div class="skill-info">
            <span class="skill-name">${skill.name}</span>
            <span class="skill-percentage">${skill.level}%</span>
          </div>
          <div class="skill-bar">
            <div class="skill-progress" style="width: ${skill.level}%"></div>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = `
      <h2>My Skills</h2>
      <div class="skills-container">
        ${skillsHtml}
      </div>
    `;
  }
};

export { skills };
