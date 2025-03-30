/**
 * @fileoverview Engine Update Loop
 * 
 * This module provides the core update loop functionality that drives the entire engine.
 * It manages timing, system execution, performance monitoring, and frame scheduling.
 * 
 * Key features:
 * - Precise timing control with configurable FPS
 * - Support for both requestAnimationFrame and setInterval
 * - Delta time calculation for smooth animations
 * - Performance monitoring and FPS tracking
 * - Prioritized system execution
 * 
 * Usage:
 * ```
 * import { EngineLoop } from './engine/loop.js';
 * 
 * const loop = new EngineLoop({ targetFPS: 60 });
 * loop.addSystems(mySystems);
 * loop.setEntities(myEntities);
 * loop.start();
 * 
 * // Later, when needed:
 * loop.stop();
 * ```
 * 
 * @module engine/loop
 */

// Change from using a named import to using the default import
import config from '../config.js';

/**
 * Engine loop controller
 */
class EngineLoop {
  /**
   * Create a new engine loop
   * @param {Object} options - Loop configuration
   * @param {number} options.targetFPS - Target frames per second (default: from config or 60)
   * @param {boolean} options.useRAF - Whether to use requestAnimationFrame (default: true)
   * @param {boolean} options.autoStart - Whether to start automatically (default: false)
   */
  constructor(options = {}) {
    this.options = {
      targetFPS: config?.advanced?.systemRefreshRate || 60,
      useRAF: true,
      autoStart: false,
      ...options
    };
    
    // Internal state
    this.isRunning = false;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.deltaTime = 0;
    this.systems = [];
    this.entities = [];
    this.frameId = null;
    this.intervalId = null;
    
    // Performance monitoring
    this.fpsHistory = [];
    this.fpsUpdateInterval = 500; // ms
    this.lastFpsUpdate = 0;
    this.currentFps = 0;
    this.maxDeltaTime = 100; // Cap delta time to prevent spiral of death after tab switch
    
    // System priority queue (lower numbers run first)
    this.systemPriorities = new Map();
    
    // Debug mode state
    this.debugMode = config?.advanced?.debug || false;
    
    // Bind methods to maintain context
    this._update = this._update.bind(this);
    
    // Auto-start if configured
    if (this.options.autoStart) {
      this.start();
    }
  }
  
  /**
   * Add systems to be updated by the loop
   * @param {System|Array<System>} systems - System(s) to add
   * @param {number} [priority=0] - System priority (lower runs first)
   * @returns {EngineLoop} This instance for chaining
   */
  addSystems(systems, priority = 0) {
    const systemArray = Array.isArray(systems) ? systems : [systems];
    
    systemArray.forEach(system => {
      this.systems.push(system);
      this.systemPriorities.set(system, priority);
    });
    
    // Sort systems by priority
    this._sortSystems();
    
    return this;
  }
  
  /**
   * Remove a system from the loop
   * @param {System} system - System to remove
   * @returns {boolean} True if system was removed
   */
  removeSystem(system) {
    const index = this.systems.indexOf(system);
    if (index !== -1) {
      this.systems.splice(index, 1);
      this.systemPriorities.delete(system);
      return true;
    }
    return false;
  }
  
  /**
   * Set entities to pass to systems
   * @param {Array|Function} entitiesOrGetter - Array of entities or function that returns entities
   * @returns {EngineLoop} This instance for chaining
   */
  setEntities(entitiesOrGetter) {
    this.entities = entitiesOrGetter;
    return this;
  }
  
  /**
   * Start the engine loop
   * @returns {EngineLoop} This instance for chaining
   */
  start() {
    if (this.isRunning) return this;
    
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    
    if (this.options.useRAF) {
      this.frameId = requestAnimationFrame(this._update);
    } else {
      const frameInterval = 1000 / this.options.targetFPS;
      this.intervalId = setInterval(() => {
        this._update(performance.now());
      }, frameInterval);
    }
    
    if (this.debugMode) {
      console.info(`EngineLoop: Started at target ${this.options.targetFPS} FPS`);
    }
    
    return this;
  }
  
  /**
   * Stop the engine loop
   * @returns {EngineLoop} This instance for chaining
   */
  stop() {
    if (!this.isRunning) return this;
    
    this.isRunning = false;
    
    if (this.options.useRAF && this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    } else if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    if (this.debugMode) {
      console.info('EngineLoop: Stopped');
    }
    
    return this;
  }
  
  /**
   * Pause the engine loop temporarily
   * @returns {EngineLoop} This instance for chaining
   */
  pause() {
    if (this.isRunning) {
      this.stop();
      this._paused = true;
    }
    return this;
  }
  
  /**
   * Resume the engine loop after pausing
   * @returns {EngineLoop} This instance for chaining
   */
  resume() {
    if (this._paused) {
      this.start();
      this._paused = false;
    }
    return this;
  }
  
  /**
   * Main update function called each frame
   * @param {number} timestamp - Current timestamp
   * @private
   */
  _update(timestamp) {
    // Calculate delta time (in seconds)
    let deltaMs = timestamp - this.lastFrameTime;
    
    // Cap delta time to prevent spiral of death
    deltaMs = Math.min(deltaMs, this.maxDeltaTime);
    
    this.deltaTime = deltaMs / 1000; // Convert to seconds
    this.lastFrameTime = timestamp;
    
    // Update frame counter
    this.frameCount++;
    
    // Calculate FPS periodically
    if (timestamp - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      this.currentFps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsUpdate));
      this.fpsHistory.push(this.currentFps);
      
      // Keep history to a reasonable size
      if (this.fpsHistory.length > 10) {
        this.fpsHistory.shift();
      }
      
      this.lastFpsUpdate = timestamp;
      this.frameCount = 0;
    }
    
    // Get current entities if using a getter function
    const currentEntities = typeof this.entities === 'function' 
      ? this.entities() 
      : this.entities;
    
    // Update all systems
    try {
      for (const system of this.systems) {
        if (typeof system.update === 'function') {
          system.update(currentEntities, this.deltaTime);
        }
      }
    } catch (error) {
      console.error('Error in system update:', error);
      
      // Don't stop the loop on error, but log it
      if (this.debugMode) {
        console.error('System update error details:', {
          error,
          systems: this.systems.length,
          entities: currentEntities?.length ?? 0,
          deltaTime: this.deltaTime
        });
      }
    }
    
    // Schedule next frame if still running
    if (this.isRunning && this.options.useRAF) {
      this.frameId = requestAnimationFrame(this._update);
    }
  }
  
  /**
   * Sort systems by priority
   * @private
   */
  _sortSystems() {
    this.systems.sort((a, b) => {
      const priorityA = this.systemPriorities.get(a) || 0;
      const priorityB = this.systemPriorities.get(b) || 0;
      return priorityA - priorityB;
    });
  }
  
  /**
   * Get current performance metrics
   * @returns {Object} Performance data
   */
  getPerformanceMetrics() {
    return {
      fps: this.currentFps,
      fpsHistory: [...this.fpsHistory],
      frameCount: this.frameCount,
      deltaTime: this.deltaTime,
      isRunning: this.isRunning,
      systemCount: this.systems.length,
      targetFPS: this.options.targetFPS
    };
  }
}

export { EngineLoop };
