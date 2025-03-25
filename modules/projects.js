const projects = {
  init(entity) {
    const container = entity.getComponent('dom').container;
    container.innerHTML = `
      <div class="project-card">
        <h2>Project Title</h2>
        <p>Project description goes here.</p>
      </div>
    `;
  }
};

export { projects };
