/**
 * Overview Tab Module
 * ======================================================================
 * Handles the Overview tab functionality in DevTools
 */
export class OverviewTab {
    constructor(devTools) {
        this.devTools = devTools;
    }

    render() {
        const engineConnected = !!this.devTools.world;
        const memoryUsage = (window.performance && window.performance.memory) 
            ? Math.round(window.performance.memory.usedJSHeapSize) 
            : 'N/A';
        
        const entityCount = engineConnected ? (this.devTools.world.entityManager?.entities?.size || 0) : 0;
        const systemCount = engineConnected ? (this.devTools.world.systemManager?.systems?.length || 0) : 0;
        
        return `
            <div class="overview-grid">
                <div class="overview-card">
                    <div class="card-header">Engine Status</div>
                    <div class="card-content">
                        <div class="status-indicator ${engineConnected ? 'online' : 'offline'}">
                            ${engineConnected ? 'Connected' : 'Disconnected'}
                        </div>
                        ${!engineConnected ? 
                            `<button id="connect-engine" class="primary-button">Connect to Engine</button>` : 
                            `<button id="disconnect-engine" class="warning-button">Disconnect</button>`
                        }
                    </div>
                </div>
                
                <div class="overview-card">
                    <div class="card-header">Performance</div>
                    <div class="card-content">
                        <div class="metric">
                            <span>Memory Usage</span>
                            <strong>${memoryUsage} MB</strong>
                        </div>
                        <div class="metric">
                            <span>FPS</span>
                            <strong id="fps-counter">0</strong>
                        </div>
                    </div>
                </div>
                
                <div class="overview-card">
                    <div class="card-header">World Data</div>
                    <div class="card-content">
                        <div class="metric">
                            <span>Entities</span>
                            <strong id="overview-entity-count">${entityCount}</strong>
                        </div>
                        <div class="metric">
                            <span>Systems</span>
                            <strong>${systemCount}</strong>
                        </div>
                    </div>
                </div>
                
                <div class="overview-card">
                    <div class="card-header">Quick Actions</div>
                    <div class="card-content">
                        <div class="button-group">
                            <button id="btn-refresh-data" title="Refresh data">🔄 Refresh</button>
                            <button id="btn-toggle-engine" title="Pause/Resume engine" ${!engineConnected ? 'disabled' : ''}>
                                ⏯️ ${this.devTools.enginePaused ? 'Resume' : 'Pause'}
                            </button>
                        </div>
                        <div class="button-group">
                            <button id="btn-step-engine" title="Step forward one frame" ${!engineConnected ? 'disabled' : ''}>
                                ⏭️ Step
                            </button>
                            <button id="btn-export-data" title="Export debug data">📤 Export</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Connect/Disconnect buttons
        const connectBtn = document.getElementById('connect-engine');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.devTools._connectToEngine());
        }
        
        const disconnectBtn = document.getElementById('disconnect-engine');
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => this.devTools._disconnectFromEngine());
        }
        
        // Quick action buttons
        const refreshBtn = document.getElementById('btn-refresh-data');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.devTools._refreshAll());
        }
        
        const toggleBtn = document.getElementById('btn-toggle-engine');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.devTools._toggleEnginePause());
        }
        
        const stepBtn = document.getElementById('btn-step-engine');
        if (stepBtn) {
            stepBtn.addEventListener('click', () => this.devTools._stepEngine());
        }
        
        const exportBtn = document.getElementById('btn-export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this._exportData());
        }
    }

    _exportData() {
        // Implementation of data export functionality
        const data = {
            engineStatus: !!this.devTools.world,
            memoryUsage: window.performance?.memory?.usedJSHeapSize || 'N/A',
            entityCount: this.devTools.world?.entityManager?.entities?.size || 0,
            systemCount: this.devTools.world?.systemManager?.systems?.length || 0,
            fps: document.getElementById('fps-counter')?.textContent || '0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'devtools-overview-export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}