/**
 * @fileoverview Page Module Manager
 * 
 * This module defines how files in the pages directory are managed and loaded.
 * It provides standardized interfaces for working with page modules and project data.
 * 
 * @module page
 * @requires ResourceDiscoverySystem from ../../engine/systems/ResourceDiscoverySystem.js
 * @requires ModuleLifecycleSystem from ../../engine/systems/ModuleLifecycleSystem.js
 * @requires assetManager from ../../engine/asset-manager.js
 */
import config from '../../config.js';
import { ResourceDiscoverySystem } from '../../engine/systems/ResourceDiscoverySystem.js';
import { ModuleLifecycleSystem } from '../../engine/systems/ModuleLifecycleSystem.js';
import { assetManager } from '../../engine/asset-manager.js';
import { errorHandler } from '../../engine/error-handler.js';

/**
 * Page module manager (adapter for new systems)
 */
const page = {
  /**
   * Initialize the page system
   * @param {Object} config - Application configuration
   */
  init(config) {
    // Initialize resource discovery
    ResourceDiscoverySystem.init(config);
    
    // Initialize module lifecycle
    ModuleLifecycleSystem.init();
    
    // Initialize asset manager with config
    assetManager.init({
      baseDir: './assets/',
      defaultImage: './assets/images/placeholder.jpg'
    });
  },
  
  /**
   * Discover available pages in the pages directory
   * @returns {Promise<Array>} Promise that resolves to the discovered sections
   */
  discoverPages() {
    return ResourceDiscoverySystem.discoverPages();
  },

  /**
   * Discover available projects in the projects directory
   * @returns {Promise<Array>} Promise that resolves to the discovered projects
   */
  discoverProjects() {
    return ResourceDiscoverySystem.discoverProjects();
  },
  
  /**
   * Get discovered sections
   * @returns {Promise<Array>} Promise that resolves to the sections array
   */
  getSections() {
    const sections = ResourceDiscoverySystem.resources.pages;
    if (sections.length > 0) {
      return Promise.resolve(sections);
    }
    return this.discoverPages();
  },
  
  /**
   * Get discovered projects
   * @returns {Promise<Array>} Promise that resolves to the projects array
   */
  getProjects() {
    const projects = ResourceDiscoverySystem.resources.projects;
    if (projects.length > 0) {
      return Promise.resolve(projects);
    }
    return this.discoverProjects();
  },
  
  /**
   * Load a page module by name
   * @param {string} moduleName - Name of the page module to load
   * @param {Entity} entity - Entity to attach the page to
   * @returns {Promise<Object>} Promise that resolves to the page module instance
   */
  async load(moduleName, entity) {
    try {
      return await ModuleLifecycleSystem.loadModule(moduleName, entity);
    } catch (error) {
      errorHandler.handleError(error, 'page-load', false);
      throw error;
    }
  },
  
  /**
   * Switch to a new page
   * @param {string} moduleName - Name of the page module to load
   * @param {Entity} entity - Entity to attach the page to
   * @returns {Promise<Object>} Promise that resolves to the new page instance
   */
  async switchTo(moduleName, entity) {
    try {
      return await ModuleLifecycleSystem.switchToModule(moduleName, entity);
    } catch (error) {
      errorHandler.handleError(error, 'page-switch', false);
      throw error;
    }
  },
  
  /**
   * Get the currently active page
   * @returns {Object|null} The active page instance or null if none
   */
  getActivePage() {
    return ModuleLifecycleSystem.getActiveModule();
  },
  
  /**
   * Update the content of a page and re-render it
   * @param {string} moduleName - Name of the page module to update
   * @param {Object} newContent - New content object to merge with existing content
   * @returns {Promise<Object>} Promise that resolves to the updated page instance
   */
  updateContent(moduleName, newContent) {
    return ModuleLifecycleSystem.updateModuleContent(moduleName, newContent);
  }
};

// Initialize with config
page.init(config);

export { page };