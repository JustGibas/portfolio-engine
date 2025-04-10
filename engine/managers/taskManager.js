/**
 * =====================================================================
 * TaskManager.js - ECS Task Management
 * =====================================================================
 * 
 * @fileoverview 
 * 
 * This file implements the TaskManager class which is responsible for
 * managing task lifecycle, registration, execution and dependencies.
 * 
 * It extends the base Manager class to maintain consistent interfaces 
 * across all managers in the engine.
 */

import { Manager } from '../core/manager.js';
import { Task, SystemTask } from '../core/task.js';

/**
 * TaskManager - Manages task lifecycle and execution
 * @extends Manager
 */
class TaskManager extends Manager {
  /**
   * Create a new task manager
   * @param {Object} options - Manager options
   * @param {Object} options.world - World reference
   * @param {Object} [options.config={}] - Configuration options
   */
  constructor({ world, config = {} }) {
    // Initialize base Manager class
    super({ world });
    
    // Task manager properties
    this.tasks = new Map();         // taskId -> Task
    this.tasksByName = new Map();   // taskName -> Task
    this.taskGroups = new Map();    // groupName -> { name, priority, tasks, enabled }
    
    // Cached execution order
    this._executionOrder = [];
    this._needsSort = true;
    
    // Configuration
    this.config = config;
    this.defaultGroup = config.defaultGroup || 'default';
    
    // References to dependencies
    this._events = world?.eventBus;
    
    console.log('TaskManager: Created');
    
    // Initialize standard task groups
    this._initializeStandardGroups();
  }
  
  /**
   * Initialize the task manager
   * @param {Object} [options={}] - Initialization options
   * @returns {TaskManager} This manager instance for chaining
   */
  init(options = {}) {
    // Call parent init
    super.init(options);
    
    // Set up dependencies
    if (options.events) {
      this._events = options.events;
    }
    
    // Recalculate execution order on init
    this._calculateExecutionOrder();
    
    console.log('TaskManager: Initialized');
    return this;
  }
  
  /**
   * Initialize standard task groups
   * @private
   */
  _initializeStandardGroups() {
    // Create standard groups with different priorities
    this.createGroup('preUpdate', -100);
    this.createGroup('update', 0);
    this.createGroup('postUpdate', 100);
    this.createGroup('render', 200);
    this.createGroup('debug', 300);
  }
  
  /**
   * Create a new task group
   * @param {string} name - Group name
   * @param {number} [groupPriority=0] - Group priority
   * @returns {TaskManager} This manager for chaining
   */
  createGroup(name, groupPriority = 0) {
    if (!this.taskGroups.has(name)) {
      this.taskGroups.set(name, {
        name,
        priority: groupPriority,
        tasks: [],
        enabled: true
      });
      this._needsSort = true;
    }
    return this;
  }
  
  /**
   * Add a task to the manager
   * @param {Task|Object} taskOrSystem - Task or system to schedule
   * @param {Object} [options={}] - Registration options
   * @returns {Task} The registered task
   */
  addTask(taskOrSystem, options = {}) {
    // Convert system to task if needed
    const task = taskOrSystem instanceof Task 
      ? taskOrSystem 
      : new SystemTask(taskOrSystem, options);
    
    // Update task with options
    if (options.name) task.name = options.name;
    if (options.group) task.group = options.group;
    if (typeof options.priority === 'number') task.priority = options.priority;
    if (options.tags) options.tags.forEach(tag => task.addTag(tag));
    if (options.dependencies) task.dependencies = [...options.dependencies];
    if (typeof options.enabled === 'boolean') task.enabled = options.enabled;
    
    // Register the task
    this.tasks.set(task.id, task);
    this.tasksByName.set(task.name, task);
    
    // Add to group
    const groupName = task.group || this.defaultGroup;
    if (!this.taskGroups.has(groupName)) {
      this.createGroup(groupName);
    }
    this.taskGroups.get(groupName).tasks.push(task);
    
    // Mark for sorting
    this._needsSort = true;
    
    // Emit task added event
    if (this._events) {
      this._events.emit('task:added', { task });
    }
    
    return task;
  }
  
  /**
   * Remove a task from the manager
   * @param {string|Task} taskIdOrTask - Task ID, name, or task instance
   * @returns {boolean} Whether the task was found and removed
   */
  removeTask(taskIdOrTask) {
    let task;
    
    if (typeof taskIdOrTask === 'string') {
      // Try to find by ID first, then by name
      task = this.tasks.get(taskIdOrTask) || this.tasksByName.get(taskIdOrTask);
    } else {
      task = taskIdOrTask;
    }
    
    if (!task) return false;
    
    // Remove from collections
    this.tasks.delete(task.id);
    this.tasksByName.delete(task.name);
    
    // Remove from group
    const groupName = task.group || this.defaultGroup;
    const group = this.taskGroups.get(groupName);
    
    if (group) {
      const index = group.tasks.indexOf(task);
      if (index !== -1) {
        group.tasks.splice(index, 1);
      }
    }
    
    // Mark for sorting
    this._needsSort = true;
    
    // Emit task removed event
    if (this._events) {
      this._events.emit('task:removed', { task });
    }
    
    return true;
  }
  
  /**
   * Get a task by ID or name
   * @param {string} idOrName - Task ID or name
   * @returns {Task|undefined} The task or undefined if not found
   */
  getTask(idOrName) {
    return this.tasks.get(idOrName) || this.tasksByName.get(idOrName);
  }
  
  /**
   * Enable or disable a task group
   * @param {string} groupName - Group name
   * @param {boolean} enabled - Whether to enable the group
   * @returns {TaskManager} This manager for chaining
   */
  setGroupEnabled(groupName, enabled) {
    const group = this.taskGroups.get(groupName);
    if (group) {
      group.enabled = enabled;
      
      // Also update the enabled state of all tasks in the group
      group.tasks.forEach(task => {
        if (enabled) {
          task.enable();
        } else {
          task.disable();
        }
      });
      
      // Emit event
      if (this._events) {
        this._events.emit('taskGroup:toggle', { groupName, enabled });
      }
    }
    return this;
  }
  
  /**
   * Execute all scheduled tasks for the current frame
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   * @returns {Promise<void>}
   */
  async execute(deltaTime) {
    // Update execution order if needed
    if (this._needsSort) {
      this._calculateExecutionOrder();
    }
    
    // Execute each task in order
    for (const task of this._executionOrder) {
      try {
        await task.execute(deltaTime);
      } catch (error) {
        console.error(`Error executing task ${task.name}:`, error);
        
        // Emit task error event
        if (this._events) {
          this._events.emit('task:error', { task, error });
        }
      }
    }
  }
  
  /**
   * Calculate optimized execution order based on dependencies and priorities
   * @private
   */
  _calculateExecutionOrder() {
    // First sort groups by priority
    const sortedGroups = Array.from(this.taskGroups.values())
      .sort((a, b) => a.priority - b.priority);
    
    // Initialize new execution order
    const newOrder = [];
    
    // Process each group in priority order
    for (const group of sortedGroups) {
      if (!group.enabled) continue;
      
      // Sort tasks within group by priority
      const sortedTasks = [...group.tasks]
        .filter(task => task.enabled)
        .sort((a, b) => a.priority - b.priority);
      
      // Process dependencies within the group
      this._processTaskDependencies(sortedTasks, newOrder);
    }
    
    // Update execution order
    this._executionOrder = newOrder;
    this._needsSort = false;
  }
  
  /**
   * Process task dependencies and add tasks to execution order
   * @param {Array<Task>} tasks - Tasks to process
   * @param {Array<Task>} executionOrder - Current execution order
   * @private
   */
  _processTaskDependencies(tasks, executionOrder) {
    // Track visited and added tasks to avoid duplicates and detect cycles
    const visited = new Set();
    const added = new Set();
    
    // Define recursive dependency traversal function
    const visit = (task) => {
      // Skip if already processed
      if (added.has(task.id)) return;
      
      // Detect cycles
      if (visited.has(task.id)) {
        console.warn(`TaskManager: Dependency cycle detected involving task '${task.name}'`);
        return;
      }
      
      visited.add(task.id);
      
      // Process dependencies first
      for (const depId of task.dependencies) {
        const depTask = this.getTask(depId);
        if (depTask) {
          visit(depTask);
        } else {
          console.warn(`TaskManager: Missing dependency '${depId}' for task '${task.name}'`);
        }
      }
      
      // Add task to execution order
      executionOrder.push(task);
      added.add(task.id);
    };
    
    // Process all tasks
    for (const task of tasks) {
      visit(task);
    }
  }
  
  /**
   * Get all registered tasks
   * @returns {Array<Task>} All tasks
   */
  getAllTasks() {
    return Array.from(this.tasks.values());
  }
  
  /**
   * Get tasks by tag
   * @param {string} tag - Tag to filter by
   * @returns {Array<Task>} Matching tasks
   */
  getTasksByTag(tag) {
    return Array.from(this.tasks.values())
      .filter(task => task.hasTag(tag));
  }
  
  /**
   * Get tasks in a group
   * @param {string} groupName - Group name
   * @returns {Array<Task>} Tasks in the group
   */
  getTasksInGroup(groupName) {
    const group = this.taskGroups.get(groupName);
    return group ? [...group.tasks] : [];
  }
  
  /**
   * Reset the task manager to initial state without releasing resources
   * @returns {TaskManager} This manager instance for chaining
   * @override
   */
  reset() {
    super.reset();
    
    this.tasks.clear();
    this.tasksByName.clear();
    
    // Reset groups but keep the structure
    for (const group of this.taskGroups.values()) {
      group.tasks = [];
    }
    
    this._executionOrder = [];
    this._needsSort = true;
    
    console.log('TaskManager: Reset');
    return this;
  }
  
  /**
   * Clear all tasks and release resources
   * @returns {TaskManager} This manager instance for chaining
   * @override
   */
  clear() {
    super.clear();
    
    this.tasks.clear();
    this.tasksByName.clear();
    this.taskGroups.clear();
    this._executionOrder = [];
    
    console.log('TaskManager: Cleared');
    return this;
  }
  
  /**
   * Get task statistics
   * @returns {Object} Statistics about tasks
   */
  getStats() {
    const stats = {
      totalTasks: this.tasks.size,
      enabledTasks: Array.from(this.tasks.values()).filter(t => t.enabled).length,
      groups: {},
      tasksByTag: {}
    };
    
    // Count tasks by group
    for (const [name, group] of this.taskGroups.entries()) {
      stats.groups[name] = {
        count: group.tasks.length,
        enabled: group.enabled,
        priority: group.priority
      };
    }
    
    // Generate tag statistics
    const tags = new Set();
    for (const task of this.tasks.values()) {
      for (const tag of task.tags) {
        tags.add(tag);
      }
    }
    
    for (const tag of tags) {
      stats.tasksByTag[tag] = this.getTasksByTag(tag).length;
    }
    
    return stats;
  }
}

export { TaskManager };
