import { System } from '../core/system.js';
import { cssLoader } from '../modules/css-loader.js';

/**
 * CSSSystem - Handles CSS loading and dynamic style manipulation
 * @extends System
 */
class CSSSystem extends System {
  constructor(world) {
    super(world);
    this.name = 'CSSSystem';
    this.cssLoader = cssLoader;
    this.componentsQuery = ['cssStyle', 'animation']; 
    this.animatingEntities = new Map(); // Track entities with active animations
  }

  init() {
    // Register for entity events
    this.world.eventBus.subscribe('entity:created', this.onEntityCreated.bind(this));
    this.world.eventBus.subscribe('entity:destroyed', this.onEntityDestroyed.bind(this));
    this.world.eventBus.subscribe('component:added', this.onComponentAdded.bind(this));
    this.world.eventBus.subscribe('component:removed', this.onComponentRemoved.bind(this));
    
    console.log(`${this.name}: Initialized`);
    return this;
  }
  
  update(dt) {
    // Update CSS-based animations
    this.animatingEntities.forEach((animData, entityId) => {
      const entity = this.world.entityManager.getEntity(entityId);
      if (!entity) return;
      
      const dom = entity.getComponent('dom') || entity.getComponent('domElement');
      const animation = entity.getComponent('animation');
      
      if (dom && animation && dom.element) {
        this.updateElementAnimation(dom.element, animation, dt);
      }
    });
  }
  
  updateElementAnimation(element, animation, dt) {
    // Handle different animation types
    switch (animation.type) {
      case 'tween':
        this.updateTween(element, animation, dt);
        break;
      case 'keyframe':
        this.updateKeyframeAnimation(element, animation);
        break;
      case 'physics':
        this.updatePhysicsAnimation(element, animation, dt);
        break;
    }
  }
  
  updateTween(element, animation, dt) {
    // Update animation progress
    animation.progress += dt * animation.speed;
    
    if (animation.progress >= animation.duration) {
      // Handle animation completion
      if (animation.loop) {
        animation.progress = 0;
      } else {
        animation.progress = animation.duration;
        animation.completed = true;
      }
    }
    
    // Calculate current value based on easing function
    const progress = this.applyEasing(animation.progress / animation.duration, animation.easing);
    
    // Apply to CSS properties
    animation.properties.forEach(prop => {
      const startValue = prop.from;
      const endValue = prop.to;
      const currentValue = startValue + (endValue - startValue) * progress;
      
      element.style[prop.name] = `${currentValue}${prop.unit || ''}`;
    });
  }
  
  updateKeyframeAnimation(element, animation) {
    // For CSS keyframe animations, we just need to add/remove the class
    if (!animation.applied) {
      element.classList.add(animation.className);
      animation.applied = true;
    }
    
    // Handle animation events if needed
    if (!animation.eventListenersAdded) {
      element.addEventListener('animationend', () => {
        this.world.eventBus.emit('animation:completed', { 
          entityId: animation.entityId,
          animationName: animation.name
        });
        
        if (!animation.loop) {
          element.classList.remove(animation.className);
        }
      });
      animation.eventListenersAdded = true;
    }
  }
  
  updatePhysicsAnimation(element, animation, dt) {
    // Map physics component values to CSS transforms
    const physics = animation.entity.getComponent('physics');
    if (!physics) return;
    
    // Apply position
    if (physics.position) {
      element.style.transform = `translate(${physics.position.x}px, ${physics.position.y}px)`;
    }
    
    // Apply rotation
    if (physics.rotation) {
      element.style.transform += ` rotate(${physics.rotation}rad)`;
    }
  }
  
  applyEasing(t, easingType = 'linear') {
    // Easing functions
    switch (easingType) {
      case 'linear': return t;
      case 'easeIn': return t * t;
      case 'easeOut': return t * (2 - t);
      case 'easeInOut': return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      // Add more easing functions as needed
      default: return t;
    }
  }

  onEntityCreated(event) {
    const entity = this.world.entityManager.getEntity(event.entityId);
    if (!entity) return;
    
    // Handle CSS loading
    const cssComponent = entity.getComponent('cssStyle');
    if (cssComponent) {
      this.loadEntityCSS(entity, cssComponent);
    }
    
    // Handle animation setup
    const animation = entity.getComponent('animation');
    if (animation) {
      this.setupAnimation(entity, animation);
    }
  }
  
  onComponentAdded(event) {
    const { entityId, componentType } = event;
    const entity = this.world.entityManager.getEntity(entityId);
    if (!entity) return;
    
    if (componentType === 'cssStyle') {
      this.loadEntityCSS(entity, entity.getComponent('cssStyle'));
    } else if (componentType === 'animation') {
      this.setupAnimation(entity, entity.getComponent('animation'));
    }
  }
  
  loadEntityCSS(entity, cssComponent) {
    if (cssComponent.file) {
      this.cssLoader.loadCSS(cssComponent.file);
    } else if (cssComponent.moduleUrl) {
      this.cssLoader.loadLocalCSS(cssComponent.moduleUrl);
    } else if (cssComponent.styles) {
      this.applyInlineStyles(entity, cssComponent.styles);
    }
  }
  
  applyInlineStyles(entity, styles) {
    const dom = entity.getComponent('dom') || entity.getComponent('domElement');
    if (!dom || !dom.element) return;
    
    // Apply style object to element
    Object.entries(styles).forEach(([property, value]) => {
      dom.element.style[property] = value;
    });
  }
  
  setupAnimation(entity, animation) {
    // Store animation data for update loop
    animation.entityId = entity.id;
    animation.entity = entity;
    animation.progress = 0;
    animation.completed = false;
    
    this.animatingEntities.set(entity.id, animation);
  }
  
  onComponentRemoved(event) {
    const { entityId, componentType } = event;
    
    if (componentType === 'animation') {
      this.animatingEntities.delete(entityId);
    }
  }

  onEntityDestroyed(event) {
    this.animatingEntities.delete(event.entityId);
  }
}

export { CSSSystem };