/**
 * @fileoverview Engine Loop - Main update loop for the Portfolio Engine
 * 
 * This implements the game loop pattern using requestAnimationFrame for rendering
 * and a fixed timestep for physics/logic updates. This approach provides:
 * 
 * 1. Consistent physics updates regardless of frame rate
 * 2. Smooth rendering using the browser's optimal timing
 * 3. Background throttling when tab is inactive
 * 4. Proper separation of rendering and logic updates
 */

/**
 * EngineLoop - Controls the main update cycle for all systems
 */
class EngineLoop {
  /**
   * Create a new engine loop
   * @param {Object} options - Configuration options
   * @param {Object} options.world - World instance to update
   * @param {number} options.fixedTimeStep - Fixed time step for logic updates (ms)
   * @param {number} options.maxUpdatesPerFrame - Maximum number of updates per frame
   * @param {boolean} options.useRAF - Whether to use requestAnimationFrame
   * @param {number} options.targetFPS - Target FPS when not using RAF
   */
  constructor(options = {}) {
    this.world = options.world;
    this.fixedTimeStep = options.fixedTimeStep || 16.666; // ~60 FPS
    this.maxUpdatesPerFrame = options.maxUpdatesPerFrame || 5;
    this.useRAF = options.useRAF !== false;
    this.targetFPS = options.targetFPS || 60;
    
    this.isRunning = false;
    this.rafId = null;
    this.intervalId = null;
    
    this.lastFrameTime = 0;
    this.accumulator = 0;
    this.frameCount = 0;
    this.frameTime = 0;
    
    // Performance metrics
    this.stats = {
      fps: 0,
      frameTime: 0,
      updateTime: 0,
      renderTime: 0,
      idleTime: 0,
      elapsedTime: 0
    };
    
    // Bind methods to preserve 'this' context
    this._update = this._update.bind(this);
    this._rafCallback = this._rafCallback.bind(this);
    
    // Debug logging interval
    this.debugInterval = null;
    this.debugMode = false;
  }
  
  /**
   * Start the engine loop
   */
  start() {
    if (this.isRunning) return;
    
    console.info('EngineLoop: Starting loop');
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.accumulator = 0;
    
    if (this.useRAF) {
      this.rafId = requestAnimationFrame(this._rafCallback);
    } else {
      const interval = 1000 / this.targetFPS;
      this.intervalId = setInterval(this._update, interval);
    }
    
    // Start debug logging if enabled
    if (this.debugMode) {
      this._startDebugLogging();
    }
    
    // Emit start event if event system exists
    if (this.world.getSystem('event')) {
      this.world.getSystem('event').emit('loop:started', {
        timestamp: performance.now(),
        useRAF: this.useRAF,
        fixedTimeStep: this.fixedTimeStep
      });
    }
  }
  
  /**
   * Stop the engine loop
   */
  stop() {
    if (!this.isRunning) return;
    
    console.info('EngineLoop: Stopping loop');
    this.isRunning = false;
    
    if (this.useRAF && this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    } else if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Stop debug logging
    if (this.debugInterval) {
      clearInterval(this.debugInterval);
      this.debugInterval = null;
    }
    
    // Emit stop event if event system exists
    if (this.world.getSystem('event')) {
      this.world.getSystem('event').emit('loop:stopped', {
        timestamp: performance.now()
      });
    }
  }
  
  /**
   * Toggle debug mode
   * @param {boolean} enabled - Whether debug mode should be enabled
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    console.log(`EngineLoop: Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    
    if (enabled && this.isRunning) {
      this._startDebugLogging();
    } else if (!enabled && this.debugInterval) {
      clearInterval(this.debugInterval);
      this.debugInterval = null;
    }
  }
  
  /**
   * Start logging debug information at regular intervals
   * @private
   */
  _startDebugLogging() {
    if (this.debugInterval) {
      clearInterval(this.debugInterval);
    }
    
    this.debugInterval = setInterval(() => {
      console.log(`EngineLoop Stats: FPS=${this.stats.fps.toFixed(1)}, ` +
                 `Frame=${this.stats.frameTime.toFixed(2)}ms, ` +
                 `Update=${this.stats.updateTime.toFixed(2)}ms, ` +
                 `Render=${this.stats.renderTime.toFixed(2)}ms`);
    }, 1000);
  }
  
  /**
   * RequestAnimationFrame callback
   * @param {number} timestamp - Current timestamp
   * @private
   */
  _rafCallback(timestamp) {
    if (!this.isRunning) return;
    
    this._update(timestamp);
    this.rafId = requestAnimationFrame(this._rafCallback);
  }
  
  /**
   * Main update method - updates all systems
   * @param {number} timestamp - Current timestamp
   * @private
   */
  _update(timestamp = performance.now()) {
    if (!this.isRunning || !this.world) return;
    
    const startFrame = performance.now();
    
    // Calculate delta time and update FPS counter
    const deltaTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;
    
    // Calculate FPS as a moving average
    this.frameCount++;
    this.frameTime += deltaTime;
    if (this.frameTime >= 1000) {
      this.stats.fps = this.frameCount / (this.frameTime / 1000);
      this.frameCount = 0;
      this.frameTime = 0;
    }
    
    // Limit delta time to prevent spiral of death
    const cappedDelta = Math.min(deltaTime, 1000 / 10); // Cap at 10 FPS min
    
    // Accumulate time for fixed updates
    this.accumulator += cappedDelta;
    
    // Perform fixed time step updates
    const startUpdate = performance.now();
    let updateCount = 0;
    
    while (this.accumulator >= this.fixedTimeStep && updateCount < this.maxUpdatesPerFrame) {
      this._fixedUpdate(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
      updateCount++;
    }
    
    this.stats.updateTime = performance.now() - startUpdate;
    
    // Perform variable time step updates (rendering)
    const startRender = performance.now();
    this._variableUpdate(deltaTime);
    this.stats.renderTime = performance.now() - startRender;
    
    // Update overall frame stats
    this.stats.frameTime = performance.now() - startFrame;
    this.stats.idleTime = this.useRAF ? 0 : Math.max(0, this.fixedTimeStep - this.stats.frameTime);
    this.stats.elapsedTime += deltaTime;
  }
  
  /**
   * Fixed time step update for physics and game logic
   * @param {number} deltaTime - Fixed delta time
   * @private
   */
  _fixedUpdate(deltaTime) {
    // Convert ms to seconds for more intuitive system updates
    const deltaSeconds = deltaTime / 1000;
    
    // Update each system that needs fixed time step updates
    this._updateSystems('fixed', deltaSeconds);
    
    // Also emit fixed update event if event system exists
    if (this.world.getSystem('event')) {
      this.world.getSystem('event').emit('loop:fixedUpdate', {
        deltaTime: deltaSeconds,
        timestamp: performance.now()
      });
    }
  }
  
  /**
   * Variable time step update for rendering and interpolation
   * @param {number} deltaTime - Variable delta time
   * @private
   */
  _variableUpdate(deltaTime) {
    // Convert ms to seconds for more intuitive system updates
    const deltaSeconds = deltaTime / 1000;
    
    // Update each system that needs variable time step updates
    this._updateSystems('variable', deltaSeconds);
    
    // Also emit variable update event if event system exists
    if (this.world.getSystem('event')) {
      this.world.getSystem('event').emit('loop:variableUpdate', {
        deltaTime: deltaSeconds,
        timestamp: performance.now()
      });
    }
  }
  
  /**
   * Update all systems of a specific type
   * @param {string} updateType - Type of update ('fixed' or 'variable')
   * @param {number} deltaTime - Delta time in seconds
   * @private
   */
  _updateSystems(updateType, deltaTime) {
    // If systems is a Map, iterate through values
    if (this.world.systems instanceof Map) {
      for (const system of this.world.systems.values()) {
        // Skip systems with incorrect update type if they specify one
        if (system.updateType && system.updateType !== updateType) {
          continue;
        }
        
        // Call the appropriate update method
        if (typeof system.update === 'function') {
          system.update(deltaTime);
        }
      }
    }
    // If systems is an Array, iterate through it directly
    else if (Array.isArray(this.world.systems)) {
      for (const system of this.world.systems) {
        // Skip systems with incorrect update type if they specify one
        if (system.updateType && system.updateType !== updateType) {
          continue;
        }
        
        // Call the appropriate update method
        if (typeof system.update === 'function') {
          system.update(deltaTime);
        }
      }
    }
    // Otherwise, try to update the SystemManager
    else if (this.world.systemManager && typeof this.world.systemManager.updateSystems === 'function') {
      this.world.systemManager.updateSystems(deltaTime, updateType);
    }
  }
}

export { EngineLoop };
