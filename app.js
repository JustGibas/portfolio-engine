/**
 * @fileoverview Application Entry Point for Portfolio Engine.
 * 
 * This file serves as the main bootstrap and initialization point for the Portfolio Engine.
 * It creates the ECS (Entity Component System) instance, registers systems, creates entities
 * for each section of the portfolio, configures them with appropriate components,
 * and initializes modules to populate the DOM.
 * 
 * The application follows an ECS architecture where:
 * - Entities represent distinct sections of the portfolio (header, about, skills, etc.)
 * - Components store data (dom references, theme settings, route information, etc.)
 * - Systems provide behavior and logic (theme management, routing, rendering, etc.)
 * 
 * @module app
 * @requires ECS from ./engine/ecs.js
 * @requires ThemeSystem from ./systems/ThemeSystem.js
 * @requires RenderSystem from ./systems/RenderSystem.js
 * @requires RoutingSystem from ./systems/RoutingSystem.js
 * @requires NavSystem from ./systems/NavSystem.js
 * @requires headerBase from ./modules/header/header-base.js
 * @requires navigation from ./modules/navigation.js
 * @requires projects from ./modules/projects.js
 * @requires skills from ./modules/skills.js
 * @requires about from ./modules/about.js
 * @requires contact from ./modules/contact.js
 * @requires footer from ./modules/footer.js
 * @requires themeSelector from ./modules/theme-selector.js
 * @requires config from ./config.js
 * 
 * @design The application uses the Entity Component System (ECS) architectural pattern
 * to create a flexible, modular, and maintainable structure. This pattern separates
 * data (components) from behavior (systems) and identity (entities), allowing for
 * greater flexibility in feature composition and system interactions.
 */
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
import config from './config.js;

/**
 * Create the main ECS instance that will manage all entities and systems.
 * The ECS (Entity Component System) is the architectural foundation of the
 * Portfolio Engine, providing a framework for creating, managing, and 
 * updating entities and their associated systems.
 */
const ecs = new ECS();

/**
 * Register systems with the ECS.
 * Systems are responsible for providing behavior and logic to entities
 * based on their component composition. Each system operates on entities
 * that have specific combinations of components.
 * 
 * - ThemeSystem: Manages theme application and transitions
 * - RenderSystem: Updates the DOM based on entity state changes
 * - RoutingSystem: Handles URL hash changes and route updates
 * - NavSystem: Manages navigation and section visibility
 */
ecs.registerSystem(new ThemeSystem());
ecs.registerSystem(new RenderSystem());
ecs.registerSystem(new RoutingSystem());
ecs.registerSystem(new NavSystem());

/**
 * Create and configure the Header entity.
 * 
 * The Header entity represents the top section of the portfolio that typically
 * contains the site title and introductory content.
 * 
 * Components:
 * - dom: References the header HTML element
 * - theme: Stores theme-related state for this entity
 */
const headerEntity = ecs.createEntity();
headerEntity.addComponent('dom', { container: document.getElementById('header') });
headerEntity.addComponent('theme', { currentTheme: config.theme.default });
headerBase.init(headerEntity);

/**
 * Create and configure the Navigation entity.
 * 
 * The Navigation entity represents the main navigation menu that allows
 * users to navigate between different sections of the portfolio.
 * 
 * Components:
 * - dom: References the navigation HTML element
 * - theme: Stores theme-related state for this entity
 */
const navEntity = ecs.createEntity();
navEntity.addComponent('dom', { container: document.getElementById('navigation') });
navEntity.addComponent('theme', { currentTheme: config.theme.default });
navigation.init(navEntity);

/**
 * Create and configure the About section entity.
 * 
 * The About entity represents the section of the portfolio that displays
 * personal information, biography, and professional summary.
 * 
 * Components:
 * - dom: References the about section HTML element
 * - route: Defines the route path and active state for this section
 * - renderable: Controls visibility of this section based on active route
 */
const aboutEntity = ecs.createEntity();
aboutEntity.addComponent('dom', { container: document.getElementById('about') });
aboutEntity.addComponent('route', { path: 'about', active: false });
aboutEntity.addComponent('renderable', { visible: true });
about.init(aboutEntity);

/**
 * Create and configure the Projects section entity.
 * 
 * The Projects entity represents the section of the portfolio that displays
 * project showcases with details, technologies used, and links.
 * 
 * Components:
 * - dom: References the projects section HTML element
 * - route: Defines the route path and active state for this section
 * - renderable: Controls visibility of this section based on active route
 */
const projectEntity = ecs.createEntity();
projectEntity.addComponent('dom', { container: document.getElementById('projects') });
projectEntity.addComponent('route', { path: 'projects', active: false });
projectEntity.addComponent('renderable', { visible: true });
projects.init(projectEntity);

/**
 * Create and configure the Contact section entity.
 * 
 * The Contact entity represents the section of the portfolio that contains
 * the contact form and contact information.
 * 
 * Components:
 * - dom: References the contact section HTML element
 * - route: Defines the route path and active state for this section
 * - renderable: Controls visibility of this section based on active route
 */
const contactEntity = ecs.createEntity();
contactEntity.addComponent('dom', { container: document.getElementById('contact') });
contactEntity.addComponent('route', { path: 'contact', active: false });
contactEntity.addComponent('renderable', { visible: true });
contact.init(contactEntity);

/**
 * Create and configure the Theme Selector entity.
 * 
 * The Theme Selector entity provides the UI for users to switch between
 * different visual themes for the portfolio.
 * 
 * Components:
 * - dom: References the theme selector HTML element
 * - theme: Stores theme-related state for this entity
 */
const themeSelectorEntity = ecs.createEntity();
themeSelectorEntity.addComponent('dom', { container: document.getElementById('theme-selector') });
themeSelectorEntity.addComponent('theme', { currentTheme: config.theme.default });
themeSelector.init(themeSelectorEntity);

/**
 * Create and configure the Footer entity.
 * 
 * The Footer entity represents the bottom section of the portfolio that typically
 * contains copyright information, additional links, or contact details.
 * 
 * Components:
 * - dom: References the footer HTML element
 * - theme: Stores theme-related state for this entity
 */
const footerEntity = ecs.createEntity();
footerEntity.addComponent('dom', { container: document.getElementById('footer') });
footerEntity.addComponent('theme', { currentTheme: config.theme.default });
footer.init(footerEntity);

/**
 * Start the ECS system to initialize all registered systems and begin the update loop.
 * This triggers the init() method on all systems, which will:
 * 1. Filter entities based on their components
 * 2. Set up event listeners
 * 3. Initialize the default route
 * 4. Apply the default theme
 * 
 * After initialization, the ECS update loop will continuously call update()
 * on all systems to respond to state changes and user interactions.
 */
ecs.start();
