/**
 * @fileoverview Routing System.
 * Handles URL hash changes and updates route components accordingly.
 * @module RoutingSystem
 * @requires System from ../engine/system.js
 */
import { System } from '../engine/system.js';

class RoutingSystem extends System {
  constructor() {
    super();
    this.currentRoute = null;
  }

  init() {
    window.addEventListener('hashchange', () => {
      this.handleRouteChange();
    });
    this.handleRouteChange();
  }

  handleRouteChange() {
    const route = window.location.hash.slice(1);
    if (route !== this.currentRoute) {
      this.currentRoute = route;
      this.updateEntities();
    }
  }

  updateEntities() {
    this.entities.forEach(entity => {
      if (entity.hasComponent('route')) {
        const routeComponent = entity.getComponent('route');
        routeComponent.active = (routeComponent.path === this.currentRoute);
      }
    });
  }

  update() {
    // No need to update every frame, routing is event-driven
  }
}

export { RoutingSystem };
