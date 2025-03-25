/**
 * @fileoverview Configuration Settings for the Portfolio Engine.
 * Contains global settings for themes, modules, systems, and routing.
 * @module config
 */

const config = {
  theme: {
    default: 'light',
    availableThemes: ['light', 'dark', 'neon']
  },
  modules: {
    header: 'header-base',
    navigation: 'navigation',
    about: 'about',
    projects: 'projects',
    contact: 'contact',
    footer: 'footer',
    themeSelector: 'theme-selector'
  },
  systems: {
    themeSystem: true,
    renderSystem: true,
    routingSystem: true,
    navSystem: true
  },
  routing: {
    defaultRoute: 'about',
    routes: ['about', 'projects', 'contact']
  }
};

export default config;
