import { ECS } from './engine/ecs.js';
import { ThemeSystem } from './systems/ThemeSystem.js';
import { RenderSystem } from './systems/RenderSystem.js';
import { RoutingSystem } from './systems/RoutingSystem.js';
import { NavSystem } from './systems/NavSystem.js';
import { headerBase } from './modules/header/header-base.js';
import { navigation } from './modules/navigation.js';
import { projects } from './modules/projects.js';
import { skills } from './modules/skills.js';
import { about } from './modules/about.js';
import { contact } from './modules/contact.js';
import { footer } from './modules/footer.js';
import { themeSelector } from './modules/theme-selector.js';
import config from './config.js';

const ecs = new ECS();

// Register systems
ecs.registerSystem(new ThemeSystem());
ecs.registerSystem(new RenderSystem());
ecs.registerSystem(new RoutingSystem());
ecs.registerSystem(new NavSystem());

// Header
const headerEntity = ecs.createEntity();
headerEntity.addComponent('dom', { container: document.getElementById('header') });
headerEntity.addComponent('theme', { currentTheme: config.theme.default });
headerBase.init(headerEntity);

// Navigation
const navEntity = ecs.createEntity();
navEntity.addComponent('dom', { container: document.getElementById('navigation') });
navEntity.addComponent('theme', { currentTheme: config.theme.default });
navigation.init(navEntity);

// About section
const aboutEntity = ecs.createEntity();
aboutEntity.addComponent('dom', { container: document.getElementById('about') });
aboutEntity.addComponent('route', { path: 'about', active: false });
aboutEntity.addComponent('renderable', { visible: true });
about.init(aboutEntity);

// Skills section
const skillsEntity = ecs.createEntity();
skillsEntity.addComponent('dom', { container: document.getElementById('skills') });
skillsEntity.addComponent('route', { path: 'skills', active: false });
skillsEntity.addComponent('renderable', { visible: true });
skills.init(skillsEntity);

// Projects section
const projectEntity = ecs.createEntity();
projectEntity.addComponent('dom', { container: document.getElementById('projects') });
projectEntity.addComponent('route', { path: 'projects', active: false });
projectEntity.addComponent('renderable', { visible: true });
projects.init(projectEntity);

// Contact section
const contactEntity = ecs.createEntity();
contactEntity.addComponent('dom', { container: document.getElementById('contact') });
contactEntity.addComponent('route', { path: 'contact', active: false });
contactEntity.addComponent('renderable', { visible: true });
contact.init(contactEntity);

// Theme selector
const themeSelectorEntity = ecs.createEntity();
themeSelectorEntity.addComponent('dom', { container: document.getElementById('theme-selector') });
themeSelectorEntity.addComponent('theme', { currentTheme: config.theme.default });
themeSelector.init(themeSelectorEntity);

// Footer
const footerEntity = ecs.createEntity();
footerEntity.addComponent('dom', { container: document.getElementById('footer') });
footerEntity.addComponent('theme', { currentTheme: config.theme.default });
footer.init(footerEntity);

// Start the ECS system
ecs.start();
