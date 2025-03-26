/**
 * @fileoverview CSS Loader
 * 
 * This module provides utilities for dynamically loading component CSS files.
 * It handles caching loaded styles and preventing duplicate loading.
 * 
 * @module cssLoader
 */

const cssLoader = {
  /**
   * Cache of loaded CSS files to prevent duplicates
   * @private
   */
  _loadedFiles: {},
  
  /**
   * Cache of failed CSS load attempts to prevent repeated attempts
   * @private
   */
  _failedFiles: {},
  
  /**
   * Base paths to search for CSS files
   * @private
   */
  _basePaths: [
    './',
    './pages/',
    './modules/'
  ],

  /**
   * Load a CSS file for a component
   * @param {string} path - Path to the CSS file
   * @returns {Promise<boolean>} Promise that resolves when CSS is loaded
   */
  loadComponentCSS(path) {
    // Skip if already loaded
    if (this._loadedFiles[path]) {
      return Promise.resolve(true);
    }
    
    // Skip if previously failed (prevent repeat attempts)
    if (this._failedFiles[path]) {
      return Promise.reject(new Error(`Previously failed to load CSS: ${path}`));
    }
    
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = path;
      
      link.onload = () => {
        this._loadedFiles[path] = true;
        console.info(`CSS Loader: Loaded ${path}`);
        resolve(true);
      };
      
      link.onerror = () => {
        this._failedFiles[path] = true;
        console.error(`CSS Loader: Failed to load ${path}`);
        reject(new Error(`Failed to load CSS file: ${path}`));
      };
      
      document.head.appendChild(link);
    });
  },
  
  /**
   * Reset the CSS loading cache
   * This can be used for debugging or to force reload styles
   */
  resetCache() {
    this._loadedFiles = {};
    this._failedFiles = {};
    console.info('CSS Loader: Cache reset');
  },
  
  /**
   * Load CSS for a module using a consistent naming convention
   * @param {string} modulePath - Path to the JS module
   * @returns {Promise<boolean>} Promise that resolves when CSS is loaded
   */
  loadModuleCSS(modulePath) {
    // Convert JS path to CSS path (e.g., pages/about.js → pages/about.css)
    const cssPath = modulePath.replace(/\.js$/, '.css');
    return this.loadComponentCSS(cssPath);
  },
  
  /**
   * Load CSS that's in the same directory as a JS module
   * @param {string} jsFilePath - Full path to the JS module
   * @param {string} [cssFilename] - Optional CSS filename (defaults to same name as JS file)
   * @returns {Promise<boolean>} Promise that resolves when CSS is loaded
   */
  loadLocalCSS(jsFilePath, cssFilename) {
    // Get directory path and filename from the JS path
    const lastSlash = jsFilePath.lastIndexOf('/');
    const directory = jsFilePath.substring(0, lastSlash + 1);
    
    // If no specific CSS filename is provided, derive it from the JS filename
    if (!cssFilename) {
      const jsFilename = jsFilePath.substring(lastSlash + 1);
      cssFilename = jsFilename.replace(/\.js$/, '.css');
    }
    
    // Combine directory and CSS filename
    const cssPath = directory + cssFilename;
    
    return this.loadComponentCSS(cssPath);
  },
  
  /**
   * Get a normalized list of possible CSS paths based on a module identifier
   * @param {string} moduleIdentifier - Module name or path
   * @returns {string[]} List of possible paths to try
   * @private
   */
  _getPossiblePaths(moduleIdentifier) {
    // Extract just the module name without path or extension
    const moduleName = moduleIdentifier.split('/').pop().replace(/\.(js|css)$/, '');
    
    // Generate all possible combinations
    const paths = [];
    
    // Specific full paths first
    if (moduleIdentifier.endsWith('.css')) {
      paths.push(moduleIdentifier);
    }
    
    // Direct paths to page/module structure
    paths.push(`./pages/${moduleName}/${moduleName}.css`);
    paths.push(`./modules/${moduleName}/${moduleName}.css`);
    
    // Legacy flat structure
    paths.push(`./pages/${moduleName}.css`);
    paths.push(`./modules/${moduleName}.css`);
    
    // Module directory structure variations
    if (moduleIdentifier.includes('/')) {
      const parts = moduleIdentifier.split('/');
      const lastPart = parts[parts.length - 1];
      
      // Handle a module in a subdirectory
      paths.push(`${moduleIdentifier}/${lastPart}.css`);
      paths.push(`${moduleIdentifier}.css`);
    }
    
    return paths.filter((path, index, self) => self.indexOf(path) === index); // Remove duplicates
  },
  
  /**
   * Attempt to load CSS from multiple possible locations
   * @param {string} moduleIdentifier - Module name or path
   * @returns {Promise<boolean>} Promise that resolves when CSS is loaded from any location
   */
  tryLoadCSS(moduleIdentifier) {
    const possiblePaths = this._getPossiblePaths(moduleIdentifier);
    
    // Try each path in order until one succeeds
    return this._tryPathsSequentially(possiblePaths);
  },
  
  /**
   * Try loading CSS from a sequence of paths until one succeeds
   * @private
   * @param {string[]} paths - Array of paths to try
   * @returns {Promise<boolean>} Promise that resolves when any path succeeds
   */
  _tryPathsSequentially(paths) {
    if (paths.length === 0) {
      return Promise.reject(new Error("No CSS paths to try"));
    }
    
    // Try the first path
    return this.loadComponentCSS(paths[0])
      .catch(error => {
        console.warn(`CSS Loader: Failed to load ${paths[0]}, trying next path`);
        // If it fails, try the next path
        if (paths.length > 1) {
          return this._tryPathsSequentially(paths.slice(1));
        }
        // If all paths fail, reject but with a cleaner error message
        return Promise.reject(new Error(`Unable to load CSS for any of these paths: ${paths.join(', ')}`));
      });
  }
};

export { cssLoader };
