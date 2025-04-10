/**
 * @fileoverview Dropdown Section Manager
 * 
 * Manages the registration of dropdown sections and provides a centralized
 * registry of available section types.
 * 
 * RESPONSIBILITIES:
 * - Maintains a registry of available dropdown section plugins
 * - Provides methods to register sections with a dropdown
 * - Creates dropdown managers for easier section management
 * 
 * This module simplifies the process of adding sections to dropdowns
 * and makes it easier to maintain a consistent set of available sections.
 */
import { settingsSection } from './sections/settings-section.js';
import { linksSection } from './sections/links-section.js';

/**
 * Available dropdown section modules that can be registered
 */
const AVAILABLE_SECTIONS = {
  settings: settingsSection,
  links: linksSection
};

/**
 * Register the default dropdown sections onto the given dropdown.
 * @param {Object} dropdown - An instance of HeaderDropdown.
 * @param {Array} sectionIds - Optional array of section IDs to register (defaults to all)
 */
function registerDefaultDropdownSections(dropdown, sectionIds = ['settings', 'links']) {
  if (!dropdown) {
    console.error('Cannot register dropdown sections: No dropdown provided');
    return;
  }
  
  // Register requested sections that are available
  sectionIds.forEach(id => {
    if (AVAILABLE_SECTIONS[id]) {
      dropdown.addSection(id, AVAILABLE_SECTIONS[id]);
    } else {
      console.warn(`Dropdown section "${id}" not found in available sections`);
    }
  });
}

/**
 * Register a specific section by ID
 * @param {Object} dropdown - An instance of HeaderDropdown
 * @param {string} sectionId - The ID of the section to register
 * @returns {boolean} True if section was registered successfully
 */
function registerDropdownSection(dropdown, sectionId) {
  if (!dropdown || !sectionId) return false;
  
  if (AVAILABLE_SECTIONS[sectionId]) {
    dropdown.addSection(sectionId, AVAILABLE_SECTIONS[sectionId]);
    return true;
  }
  return false;
}

/**
 * Create a dropdown manager for a specific dropdown instance
 * @param {Object} dropdown - HeaderDropdown instance
 * @returns {Object} Manager with methods to register sections
 */
function createDropdownManager(dropdown) {
  if (!dropdown) {
    throw new Error('Cannot create dropdown manager: No dropdown provided');
  }
  
  return {
    /**
     * Register a single section by ID
     * @param {string} sectionId - Section ID to register
     * @returns {boolean} True if registered successfully
     */
    registerSection(sectionId) {
      return registerDropdownSection(dropdown, sectionId);
    },
    
    /**
     * Register multiple sections by ID
     * @param {Array} sectionIds - Section IDs to register
     */
    registerSections(sectionIds = []) {
      registerDefaultDropdownSections(dropdown, sectionIds);
    },
    
    /**
     * Register a custom section
     * @param {string} id - Section ID
     * @param {Object} section - Section object with render method
     */
    registerCustomSection(id, section) {
      if (!id || !section || typeof section.render !== 'function') {
        console.error('Invalid custom section provided');
        return;
      }
      dropdown.addSection(id, section);
    }
  };
}

export { 
  registerDefaultDropdownSections, 
  registerDropdownSection, 
  AVAILABLE_SECTIONS,
  createDropdownManager 
};
