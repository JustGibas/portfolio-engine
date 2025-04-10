/**
 * @fileoverview Learning Page for Portfolio Engine
 * This is a demo page for learning how to use the Portfolio Engine ECS architecture
 */

/**
 * Learning page module that demonstrates various ECS concepts
 */
const learnPage = {
  // Content data for the page
  content: {
    title: "Learning Lab",
    description: "A playground for experimenting with ECS concepts"
  },
  
  /**
   * Initialize the page
   * @param {Object} entity - The entity representing this page
   */
  async init(entity) {
    this.entity = entity;
    this.ecs = entity.ecs || window.portfolioEngine?.world;
    
    // Get the container from the entity
    // Fix: Check for both 'dom' and 'domElement' components for compatibility
    const container = entity.getComponent('domElement')?.container || 
                      entity.getComponent('dom')?.container;
    if (!container) {
      console.error('Learn page: Container not found');
      return this;
    }
    
    // Render the page content
    this.render(container);
    
    return this;
  },
  
  /**
   * Render the page content
   * @param {HTMLElement} container - The container to render into
   */
  render(container) {
    if (!container) return;
    
    // Create basic page structure
    container.innerHTML = `
      <div class="learn-page">
        <h1>${this.content.title}</h1>
        <p>${this.content.description}</p>
        
        <div class="learn-section">
          <h2>ECS Button Demo</h2>
          <p>These buttons are created using the ECS architecture:</p>
          <div id="button-container" class="button-demo"></div>
        </div>
        
        <div class="learn-section">
          <h2>Component State Demo</h2>
          <div id="component-demo" class="component-demo">
            <div id="component-display" class="component-display">
              No component selected
            </div>
          </div>
        </div>
        
        <div class="learn-section">
          <h2>Event System Demo</h2>
          <p>This demonstrates how the ECS Event System works:</p>
          <div id="event-demo" class="event-demo">
            <div class="event-controls">
              <button id="emit-event-btn" class="btn btn-primary">Emit Event</button>
              <button id="add-listener-btn" class="btn btn-secondary">Add Listener</button>
            </div>
            <div id="event-log" class="event-log">
              Event log will appear here...
            </div>
          </div>
        </div>
      </div>
    `;
    
    // After rendering HTML, create interactive elements using ECS
    this._setupButtonDemo();
    this._setupComponentDemo();
    this._setupEventDemo();
  },
  
  /**
   * Set up button demo using our new createButton method
   * @private
   */
  _setupButtonDemo() {
    const buttonContainer = document.getElementById('button-container');
    if (!buttonContainer || !this.ecs) return;
    
    // Get the LayoutSystem which has our button creation method
    // Try different ways to access the system
    const layoutSystem = this.ecs.getSystem('LayoutSystem') || 
                         this.ecs.getSystem('layout') ||
                         this.ecs.layoutSystem;
                         
    if (!layoutSystem) {
      console.error('Learn page: LayoutSystem not found');
      buttonContainer.innerHTML = '<p>Error: LayoutSystem not available</p>';
      return;
    }
    
    // Create a primary button
    layoutSystem.createButton('Primary Button', () => {
      alert('Primary button clicked!');
    }, {
      className: 'btn btn-primary',
      parent: buttonContainer,
      style: {
        marginRight: '10px'
      }
    });
    
    // Create a secondary button 
    layoutSystem.createButton('Secondary Button', () => {
      alert('Secondary button clicked!');
    }, {
      className: 'btn btn-secondary',
      parent: buttonContainer
    });
    
    console.log('Button demo setup complete');
  },
  
  /**
   * Set up component demo
   * @private
   */
  _setupComponentDemo() {
    const componentDisplay = document.getElementById('component-display');
    const componentDemo = document.getElementById('component-demo');
    
    if (!componentDisplay || !componentDemo || !this.ecs) return;
    
    // Create a control panel for our demo
    const controlPanel = document.createElement('div');
    controlPanel.className = 'component-controls';
    componentDemo.insertBefore(controlPanel, componentDisplay);
    
    // Create entity with position component
    const entityId = this.ecs.createEntity();
    this.ecs.addComponent(entityId, 'position', {
      x: 0,
      y: 0,
      z: 0
    });
    
    // Function to update the display
    const updateDisplay = () => {
      const position = this.ecs.getComponent(entityId, 'position');
      if (position) {
        componentDisplay.innerHTML = `
          <h3>Position Component</h3>
          <pre>
{
  x: ${position.x},
  y: ${position.y},
  z: ${position.z}
}</pre>
        `;
      }
    };
    
    // Initial display update
    updateDisplay();
    
    // Create buttons to modify the component
    const createPositionControls = () => {
      // Create a grid layout for our controls
      controlPanel.innerHTML = `
        <div class="control-grid">
          <div class="control-row">
            <button id="pos-x-minus" class="btn btn-small">X-</button>
            <button id="pos-x-plus" class="btn btn-small">X+</button>
          </div>
          <div class="control-row">
            <button id="pos-y-minus" class="btn btn-small">Y-</button>
            <button id="pos-y-plus" class="btn btn-small">Y+</button>
          </div>
          <div class="control-row">
            <button id="pos-z-minus" class="btn btn-small">Z-</button>
            <button id="pos-z-plus" class="btn btn-small">Z+</button>
          </div>
          <div class="control-row">
            <button id="pos-reset" class="btn btn-small">Reset Position</button>
          </div>
        </div>
      `;
      
      // Add event listeners for the buttons
      document.getElementById('pos-x-minus').addEventListener('click', () => {
        const position = this.ecs.getComponent(entityId, 'position');
        position.x -= 10;
        updateDisplay();
      });
      
      document.getElementById('pos-x-plus').addEventListener('click', () => {
        const position = this.ecs.getComponent(entityId, 'position');
        position.x += 10;
        updateDisplay();
      });
      
      document.getElementById('pos-y-minus').addEventListener('click', () => {
        const position = this.ecs.getComponent(entityId, 'position');
        position.y -= 10;
        updateDisplay();
      });
      
      document.getElementById('pos-y-plus').addEventListener('click', () => {
        const position = this.ecs.getComponent(entityId, 'position');
        position.y += 10;
        updateDisplay();
      });
      
      document.getElementById('pos-z-minus').addEventListener('click', () => {
        const position = this.ecs.getComponent(entityId, 'position');
        position.z -= 10;
        updateDisplay();
      });
      
      document.getElementById('pos-z-plus').addEventListener('click', () => {
        const position = this.ecs.getComponent(entityId, 'position');
        position.z += 10;
        updateDisplay();
      });
      
      document.getElementById('pos-reset').addEventListener('click', () => {
        const position = this.ecs.getComponent(entityId, 'position');
        position.x = 0;
        position.y = 0;
        position.z = 0;
        updateDisplay();
      });
    };
    
    createPositionControls();
    
    console.log('Component demo setup complete with entity ID:', entityId);
  },
  
  /**
   * Set up event system demo
   * @private
   */
  _setupEventDemo() {
    const eventDemoContainer = document.getElementById('event-demo');
    const eventLog = document.getElementById('event-log');
    const emitEventBtn = document.getElementById('emit-event-btn');
    const addListenerBtn = document.getElementById('add-listener-btn');
    
    if (!eventDemoContainer || !eventLog || !emitEventBtn || !addListenerBtn || !this.ecs) {
      console.error('Event demo: Required elements not found');
      return;
    }
    
    // Check if the event system exists
    const eventSystem = this.ecs.getSystem('event');
    if (!eventSystem) {
      eventLog.innerHTML = `
        <div class="error-message">
          Error: Event System not found in ECS world.
          <br>
          Please make sure EventSystem is registered.
        </div>
      `;
      return;
    }
    
    // Disable debug mode for the event system to prevent console flooding
    // We'll still log to our UI but not to the console
    eventSystem.setDebugMode(false);
    
    // Log to our UI only
    const logEvent = (message, type = 'info') => {
      const timestamp = new Date().toLocaleTimeString();
      const entry = document.createElement('div');
      entry.className = `log-entry log-${type}`;
      entry.innerHTML = `<span class="log-time">${timestamp}</span> ${message}`;
      eventLog.appendChild(entry);
      
      // Auto-scroll to bottom
      eventLog.scrollTop = eventLog.scrollHeight;
    };
    
    // Track our listener IDs so we can remove them later if needed
    const listenerIds = [];
    
    // Add an initial event listener
    const listenerId = eventSystem.on('demo:event', (data) => {
      logEvent(`Received event: "${data.message}" (counter: ${data.counter})`, 'event');
    });
    listenerIds.push(listenerId);
    logEvent('Added initial event listener', 'system');
    
    // Counter for the events
    let eventCounter = 0;
    
    // Set up the emit event button
    emitEventBtn.addEventListener('click', () => {
      eventCounter++;
      const eventData = {
        message: `Hello from event #${eventCounter}`,
        counter: eventCounter,
        timestamp: Date.now()
      };
      
      // Create and emit the event using the event system
      const eventEntityId = eventSystem.emit('demo:event', eventData);
      
      logEvent(`Emitted event: "${eventData.message}" (ID: ${eventEntityId})`, 'emit');
    });
    
    // Set up the add listener button
    addListenerBtn.addEventListener('click', () => {
      const newListenerId = eventSystem.on('demo:event', (data) => {
        logEvent(`Additional listener received: "${data.message}" (counter: ${data.counter})`, 'event');
      });
      
      listenerIds.push(newListenerId);
      logEvent(`Added new event listener (ID: ${newListenerId})`, 'system');
    });
    
    console.log('Event demo setup complete');
  },
  
  // Lifecycle methods
  mount() {
    console.log('Learn page mounted');
  },
  
  unmount() {
    console.log('Learn page unmounted');
  }
};

export default learnPage;