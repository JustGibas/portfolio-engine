/**
 * Simple Navbar implementation
 */
class Navbar {
  constructor(options = {}) {
    this.options = Object.assign({
      container: null,
      items: [
        { text: 'About', route: 'about' },
        { text: 'Projects', route: 'projects' },
        { text: 'Learn', route: 'learn' },
        { text: 'Contact', route: 'contact' }
      ]
    }, options);
    
    this.container = this.options.container;
  }
  
  /**
   * Initialize the navbar
   */
  async init() {
    if (!this.container) {
      console.error('Navbar initialization failed: No container provided');
      return this;
    }
    
    // Create the navigation links
    this._createNavLinks();
    
    return this;
  }
  
  /**
   * Create navigation links
   * @private
   */
  _createNavLinks() {
    // Clear container
    this.container.innerHTML = '';
    
    // Create a link for each nav item
    this.options.items.forEach(item => {
      const link = document.createElement('a');
      link.textContent = item.text;
      link.href = `#${item.route}`;
      link.className = 'nav-link';
      
      // Mark active if current route matches
      const currentRoute = window.location.hash.substring(1) || 'home';
      if (currentRoute === item.route) {
        link.classList.add('active');
      }
      
      this.container.appendChild(link);
    });
    
    // Listen for hash changes to update active state
    window.addEventListener('hashchange', this._updateActiveLink.bind(this));
  }
  
  /**
   * Update the active link based on current route
   * @private
   */
  _updateActiveLink() {
    const currentRoute = window.location.hash.substring(1) || 'home';
    
    // Update all links
    const links = this.container.querySelectorAll('.nav-link');
    links.forEach(link => {
      const route = link.getAttribute('href').substring(1);
      if (route === currentRoute) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}

export { Navbar };