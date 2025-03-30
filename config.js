/**
 * @fileoverview Portfolio Engine Configuration
 * 
 * This is the central configuration file that controls the entire application behavior.
 * It defines site information, theme settings, default routes, and various application
 * parameters in a unified location.
 * 
 * Configuration is organized into logical sections:
 * - site: Basic information about the website and its owner
 * - theme: Theme selection and available themes
 * - defaults: Default application settings and fallbacks
 * - assets: Asset paths and management configuration
 * - advanced: Developer settings and feature flags
 * 
 * All modules access this configuration through imports, ensuring consistent
 * application behavior and making it easy to update site-wide settings.
 * 
 * @module config
 */

const config = {
  // Site information - Used across the application to maintain consistent branding
  site: {
    title: "Portfolio Engine",
    author: "Justinas Gibas",
    description: "A dynamic portfolio built with ECS architecture",
    email: "justas.gibas@gmail.com",
    location: "Vilnius, Lithuania",
    socialProfileImage: ""
  },
  
  // Theme settings - Controls the visual appearance of the site
  theme: {
    default: 'dark',
    availableThemes: ['light', 'dark', 'neon']
  },
  
  // Navigation and content structure is now dynamically loaded
  // from the pages directory instead of being hardcoded here
  
  // Default settings - Application fallbacks and initial states
  defaults: {
    route: 'projects',     // Default route to load
    showLoadingIndicators: true,
    animateTransitions: true
  },
  
  // Asset configuration - Paths and settings for images and other resources
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
    
    // Profile and user images configuration
    userImages: {
      profile: {
        path: './assets/images/profile.png',  // Updated to the newly uploaded image
        fallback: 'https://via.placeholder.com/300x300?text=Profile+Image',
        alt: 'Profile Picture'
      },
      // You can add more user images here in the future
      banner: {
        path: './assets/images/banner.jpg',
        fallback: './assets/images/default-banner.jpg',
        alt: 'Banner Image'
      }
    },
    
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
  },
  
  // Resource configuration for dynamic content discovery
  resources: {
    // Available pages to display in navigation and load dynamically
    pages: [
      'about',
      'projects',
      'resume',
      'vison',
    ],
    
    // Projects to discover and display on the projects page
    projects: [
      'MyFistWebsite', // (my tesing repo)
      'Portfolio_Engine_Deepdive',
      // Add more projects here when they're ready
      //
    ]
  },
  
  // UI module configuration - Used for dynamic module layout and composition
  uiModules: {
    header: {
      // Navigation is now dynamically loaded from discovered pages
      position: 'top',
      showLogo: true,
      enableDropdown: true
    },
    footer: {
      showCopyright: true,
      showSocialLinks: true
    }
  },
  
  // Advanced settings - Development tools and feature flags
  advanced: {
    // Check localStorage first for dev mode override, otherwise use default
    debug: localStorage.getItem('devMode') === 'true' || false,
    systemRefreshRate: 60,  // How often systems update in Hz
    enableLazyLoading: true, // Whether to lazy load content
    
    // Feature flags for enabling/disabling functionality
    features: {
      experimentalUI: false,
      betaPerformance: true,
      advancedAnalytics: false,
      newAboutPage: false,
      enhancedAnimations: true,
      experimental: false
    },
    
    // Module resolution priorities
    moduleResolution: {
      priorities: [
        'local',     // Check component-local assets first
        'project',   // Then check project-specific assets
        'global'     // Finally fall back to global assets
      ]
    },
    
    // Performance settings
    performance: {
      lazyLoadImages: true,
      throttleEvents: true
    }
  },
  
  // Environment-specific settings
  // Using a browser-safe approach to determine environment
  environment: (function() {
    // Check if we're in development mode by looking for common indicators
    // This is safer than using process.env which isn't available in browsers
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('.local')) {
      return 'development';
    }
    return 'production';
  })()
};

// For backward compatibility (can be removed once all code is updated)
config.assets.profileImage = config.assets.userImages.profile.path;
config.assets.profileImageFallback = config.assets.userImages.profile.fallback;

export default config;
