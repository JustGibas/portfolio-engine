/**
 * @fileoverview Resource Discovery System
 * 
 * This system is responsible for discovering available resources like pages and projects.
 * It centralizes the logic for scanning directories and loading configuration files.
 * 
 * @module ResourceDiscoverySystem
 * @requires config from ../../config.js
 * 
 * @design Observer Pattern - Notifies listeners when resources are discovered
 */

const ResourceDiscoverySystem = {
  // Available resources (populated by discovery)
  resources: {
    pages: [],
    projects: []
  },

  // Discovery state
  _discoveryPromises: {
    pages: null,
    projects: null
  },

  // Resource registries
  _registries: {
    pages: [
      'about',
      'projects',
      'contact'
    ],
    projects: [
      'Portfolio_Engine',
      'Data_Visualization',
      'AI_Chatbot'
    ]
  },

  /**
   * Initialize the resource discovery system
   * @param {Object} config - Application configuration
   */
  init(config) {
    this.config = config;
    console.info('ResourceDiscoverySystem: Initialized');
  },

  /**
   * Discover all available pages
   * @returns {Promise<Array>} Promise that resolves to discovered pages
   */
  discoverPages() {
    if (this._discoveryPromises.pages) {
      return this._discoveryPromises.pages;
    }

    console.info('ResourceDiscoverySystem: Starting page discovery');
    
    this._discoveryPromises.pages = this._performPageDiscovery().then(pages => {
      this.resources.pages = pages;
      console.info(`ResourceDiscoverySystem: Found ${pages.length} pages`);
      return pages;
    });
    
    return this._discoveryPromises.pages;
  },
  
  /**
   * Discover all available projects
   * @returns {Promise<Array>} Promise that resolves to discovered projects
   */
  discoverProjects() {
    if (this._discoveryPromises.projects) {
      return this._discoveryPromises.projects;
    }

    console.info('ResourceDiscoverySystem: Starting project discovery');
    
    this._discoveryPromises.projects = this._performProjectDiscovery().then(projects => {
      this.resources.projects = projects;
      console.info(`ResourceDiscoverySystem: Found ${projects.length} projects`);
      return projects;
    });
    
    return this._discoveryPromises.projects;
  },

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
              showInNav: true
            });
            console.info(`ResourceDiscoverySystem: Found page module: ${pageName}`);
          }
        })
      );
    }
    
    await Promise.all(promises);
    return pages;
  },

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
  },

  /**
   * Check if a page module exists
   * @private
   * @param {string} pageName - Name of the page to check
   * @returns {Promise<boolean>} Promise that resolves to true if page exists
   */
  async _checkPageExists(pageName) {
    try {
      // First try the new structure with subdirectories
      await import(`../../pages/${pageName}/${pageName}.js`);
      return true;
    } catch (error) {
      // If that fails, try the legacy flat structure
      try {
        await import(`../../pages/${pageName}.js`);
        return true;
      } catch (legacyError) {
        console.warn(`ResourceDiscoverySystem: Page '${pageName}' not found in either location`);
        return false;
      }
    }
  },

  /**
   * Load data for a specific project
   * @private
   * @param {string} projectDirName - Project directory name
   * @returns {Promise<Object|null>} Promise resolving to project data or null if not found
   */
  async _loadProjectData(projectDirName) {
    try {
      // Try to load project.js file if it exists
      const projectPath = `../../pages/projects/${projectDirName}/project.js`;
      
      try {
        // First see if there's a project.js file with configuration
        const projectModule = await import(projectPath);
        const projectConfig = projectModule.default || projectModule.projectConfig || {};
        
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
        console.warn(`ResourceDiscoverySystem: No project.js found for ${projectDirName}, using defaults`);
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
        console.warn(`ResourceDiscoverySystem: No README.md found for ${projectDirName}`);
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
      console.error(`ResourceDiscoverySystem: Failed to load project ${projectDirName}:`, error);
      return null;
    }
  },

  /**
   * Format text as a title (capitalize first letter)
   * @private
   * @param {string} text - Text to format
   * @returns {string} Formatted title
   */
  _formatTitle(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  },

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
  },
  
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
};

export { ResourceDiscoverySystem };
