/**
 * =====================================================================
 * TaskSystem.js - Task Scheduler System
 * =====================================================================
 * 
 * @fileoverview 
 * 
 * This system manages and executes tasks in a prioritized, dependency-aware manner.
 * It serves as a replacement for the previous scheduler implementation with improved
 * organization and error handling.
 */
import { System } from '../core/system.js';
import { Task, SystemTask } from '../core/task.js';

/**
 * Group of related tasks
 */
class TaskGroup {
  /**
   * Create a new task group
   * @param {string} name - Group name
   * @param {number} priority - Group execution priority
   */
  constructor(name, priority = 0) {
    this.name = name;
    this.priority = priority;
    this.tasks = new Map();
    this.enabled = true;
  }
  
  /**
   * Add a task to the group
   * @param {Task} task - Task to add
   * @returns {TaskGroup} This group for chaining
   */
  addTask(task) {
    if (!(task instanceof Task)) {
      throw new Error('Expected a Task instance');
    }
    
    task.group = this.name;
    this.tasks.set(task.id, task);
    return this;
  }
  
  /**
   * Get a task by ID or name
   * @param {string} idOrName - Task ID or name
   * @returns {Task|null} The task or null if not found
   */
  getTask(idOrName) {
    // Look for exact ID match first
    if (this.tasks.has(idOrName)) {
      return this.tasks.get(idOrName);
    }
    
    // Then try to find by name
    for (const task of this.tasks.values()) {
      if (task.name === idOrName) {
        return task;
      }
    }
    
    return null;
  }
  
  /**
   * Remove a task from the group
   * @param {string} taskId - Task ID to remove
   * @returns {boolean} Whether the task was removed
   */
  removeTask(taskId) {
    return this.tasks.delete(taskId);
  }
  
  /**
   * Enable or disable the entire group
   * @param {boolean} enabled - Whether to enable the group
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }
  
  /**
   * Execute all tasks in the group
   * @param {number} deltaTime - Time since last frame
   * @returns {Promise<Array>} Results of task execution
   */
  async execute(deltaTime) {
    if (!this.enabled) return [];
    
    // Sort tasks by priority (lower numbers first)
    const sortedTasks = Array.from(this.tasks.values())
      .sort((a, b) => a.priority - b.priority);
    
    // Execute all tasks and collect results
    const results = [];
    for (const task of sortedTasks) {
      try {
        if (task.enabled) {
          const result = await task.execute(deltaTime);
          results.push({ task: task.id, success: result });
        }
      } catch (error) {
        console.error(`Error executing task ${task.name}:`, error);
        results.push({ task: task.id, success: false, error });
      }
    }
    
    return results;
  }
}

/**
 * TaskSystem - Manages scheduled tasks for the engine
 */
class TaskSystem extends System {
  /**
   * Initialize the task system
   * @param {Object} world - The world instance
   * @returns {TaskSystem} This system for chaining
   */
  init(world) {
    super.init(world);
    
    /**
     * Task groups by name
     * @type {Map<string, TaskGroup>}
     */
    this.groups = new Map();
    
    /**
     * Default group for tasks without specified group
     * @type {TaskGroup}
     */
    this.defaultGroup = this.createGroup('default', 0);
    
    /**
     * Whether to skip execution temporarily
     * @type {boolean}
     */
    this.paused = false;
    
    /**
     * Task dependency graph (taskId -> [dependencyIds])
     * @type {Map<string, Set<string>>}
     */
    this.dependencyGraph = new Map();
    
    console.info('TaskSystem: Initialized');
    return this;
  }
  
  /**
   * Create a new task group
   * @param {string} name - Group name
   * @param {number} priority - Group execution priority
   * @returns {TaskGroup} The created group
   */
  createGroup(name, priority = 0) {
    if (this.groups.has(name)) {
      return this.groups.get(name);
    }
    
    const group = new TaskGroup(name, priority);
    this.groups.set(name, group);
    return group;
  }
  
  /**
   * Get a task group by name
   * @param {string} name - Group name
   * @returns {TaskGroup|null} The group or null if not found
   */
  getGroup(name) {
    return this.groups.get(name) || null;
  }
  
  /**
   * Add a task to the system
   * @param {Task} task - The task to add
   * @param {string} [groupName='default'] - Group to add the task to
   * @returns {Task} The added task
   */
  addTask(task, groupName = 'default') {
    if (!(task instanceof Task)) {
      throw new Error('Expected a Task instance');
    }
    
    let group = this.groups.get(groupName);
    if (!group) {
      group = this.createGroup(groupName);
    }
    
    group.addTask(task);
    
    // Register task dependencies
    if (task.dependencies && task.dependencies.length > 0) {
      this.dependencyGraph.set(task.id, new Set(task.dependencies));
    }
    
    return task;
  }
  
  /**
   * Create and add a system task
   * @param {Object} system - System to wrap in a task
   * @param {Object} [options={}] - Task options
   * @returns {SystemTask} The created task
   */
  addSystemTask(system, options = {}) {
    const task = new SystemTask(system, options);
    return this.addTask(task, options.group || 'systems');
  }
  
  /**
   * Get a task by ID or name
   * @param {string} idOrName - Task ID or name
   * @returns {Task|null} The task or null if not found
   */
  getTask(idOrName) {
    // Search all groups for the task
    for (const group of this.groups.values()) {
      const task = group.getTask(idOrName);
      if (task) {
        return task;
      }
    }
    
    return null;
  }
  
  /**
   * Remove a task from the system
   * @param {string} taskId - Task ID to remove
   * @returns {boolean} Whether the task was removed
   */
  removeTask(taskId) {
    for (const group of this.groups.values()) {
      if (group.removeTask(taskId)) {
        // Also remove from dependency graph
        this.dependencyGraph.delete(taskId);
        
        // Remove as dependency from other tasks
        for (const dependencies of this.dependencyGraph.values()) {
          dependencies.delete(taskId);
        }
        
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Pause task execution
   */
  pause() {
    this.paused = true;
  }
  
  /**
   * Resume task execution
   */
  resume() {
    this.paused = false;
  }
  
  /**
   * Update method called by the engine loop
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    if (this.paused) return;
    
    // Sort groups by priority
    const sortedGroups = Array.from(this.groups.values())
      .sort((a, b) => a.priority - b.priority);
    
    // Execute all groups
    for (const group of sortedGroups) {
      group.execute(deltaTime).catch(error => {
        console.error(`Error executing task group ${group.name}:`, error);
      });
    }
  }
  
  /**
   * Get all tasks as a flat array
   * @returns {Array<Task>} All tasks
   */
  getAllTasks() {
    const tasks = [];
    for (const group of this.groups.values()) {
      tasks.push(...group.tasks.values());
    }
    return tasks;
  }
  
  /**
   * Get tasks filtered by tags
   * @param {Array<string>} tags - Tags to filter by
   * @returns {Array<Task>} Matching tasks
   */
  getTasksByTags(tags) {
    return this.getAllTasks().filter(task => {
      return tags.some(tag => task.hasTag(tag));
    });
  }
}

export { TaskSystem, TaskGroup };