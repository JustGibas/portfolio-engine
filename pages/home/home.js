export class HomePage {
  constructor(engine) {
    this.engine = engine;
    this.world = engine.world;
  }

  async initialize() {
    const layoutSystem = this.world.getSystem('layoutSystem');
    const headerId = layoutSystem.createHeaderEntity();
    const mainId = layoutSystem.createMainContentEntity();

    const { createDropdown } = await import('../../engine/elements/dropdown/dropdown.js');
    createDropdown(this.world, {
      parent: document.querySelector('header'),
      label: 'Menu',
      items: [
        { label: 'Home' },
        { label: 'Projects' },
        { label: 'About' },
        { label: 'Contact' }
      ]
    });

    const heroId = this.world.entityManager.createEntity();
    const heroElement = document.createElement('section');
    heroElement.className = 'hero';

    this.world.componentManager.addComponent(heroId, 'domElement', {
      element: heroElement,
      parent: document.querySelector('main')
    });

    this.world.componentManager.addComponent(heroId, 'content', {
      value: `
        <h1>Welcome to My Portfolio</h1>
        <p>I build amazing web experiences</p>
        <button class="cta-button">View Projects</button>
      `,
      needsUpdate: true
    });
  }
}
