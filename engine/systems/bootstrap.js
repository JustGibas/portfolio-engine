/**
 * @fileoverview System Registry for Portfolio Engine
 * 
 * This file serves as the central registry for all system implementations.
 * It aggregates and re-exports all concrete system implementations, making
 * them available through a single import.
 * 
 * @module Systems
 * 
 * @design Aggregator pattern - Provides a single import point for all systems
 */

export { eventSystem } from './EventSystem.js';
export { EntityCreator } from './EntityCreator.js';
export { ModuleLoader } from './ModuleLoader.js';
export { LayoutInitializerSystem } from './LayoutInitializerSystem.js';
