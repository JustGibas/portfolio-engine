/**
 * @fileoverview System proxy for backward compatibility
 * 
 * This file re-exports the System class from the core directory
 * to maintain backward compatibility with existing code.
 * we need to update so that we dont need this file.
 * 
 */

import { System } from '../core/system.js';

export { System };
