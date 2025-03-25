class Footer {
  constructor() {
    this.container = null;
  }

  init(container) {
    this.container = container;
    this.render();
  }

  render() {
    if (this.container) {
      this.container.innerHTML = `
        <footer>
          <p>&copy; 2023 Portfolio Engine. All rights reserved.</p>
        </footer>
      `;
    }
  }
}

export const footer = new Footer();
