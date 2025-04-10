/**
 * @fileoverview CSS Loader Module
 * 
 * A self-contained module for dynamically loading CSS files.
 * No longer depends on a global config object.
 */
import { Module } from '../core/module.js';

/**
 * Module for handling CSS loading functionality
 */
export class CSSLoaderModule extends Module {
  /**
   * Create a new CSS Loader instance
   * @param {Object} [world=null] - Optional world instance
   * @param {Object} [options={}] - Configuration options
   */
  constructor(world = null, options = {}) {
    super(world, {
      name: 'CSSLoader',
      description: 'Dynamically loads CSS files for modules',
      version: '1.0.0',
      config: {
        createUI: false, // This module doesn't need UI
        createContainer: false,
        defaultPath: './styles/',
        silentFail: true,
        ...options
      }
    });
    
    // Track loaded CSS files to avoid duplicates
    this.loadedCSSFiles = new Set();
  }

  /**
   * CSS Loader-specific initialization
   * @protected
   */
  async _initializeModule() {
    console.log('CSS Loader initialized');
  }
  
  /**
   * Load a CSS file from a URL
   * @param {string} url - URL to the CSS file
   * @returns {Promise<HTMLElement>} Promise resolving to the link element
   */
  async loadCSS(url) {
    // Return early if already loaded
    if (this.loadedCSSFiles.has(url)) {
      return Promise.resolve(document.querySelector(`link[href="${url}"]`));
    }
    
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      
      // Set up load and error handlers
      link.onload = () => {
        this.loadedCSSFiles.add(url);
        console.info(`CSS Loader: Loaded ${url}`);
        resolve(link);
      };
      
      link.onerror = (err) => {
        const error = new Error(`Failed to load CSS: ${url}`);
        if (this.config.silentFail) {
          console.warn(error);
          resolve(null); // Resolve with null instead of rejecting
        } else {
          console.error(error);
          reject(error);
        }
      };
      
      // Insert link element into head
      document.head.appendChild(link);
    });
  }
  
  /**
   * Load CSS from the same directory as a JavaScript module
   * @param {string} importMetaUrl - import.meta.url from the calling module
   * @returns {Promise<HTMLElement>} Promise resolving to the link element
   */
  async loadLocalCSS(importMetaUrl) {
    try {
      // Handle both direct URL and import.meta.url object
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
  }
  
  /**
   * Load a CSS file by name from the default path
   * @param {string} name - CSS file name (without extension)
   * @returns {Promise<HTMLElement>} Promise resolving to the link element
   */
  async loadCSSByName(name) {
    const url = `${this.config.defaultPath}${name}.css`;
    return await this.loadCSS(url);
  }
}

// Create singleton instance with null world for global use
const cssLoader = new CSSLoaderModule(null);

// Expose for backward compatibility
if (typeof window !== 'undefined') {
  window.cssLoader = cssLoader;
}

export { cssLoader };
