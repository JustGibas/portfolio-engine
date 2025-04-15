/**
 * Events Tab Module
 * ======================================================================
 * Handles event system monitoring and management in DevTools
 */
export class EventsTab {
    constructor(devTools) {
        this.devTools = devTools;
        this.selectedEvent = null;
        this.filterText = '';
        this.isRecording = false;
        this.eventLog = [];
        this.maxLogEntries = 1000;
    }

    render() {
        const engineConnected = !!this.devTools.world;
        
        return `
            <div class="events-header">
                <div class="events-controls">
                    <button id="toggle-recording" class="${this.isRecording ? 'recording' : ''}" 
                            ${!engineConnected ? 'disabled' : ''}>
                        ${this.isRecording ? '⏹️ Stop Recording' : '⏺️ Start Recording'}
                    </button>
                    <button id="clear-events" ${!engineConnected ? 'disabled' : ''}>
                        🗑️ Clear Events
                    </button>
                    <div class="event-filters">
                        <input type="text" id="event-filter" placeholder="Filter events..." 
                               value="${this.filterText}" ${!engineConnected ? 'disabled' : ''}>
                        <button id="filter-settings" title="Filter settings" ${!engineConnected ? 'disabled' : ''}>
                            ⚙️
                        </button>
                    </div>
                </div>
                
                <div class="event-stats">
                    <div class="stat-item">
                        <span>Total Events</span>
                        <strong>${this.eventLog.length}</strong>
                    </div>
                    <div class="stat-item">
                        <span>Event Types</span>
                        <strong>${this._getUniqueEventTypes().size}</strong>
                    </div>
                    <div class="stat-item">
                        <span>Events/sec</span>
                        <strong id="events-per-second">0</strong>
                    </div>
                </div>
            </div>

            <div class="events-container">
                <div class="events-list">
                    ${this._renderEventsList()}
                </div>

                <div class="event-detail-panel">
                    <h4>Event Details</h4>
                    ${this._renderEventDetails()}
                </div>
            </div>

            <div class="events-timeline">
                ${this._renderTimeline()}
            </div>
        `;
    }

    attachEventListeners() {
        // Recording controls
        const recordBtn = document.getElementById('toggle-recording');
        if (recordBtn) {
            recordBtn.addEventListener('click', () => this._toggleRecording());
        }

        // Clear button
        const clearBtn = document.getElementById('clear-events');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this._clearEvents());
        }

        // Filter input
        const filterInput = document.getElementById('event-filter');
        if (filterInput) {
            filterInput.addEventListener('input', (e) => {
                this.filterText = e.target.value;
                this._updateList();
            });
        }

        // Filter settings
        const filterSettingsBtn = document.getElementById('filter-settings');
        if (filterSettingsBtn) {
            filterSettingsBtn.addEventListener('click', () => this._showFilterSettings());
        }

        // Event selection
        this._attachEventListeners();
    }

    _renderEventsList() {
        if (!this.devTools.world) {
            return '<div class="empty-message">Connect to engine to view events</div>';
        }

        if (this.eventLog.length === 0) {
            return '<div class="empty-message">No events recorded</div>';
        }

        const filteredEvents = this._getFilteredEvents();
        return filteredEvents.map(event => `
            <div class="event-item ${event.id === this.selectedEvent?.id ? 'selected' : ''}"
                 data-event-id="${event.id}">
                <div class="event-item-header">
                    <span class="event-type">${event.type}</span>
                    <span class="event-time">${this._formatTime(event.timestamp)}</span>
                </div>
                <div class="event-item-meta">
                    <span class="event-source">${event.source || 'Unknown'}</span>
                    <span class="event-target">${event.target ? `→ ${event.target}` : ''}</span>
                </div>
            </div>
        `).join('');
    }

    _renderEventDetails() {
        if (!this.selectedEvent) {
            return '<div class="empty-message">Select an event to view details</div>';
        }

        return `
            <div class="event-info">
                <div class="info-group">
                    <label>Event Type:</label>
                    <span>${this.selectedEvent.type}</span>
                </div>
                <div class="info-group">
                    <label>Timestamp:</label>
                    <span>${new Date(this.selectedEvent.timestamp).toLocaleString()}</span>
                </div>
                <div class="info-group">
                    <label>Source:</label>
                    <span>${this.selectedEvent.source || 'Unknown'}</span>
                </div>
                <div class="info-group">
                    <label>Target:</label>
                    <span>${this.selectedEvent.target || 'None'}</span>
                </div>
                <div class="info-group">
                    <label>Data:</label>
                    <pre class="event-data">${JSON.stringify(this.selectedEvent.data, null, 2)}</pre>
                </div>
                <div class="info-group">
                    <label>Stack Trace:</label>
                    <pre class="event-stack">${this.selectedEvent.stack || 'Not available'}</pre>
                </div>
            </div>
        `;
    }

    _renderTimeline() {
        if (!this.devTools.world || this.eventLog.length === 0) {
            return '';
        }

        const timelineData = this._prepareTimelineData();
        return `
            <div class="timeline-header">
                <h4>Event Timeline</h4>
                <div class="timeline-controls">
                    <button id="zoom-out" title="Zoom out">-</button>
                    <button id="zoom-in" title="Zoom in">+</button>
                    <button id="reset-zoom" title="Reset zoom">Reset</button>
                </div>
            </div>
            <div class="timeline-view">
                ${this._renderTimelineBars(timelineData)}
            </div>
            <div class="timeline-legend">
                ${this._renderTimelineLegend(timelineData)}
            </div>
        `;
    }

    _prepareTimelineData() {
        const timeRange = 10000; // 10 seconds window
        const now = Date.now();
        const start = now - timeRange;
        
        // Group events by type in time buckets
        const buckets = new Map();
        const bucketSize = 100; // 100ms buckets
        
        this.eventLog.forEach(event => {
            if (event.timestamp >= start) {
                const bucketIndex = Math.floor((event.timestamp - start) / bucketSize);
                if (!buckets.has(bucketIndex)) {
                    buckets.set(bucketIndex, new Map());
                }
                const typeCounts = buckets.get(bucketIndex);
                typeCounts.set(event.type, (typeCounts.get(event.type) || 0) + 1);
            }
        });
        
        return {
            start,
            end: now,
            buckets,
            bucketSize
        };
    }

    _renderTimelineBars(timelineData) {
        const { start, end, buckets, bucketSize } = timelineData;
        const totalBuckets = Math.ceil((end - start) / bucketSize);
        
        let bars = '';
        for (let i = 0; i < totalBuckets; i++) {
            const bucketData = buckets.get(i) || new Map();
            const totalHeight = Array.from(bucketData.values()).reduce((a, b) => a + b, 0);
            let y = 0;
            
            bars += `<div class="timeline-bar" style="left: ${(i / totalBuckets) * 100}%">`;
            for (const [type, count] of bucketData.entries()) {
                const height = (count / totalHeight) * 100;
                bars += `
                    <div class="event-segment" 
                         style="height: ${height}%; bottom: ${y}%"
                         data-type="${type}"
                         title="${type}: ${count} events">
                    </div>
                `;
                y += height;
            }
            bars += '</div>';
        }
        
        return `<div class="timeline-bars">${bars}</div>`;
    }

    _renderTimelineLegend(timelineData) {
        const eventTypes = new Set();
        for (const bucket of timelineData.buckets.values()) {
            for (const type of bucket.keys()) {
                eventTypes.add(type);
            }
        }
        
        return Array.from(eventTypes).map(type => `
            <div class="legend-item">
                <span class="legend-color" data-type="${type}"></span>
                <span class="legend-label">${type}</span>
            </div>
        `).join('');
    }

    _toggleRecording() {
        this.isRecording = !this.isRecording;
        
        if (this.isRecording) {
            this._startRecording();
        } else {
            this._stopRecording();
        }
        
        const recordBtn = document.getElementById('toggle-recording');
        if (recordBtn) {
            recordBtn.textContent = this.isRecording ? '⏹️ Stop Recording' : '⏺️ Start Recording';
            recordBtn.classList.toggle('recording', this.isRecording);
        }
    }

    _startRecording() {
        if (!this._recordingInterval) {
            // Start event collection
            this._setupEventListeners();
            
            // Update events/sec counter
            this._lastEventCount = this.eventLog.length;
            this._recordingInterval = setInterval(() => {
                const currentCount = this.eventLog.length;
                const eventsPerSecond = currentCount - this._lastEventCount;
                this._lastEventCount = currentCount;
                
                const counter = document.getElementById('events-per-second');
                if (counter) {
                    counter.textContent = eventsPerSecond;
                }
                
                this._updateList();
            }, 1000);
        }
    }

    _stopRecording() {
        if (this._recordingInterval) {
            clearInterval(this._recordingInterval);
            this._recordingInterval = null;
            this._removeEventListeners();
        }
    }

    _setupEventListeners() {
        if (!this.devTools.world) return;
        
        // Implementation depends on your engine's event system
        this._eventHandler = (event) => {
            this._logEvent(event);
        };
        
        this.devTools.world.eventSystem.on('*', this._eventHandler);
    }

    _removeEventListeners() {
        if (!this.devTools.world) return;
        
        if (this._eventHandler) {
            this.devTools.world.eventSystem.off('*', this._eventHandler);
        }
    }

    _logEvent(event) {
        const logEntry = {
            id: this.eventLog.length + 1,
            type: event.type,
            timestamp: Date.now(),
            source: event.source,
            target: event.target,
            data: event.data,
            stack: new Error().stack
        };
        
        this.eventLog.push(logEntry);
        
        // Keep log size under control
        if (this.eventLog.length > this.maxLogEntries) {
            this.eventLog.shift();
        }
    }

    _clearEvents() {
        this.eventLog = [];
        this.selectedEvent = null;
        this._updateList();
    }

    _getFilteredEvents() {
        let events = [...this.eventLog];
        
        if (this.filterText) {
            const searchText = this.filterText.toLowerCase();
            events = events.filter(event => 
                event.type.toLowerCase().includes(searchText) ||
                (event.source && event.source.toLowerCase().includes(searchText)) ||
                (event.target && event.target.toLowerCase().includes(searchText)));
        }
        
        return events.reverse(); // Most recent first
    }

    _getUniqueEventTypes() {
        return new Set(this.eventLog.map(event => event.type));
    }

    _formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 1000) {
            return 'just now';
        } else if (diff < 60000) {
            return `${Math.floor(diff / 1000)}s ago`;
        } else if (diff < 3600000) {
            return `${Math.floor(diff / 60000)}m ago`;
        } else {
            return new Date(timestamp).toLocaleTimeString();
        }
    }

    _showFilterSettings() {
        const dialog = document.createElement('div');
        dialog.className = 'devtools-modal';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Event Filter Settings</h3>
                    <button class="close-modal">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Event Types</label>
                        <div class="checkbox-list">
                            ${Array.from(this._getUniqueEventTypes()).map(type => `
                                <label class="checkbox-label">
                                    <input type="checkbox" value="${type}" checked>
                                    ${type}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="time-range">Time Range</label>
                        <select id="time-range">
                            <option value="0">All Events</option>
                            <option value="300">Last 5 minutes</option>
                            <option value="900">Last 15 minutes</option>
                            <option value="3600">Last hour</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="apply-filters" class="primary-button">Apply</button>
                    <button id="cancel-filters">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Event listeners
        dialog.querySelector('.close-modal').addEventListener('click', () => dialog.remove());
        dialog.querySelector('#cancel-filters').addEventListener('click', () => dialog.remove());
        dialog.querySelector('#apply-filters').addEventListener('click', () => {
            this._applyFilters(dialog);
            dialog.remove();
        });
    }

    _applyFilters(dialog) {
        const selectedTypes = Array.from(dialog.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.value);
        const timeRange = parseInt(dialog.querySelector('#time-range').value);
        
        // Apply filters
        this.filterText = selectedTypes.length > 0 ? 
            selectedTypes.join('|') : '';
            
        if (timeRange > 0) {
            const cutoff = Date.now() - (timeRange * 1000);
            this.eventLog = this.eventLog.filter(event => event.timestamp >= cutoff);
        }
        
        this._updateList();
    }

    _attachEventListeners() {
        document.querySelectorAll('.event-item').forEach(item => {
            const eventId = parseInt(item.dataset.eventId);
            item.addEventListener('click', () => this._selectEvent(eventId));
        });

        // Timeline zoom controls
        document.getElementById('zoom-in')?.addEventListener('click', () => this._zoomTimeline(0.5));
        document.getElementById('zoom-out')?.addEventListener('click', () => this._zoomTimeline(2));
        document.getElementById('reset-zoom')?.addEventListener('click', () => this._resetTimelineZoom());
    }

    _selectEvent(eventId) {
        const event = this.eventLog.find(e => e.id === eventId);
        if (event) {
            this.selectedEvent = event;
            
            const detailPanel = document.querySelector('.event-detail-panel');
            if (detailPanel) {
                detailPanel.innerHTML = `<h4>Event Details</h4>${this._renderEventDetails()}`;
            }

            // Update selection visual
            document.querySelectorAll('.event-item').forEach(item => {
                item.classList.toggle('selected', item.dataset.eventId === eventId.toString());
            });
        }
    }

    _updateList() {
        const list = document.querySelector('.events-list');
        if (list) {
            list.innerHTML = this._renderEventsList();
            this._attachEventListeners();
        }

        // Update timeline if it exists
        const timeline = document.querySelector('.events-timeline');
        if (timeline) {
            timeline.innerHTML = this._renderTimeline();
            this._attachEventListeners();
        }
    }

    _zoomTimeline(factor) {
        // Implementation of timeline zooming
    }

    _resetTimelineZoom() {
        // Reset timeline zoom level
    }
}