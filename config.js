/**
 * @fileoverview Portfolio Engine Configuration
 * 
 * A simplified configuration file that defines the structure and behavior
 * of the portfolio application. This centralized configuration makes it
 * easy to modify sections, themes, and other settings.
 * 
 * @module config
 */

const config = {
  // Site information
  site: {
    title: "Portfolio Engine",
    author: "Justinas Gibas",
    description: "A dynamic portfolio built with ECS architecture",
    email: "justas.gibas@gmail.com",
    location: "Vilnius, Lithuania",
    socialProfileImage: "https://gravatar.com/avatar/0e19fb6b602b0b3793aa42af81f69ade?size=256"
  },
  
  // Theme settings
  theme: {
    default: 'dark',
    availableThemes: ['light', 'dark', 'neon']
  },
  
  // Navigation and content structure is now dynamically loaded
  // from the pages directory instead of being hardcoded here
  
  // Default settings
  defaults: {
    route: 'about',     // Default route to load
    showLoadingIndicators: true,
    animateTransitions: true
  },
  
  // Advanced settings (for developers)
  advanced: {
    debug: false,       // Enable debug logging
    systemRefreshRate: 60,  // How often systems update in Hz
    enableLazyLoading: true // Whether to lazy load content
  }
};

export default config;
