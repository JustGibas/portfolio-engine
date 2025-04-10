import { System } from '../core/system.js';

/**
 * AnimationSystem - Handles all animations including CSS-based ones
 * @extends System
 */
class AnimationSystem extends System {
  constructor(world) {
    super(world);
    this.name = 'AnimationSystem';
    this.componentsQuery = ['animation'];
    this.animations = new Map();
  }
  
  init() {
    this.world.eventBus.subscribe('entity:created', this.onEntityCreated.bind(this));
    this.world.eventBus.subscribe('entity:destroyed', this.onEntityDestroyed.bind(this));
    console.log(`${this.name}: Initialized`);
    return this;
  }
  
  update(dt) {
    // Process all active animations
    this.animations.forEach((animation, entityId) => {
      const entity = this.world.entityManager.getEntity(entityId);
      if (!entity) return;
      
      // Update animation progress
      animation.elapsed += dt;
      const progress = Math.min(animation.elapsed / animation.duration, 1);
      
      // Apply animation based on type
      this.applyAnimation(entity, animation, progress);
      
      // Handle completion
      if (progress >= 1) {
        if (animation.loop) {
          animation.elapsed = 0;
        } else {
          this.animations.delete(entityId);
          this.world.eventBus.emit('animation:completed', {
            entityId,
            animationId: animation.id
          });
        }
      }
    });
  }
  
  applyAnimation(entity, animation, progress) {
    const dom = entity.getComponent('dom') || entity.getComponent('domElement');
    if (!dom || !dom.element) return;
    
    // Get current animation values based on easing
    const easedProgress = this.getEasedValue(progress, animation.easing);
    
    switch (animation.type) {
      case 'css':
        this.applyCSSAnimation(dom.element, animation, easedProgress);
        break;
      case 'sprite':
        this.applySpriteAnimation(dom.element, animation, progress);
        break;
      case 'script':
        // Call custom animation function
        if (typeof animation.callback === 'function') {
          animation.callback(entity, easedProgress, animation);
        }
        break;
    }
  }
  
  applyCSSAnimation(element, animation, progress) {
    animation.properties.forEach(prop => {
      // Calculate value based on from/to
      let value;
      
      if (typeof prop.from === 'number' && typeof prop.to === 'number') {
        // Numeric property
        value = prop.from + (prop.to - prop.from) * progress;
        value = `${value}${prop.unit || ''}`;
      } else if (Array.isArray(prop.values)) {
        // Use discrete keyframes
        const index = Math.floor(progress * (prop.values.length - 1));
        value = prop.values[index];
      }
      
      if (value !== undefined) {
        // Apply to element style
        element.style[prop.name] = value;
      }
    });
  }
  
  applySpriteAnimation(element, animation, progress) {
    // Handle sprite sheet animations
    const frameCount = animation.frames.length;
    const frameIndex = Math.floor(progress * frameCount);
    const frame = animation.frames[Math.min(frameIndex, frameCount - 1)];
    
    element.style.backgroundPosition = `-${frame.x}px -${frame.y}px`;
  }
  
  getEasedValue(t, easingType = 'linear') {
    // Easing functions library
    const easings = {
      linear: t => t,
      easeIn: t => t * t,
      easeOut: t => t * (2 - t),
      easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      bounce: t => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
          return n1 * t * t;
        } else if (t < 2 / d1) {
          return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
          return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
          return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
      }
    };
    
    return (easings[easingType] || easings.linear)(t);
  }
  
  onEntityCreated(event) {
    const entity = this.world.entityManager.getEntity(event.entityId);
    if (!entity) return;
    
    const animation = entity.getComponent('animation');
    if (animation) {
      this.registerAnimation(entity.id, animation);
    }
  }
  
  registerAnimation(entityId, animationComponent) {
    // Set up animation data
    const animation = {
      ...animationComponent,
      id: `anim_${entityId}_${Date.now()}`,
      entityId,
      elapsed: 0,
      active: true
    };
    
    this.animations.set(entityId, animation);
    return animation.id;
  }
  
  onEntityDestroyed(event) {
    this.animations.delete(event.entityId);
  }
  
  // Public API
  startAnimation(entityId, animationData) {
    const entity = this.world.entityManager.getEntity(entityId);
    if (!entity) return null;
    
    // Create animation component if not exists
    let animation = entity.getComponent('animation');
    if (!animation) {
      animation = this.world.componentManager.addComponent(
        entityId, 
        'animation', 
        animationData
      );
    } else {
      // Update existing animation
      Object.assign(animation, animationData);
    }
    
    return this.registerAnimation(entityId, animation);
  }
  
  stopAnimation(entityId) {
    this.animations.delete(entityId);
  }
}

export { AnimationSystem };