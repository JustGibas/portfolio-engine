/**
 * Tasks Tab Module
 * ======================================================================
 * Handles task management and monitoring in DevTools
 */
export class TasksTab {
    constructor(devTools) {
        this.devTools = devTools;
        this.selectedTask = null;
        this.filterText = '';
        this.sortBy = 'priority';
        this.sortOrder = 'desc';
    }

    render() {
        const engineConnected = !!this.devTools.world;
        
        return `
            <div class="tasks-header">
                <div class="tasks-controls">
                    <div class="task-actions">
                        <button id="add-task" ${!engineConnected ? 'disabled' : ''}>
                            ➕ New Task
                        </button>
                        <button id="pause-all" ${!engineConnected ? 'disabled' : ''}>
                            ⏸️ Pause All
                        </button>
                        <button id="resume-all" ${!engineConnected ? 'disabled' : ''}>
                            ▶️ Resume All
                        </button>
                    </div>
                    <div class="task-filters">
                        <input type="text" id="task-filter" placeholder="Filter tasks..." 
                               value="${this.filterText}" ${!engineConnected ? 'disabled' : ''}>
                        <select id="sort-by" ${!engineConnected ? 'disabled' : ''}>
                            <option value="priority">Priority</option>
                            <option value="status">Status</option>
                            <option value="created">Created</option>
                            <option value="name">Name</option>
                        </select>
                        <button id="sort-order" title="Toggle sort order" ${!engineConnected ? 'disabled' : ''}>
                            ${this.sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                </div>

                <div class="task-stats">
                    <div class="stat-item">
                        <span>Total Tasks</span>
                        <strong>${this._getTaskCount()}</strong>
                    </div>
                    <div class="stat-item">
                        <span>Running</span>
                        <strong>${this._getTaskCountByStatus('running')}</strong>
                    </div>
                    <div class="stat-item">
                        <span>Pending</span>
                        <strong>${this._getTaskCountByStatus('pending')}</strong>
                    </div>
                    <div class="stat-item">
                        <span>Completed</span>
                        <strong>${this._getTaskCountByStatus('completed')}</strong>
                    </div>
                </div>
            </div>

            <div class="tasks-container">
                <div class="tasks-list">
                    ${this._renderTasksList()}
                </div>

                <div class="task-detail-panel">
                    <h4>Task Details</h4>
                    ${this._renderTaskDetails()}
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Task action buttons
        const addBtn = document.getElementById('add-task');
        if (addBtn) {
            addBtn.addEventListener('click', () => this._showAddTaskDialog());
        }

        const pauseAllBtn = document.getElementById('pause-all');
        if (pauseAllBtn) {
            pauseAllBtn.addEventListener('click', () => this._pauseAllTasks());
        }

        const resumeAllBtn = document.getElementById('resume-all');
        if (resumeAllBtn) {
            resumeAllBtn.addEventListener('click', () => this._resumeAllTasks());
        }

        // Filter and sort controls
        const filterInput = document.getElementById('task-filter');
        if (filterInput) {
            filterInput.addEventListener('input', (e) => {
                this.filterText = e.target.value;
                this._updateList();
            });
        }

        const sortSelect = document.getElementById('sort-by');
        if (sortSelect) {
            sortSelect.value = this.sortBy;
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this._updateList();
            });
        }

        const sortOrderBtn = document.getElementById('sort-order');
        if (sortOrderBtn) {
            sortOrderBtn.addEventListener('click', () => {
                this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
                sortOrderBtn.textContent = this.sortOrder === 'asc' ? '↑' : '↓';
                this._updateList();
            });
        }

        // Task selection and actions
        this._attachTaskListeners();
    }

    _renderTasksList() {
        if (!this.devTools.world) {
            return '<div class="empty-message">Connect to engine to view tasks</div>';
        }

        const tasks = this._getTasks();
        if (tasks.length === 0) {
            return '<div class="empty-message">No tasks found</div>';
        }

        const sortedTasks = this._sortTasks(this._filterTasks(tasks));
        return sortedTasks.map(task => `
            <div class="task-item ${task.id === this.selectedTask?.id ? 'selected' : ''}"
                 data-task-id="${task.id}">
                <div class="task-item-header">
                    <div class="task-info">
                        <span class="task-name">${task.name}</span>
                        <span class="task-priority priority-${task.priority}">${task.priority}</span>
                    </div>
                    <div class="task-status status-${task.status}">${task.status}</div>
                </div>
                <div class="task-item-body">
                    <div class="task-progress">
                        <div class="progress-bar" style="width: ${task.progress || 0}%"></div>
                        <span class="progress-text">${task.progress || 0}%</span>
                    </div>
                </div>
                <div class="task-item-footer">
                    <span class="task-time">${this._formatTime(task.created)}</span>
                    <div class="task-actions">
                        ${this._renderTaskActions(task)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    _renderTaskActions(task) {
        const actions = [];
        
        switch (task.status) {
            case 'pending':
                actions.push('<button class="start-task" title="Start">▶️</button>');
                actions.push('<button class="delete-task" title="Delete">🗑️</button>');
                break;
            case 'running':
                actions.push('<button class="pause-task" title="Pause">⏸️</button>');
                actions.push('<button class="stop-task" title="Stop">⏹️</button>');
                break;
            case 'paused':
                actions.push('<button class="resume-task" title="Resume">▶️</button>');
                actions.push('<button class="stop-task" title="Stop">⏹️</button>');
                break;
            case 'completed':
                actions.push('<button class="restart-task" title="Restart">🔄</button>');
                actions.push('<button class="delete-task" title="Delete">🗑️</button>');
                break;
        }
        
        return actions.join('');
    }

    _renderTaskDetails() {
        if (!this.selectedTask) {
            return '<div class="empty-message">Select a task to view details</div>';
        }

        return `
            <div class="task-info">
                <div class="info-group">
                    <label>Name:</label>
                    <span>${this.selectedTask.name}</span>
                </div>
                <div class="info-group">
                    <label>Status:</label>
                    <span class="status-${this.selectedTask.status}">${this.selectedTask.status}</span>
                </div>
                <div class="info-group">
                    <label>Priority:</label>
                    <span class="priority-${this.selectedTask.priority}">${this.selectedTask.priority}</span>
                </div>
                <div class="info-group">
                    <label>Progress:</label>
                    <div class="progress-bar-large">
                        <div class="progress-fill" style="width: ${this.selectedTask.progress || 0}%"></div>
                        <span>${this.selectedTask.progress || 0}%</span>
                    </div>
                </div>
                <div class="info-group">
                    <label>Created:</label>
                    <span>${new Date(this.selectedTask.created).toLocaleString()}</span>
                </div>
                <div class="info-group">
                    <label>Last Updated:</label>
                    <span>${new Date(this.selectedTask.lastUpdated).toLocaleString()}</span>
                </div>
                <div class="info-group">
                    <label>Description:</label>
                    <p>${this.selectedTask.description || 'No description provided'}</p>
                </div>
                <div class="info-group">
                    <label>Dependencies:</label>
                    <div class="dependencies-list">
                        ${this._renderDependencies()}
                    </div>
                </div>
                <div class="info-group">
                    <label>Error Log:</label>
                    <pre class="error-log">${this.selectedTask.errors?.join('\n') || 'No errors'}</pre>
                </div>
            </div>
        `;
    }

    _renderDependencies() {
        if (!this.selectedTask.dependencies?.length) {
            return '<span class="empty-message">No dependencies</span>';
        }

        return this.selectedTask.dependencies.map(dep => `
            <div class="dependency-item">
                <span class="dependency-name">${dep.name}</span>
                <span class="dependency-status status-${dep.status}">${dep.status}</span>
            </div>
        `).join('');
    }

    _getTasks() {
        if (!this.devTools.world?.taskManager) return [];
        return Array.from(this.devTools.world.taskManager.tasks.values());
    }

    _getTaskCount() {
        return this._getTasks().length;
    }

    _getTaskCountByStatus(status) {
        return this._getTasks().filter(task => task.status === status).length;
    }

    _filterTasks(tasks) {
        if (!this.filterText) return tasks;
        
        const searchText = this.filterText.toLowerCase();
        return tasks.filter(task => 
            task.name.toLowerCase().includes(searchText) ||
            task.description?.toLowerCase().includes(searchText) ||
            task.status.toLowerCase().includes(searchText));
    }

    _sortTasks(tasks) {
        const direction = this.sortOrder === 'asc' ? 1 : -1;
        
        return [...tasks].sort((a, b) => {
            switch (this.sortBy) {
                case 'priority':
                    return (this._getPriorityValue(a.priority) - this._getPriorityValue(b.priority)) * direction;
                case 'status':
                    return (this._getStatusValue(a.status) - this._getStatusValue(b.status)) * direction;
                case 'created':
                    return (a.created - b.created) * direction;
                case 'name':
                    return a.name.localeCompare(b.name) * direction;
                default:
                    return 0;
            }
        });
    }

    _getPriorityValue(priority) {
        const priorities = { low: 0, medium: 1, high: 2, critical: 3 };
        return priorities[priority] || 0;
    }

    _getStatusValue(status) {
        const statuses = { pending: 0, running: 1, paused: 2, completed: 3, failed: 4 };
        return statuses[status] || 0;
    }

    _formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        } else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `${minutes}m ago`;
        } else if (diff < 86400000) { // Less than 1 day
            const hours = Math.floor(diff / 3600000);
            return `${hours}h ago`;
        } else {
            return new Date(timestamp).toLocaleDateString();
        }
    }

    _attachTaskListeners() {
        // Task selection
        document.querySelectorAll('.task-item').forEach(item => {
            const taskId = item.dataset.taskId;
            
            // Select task on click (except when clicking action buttons)
            item.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    this._selectTask(taskId);
                }
            });

            // Task actions
            item.querySelector('.start-task')?.addEventListener('click', () => this._startTask(taskId));
            item.querySelector('.pause-task')?.addEventListener('click', () => this._pauseTask(taskId));
            item.querySelector('.resume-task')?.addEventListener('click', () => this._resumeTask(taskId));
            item.querySelector('.stop-task')?.addEventListener('click', () => this._stopTask(taskId));
            item.querySelector('.restart-task')?.addEventListener('click', () => this._restartTask(taskId));
            item.querySelector('.delete-task')?.addEventListener('click', () => this._deleteTask(taskId));
        });
    }

    _selectTask(taskId) {
        const task = this._getTasks().find(t => t.id === taskId);
        if (task) {
            this.selectedTask = task;
            
            const detailPanel = document.querySelector('.task-detail-panel');
            if (detailPanel) {
                detailPanel.innerHTML = `<h4>Task Details</h4>${this._renderTaskDetails()}`;
            }

            // Update selection visual
            document.querySelectorAll('.task-item').forEach(item => {
                item.classList.toggle('selected', item.dataset.taskId === taskId);
            });
        }
    }

    _updateList() {
        const list = document.querySelector('.tasks-list');
        if (list) {
            list.innerHTML = this._renderTasksList();
            this._attachTaskListeners();
        }
    }

    _showAddTaskDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'devtools-modal';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add New Task</h3>
                    <button class="close-modal">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="task-name">Name</label>
                        <input type="text" id="task-name" placeholder="Task name">
                    </div>
                    <div class="form-group">
                        <label for="task-description">Description</label>
                        <textarea id="task-description" rows="3" placeholder="Task description"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="task-priority">Priority</label>
                        <select id="task-priority">
                            <option value="low">Low</option>
                            <option value="medium" selected>Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Dependencies</label>
                        <div class="dependencies-selector">
                            ${this._renderDependencyOptions()}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="cancel-add-task">Cancel</button>
                    <button id="confirm-add-task" class="primary-button">Add Task</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Event listeners
        dialog.querySelector('.close-modal').addEventListener('click', () => dialog.remove());
        dialog.querySelector('#cancel-add-task').addEventListener('click', () => dialog.remove());
        dialog.querySelector('#confirm-add-task').addEventListener('click', () => {
            this._createTask(dialog);
            dialog.remove();
        });
    }

    _renderDependencyOptions() {
        const tasks = this._getTasks()
            .filter(task => task.status !== 'completed' && task.status !== 'failed');
            
        if (tasks.length === 0) {
            return '<div class="empty-message">No available tasks to depend on</div>';
        }

        return tasks.map(task => `
            <label class="checkbox-label">
                <input type="checkbox" value="${task.id}">
                ${task.name} (${task.status})
            </label>
        `).join('');
    }

    async _createTask(dialog) {
        const name = dialog.querySelector('#task-name').value;
        const description = dialog.querySelector('#task-description').value;
        const priority = dialog.querySelector('#task-priority').value;
        const dependencies = Array.from(dialog.querySelectorAll('.dependencies-selector input:checked'))
            .map(cb => cb.value);

        if (!name) {
            this.devTools._showNotification('Task name is required', true);
            return;
        }

        try {
            await this.devTools.world.taskManager.createTask({
                name,
                description,
                priority,
                dependencies
            });
            
            this._updateList();
            this.devTools._showNotification('Task created successfully');
        } catch (err) {
            this.devTools._showNotification(`Failed to create task: ${err.message}`, true);
        }
    }

    async _startTask(taskId) {
        try {
            await this.devTools.world.taskManager.startTask(taskId);
            this._updateList();
        } catch (err) {
            this.devTools._showNotification(`Failed to start task: ${err.message}`, true);
        }
    }

    async _pauseTask(taskId) {
        try {
            await this.devTools.world.taskManager.pauseTask(taskId);
            this._updateList();
        } catch (err) {
            this.devTools._showNotification(`Failed to pause task: ${err.message}`, true);
        }
    }

    async _resumeTask(taskId) {
        try {
            await this.devTools.world.taskManager.resumeTask(taskId);
            this._updateList();
        } catch (err) {
            this.devTools._showNotification(`Failed to resume task: ${err.message}`, true);
        }
    }

    async _stopTask(taskId) {
        try {
            await this.devTools.world.taskManager.stopTask(taskId);
            this._updateList();
        } catch (err) {
            this.devTools._showNotification(`Failed to stop task: ${err.message}`, true);
        }
    }

    async _restartTask(taskId) {
        try {
            await this.devTools.world.taskManager.restartTask(taskId);
            this._updateList();
        } catch (err) {
            this.devTools._showNotification(`Failed to restart task: ${err.message}`, true);
        }
    }

    async _deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                await this.devTools.world.taskManager.deleteTask(taskId);
                if (this.selectedTask?.id === taskId) {
                    this.selectedTask = null;
                }
                this._updateList();
            } catch (err) {
                this.devTools._showNotification(`Failed to delete task: ${err.message}`, true);
            }
        }
    }

    async _pauseAllTasks() {
        try {
            await this.devTools.world.taskManager.pauseAllTasks();
            this._updateList();
        } catch (err) {
            this.devTools._showNotification(`Failed to pause all tasks: ${err.message}`, true);
        }
    }

    async _resumeAllTasks() {
        try {
            await this.devTools.world.taskManager.resumeAllTasks();
            this._updateList();
        } catch (err) {
            this.devTools._showNotification(`Failed to resume all tasks: ${err.message}`, true);
        }
    }
}