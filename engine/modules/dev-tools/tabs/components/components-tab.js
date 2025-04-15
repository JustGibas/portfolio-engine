/**
 * Components Tab Module
 * ======================================================================
 * Handles component type management and inspection in DevTools
 */
export class ComponentsTab {
    constructor(devTools) {
        this.devTools = devTools;
        this.selectedComponent = null;
        this.filterText = '';
    }

    render() {
        const engineConnected = !!this.devTools.world;
        
        return `
            <div class="components-header">
                <h3>Components</h3>
                <div class="components-tools">
                    <button id="refresh-components" ${!engineConnected ? 'disabled' : ''}>
                        🔄 Refresh
                    </button>
                    <button id="register-component" ${!engineConnected ? 'disabled' : ''}>
                        ➕ Register Component
                    </button>
                </div>
            </div>
            
            <div class="components-search">
                <input type="text" id="component-filter" placeholder="Filter components..." 
                       value="${this.filterText}" ${!engineConnected ? 'disabled' : ''}>
            </div>
            
            <div class="components-grid">
                ${this._renderComponentsList()}
            </div>

            <div class="component-details">
                <h4>Component Details</h4>
                ${this._renderComponentDetails()}
            </div>
        `;
    }

    attachEventListeners() {
        // Filter input
        const filterInput = document.getElementById('component-filter');
        if (filterInput) {
            filterInput.addEventListener('input', (e) => {
                this.filterText = e.target.value;
                this._updateList();
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refresh-components');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this._updateList());
        }

        // Register component button
        const registerBtn = document.getElementById('register-component');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => this._showRegisterDialog());
        }

        // Component selection
        this._attachComponentListeners();
    }

    _renderComponentsList() {
        if (!this.devTools.world) {
            return '<div class="empty-message">Connect to engine to view components</div>';
        }

        const components = this._getRegisteredComponents();
        if (components.length === 0) {
            return '<div class="empty-message">No components registered</div>';
        }

        const filteredComponents = this.filterText ? 
            components.filter(comp => this._componentMatchesFilter(comp)) : 
            components;

        return filteredComponents.map(component => `
            <div class="component-card ${component.name === this.selectedComponent?.name ? 'selected' : ''}"
                 data-component="${component.name}">
                <div class="component-card-header">
                    <h4>${component.name}</h4>
                    <div class="component-meta">
                        <span title="Active instances">${this._getInstanceCount(component.name)} instances</span>
                    </div>
                </div>
                <div class="component-card-body">
                    <div class="schema-preview">
                        ${this._renderSchemaPreview(component)}
                    </div>
                </div>
                <div class="component-card-footer">
                    <button class="view-details" title="View details">🔍</button>
                    <button class="edit-schema" title="Edit schema">✏️</button>
                </div>
            </div>
        `).join('');
    }

    _renderComponentDetails() {
        if (!this.selectedComponent) {
            return '<div class="empty-message">Select a component to view details</div>';
        }

        return `
            <div class="component-info">
                <div class="info-group">
                    <label>Name:</label>
                    <span>${this.selectedComponent.name}</span>
                </div>
                <div class="info-group">
                    <label>Active Instances:</label>
                    <span>${this._getInstanceCount(this.selectedComponent.name)}</span>
                </div>
                <div class="info-group">
                    <label>Schema:</label>
                    <pre class="component-schema">${JSON.stringify(this.selectedComponent.schema, null, 2)}</pre>
                </div>
                <div class="info-group">
                    <label>Default Values:</label>
                    <pre class="component-defaults">${JSON.stringify(this.selectedComponent.defaults, null, 2)}</pre>
                </div>
            </div>
        `;
    }

    _renderSchemaPreview(component) {
        const schema = component.schema || {};
        const preview = Object.keys(schema)
            .slice(0, 3)
            .map(key => `${key}: ${schema[key].type}`)
            .join('\n');
            
        return `<pre>${preview}${Object.keys(schema).length > 3 ? '\n...' : ''}</pre>`;
    }

    _getRegisteredComponents() {
        if (!this.devTools.world?.componentManager) return [];
        
        // This implementation depends on your engine's component system
        return Array.from(this.devTools.world.componentManager.registry.values());
    }

    _getInstanceCount(componentName) {
        if (!this.devTools.world?.entityManager) return 0;
        
        // Count entities that have this component
        return Array.from(this.devTools.world.entityManager.entities.values())
            .filter(entity => entity.hasComponent(componentName))
            .length;
    }

    _componentMatchesFilter(component) {
        const searchText = this.filterText.toLowerCase();
        
        return component.name.toLowerCase().includes(searchText) ||
            Object.keys(component.schema || {}).some(key => 
                key.toLowerCase().includes(searchText));
    }

    _attachComponentListeners() {
        document.querySelectorAll('.component-card').forEach(card => {
            const componentName = card.dataset.component;
            
            card.querySelector('.view-details')?.addEventListener('click', () => 
                this._selectComponent(componentName));
                
            card.querySelector('.edit-schema')?.addEventListener('click', () => 
                this._showSchemaEditor(componentName));
        });
    }

    _updateList() {
        const grid = document.querySelector('.components-grid');
        if (grid) {
            grid.innerHTML = this._renderComponentsList();
            this._attachComponentListeners();
        }
    }

    _selectComponent(componentName) {
        if (!this.devTools.world) return;
        
        const component = this._getRegisteredComponents()
            .find(c => c.name === componentName);
            
        if (component) {
            this.selectedComponent = component;
            
            // Update details panel
            const details = document.querySelector('.component-details');
            if (details) {
                details.innerHTML = `<h4>Component Details</h4>${this._renderComponentDetails()}`;
            }

            // Update selection visual
            document.querySelectorAll('.component-card').forEach(card => {
                card.classList.toggle('selected', card.dataset.component === componentName);
            });
        }
    }

    _showRegisterDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'devtools-modal';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Register New Component</h3>
                    <button class="close-modal">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="component-name">Component Name</label>
                        <input type="text" id="component-name" placeholder="e.g., Position">
                    </div>
                    <div class="form-group">
                        <label for="component-schema">Schema (JSON)</label>
                        <textarea id="component-schema" rows="6" placeholder="{&#13;&#10;  &quot;x&quot;: { &quot;type&quot;: &quot;number&quot;, &quot;default&quot;: 0 },&#13;&#10;  &quot;y&quot;: { &quot;type&quot;: &quot;number&quot;, &quot;default&quot;: 0 }&#13;&#10;}"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="cancel-register">Cancel</button>
                    <button id="confirm-register" class="primary-button">Register</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Event listeners
        dialog.querySelector('.close-modal').addEventListener('click', () => dialog.remove());
        dialog.querySelector('#cancel-register').addEventListener('click', () => dialog.remove());
        dialog.querySelector('#confirm-register').addEventListener('click', () => {
            const name = document.getElementById('component-name').value;
            const schema = document.getElementById('component-schema').value;
            
            try {
                const schemaObj = JSON.parse(schema);
                this._registerComponent(name, schemaObj);
                dialog.remove();
            } catch (err) {
                this.devTools._showNotification('Invalid schema JSON', true);
            }
        });
    }

    _showSchemaEditor(componentName) {
        const component = this._getRegisteredComponents()
            .find(c => c.name === componentName);
            
        if (!component) return;

        const dialog = document.createElement('div');
        dialog.className = 'devtools-modal';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit ${componentName} Schema</h3>
                    <button class="close-modal">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="edit-schema">Schema (JSON)</label>
                        <textarea id="edit-schema" rows="10">${JSON.stringify(component.schema, null, 2)}</textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="cancel-edit">Cancel</button>
                    <button id="confirm-edit" class="primary-button">Save</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Event listeners
        dialog.querySelector('.close-modal').addEventListener('click', () => dialog.remove());
        dialog.querySelector('#cancel-edit').addEventListener('click', () => dialog.remove());
        dialog.querySelector('#confirm-edit').addEventListener('click', () => {
            const schema = document.getElementById('edit-schema').value;
            
            try {
                const schemaObj = JSON.parse(schema);
                this._updateComponentSchema(componentName, schemaObj);
                dialog.remove();
            } catch (err) {
                this.devTools._showNotification('Invalid schema JSON', true);
            }
        });
    }

    _registerComponent(name, schema) {
        if (!this.devTools.world) return;
        
        try {
            // Implementation depends on your engine's component system
            this.devTools.world.componentManager.registerComponent(name, schema);
            this._updateList();
            this.devTools._showNotification(`Component ${name} registered successfully`);
        } catch (err) {
            this.devTools._showNotification(`Failed to register component: ${err.message}`, true);
        }
    }

    _updateComponentSchema(componentName, schema) {
        if (!this.devTools.world) return;
        
        try {
            // Implementation depends on your engine's component system
            this.devTools.world.componentManager.updateSchema(componentName, schema);
            this._updateList();
            this.devTools._showNotification(`Schema updated successfully`);
        } catch (err) {
            this.devTools._showNotification(`Failed to update schema: ${err.message}`, true);
        }
    }
}