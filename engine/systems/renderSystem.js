/**
 * @fileoverview Render System for ECS
 * 
 * Handles rendering entities with DOM elements and appearance components.
 */
import { System } from '../core/system.js';

/**
 * RenderSystem - Updates DOM elements based on entity components
 */
class RenderSystem extends System {
  init(world) {
    super.init(world);
    console.info('RenderSystem: Initialized');
    return this;
  }

  update() {
    // Update content for entities with domElement and content components
    const contentEntities = this.world.getEntitiesWith('domElement', 'content');
    for (const entityId of contentEntities) {
      const domElement = this.world.getComponent(entityId, 'domElement');
      const content = this.world.getComponent(entityId, 'content');

      if (content.needsUpdate && domElement.element) {
        domElement.element.innerHTML = content.value;
        content.needsUpdate = false;
      }
    }

    // Update styles for entities with domElement and appearance components
    const appearanceEntities = this.world.getEntitiesWith('domElement', 'appearance');
    for (const entityId of appearanceEntities) {
      const domElement = this.world.getComponent(entityId, 'domElement');
      const appearance = this.world.getComponent(entityId, 'appearance');

      if (appearance.needsUpdate && domElement.element) {
        Object.assign(domElement.element.style, appearance.styles);
        appearance.needsUpdate = false;
      }
    }
  }
}

export { RenderSystem };
