/**
 * Entities Tab Module
 * ======================================================================
 * Handles entity inspection and manipulation in DevTools
 */
export class EntitiesTab {
    constructor(devTools) {
        this.devTools = devTools;
        this.selectedEntity = null;
        this.filterText = '';
    }

    render() {
        const engineConnected = !!this.devTools.world;
        
        return `
            <div class="split-panel">
                <div class="panel-left">
                    <div class="panel-header">
                        <h3>Entities</h3>
                        <div class="entity-tools">
                            <button id="refresh-entities" title="Refresh entities list" ${!engineConnected ? 'disabled' : ''}>
                                🔄
                            </button>
                            <button id="add-entity" title="Create new entity" ${!engineConnected ? 'disabled' : ''}>
                                ➕
                            </button>
                        </div>
                    </div>
                    <div class="entity-search">
                        <input type="text" id="entity-filter" placeholder="Filter entities..." 
                               ${!engineConnected ? 'disabled' : ''}>
                    </div>
                    <div class="scrollable-list" id="entities-list">
                        ${this._renderEntitiesList()}
                    </div>
                </div>
                
                <div class="panel-right">
                    <div class="panel-header">
                        <h3>Entity Inspector</h3>
                        <div class="entity-tools">
                            <button id="add-component" title="Add component" 
                                    ${!engineConnected || !this.selectedEntity ? 'disabled' : ''}>
                                ➕
                            </button>
                            <button id="delete-entity" title="Delete entity" 
                                    ${!engineConnected || !this.selectedEntity ? 'disabled' : ''}>
                                🗑️
                            </button>
                        </div>
                    </div>
                    <div class="entity-inspector">
                        ${this._renderEntityInspector()}
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Filter input
        const filterInput = document.getElementById('entity-filter');
        if (filterInput) {
            filterInput.value = this.filterText;
            filterInput.addEventListener('input', (e) => {
                this.filterText = e.target.value;
                this._updateEntitiesList();
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refresh-entities');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this._updateEntitiesList());
        }

        // Add entity button
        const addEntityBtn = document.getElementById('add-entity');
        if (addEntityBtn) {
            addEntityBtn.addEventListener('click', () => this._createEntity());
        }

        // Add component button
        const addComponentBtn = document.getElementById('add-component');
        if (addComponentBtn) {
            addComponentBtn.addEventListener('click', () => this._showAddComponentDialog());
        }

        // Delete entity button
        const deleteEntityBtn = document.getElementById('delete-entity');
        if (deleteEntityBtn) {
            deleteEntityBtn.addEventListener('click', () => this._deleteSelectedEntity());
        }

        // Entity selection
        this._attachEntityListeners();
    }

    _renderEntitiesList() {
        if (!this.devTools.world) {
            return '<div class="empty-message">Connect to engine to view entities</div>';
        }

        const entities = Array.from(this.devTools.world.entityManager.entities.values());
        if (entities.length === 0) {
            return '<div class="empty-message">No entities found</div>';
        }

        const filteredEntities = this.filterText ? 
            entities.filter(entity => this._entityMatchesFilter(entity)) : 
            entities;

        return filteredEntities.map(entity => `
            <div class="entity-item ${entity.id === this.selectedEntity?.id ? 'selected' : ''}" 
                 data-entity-id="${entity.id}">
                <div class="entity-item-header">
                    <span class="entity-id">Entity #${entity.id}</span>
                    <small>${entity.components.size} components</small>
                </div>
                <div class="entity-item-meta">
                    ${Array.from(entity.components.keys()).join(', ')}
                </div>
                <div class="entity-item-actions">
                    <button class="inspect-entity" title="Inspect entity">🔍</button>
                </div>
            </div>
        `).join('');
    }

    _renderEntityInspector() {
        if (!this.selectedEntity) {
            return '<div class="inspector-message">Select an entity to inspect</div>';
        }

        return `
            <div class="inspector-header">
                <h4>Entity #${this.selectedEntity.id}</h4>
            </div>
            <div class="components-list">
                ${Array.from(this.selectedEntity.components.entries()).map(([name, component]) => `
                    <div class="component-item">
                        <div class="component-header">
                            <span class="component-name">${name}</span>
                            <button class="remove-component" data-component="${name}" title="Remove component">✕</button>
                        </div>
                        <pre class="component-data">${JSON.stringify(component, null, 2)}</pre>
                    </div>
                `).join('')}
            </div>
        `;
    }

    _entityMatchesFilter(entity) {
        const searchText = this.filterText.toLowerCase();
        if (entity.id.toString().includes(searchText)) return true;
        
        for (const componentName of entity.components.keys()) {
            if (componentName.toLowerCase().includes(searchText)) return true;
        }
        
        return false;
    }

    _attachEntityListeners() {
        const entityItems = document.querySelectorAll('.entity-item');
        entityItems.forEach(item => {
            const entityId = parseInt(item.dataset.entityId);
            
            // Inspect button
            const inspectBtn = item.querySelector('.inspect-entity');
            if (inspectBtn) {
                inspectBtn.addEventListener('click', () => this._inspectEntity(entityId));
            }
            
            // Click on item
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.entity-item-actions')) {
                    this._selectEntity(entityId);
                }
            });
        });

        // Component removal buttons
        const removeButtons = document.querySelectorAll('.remove-component');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const componentName = btn.dataset.component;
                this._removeComponent(componentName);
            });
        });
    }

    _updateEntitiesList() {
        const list = document.getElementById('entities-list');
        if (list) {
            list.innerHTML = this._renderEntitiesList();
            this._attachEntityListeners();
        }
    }

    _selectEntity(entityId) {
        if (!this.devTools.world) return;
        
        this.selectedEntity = this.devTools.world.entityManager.getEntity(entityId);
        const inspector = document.querySelector('.entity-inspector');
        if (inspector) {
            inspector.innerHTML = this._renderEntityInspector();
            this._attachEntityListeners();
        }

        // Update selection visual
        document.querySelectorAll('.entity-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.entityId === entityId.toString());
        });
    }

    _inspectEntity(entityId) {
        this._selectEntity(entityId);
    }

    _createEntity() {
        if (!this.devTools.world) return;
        
        const entity = this.devTools.world.entityManager.createEntity();
        this._updateEntitiesList();
        this._selectEntity(entity.id);
    }

    _deleteSelectedEntity() {
        if (!this.selectedEntity || !this.devTools.world) return;
        
        this.devTools.world.entityManager.removeEntity(this.selectedEntity.id);
        this.selectedEntity = null;
        this._updateEntitiesList();
        
        const inspector = document.querySelector('.entity-inspector');
        if (inspector) {
            inspector.innerHTML = this._renderEntityInspector();
        }
    }

    _showAddComponentDialog() {
        if (!this.selectedEntity || !this.devTools.world) return;
        
        // Get available component types
        const availableComponents = this._getAvailableComponents();
        
        const dialog = document.createElement('div');
        dialog.className = 'devtools-modal';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add Component</h3>
                    <button class="close-modal">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="component-type">Component Type</label>
                        <select id="component-type">
                            ${availableComponents.map(type => 
                                `<option value="${type}">${type}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="cancel-add-component">Cancel</button>
                    <button id="confirm-add-component" class="primary-button">Add</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Event listeners
        const closeBtn = dialog.querySelector('.close-modal');
        const cancelBtn = dialog.querySelector('#cancel-add-component');
        const confirmBtn = dialog.querySelector('#confirm-add-component');

        const closeDialog = () => {
            dialog.remove();
        };

        closeBtn.addEventListener('click', closeDialog);
        cancelBtn.addEventListener('click', closeDialog);
        
        confirmBtn.addEventListener('click', () => {
            const componentType = dialog.querySelector('#component-type').value;
            this._addComponent(componentType);
            closeDialog();
        });
    }

    _getAvailableComponents() {
        // This should return a list of available component types
        // Implementation depends on your engine's component registry
        return ['Position', 'Appearance', 'Physics', 'Input', 'Script'];
    }

    _addComponent(componentType) {
        if (!this.selectedEntity || !this.devTools.world) return;
        
        // Implementation depends on your engine's component system
        const component = this.devTools.world.componentManager.createComponent(componentType);
        this.selectedEntity.addComponent(component);
        
        const inspector = document.querySelector('.entity-inspector');
        if (inspector) {
            inspector.innerHTML = this._renderEntityInspector();
            this._attachEntityListeners();
        }
    }

    _removeComponent(componentName) {
        if (!this.selectedEntity || !this.devTools.world) return;
        
        this.selectedEntity.removeComponent(componentName);
        
        const inspector = document.querySelector('.entity-inspector');
        if (inspector) {
            inspector.innerHTML = this._renderEntityInspector();
            this._attachEntityListeners();
        }
    }
}