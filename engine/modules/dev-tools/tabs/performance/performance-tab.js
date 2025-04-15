/**
 * Performance Tab Module
 * ======================================================================
 * Handles performance monitoring in DevTools
 */
export class PerformanceTab {
    constructor(devTools) {
        this.devTools = devTools;
        this.metrics = {
            fps: [],
            memory: [],
            entities: [],
            systems: []
        };
        this.isRecording = false;
        this.maxDataPoints = 100;
        this.charts = {};
    }

    render() {
        const engineConnected = !!this.devTools.world;
        
        return `
            <div class="performance-header">
                <h3>Performance Monitoring</h3>
                <div class="perf-controls">
                    <button id="start-recording" ${!engineConnected ? 'disabled' : ''}>
                        ${this.isRecording ? 'Stop Recording' : 'Start Recording'}
                    </button>
                    <button id="clear-data" ${!engineConnected ? 'disabled' : ''}>Clear Data</button>
                </div>
            </div>
            
            <div class="perf-charts">
                <div class="chart-container">
                    <h4>FPS</h4>
                    <canvas id="fps-chart" height="100"></canvas>
                </div>
                <div class="chart-container">
                    <h4>Memory Usage</h4>
                    <canvas id="memory-chart" height="100"></canvas>
                </div>
            </div>
            
            <div class="perf-metrics">
                <div class="metric-card">
                    <div class="metric-title">Current FPS</div>
                    <div class="metric-value" id="current-fps">0</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Memory Usage</div>
                    <div class="metric-value" id="current-memory">0 MB</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Active Entities</div>
                    <div class="metric-value" id="current-entities">0</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Active Systems</div>
                    <div class="metric-value" id="current-systems">0</div>
                </div>
            </div>
            
            <div class="perf-table-container">
                <table class="perf-table">
                    <thead>
                        <tr>
                            <th>System</th>
                            <th>Last Execution Time</th>
                            <th>Average Time</th>
                            <th>Peak Time</th>
                        </tr>
                    </thead>
                    <tbody id="system-metrics">
                        ${engineConnected ? this._renderSystemMetrics() : 
                            '<tr><td colspan="4">Connect to engine to view metrics</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    }

    attachEventListeners() {
        const startBtn = document.getElementById('start-recording');
        if (startBtn) {
            startBtn.addEventListener('click', () => this._toggleRecording());
        }
        
        const clearBtn = document.getElementById('clear-data');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this._clearData());
        }

        if (this.devTools.world) {
            this._initializeCharts();
        }
    }

    _toggleRecording() {
        this.isRecording = !this.isRecording;
        const startBtn = document.getElementById('start-recording');
        if (startBtn) {
            startBtn.textContent = this.isRecording ? 'Stop Recording' : 'Start Recording';
        }
        
        if (this.isRecording) {
            this._startRecording();
        }
    }

    _startRecording() {
        if (!this._recordingInterval) {
            this._recordingInterval = setInterval(() => this.updateMetrics(), 1000);
        }
    }

    _stopRecording() {
        if (this._recordingInterval) {
            clearInterval(this._recordingInterval);
            this._recordingInterval = null;
        }
    }

    _clearData() {
        this.metrics = {
            fps: [],
            memory: [],
            entities: [],
            systems: []
        };
        this._updateCharts();
    }

    updateMetrics() {
        if (!this.isRecording || !this.devTools.world) return;

        const now = Date.now();
        const memory = window.performance?.memory?.usedJSHeapSize || 0;
        const fps = this._calculateFPS();
        const entities = this.devTools.world.entityManager?.entities?.size || 0;
        const systems = this.devTools.world.systemManager?.systems?.length || 0;

        // Update metrics arrays
        this.metrics.fps.push({ time: now, value: fps });
        this.metrics.memory.push({ time: now, value: Math.round(memory / (1024 * 1024)) });
        this.metrics.entities.push({ time: now, value: entities });
        this.metrics.systems.push({ time: now, value: systems });

        // Keep only last N data points
        Object.keys(this.metrics).forEach(key => {
            if (this.metrics[key].length > this.maxDataPoints) {
                this.metrics[key].shift();
            }
        });

        // Update UI
        this._updateCurrentMetrics(fps, memory, entities, systems);
        this._updateCharts();
        this._updateSystemMetrics();
    }

    _calculateFPS() {
        // Implementation depends on your engine
        return window.engine?.getFPS() || 0;
    }

    _updateCurrentMetrics(fps, memory, entities, systems) {
        document.getElementById('current-fps').textContent = Math.round(fps);
        document.getElementById('current-memory').textContent = 
            `${Math.round(memory / (1024 * 1024))} MB`;
        document.getElementById('current-entities').textContent = entities;
        document.getElementById('current-systems').textContent = systems;
    }

    _initializeCharts() {
        // Note: This assumes you're using a charting library like Chart.js
        // You'll need to implement the actual chart initialization based on your chosen library
        console.log('Charts would be initialized here');
    }

    _updateCharts() {
        // Implementation depends on your charting library
        console.log('Charts would be updated here');
    }

    _renderSystemMetrics() {
        if (!this.devTools.world?.systemManager?.systems) return '';
        
        return this.devTools.world.systemManager.systems.map(system => `
            <tr>
                <td>${system.constructor.name}</td>
                <td>${system.lastExecutionTime || '0'}ms</td>
                <td>${system.averageExecutionTime || '0'}ms</td>
                <td>${system.peakExecutionTime || '0'}ms</td>
            </tr>
        `).join('');
    }

    _updateSystemMetrics() {
        const tbody = document.getElementById('system-metrics');
        if (tbody) {
            tbody.innerHTML = this._renderSystemMetrics();
        }
    }
}