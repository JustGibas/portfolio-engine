/**
 * @fileoverview Portfolio Engine Configuration
 * 
 * A centralized configuration file that defines the structure, behavior,
 * and asset management of the portfolio application. This unified configuration 
 * makes it easy to modify sections, themes, assets, and other settings.
 * 
 * Previously, asset configuration was in a separate file (asset-config.js),
 * but it has now been integrated here to simplify the configuration structure.
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
  },
  
  // Asset configuration (merged from asset-config.js)
  assets: {
    // Base directories
    globalDir: './assets/',           // For global/shared assets
    projectRelativeDir: './pages/projects/', // Base path for project-specific assets
    
    // Default fallback images (global)
    defaultImage: './assets/images/placeholder.jpg',
    
    // Path structure for project assets (relative to project folder)
    projectStructure: {
      images: 'images/',              // Project images in project_folder/images/
      data: 'data/',                  // Project data in project_folder/data/
      readme: 'README.md'             // Project readme in project_folder/README.md
    },
    
    // Profile images
    profileImage: './pages/about/images/profile.jpg',  // Move to about page context
    profileImageFallback: 'https://via.placeholder.com/300x300?text=Profile+Image',
    
    // Directory structure for global/shared assets
    directories: {
      images: 'images/',
      fonts: 'fonts/',
      data: 'data/',
      audio: 'audio/',
      video: 'video/',
    },
    
    // Asset resolution priority (project-first or global-first)
    resolutionPriority: 'project-first'  // Look in project folders before global assets
  }
};

export default config;
