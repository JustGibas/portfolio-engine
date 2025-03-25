import { ECS } from './engine/ecs.js';
import { ThemeSystem } from './systems/ThemeSystem.js';
import { headerBase } from './modules/header/header-base.js';
import { projects } from './modules/projects.js';

const ecs = new ECS();

ecs.registerSystem(new ThemeSystem());

const headerEntity = ecs.createEntity();
headerEntity.addComponent('dom', { container: document.getElementById('header') });
headerEntity.addComponent('theme', { currentTheme: 'default' });
headerBase.init(headerEntity);

const projectEntity = ecs.createEntity();
projectEntity.addComponent('dom', { container: document.getElementById('projects') });
projects.init(projectEntity);

ecs.start();
