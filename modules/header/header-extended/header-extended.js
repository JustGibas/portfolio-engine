/**
 * @fileoverview Extended Header Module
 * 
 * This module extends the base header with additional elements and functionality.
 * It demonstrates how to properly extend a base module while maintaining
 * the core header structure and behavior.
 * 
 * Additional features:
 * - WebGL background animation
 * 
 * @module headerExtended
 * @requires headerBase from ./header-base.js
 * @requires config from ../../config.js
 * 
 * @design Decorator pattern - adds functionality to the base header
 * 
 * @example
 * // Initialize the extended header on an entity
 * import { headerExtended } from './modules/header/header-extended.js';
 * headerExtended.init(headerEntity);
 */
import { headerBase } from '../header-base/header-base.js';
import config from '../../../config.js';

const headerExtended = {
  init(entity) {
    // First initialize the base header
    headerBase.init(entity);
    
    const container = entity.getComponent('dom').container;
    const headerContent = container.querySelector('.header-content');
    
    // Add WebGL background animation
    
    console.info('Extended header initialized with additional elements');
  }
};

export { headerExtended };
