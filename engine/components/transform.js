/**
 * Transform Components
 * Contains data structures for position, rotation, scale
 */

// Component type names
export const POSITION = 'position';
export const ROTATION = 'rotation';
export const SCALE = 'scale';
export const TRANSFORM = 'transform';

// Component definitions
export const TransformComponents = {
  // Position component
  [POSITION]: {
    schema: {
      x: { type: 'number', default: 0 },
      y: { type: 'number', default: 0 },
      z: { type: 'number', default: 0 }
    }
  },
  
  // Rotation component
  [ROTATION]: {
    schema: {
      x: { type: 'number', default: 0 },
      y: { type: 'number', default: 0 },
      z: { type: 'number', default: 0 }
    }
  },
  
  // Scale component
  [SCALE]: {
    schema: {
      x: { type: 'number', default: 1 },
      y: { type: 'number', default: 1 },
      z: { type: 'number', default: 1 }
    }
  },
  
  // Transform component (combines position, rotation, scale)
  [TRANSFORM]: {
    schema: {
      position: { 
        type: 'object', 
        default: { x: 0, y: 0, z: 0 } 
      },
      rotation: { 
        type: 'object', 
        default: { x: 0, y: 0, z: 0 } 
      },
      scale: { 
        type: 'object', 
        default: { x: 1, y: 1, z: 1 } 
      }
    }
  }
};
