/**
 * @fileoverview Base Header Module.
 * Renders the basic header content.
 * @module headerBase
 */
const headerBase = {
  init(container) {
    container.innerHTML = `
      <div class="header">
        <h1>Welcome to My Portfolio</h1>
      </div>
    `;
  }
};

export { headerBase };
