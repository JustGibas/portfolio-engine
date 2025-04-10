/**
 * @fileoverview Links Dropdown Section
 * 
 * A dropdown section plugin that provides navigation links to related resources
 * like documentation, tools, and user profile.
 * 
 * Conforms to the dropdown section plugin interface by providing a render() method
 * that returns an HTMLElement.
 */

const linksSection = {
	/**
	 * Render the links section.
	 * @returns {HTMLElement} The links section element.
	 */
	render() {
		const container = document.createElement('div');
		container.className = 'dropdown-section';
		container.innerHTML = `
      <h3 class="dropdown-section-title">Links</h3>
      <a href="#" class="dropdown-item">
        <span class="dropdown-item-icon">📄</span>
        <span class="dropdown-item-label">Documentation</span>
      </a>
      <a href="#" class="dropdown-item">
        <span class="dropdown-item-icon">🔧</span>
        <span class="dropdown-item-label">Tools</span>
      </a>
      <a href="#" class="dropdown-item">
        <span class="dropdown-item-icon">👤</span>
        <span class="dropdown-item-label">Profile</span>
      </a>
    `;
		return container;
	}
};

export { linksSection };
