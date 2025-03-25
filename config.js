const config = {
  theme: {
    default: 'light',
    availableThemes: ['light', 'dark', 'neon']
  },
  modules: {
    header: 'header-base',
    navigation: 'navigation',
    about: 'about',
    skills: 'skills',
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
    routes: ['about', 'skills', 'projects', 'contact']
  }
};

export default config;
