/**
 * @fileoverview Extended Header Module.
 * Extends the base header with additional elements.
 * @module headerExtended
 * @requires headerBase from ./header-base.js
 */
import { headerBase } from './header-base.js';

const headerExtended = {
  ...headerBase,
  init(container) {
    headerBase.init(container);
    container.innerHTML += `<button>Extra</button>`;
  }
};

export { headerExtended };
