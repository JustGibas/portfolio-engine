import { Component, ComponentSchema } from '../core/component.js';

/**
 * Schema for Input component
 */
const inputSchema = new ComponentSchema({
  properties: {
    controllable: { type: 'boolean', default: true },
    inputMap: { type: 'object', default: {} },
    inputState: { type: 'object', default: {} },
    mouseEnabled: { type: 'boolean', default: false },
    touchEnabled: { type: 'boolean', default: false },
    gamepadEnabled: { type: 'boolean', default: false }
  }
});

/**
 * InputComponent - Handles entity input control
 * @extends Component
 */
class InputComponent extends Component {
  constructor(data = {}) {
    super({
      ...inputSchema.defaults,
      ...data
    });
  }
  
  /**
   * Map an input action to a key or button
   * @param {string} action - Action name
   * @param {string|number} key - Key code or button name
   */
  mapInput(action, key) {
    if (!this.inputMap[action]) {
      this.inputMap[action] = [];
    }
    
    this.inputMap[action].push(key);
    this.inputState[action] = false;
  }
  
  /**
   * Check if an action is active
   * @param {string} action - Action to check
   * @returns {boolean} True if the action is active
   */
  isActionActive(action) {
    return !!this.inputState[action];
  }
}

export { InputComponent, inputSchema };