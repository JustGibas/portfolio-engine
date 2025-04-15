/**
 * Engine Tab Module
 * ======================================================================
 * Handles engine controls and settings in DevTools
 */
export class EngineTab {
    constructor(devTools) {
        this.devTools = devTools;
    }

    render() {
        const engineConnected = !!this.devTools.world;
        
        return `
            <div class="engine-controls">
                <div class="control-group">
                    <label>Engine Controls</label>
                    <div class="button-row">
                        <button id="engine-pause" class="control-button" ${!engineConnected ? 'disabled' : ''}>
                            ${this.devTools.enginePaused ? '▶️ Resume' : '⏸️ Pause'}
                        </button>
                        <button id="engine-step" class="control-button" ${!engineConnected || !this.devTools.enginePaused ? 'disabled' : ''}>
                            ⏭️ Step
                        </button>
                        <button id="engine-restart" class="control-button" ${!engineConnected ? 'disabled' : ''}>
                            🔄 Restart
                        </button>
                    </div>
                </div>

                <div class="control-group">
                    <label>Performance Settings</label>
                    <div class="control-row">
                        <div class="input-group">
                            <label for="target-fps">Target FPS</label>
                            <input type="number" id="target-fps" value="60" min="1" max="144" ${!engineConnected ? 'disabled' : ''}>
                            <button id="apply-fps" ${!engineConnected ? 'disabled' : ''}>Apply</button>
                        </div>
                        <div class="toggle-group">
                            <label class="toggle-switch">
                                <input type="checkbox" id="vsync-toggle" ${!engineConnected ? 'disabled' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                            <span>VSync</span>
                        </div>
                    </div>
                </div>

                <div class="control-group">
                    <label>Auto-Refresh</label>
                    <div class="control-row">
                        <div class="toggle-group">
                            <label class="toggle-switch">
                                <input type="checkbox" id="auto-refresh-toggle" checked ${!engineConnected ? 'disabled' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                            <span>Enable Auto-Refresh</span>
                        </div>
                        <div class="input-group">
                            <label for="refresh-rate">Refresh Rate (ms)</label>
                            <select id="refresh-rate" ${!engineConnected ? 'disabled' : ''}>
                                <option value="500">500ms</option>
                                <option value="1000" selected>1000ms</option>
                                <option value="2000">2000ms</option>
                                <option value="5000">5000ms</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="control-group">
                    <label>Engine Info</label>
                    <div class="info-panel">
                        <pre id="engine-info">${this._getEngineInfo()}</pre>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Engine control buttons
        const pauseBtn = document.getElementById('engine-pause');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.devTools._toggleEnginePause());
        }
        
        const stepBtn = document.getElementById('engine-step');
        if (stepBtn) {
            stepBtn.addEventListener('click', () => this.devTools._stepEngine());
        }
        
        const restartBtn = document.getElementById('engine-restart');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this._restartEngine());
        }

        // FPS control
        const applyFpsBtn = document.getElementById('apply-fps');
        if (applyFpsBtn) {
            applyFpsBtn.addEventListener('click', () => {
                const targetFps = parseInt(document.getElementById('target-fps').value);
                this.devTools._setEngineFPS(targetFps);
            });
        }

        // VSync toggle
        const vsyncToggle = document.getElementById('vsync-toggle');
        if (vsyncToggle) {
            vsyncToggle.addEventListener('change', (e) => this._toggleVSync(e.target.checked));
        }

        // Auto-refresh controls
        const autoRefreshToggle = document.getElementById('auto-refresh-toggle');
        if (autoRefreshToggle) {
            autoRefreshToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.devTools.startAutoRefresh();
                } else {
                    this.devTools.stopAutoRefresh();
                }
            });
        }

        const refreshRate = document.getElementById('refresh-rate');
        if (refreshRate) {
            refreshRate.addEventListener('change', (e) => {
                this.devTools.autoRefreshRate = parseInt(e.target.value);
                this.devTools.updateAutoRefresh();
            });
        }
    }

    _getEngineInfo() {
        if (!this.devTools.world) {
            return 'Engine not connected';
        }

        const info = {
            version: window.engine?.version || '1.0.0',
            status: this.devTools.enginePaused ? 'Paused' : 'Running',
            fps: window.engine?.getFPS() || 0,
            targetFPS: window.engine?.targetFPS || 60,
            vsync: window.engine?.vsync || false,
            entities: this.devTools.world.entityManager?.entities?.size || 0,
            systems: this.devTools.world.systemManager?.systems?.length || 0,
            uptime: this._formatUptime(window.engine?.uptime || 0)
        };

        return JSON.stringify(info, null, 2);
    }

    _formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }

    _restartEngine() {
        if (!this.devTools.world) return;
        
        window.engine?.stop();
        window.engine?.reset();
        window.engine?.start();
        this.devTools._refreshAll();
    }

    _toggleVSync(enabled) {
        if (!this.devTools.world) return;
        
        window.engine?.setVSync(enabled);
        this.devTools._refreshAll();
    }

    updateEngineInfo() {
        const infoPanel = document.getElementById('engine-info');
        if (infoPanel) {
            infoPanel.textContent = this._getEngineInfo();
        }
    }
}