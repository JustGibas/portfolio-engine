/**
 * @fileoverview CSS Loader Utility
 * 
 * This utility module provides functions for dynamically loading 
 * CSS files in a module-specific way.
 */

/**
 * Keeps track of loaded CSS files to avoid duplicates
 * @type {Set<string>}
 */
const loadedCSSFiles = new Set();

/**
 * CSS Loader utility for dynamically loading CSS
 */
const cssLoader = {
  /**
   * Load a CSS file from a URL
   * @param {string} url - URL to the CSS file
   * @returns {Promise<HTMLElement>} Promise resolving to the link element
   */
  async loadCSS(url) {
    // Return early if already loaded
    if (loadedCSSFiles.has(url)) {
      return Promise.resolve(document.querySelector(`link[href="${url}"]`));
    }
    
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      
      // Set up load and error handlers
      link.onload = () => {
        loadedCSSFiles.add(url);
        console.info(`CSS Loader: Loaded ${url}`);
        resolve(link);
      };
      
      link.onerror = () => {
        const error = new Error(`Failed to load CSS: ${url}`);
        console.error(error);
        reject(error);
      };
      
      // Insert link element into head
      document.head.appendChild(link);
    });
  },
  
  /**
   * Load CSS from the same directory as a JavaScript module
   * @param {string} importMetaUrl - import.meta.url from the calling module
   * @returns {Promise<HTMLElement>} Promise resolving to the link element
   */
  async loadLocalCSS(importMetaUrl) {
    try {
      // Handle both direct URL and import.meta.url
      const moduleUrl = typeof importMetaUrl === 'string' 
        ? importMetaUrl 
        : importMetaUrl?.url;
        
      if (!moduleUrl) {
        throw new Error('Invalid URL provided to loadLocalCSS');
      }
      
      // Replace .js extension with .css to get CSS file path
      const cssUrl = moduleUrl.replace(/\.js$/, '.css');
      
      return await this.loadCSS(cssUrl);
    } catch (error) {
      console.warn(`CSS Loader: ${error.message}`);
      return null;
    }
  },

  /**
   * Automatically load CSS file based on JS module URL
   * This method checks for a CSS file with the same name as the JS file 
   * and loads it automatically
   * 
   * @param {string} moduleUrl - import.meta.url from the calling module
   * @returns {Promise} - Promise that resolves when CSS is loaded or fails silently
   */
  autoLoadModuleCSS(moduleUrl) {
    // Convert JS file URL to CSS file URL
    const cssUrl = moduleUrl.replace(/\.js$/, '.css');
    
    // Load CSS without throwing errors (silent fail)
    return this.loadLocalCSS(cssUrl, true)
      .catch(() => {
        // Silently ignore if CSS doesn't exist
        console.debug(`CSS Loader: No CSS file found for ${moduleUrl}`);
        return null;
      });
  }
};

// Create alias for backward compatibility
// This allows both paths to work:
// - engine/utils/css-loader.js
// - engine/css-loader.js
// - engine/systems/css-loader.js
if (typeof window !== 'undefined') {
  window.cssLoader = cssLoader;
}

export { cssLoader };
