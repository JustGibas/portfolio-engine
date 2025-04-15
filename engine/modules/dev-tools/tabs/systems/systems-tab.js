/**
 * Systems Tab Module
 * ======================================================================
 * Handles system monitoring and control in DevTools
 */
export class SystemsTab {
    constructor(devTools) {
        this.devTools = devTools;
        this.selectedSystem = null;
        this.filterText = '';
        this.sortField = 'priority';
        this.sortDirection = 'asc';
    }

    render() {
        const engineConnected = !!this.devTools.world;
        
        return `
            <div class="systems-header">
                <div class="systems-controls">
                    <button id="refresh-systems" ${!engineConnected ? 'disabled' : ''}>
                        🔄 Refresh
                    </button>
                    <div class="sort-controls">
                        <label>Sort by:</label>
                        <select id="sort-field" ${!engineConnected ? 'disabled' : ''}>
                            <option value="priority">Priority</option>
                            <option value="name">Name</option>
                            <option value="executionTime">Execution Time</option>
                        </select>
                        <button id="toggle-sort" ${!engineConnected ? 'disabled' : ''}>
                            ${this.sortDirection === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                </div>
                <div class="systems-filter">
                    <input type="text" id="system-filter" placeholder="Filter systems..." 
                           value="${this.filterText}" ${!engineConnected ? 'disabled' : ''}>
                </div>
            </div>
            
            <div class="systems-table-container">
                <table class="systems-table">
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>System</th>
                            <th>Priority</th>
                            <th>Last Execution</th>
                            <th>Average Time</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this._renderSystemsList()}
                    </tbody>
                </table>
            </div>

            <div class="system-detail-panel">
                <h4>System Details</h4>
                ${this._renderSystemDetails()}
            </div>
        `;
    }

    attachEventListeners() {
        // Filter input
        const filterInput = document.getElementById('system-filter');
        if (filterInput) {
            filterInput.addEventListener('input', (e) => {
                this.filterText = e.target.value;
                this._updateList();
            });
        }

        // Sort controls
        const sortField = document.getElementById('sort-field');
        if (sortField) {
            sortField.value = this.sortField;
            sortField.addEventListener('change', (e) => {
                this.sortField = e.target.value;
                this._updateList();
            });
        }

        const sortToggle = document.getElementById('toggle-sort');
        if (sortToggle) {
            sortToggle.addEventListener('click', () => {
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                sortToggle.textContent = this.sortDirection === 'asc' ? '↑' : '↓';
                this._updateList();
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refresh-systems');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this._updateList());
        }

        // System actions
        this._attachSystemListeners();
    }

    _renderSystemsList() {
        if (!this.devTools.world) {
            return '<tr><td colspan="6">Connect to engine to view systems</td></tr>';
        }

        const systems = this._getSystems();
        if (systems.length === 0) {
            return '<tr><td colspan="6">No systems found</td></tr>';
        }

        return systems.map(system => `
            <tr class="system-row ${system.enabled ? '' : 'disabled'}" data-system="${system.name}">
                <td>
                    <span class="status-indicator ${system.enabled ? 'enabled' : 'disabled'}">
                        ${system.enabled ? '●' : '○'}
                    </span>
                </td>
                <td>${system.name}</td>
                <td>${system.priority}</td>
                <td>${system.lastExecutionTime?.toFixed(2) || '0.00'}ms</td>
                <td>${system.averageExecutionTime?.toFixed(2) || '0.00'}ms</td>
                <td class="system-actions">
                    <button class="toggle-system" title="${system.enabled ? 'Disable' : 'Enable'} system">
                        ${system.enabled ? '⏸️' : '▶️'}
                    </button>
                    <button class="inspect-system" title="View details">🔍</button>
                    <button class="system-settings" title="Settings">⚙️</button>
                </td>
            </tr>
        `).join('');
    }

    _renderSystemDetails() {
        if (!this.selectedSystem) {
            return '<div class="empty-message">Select a system to view details</div>';
        }

        return `
            <div class="system-info">
                <div class="info-group">
                    <label>Name:</label>
                    <span>${this.selectedSystem.name}</span>
                </div>
                <div class="info-group">
                    <label>Status:</label>
                    <span>${this.selectedSystem.enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div class="info-group">
                    <label>Priority:</label>
                    <span>${this.selectedSystem.priority}</span>
                </div>
                <div class="info-group">
                    <label>Performance:</label>
                    <div class="performance-stats">
                        <div>
                            <span>Last Execution:</span>
                            <strong>${this.selectedSystem.lastExecutionTime?.toFixed(2) || '0.00'}ms</strong>
                        </div>
                        <div>
                            <span>Average Time:</span>
                            <strong>${this.selectedSystem.averageExecutionTime?.toFixed(2) || '0.00'}ms</strong>
                        </div>
                        <div>
                            <span>Peak Time:</span>
                            <strong>${this.selectedSystem.peakExecutionTime?.toFixed(2) || '0.00'}ms</strong>
                        </div>
                    </div>
                </div>
                ${this._renderSystemSpecificInfo()}
            </div>
        `;
    }

    _renderSystemSpecificInfo() {
        if (!this.selectedSystem) return '';

        // Render system-specific information based on the type of system
        switch (this.selectedSystem.constructor.name) {
            case 'RenderSystem':
                return this._renderRenderSystemInfo();
            case 'PhysicsSystem':
                return this._renderPhysicsSystemInfo();
            case 'AnimationSystem':
                return this._renderAnimationSystemInfo();
            default:
                return '';
        }
    }

    _renderRenderSystemInfo() {
        return `
            <div class="info-group">
                <label>Render Stats:</label>
                <div class="stats-grid">
                    <div>
                        <span>Draw Calls:</span>
                        <strong>${this.selectedSystem.drawCalls || 0}</strong>
                    </div>
                    <div>
                        <span>Vertices:</span>
                        <strong>${this.selectedSystem.vertices || 0}</strong>
                    </div>
                    <div>
                        <span>Elements:</span>
                        <strong>${this.selectedSystem.elements?.length || 0}</strong>
                    </div>
                </div>
            </div>
        `;
    }

    _renderPhysicsSystemInfo() {
        return `
            <div class="info-group">
                <label>Physics Stats:</label>
                <div class="stats-grid">
                    <div>
                        <span>Bodies:</span>
                        <strong>${this.selectedSystem.bodies?.length || 0}</strong>
                    </div>
                    <div>
                        <span>Collisions:</span>
                        <strong>${this.selectedSystem.collisions || 0}</strong>
                    </div>
                    <div>
                        <span>Updates:</span>
                        <strong>${this.selectedSystem.updates || 0}/s</strong>
                    </div>
                </div>
            </div>
        `;
    }

    _renderAnimationSystemInfo() {
        return `
            <div class="info-group">
                <label>Animation Stats:</label>
                <div class="stats-grid">
                    <div>
                        <span>Active:</span>
                        <strong>${this.selectedSystem.activeAnimations || 0}</strong>
                    </div>
                    <div>
                        <span>Completed:</span>
                        <strong>${this.selectedSystem.completedAnimations || 0}</strong>
                    </div>
                    <div>
                        <span>Frame Rate:</span>
                        <strong>${this.selectedSystem.frameRate || 60}fps</strong>
                    </div>
                </div>
            </div>
        `;
    }

    _getSystems() {
        if (!this.devTools.world?.systemManager?.systems) return [];
        
        let systems = this.devTools.world.systemManager.systems
            .map(system => ({
                name: system.constructor.name,
                priority: system.priority || 0,
                enabled: system.enabled !== false,
                lastExecutionTime: system.lastExecutionTime,
                averageExecutionTime: system.averageExecutionTime,
                peakExecutionTime: system.peakExecutionTime,
                ...system
            }));

        // Apply filter
        if (this.filterText) {
            const searchText = this.filterText.toLowerCase();
            systems = systems.filter(system => 
                system.name.toLowerCase().includes(searchText));
        }

        // Apply sorting
        systems.sort((a, b) => {
            let comparison = 0;
            switch (this.sortField) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'priority':
                    comparison = a.priority - b.priority;
                    break;
                case 'executionTime':
                    comparison = (a.averageExecutionTime || 0) - (b.averageExecutionTime || 0);
                    break;
            }
            return this.sortDirection === 'asc' ? comparison : -comparison;
        });

        return systems;
    }

    _attachSystemListeners() {
        // System row actions
        document.querySelectorAll('.system-row').forEach(row => {
            const systemName = row.dataset.system;
            
            // Toggle system
            row.querySelector('.toggle-system')?.addEventListener('click', () => 
                this._toggleSystem(systemName));
            
            // Inspect system
            row.querySelector('.inspect-system')?.addEventListener('click', () => 
                this._selectSystem(systemName));
            
            // System settings
            row.querySelector('.system-settings')?.addEventListener('click', () => 
                this._showSystemSettings(systemName));
        });
    }

    _updateList() {
        const tbody = document.querySelector('.systems-table tbody');
        if (tbody) {
            tbody.innerHTML = this._renderSystemsList();
            this._attachSystemListeners();
        }
    }

    _selectSystem(systemName) {
        if (!this.devTools.world) return;
        
        const system = this._getSystems().find(s => s.name === systemName);
        if (system) {
            this.selectedSystem = system;
            
            const detailPanel = document.querySelector('.system-detail-panel');
            if (detailPanel) {
                detailPanel.innerHTML = `<h4>System Details</h4>${this._renderSystemDetails()}`;
            }
        }
    }

    _toggleSystem(systemName) {
        if (!this.devTools.world) return;
        
        const system = this.devTools.world.systemManager.getSystem(systemName);
        if (system) {
            system.enabled = !system.enabled;
            this._updateList();
            
            if (this.selectedSystem?.name === systemName) {
                this._selectSystem(systemName);
            }
        }
    }

    _showSystemSettings(systemName) {
        const system = this._getSystems().find(s => s.name === systemName);
        if (!system) return;

        const dialog = document.createElement('div');
        dialog.className = 'devtools-modal';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${system.name} Settings</h3>
                    <button class="close-modal">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="system-priority">Priority</label>
                        <input type="number" id="system-priority" value="${system.priority || 0}">
                    </div>
                    ${this._renderSystemSpecificSettings(system)}
                </div>
                <div class="modal-footer">
                    <button id="cancel-settings">Cancel</button>
                    <button id="save-settings" class="primary-button">Save</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Event listeners
        dialog.querySelector('.close-modal').addEventListener('click', () => dialog.remove());
        dialog.querySelector('#cancel-settings').addEventListener('click', () => dialog.remove());
        dialog.querySelector('#save-settings').addEventListener('click', () => {
            this._saveSystemSettings(system, dialog);
        });
    }

    _renderSystemSpecificSettings(system) {
        // Render additional settings based on system type
        switch (system.constructor.name) {
            case 'RenderSystem':
                return `
                    <div class="form-group">
                        <label for="vsync">VSync</label>
                        <input type="checkbox" id="vsync" ${system.vsync ? 'checked' : ''}>
                    </div>
                `;
            case 'PhysicsSystem':
                return `
                    <div class="form-group">
                        <label for="timestep">Fixed Timestep (ms)</label>
                        <input type="number" id="timestep" value="${system.timestep || 16.66}">
                    </div>
                `;
            default:
                return '';
        }
    }

    _saveSystemSettings(system, dialog) {
        if (!this.devTools.world) return;

        const priority = parseInt(dialog.querySelector('#system-priority').value);
        system.priority = priority;

        // Save system-specific settings
        switch (system.constructor.name) {
            case 'RenderSystem':
                system.vsync = dialog.querySelector('#vsync').checked;
                break;
            case 'PhysicsSystem':
                system.timestep = parseFloat(dialog.querySelector('#timestep').value);
                break;
        }

        this._updateList();
        if (this.selectedSystem?.name === system.name) {
            this._selectSystem(system.name);
        }

        dialog.remove();
    }
}