/**
 * @fileoverview Navigation Module.
 * Renders the main navigation menu and dispatches navigation events.
 * @module navigation
 */
const navigation = {
  init(entity) {
    const container = entity.getComponent('dom').container;
    
    container.innerHTML = `
      <nav class="main-nav">
        <ul>
          <li><a href="#about" class="nav-link" data-route="about">About</a></li>
          <li><a href="#skills" class="nav-link" data-route="skills">Skills</a></li>
          <li><a href="#projects" class="nav-link" data-route="projects">Projects</a></li>
          <li><a href="#contact" class="nav-link" data-route="contact">Contact</a></li>
        </ul>
      </nav>
    `;
    
    // Add click event listeners to handle navigation
    const links = container.querySelectorAll('.nav-link');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        // Custom event for NavSystem to pick up
        const navEvent = new CustomEvent('navigation', {
          detail: { route: link.getAttribute('data-route') }
        });
        document.dispatchEvent(navEvent);
      });
    });
  }
};

export { navigation };
