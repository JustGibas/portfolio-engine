/**
 * @fileoverview Asset Manager
 * 
 * This module provides utilities for managing and loading assets like images,
 * fonts, and other resources. It handles path resolution, caching, and error fallbacks.
 * 
 * @module assetManager
 * @requires assetConfig from ../asset-config.js
 * 
 * @design Singleton pattern with a central cache and path resolution
 */
import assetConfig from '../asset-config.js';

const assetManager = {
  /**
   * Cache of loaded assets to prevent duplicates
   * @private
   */
  _cache: {},
  
  /**
   * Cache of failed asset load attempts
   * @private
   */
  _failedCache: {},
  
  /**
   * Configuration for asset paths
   * @type {Object}
   */
  config: assetConfig,
  
  /**
   * Initialize the asset manager
   * @param {Object} config - Optional configuration to override defaults
   */
  init(config = {}) {
    // Override default config with provided values
    if (config) {
      this.config = { ...assetConfig, ...config };
    }
    
    // Create placeholder assets
    this._createPlaceholders();
    
    console.info('AssetManager: Initialized with base directory:', this.config.baseDir);
    return this;
  },
  
  /**
   * Create placeholder assets for fallbacks
   * @private
   */
  _createPlaceholders() {
    // Preload default image
    const img = new Image();
    img.src = this.config.defaultImage;
    img.onerror = () => {
      // If default image fails, use a data URI
      this.config.defaultImage = 'data:image/svg+xml,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
          <rect width="200" height="200" fill="#eee"/>
          <text x="50%" y="50%" font-family="Arial" font-size="24" text-anchor="middle" fill="#aaa">Image</text>
        </svg>
      `);
    };
  },
  
  /**
   * Get the full path for an asset
   * @param {string} path - Relative path or name of the asset
   * @param {string} type - Type of asset (image, font, etc.)
   * @returns {string} Full path to the asset
   */
  getAssetPath(path, type = 'images') {
    // If path is already absolute or a data URI, return it as is
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    
    // If path already starts with base dir, return it as is
    if (path.startsWith(this.config.baseDir)) {
      return path;
    }
    
    // If path already includes the asset type directory, append just the base
    if (path.startsWith(this.config.directories[type])) {
      return `${this.config.baseDir}${path}`;
    }
    
    // Otherwise construct the full path
    return `${this.config.baseDir}${this.config.directories[type] || ''}${path}`;
  },
  
  /**
   * Get an image path with a fallback
   * @param {string} imagePath - Path to the image
   * @param {string} [fallbackPath] - Optional custom fallback path
   * @returns {Object} Object with src and fallback properties
   */
  getImageWithFallback(imagePath, fallbackPath = null) {
    return {
      src: this.getAssetPath(imagePath, 'images'),
      fallback: fallbackPath || this.config.defaultImage
    };
  },
  
  /**
   * Generate HTML for an image with proper loading and error handling
   * @param {string} src - Image source path
   * @param {string} alt - Alt text for the image
   * @param {Object} options - Additional image options
   * @returns {string} HTML string for the image tag
   */
  getImageHTML(src, alt = '', options = {}) {
    const { className, width, height, style } = options;
    const { src: imgSrc, fallback } = this.getImageWithFallback(src);
    
    const classAttr = className ? ` class="${className}"` : '';
    const widthAttr = width ? ` width="${width}"` : '';
    const heightAttr = height ? ` height="${height}"` : '';
    const styleAttr = style ? ` style="${style}"` : '';
    
    return `
      <img src="${imgSrc}" 
           alt="${alt}" 
           onerror="this.onerror=null; this.src='${fallback}'"
           ${classAttr}${widthAttr}${heightAttr}${styleAttr}>
    `.trim();
  },
  
  /**
   * Preload an asset to ensure it's in the cache
   * @param {string} path - Path to the asset
   * @param {string} type - Type of asset
   * @returns {Promise} Promise that resolves when asset is loaded
   */
  preloadAsset(path, type = 'images') {
    const fullPath = this.getAssetPath(path, type);
    
    // Skip if already loaded or previously failed
    if (this._cache[fullPath]) {
      return Promise.resolve(this._cache[fullPath]);
    }
    
    if (this._failedCache[fullPath]) {
      return Promise.reject(new Error(`Previously failed to load: ${fullPath}`));
    }
    
    let promise;
    
    // Handle different asset types
    switch(type) {
      case 'images':
        promise = new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => {
            this._failedCache[fullPath] = true;
            reject(new Error(`Failed to load image: ${fullPath}`));
          };
          img.src = fullPath;
        });
        break;
        
      case 'audio':
        promise = new Promise((resolve, reject) => {
          const audio = new Audio();
          audio.oncanplaythrough = () => resolve(audio);
          audio.onerror = () => {
            this._failedCache[fullPath] = true;
            reject(new Error(`Failed to load audio: ${fullPath}`));
          };
          audio.src = fullPath;
        });
        break;
        
      default:
        // For other types, use fetch
        promise = fetch(fullPath).then(response => {
          if (!response.ok) {
            this._failedCache[fullPath] = true;
            throw new Error(`Failed to load asset: ${fullPath}`);
          }
          return response;
        });
    }
    
    // Cache the promise
    this._cache[fullPath] = promise;
    
    return promise;
  },
  
  /**
   * Preload multiple assets at once
   * @param {Object[]} assets - Array of asset objects with path and type
   * @returns {Promise} Promise that resolves when all assets are loaded
   */
  preloadMultiple(assets) {
    const promises = assets.map(asset => 
      this.preloadAsset(asset.path, asset.type || 'images')
    );
    
    return Promise.allSettled(promises);
  },
  
  /**
   * Clear the asset cache
   */
  clearCache() {
    this._cache = {};
    this._failedCache = {};
    console.info('AssetManager: Cache cleared');
  }
};

// Initialize the asset manager with defaults
assetManager.init();

export { assetManager };
