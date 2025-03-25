import { System } from '../engine/system.js';

class NavSystem extends System {
  constructor() {
    super();
    this.currentRoute = null;
  }

  init(entities) {
    this.entities = entities.filter(entity => entity.hasComponent('route'));
    
    // Listen for navigation events
    document.addEventListener('navigation', (event) => {
      this.navigateTo(event.detail.route);
    });
    
    // Initialize with default route or from URL hash
    this.initializeRoute();
  }

  initializeRoute() {
    let route = window.location.hash.slice(1);
    if (!route || !this.isValidRoute(route)) {
      route = 'about'; // Default route
    }
    this.navigateTo(route);
  }

  isValidRoute(route) {
    return this.entities.some(entity => 
      entity.getComponent('route').path === route
    );
  }

  navigateTo(route) {
    if (route === this.currentRoute) return;
    
    // Update URL hash
    window.location.hash = route;
    this.currentRoute = route;
    
    // Update route components and view visibility
    this.entities.forEach(entity => {
      const routeComponent = entity.getComponent('route');
      const isActive = routeComponent.path === route;
      routeComponent.active = isActive;
      
      if (entity.hasComponent('renderable')) {
        entity.getComponent('renderable').visible = isActive;
      }
      
      // Get the DOM element and update its visibility
      if (entity.hasComponent('dom')) {
        const element = entity.getComponent('dom').container;
        element.style.display = isActive ? 'block' : 'none';
      }
    });
    
    // Highlight active navigation link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      if (link.getAttribute('data-route') === route) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  update() {
    // Most functionality is event-driven
    // This method could be used for animations or transitions
  }
}

export { NavSystem };
