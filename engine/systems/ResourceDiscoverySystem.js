/**
 * @fileoverview Resource Discovery System
 * 
 * Handles dynamic discovery of pages and projects.
 */
import { System } from '../core/system.js';
import config from '../../config.js';

/**
 * Resource Discovery System implementation
 */
class ResourceDiscoverySystem extends System {
  /**
   * Create a new ResourceDiscoverySystem
   */
  constructor() {
    super();
    
    // Available resources (populated by discovery)
    this.resources = {
      pages: [],
      projects: []
    };

    // Discovery state
    this._discoveryPromises = {
      pages: null,
      projects: null
    };

    // Default registries (will be overridden by config in init if available)
    this._registries = {
      pages: [
        'devtools'
      ],

      projects: [
        'Portfolio_Engine'
      ]
    };

    // Direct call flag
    this._directCall = false;
    
    // Lazy loading state
    this._lazyState = {
      pagesMetadataLoaded: false,
      pagesFullyLoaded: false,
      projectsMetadataLoaded: false,
      projectsFullyLoaded: false
    };
  }
  
  /**
   * Initialize the system
   * @param {World} world - The world instance
   * @param {Object} config - Application configuration
   */
  init(world, config) {
    super.init(world, config);
    this.config = config;
    
    // Override registries with config values if available
    if (config.resources) {
      if (config.resources.pages) {
        // Start with base pages from config
        this._registries.pages = [...config.resources.pages];
        
        // Add devtools conditionally based on dev mode or localStorage
        const isDevMode = localStorage.getItem('devMode') === 'true' || 
                         (config.environment === 'development' && config.advanced?.debug);
        
        if (isDevMode && !this._registries.pages.includes('devtools')) {
          this._registries.pages.push('devtools');
        } else if (!isDevMode && this._registries.pages.includes('devtools')) {
          this._registries.pages = this._registries.pages.filter(page => page !== 'devtools');
        }
        
        console.info(`ResourceDiscoverySystem: Using ${this._registries.pages.length} pages from config`);
      }
      
      if (config.resources.projects) {
        this._registries.projects = config.resources.projects;
        console.info(`ResourceDiscoverySystem: Using ${this._registries.projects.length} projects from config`);
      }
    }
    
    // Listen for dev mode changes
    document.addEventListener('devmode:change', (event) => {
      const isDevMode = event.detail.enabled;
      
      // Update pages registry based on dev mode
      if (isDevMode && !this._registries.pages.includes('devtools')) {
        this._registries.pages.push('devtools');
        
        // Clear discovery cache to force rediscovery with updated registries
        this._discoveryPromises.pages = null;
        
        // Force page rediscovery to update the navbar
        this.discoverPages().then(pages => {
          // Emit event to notify systems (like navbar) to update
          const updateEvent = new CustomEvent('pages:updated', {
            detail: { pages }
          });
          document.dispatchEvent(updateEvent);
          console.info('ResourceDiscoverySystem: Added devtools page due to dev mode activation');
        });
      } else if (!isDevMode && this._registries.pages.includes('devtools')) {
        this._registries.pages = this._registries.pages.filter(page => page !== 'devtools');
        
        // Clear discovery cache to force rediscovery with updated registries
        this._discoveryPromises.pages = null;
        
        // Force page rediscovery to update the navbar
        this.discoverPages().then(pages => {
          const updateEvent = new CustomEvent('pages:updated', {
            detail: { pages }
          });
          document.dispatchEvent(updateEvent);
          console.info('ResourceDiscoverySystem: Removed devtools page due to dev mode deactivation');
        });
      }
    });
    
    // Register with scheduler if available
    if (this.world.getScheduler) {
      const scheduler = this.world.getScheduler();
      const lateGroup = scheduler.getGroup('late') || scheduler.createGroup('late', 10);
      lateGroup.addSystem(this);
    }
    
    // Load page metadata immediately but defer full content loading
    this._loadPagesMetadata();
    
    console.info('ResourceDiscoverySystem: Initialized');
  }
  
  /**
   * Update method - Not used for this system
   */
  update() {
    // This system uses promises for discovery instead of frame updates
  }

  /**
   * Load only page metadata (names, routes, titles) without full content
   * @returns {Promise<Array>} Promise resolving to basic page information
   */
  async _loadPagesMetadata() {
    if (this._lazyState.pagesMetadataLoaded) {
      return this.resources.pages;
    }
    
    console.info('ResourceDiscoverySystem: Loading page metadata');
    
    // Create basic page information from registry without loading modules
    const pages = this._registries.pages.map(pageName => ({
      id: pageName,
      title: this._formatTitle(pageName),
      route: pageName,
      module: pageName,
      showInNav: true,
      loaded: false
    }));
    
    this.resources.pages = pages;
    this._lazyState.pagesMetadataLoaded = true;
    
    return pages;
  }

  /**
   * Get page metadata without triggering full content discovery
   * @returns {Promise<Array>} Promise resolving to basic page information
   */
  async getPageMetadata() {
    return this._loadPagesMetadata();
  }

  /**
   * Discover all available pages
   * @returns {Promise<Array>} Promise that resolves to discovered pages
   */
  async discoverPages() {
    // If we only need metadata and it's already loaded, return it
    if (this._lazyState.pagesMetadataLoaded && !this._directCall) {
      return this.resources.pages;
    }
    
    // Always return a fresh promise if directly called from page module
    if (this._directCall) {
      this._discoveryPromises.pages = null;
    }
    
    this._directCall = true;
    
    if (this._discoveryPromises.pages) {
      return this._discoveryPromises.pages;
    }

    console.info('ResourceDiscoverySystem: Starting full page discovery');
    
    this._discoveryPromises.pages = this._performPageDiscovery()
      .then(pages => {
        this.resources.pages = pages;
        this._lazyState.pagesFullyLoaded = true;
        console.info(`ResourceDiscoverySystem: Found ${pages.length} pages`);
        return pages;
      })
      .catch(error => {
        console.error('ResourceDiscoverySystem: Error in page discovery:', error);
        // Return default pages on error
        const fallbackPages = this._registries.pages.map(pageName => ({
          id: pageName,
          title: this._formatTitle(pageName),
          route: pageName,
          module: pageName,
          showInNav: true,
          loaded: false
        }));
        this.resources.pages = fallbackPages;
        return fallbackPages;
      });
    
    return this._discoveryPromises.pages;
  }
  
  /**
   * Load a specific page by route
   * @param {string} route - The route name to load
   * @returns {Promise<Object>} Promise resolving to page data
   */
  async loadPage(route) {
    console.info(`ResourceDiscoverySystem: Loading specific page: ${route}`);
    
    // Check if page exists first using a more efficient method
    try {
      const pageExists = await this._checkPageExists(route);
      
      if (!pageExists) {
        console.warn(`ResourceDiscoverySystem: Page '${route}' not found`);
        return null;
      }
      
      // Create and return page data
      const pageData = {
        id: route,
        title: this._formatTitle(route),
        route: route,
        module: route,
        showInNav: true,
        loaded: true
      };
      
      // Update metadata if we have it already
      if (this._lazyState.pagesMetadataLoaded) {
        const existingPageIndex = this.resources.pages.findIndex(p => p.id === route);
        if (existingPageIndex >= 0) {
          this.resources.pages[existingPageIndex] = pageData;
        } else {
          this.resources.pages.push(pageData);
        }
      }
      
      return pageData;
    } catch (error) {
      console.error(`ResourceDiscoverySystem: Error loading page ${route}:`, error);
      return null;
    }
  }
  
  /**
   * Discover all available projects
   * @returns {Promise<Array>} Promise that resolves to discovered projects
   */
  async discoverProjects() {
    if (this._discoveryPromises.projects) {
      return this._discoveryPromises.projects;
    }

    console.info('ResourceDiscoverySystem: Starting project discovery');
    
    this._discoveryPromises.projects = this._performProjectDiscovery().then(projects => {
      this.resources.projects = projects;
      this._lazyState.projectsFullyLoaded = true;
      console.info(`ResourceDiscoverySystem: Found ${projects.length} projects`);
      return projects;
    });
    
    return this._discoveryPromises.projects;
  }

  /**
   * Get project metadata without triggering full content discovery
   * @returns {Array} Basic project information
   */
  getProjectMetadata() {
    // If we haven't loaded any project data yet, create minimal metadata
    if (!this._lazyState.projectsMetadataLoaded && !this._lazyState.projectsFullyLoaded) {
      const basicProjects = this._registries.projects.map(projectName => ({
        id: projectName,
        title: this._formatProjectTitle(projectName),
        description: `Loading ${this._formatProjectTitle(projectName)}...`,
        link: `#projects/${projectName}`,
        loaded: false
      }));
      
      this.resources.projects = basicProjects;
      this._lazyState.projectsMetadataLoaded = true;
      return basicProjects;
    }
    
    return this.resources.projects;
  }

  /**
   * Perform the page discovery process
   * @private
   * @returns {Promise<Array>} Promise that resolves to discovered pages
   */
  async _performPageDiscovery() {
    const pages = [];
    const promises = [];
    
    for (const pageName of this._registries.pages) {
      promises.push(
        this._checkPageExists(pageName).then(exists => {
          if (exists) {
            // Create a section config object for this page
            pages.push({
              id: pageName,
              title: this._formatTitle(pageName),
              route: pageName,
              module: pageName,
              showInNav: true,
              loaded: true
            });
            console.info(`ResourceDiscoverySystem: Found page module: ${pageName}`);
          }
        })
      );
    }
    
    await Promise.all(promises);
    return pages;
  }

  /**
   * Perform the project discovery process
   * @private
   * @returns {Promise<Array>} Promise that resolves to discovered projects
   */
  async _performProjectDiscovery() {
    const projects = [];
    const promises = [];
    
    for (const projectName of this._registries.projects) {
      promises.push(
        this._loadProjectData(projectName).then(projectData => {
          if (projectData) {
            projects.push(projectData);
            console.info(`ResourceDiscoverySystem: Found project: ${projectData.title}`);
          }
        }).catch(error => {
          console.warn(`ResourceDiscoverySystem: Failed to load project ${projectName}:`, error.message);
        })
      );
    }
    
    await Promise.all(promises);
    return projects;
  }

  /**
   * Check if a page module exists
   * @private
   * @param {string} pageName - Name of the page to check
   * @returns {Promise<boolean>} Promise that resolves to true if page exists
   */
  async _checkPageExists(pageName) {
    // Use a more efficient method first - just check if a file exists
    // without trying to import it, which is expensive
    const possiblePaths = [
      `../../pages/${pageName}/${pageName}.js`,
      `../../pages/${pageName}.js`
    ];
    
    // First try checking with fetch HEAD requests which are lighter
    // than import() for just checking existence
    for (const path of possiblePaths) {
      try {
        // Convert relative path to absolute URL for fetch
        const baseUrl = new URL(document.baseURI);
        const absolutePath = new URL(path, baseUrl).href;
        
        const response = await fetch(absolutePath, { method: 'HEAD' });
        if (response.ok) {
          console.info(`ResourceDiscoverySystem: Found page at ${path} (HEAD check)`);
          return true;
        }
      } catch (error) {
        // Ignore fetch errors and try the next method
        continue;
      }
    }
    
    // Fall back to import() as a last resort
    for (const path of possiblePaths) {
      try {
        await import(path);
        console.info(`ResourceDiscoverySystem: Found page at ${path}`);
        return true;
      } catch (error) {
        // Continue to next path
        continue;
      }
    }
    
    console.warn(`ResourceDiscoverySystem: Page '${pageName}' not found in any location`);
    // Return true anyway to include default pages in navigation
    return true;
  }

  /**
   * Load data for a specific project
   * @private
   * @param {string} projectDirName - Project directory name
   * @returns {Promise<Object|null>} Promise resolving to project data or null if not found
   */
  async _loadProjectData(projectDirName) {
    try {
      // Check if directory exists first before trying to load files
      const directoryExists = await this._checkDirectoryExists(projectDirName);
      if (!directoryExists) {
        console.info(`ResourceDiscoverySystem: Project directory ${projectDirName} doesn't exist, using default data`);
        return this._createDefaultProjectData(projectDirName);
      }
      
      // Try to load project.js file if it exists
      const projectPath = `../../pages/projects/${projectDirName}/project.js`;
      let projectConfig = {};
      
      try {
        // First see if there's a project.js file with configuration
        const projectModule = await import(projectPath);
        projectConfig = projectModule.default || projectModule.projectConfig || {};
        
        // If we have a project config, use it
        if (Object.keys(projectConfig).length > 0) {
          console.info(`ResourceDiscoverySystem: Loaded project config from ${projectPath}`);
          
          // Set defaults for missing properties
          return {
            id: projectDirName,
            title: projectConfig.title || this._formatProjectTitle(projectDirName),
            description: projectConfig.description || '',
            technologies: projectConfig.technologies || [],
            image: projectConfig.image || `assets/images/${projectDirName.toLowerCase()}.jpg`,
            link: projectConfig.link || `#projects/${projectDirName}`,
            readme: projectConfig.readme || null
          };
        }
      } catch (err) {
        console.info(`ResourceDiscoverySystem: No project.js found for ${projectDirName}, using defaults`);
      }
      
      // Try to load README.md for project description
      let readme = null;
      try {
        const readmePath = `../../pages/projects/${projectDirName}/README.md`;
        const readmeResponse = await fetch(readmePath);
        if (readmeResponse.ok) {
          readme = await readmeResponse.text();
        }
      } catch (readmeErr) {
        console.info(`ResourceDiscoverySystem: No README.md found for ${projectDirName}`);
      }
      
      // Create project data with defaults
      return {
        id: projectDirName,
        title: this._formatProjectTitle(projectDirName),
        description: readme ? readme.split('\n')[0] : `Project ${projectDirName}`,
        technologies: [],
        image: `assets/images/${projectDirName.toLowerCase()}.jpg`,
        link: `#projects/${projectDirName}`,
        readme: readme
      };
    } catch (error) {
      console.warn(`ResourceDiscoverySystem: Failed to load project ${projectDirName}:`, error.message);
      return this._createDefaultProjectData(projectDirName);
    }
  }

  /**
   * Check if a directory exists using HEAD request
   * @private
   * @param {string} projectDirName - Project directory name
   * @returns {Promise<boolean>} Promise resolving to true if directory exists
   */
  async _checkDirectoryExists(projectDirName) {
    try {
      // Create a minimal file path to check if the directory exists
      // We use a HEAD request which is more efficient than a full GET
      const checkPath = `../../pages/projects/${projectDirName}/`;
      const response = await fetch(checkPath, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      // If we get a network error or other issue, assume directory doesn't exist
      return false;
    }
  }

  /**
   * Create default project data for a project
   * @private
   * @param {string} projectDirName - Project directory name
   * @returns {Object} Default project data
   */
  _createDefaultProjectData(projectDirName) {
    return {
      id: projectDirName,
      title: this._formatProjectTitle(projectDirName),
      description: `A project focused on ${this._formatProjectTitle(projectDirName)}`,
      technologies: [],
      image: 'assets/images/placeholder-project.jpg',  // Use a guaranteed existing placeholder
      link: `#projects/${projectDirName}`,
      readme: null
    };
  }

  /**
   * Format text as a title (capitalize first letter)
   * @private
   * @param {string} text - Text to format
   * @returns {string} Formatted title
   */
  _formatTitle(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /**
   * Format project name as a title
   * @private
   * @param {string} projectName - Project directory name to format
   * @returns {string} Formatted title
   */
  _formatProjectTitle(projectName) {
    // Replace underscores with spaces and capitalize each word
    return projectName
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Register a new resource type
   * @param {string} type - Resource type (e.g., 'pages', 'projects')
   * @param {string[]} resources - Array of resource names
   */
  registerResources(type, resources) {
    if (!this._registries[type]) {
      this._registries[type] = [];
    }
    
    this._registries[type] = [...this._registries[type], ...resources];
    console.info(`ResourceDiscoverySystem: Registered ${resources.length} ${type}`);
  }
}

// Create a singleton instance for backward compatibility
const resourceDiscoverySystem = new ResourceDiscoverySystem();

export { ResourceDiscoverySystem, resourceDiscoverySystem };
