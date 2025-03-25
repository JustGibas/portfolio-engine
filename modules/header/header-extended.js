import { headerBase } from './header-base.js';

const headerExtended = {
  ...headerBase,
  init(container) {
    headerBase.init(container);
    container.innerHTML += `<button>Extra</button>`;
  }
};

export { headerExtended };
