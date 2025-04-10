import { Component, ComponentSchema } from '../core/component.js';

/**
 * Schema for Render component
 */
const renderSchema = new ComponentSchema({
  properties: {
    visible: { type: 'boolean', default: true },
    layer: { type: 'number', default: 0 },
    renderType: { type: 'string', default: 'sprite' }, // sprite, text, shape, etc.
    sprite: { type: ['string', 'null'], default: null },
    color: { type: 'string', default: '#ffffff' },
    opacity: { type: 'number', default: 1.0 },
    zIndex: { type: 'number', default: 0 }
  }
});

/**
 * RenderComponent - Controls how an entity is rendered
 * @extends Component
 */
class RenderComponent extends Component {
  constructor(data = {}) {
    super({
      ...renderSchema.defaults,
      ...data
    });
  }
  
  /**
   * Set visibility
   * @param {boolean} visible - Whether the entity is visible
   */
  setVisible(visible) {
    this.visible = visible;
  }
  
  /**
   * Set render layer
   * @param {number} layer - Layer number
   */
  setLayer(layer) {
    this.layer = layer;
  }
}

export { RenderComponent, renderSchema };