/**
 * @fileoverview System Registry
 * 
 * A registry that provides access to ECS systems through a consistent interface.
 * This improves modularity by avoiding direct system references and enables
 * better testing and debugging.
 */

/**
 * SystemRegistry - Maintains references to all systems and provides a clean interface
 */
class SystemRegistry {
  /**
   * Create a new SystemRegistry
   * @param {Object} systems - Object containing system instances keyed by name
   */
  constructor(systems = {}) {
    this.systems = { ...systems };
    this._dependencies = new Map();
    this._aliases = new Map();
    this._initializeAliases();
  }
  
  /**
   * Register a system with the registry
   * @param {string} name - System name/key
   * @param {System} system - System instance
   * @returns {SystemRegistry} This registry instance for chaining
   */
  register(name, system) {
    this.systems[name] = system;
    return this;
  }
  
  /**
   * Get a system by name
   * @param {string} name - System name/key
   * @returns {System|undefined} The requested system or undefined if not found
   */
  get(name) {
    // Check for alias first
    const actualName = this._aliases.get(name) || name;
    return this.systems[actualName];
  }
  
  /**
   * Check if a system exists in the registry
   * @param {string} name - System name/key
   * @returns {boolean} True if the system exists
   */
  has(name) {
    const actualName = this._aliases.get(name) || name;
    return actualName in this.systems;
  }
  
  /**
   * Register an alias for a system name
   * @param {string} alias - Alias name
   * @param {string} actualName - Actual system name
   * @returns {SystemRegistry} This registry instance for chaining
   */
  registerAlias(alias, actualName) {
    this._aliases.set(alias, actualName);
    return this;
  }
  
  /**
   * Register a dependency relationship between systems
   * @param {string} systemName - System that depends on others
   * @param {Array<string>} dependencies - Systems that are required
   * @returns {SystemRegistry} This registry instance for chaining
   */
  registerDependency(systemName, dependencies) {
    this._dependencies.set(systemName, dependencies);
    return this;
  }
  
  /**
   * Check if all dependencies for a system are satisfied
   * @param {string} systemName - System to check dependencies for
   * @returns {boolean} True if all dependencies are satisfied
   */
  areDependenciesSatisfied(systemName) {
    const dependencies = this._dependencies.get(systemName);
    if (!dependencies) return true;
    
    return dependencies.every(dep => this.has(dep));
  }
  
  /**
   * Get all system names
   * @returns {Array<string>} Array of system names
   */
  getSystemNames() {
    return Object.keys(this.systems);
  }
  
  /**
   * Get all systems as an object
   * @returns {Object} All systems
   */
  getAllSystems() {
    return { ...this.systems };
  }
  
  /**
   * Initialize standard system name aliases
   * @private
   */
  _initializeAliases() {
    // Common aliases for convenience
    this.registerAlias('events', 'event');
    this.registerAlias('errors', 'error');
    this.registerAlias('components', 'componentRegistry');
    this.registerAlias('modules', 'module');
    this.registerAlias('resources', 'resourceDiscovery');
  }
}

export { SystemRegistry };
