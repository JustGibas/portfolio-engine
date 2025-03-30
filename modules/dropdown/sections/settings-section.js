/**
 * @fileoverview Settings Dropdown Section
 * 
 * A dropdown section plugin that provides UI for changing application settings,
 * including theme toggle and notification preferences.
 * 
 * Conforms to the dropdown section plugin interface by providing a render() method
 * that returns an HTMLElement.
 */
import config from '../../../config.js';

const settingsSection = {
	/**
	 * Render the settings section.
	 * @returns {HTMLElement} The settings section element.
	 */
	render() {
		const container = document.createElement('div');
		container.className = 'dropdown-section';
		container.innerHTML = `
      <h3 class="dropdown-section-title">Settings</h3>
      <div class="dropdown-item">
        <span class="dropdown-item-label">Dark Mode</span>
        <label class="toggle-switch">
          <input type="checkbox" id="dark-mode-toggle">
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="dropdown-item">
        <span class="dropdown-item-label">Notifications</span>
        <label class="toggle-switch">
          <input type="checkbox" checked>
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="dropdown-item">
        <span class="dropdown-item-label">Developer Mode</span>
        <label class="toggle-switch">
          <input type="checkbox" id="dev-mode-toggle">
          <span class="toggle-slider"></span>
        </label>
      </div>
    `;
		// Set up dark mode toggle functionality
		setTimeout(() => {
			const darkModeToggle = container.querySelector('#dark-mode-toggle');
			if (darkModeToggle) {
				darkModeToggle.checked = localStorage.getItem('portfolioTheme') === 'dark';
				darkModeToggle.addEventListener('change', (e) => {
					const theme = e.target.checked ? 'dark' : 'light';
					document.documentElement.setAttribute('data-theme', theme);
					localStorage.setItem('portfolioTheme', theme);
				});
			}
			
			// Set up dev mode toggle functionality
			const devModeToggle = container.querySelector('#dev-mode-toggle');
			if (devModeToggle) {
				// Initialize based on current dev mode state
				devModeToggle.checked = localStorage.getItem('devMode') === 'true';
				
				// Update state when toggled
				devModeToggle.addEventListener('change', (e) => {
					const isDevMode = e.target.checked;
					localStorage.setItem('devMode', isDevMode);
					config.advanced.debug = isDevMode;
					
					// Emit event to notify systems of dev mode change
					const event = new CustomEvent('devmode:change', { 
						detail: { enabled: isDevMode } 
					});
					document.dispatchEvent(event);
					
					// No reload - just show/hide DevTools dynamically
					// If enabling dev mode, navigate to DevTools page automatically
					if (isDevMode && !window.location.hash.includes('devtools')) {
						// Apply a small timeout to allow systems to update
						setTimeout(() => {
							window.location.hash = 'devtools';
						}, 50);
					}
				});
			}
		}, 0);
		return container;
	}
};

export { settingsSection };
