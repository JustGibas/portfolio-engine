/**
 * =====================================================================
 * Portfolio engine: app.js - Entry Point
 * =====================================================================
 */

// Show the loading indicator 
console.info('App initialized...');
(function showImmediateLoadingIndicator() {
  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'initial-loading';
  loadingIndicator.className = 'loading-indicator';
  
  loadingIndicator.innerHTML = `
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <div class="loading-text">Portfolio Engine Loading...</div>
      <div class="loading-progress">
        <div class="progress-fill"></div>
      </div>
    </div>
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    .loading-indicator {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: var(--card-bg-color, #121212);
      color: var(--text-color, #ffffff);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      border-radius: 8px;
      box-shadow: 0 5px 15px var(--shadow-color, rgba(0,0,0,0.5));
      padding: 20px;
    }
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto 20px;
      border: 4px solid rgba(255, 255, 255, 0.2);
      border-left-color: var(--primary-color, #09f);
      border-radius: 50%;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(loadingIndicator);
  document.querySelector('.loading-spinner').style.animation = 'spin 1s linear infinite';
})();

// After showing the loading indicator, start loading
setTimeout(async () => {
  try {
    // ======================================================================
    // PHASE 1: Initialize DevTools
    // ======================================================================
    console.info('PHASE 1 Start: Initialize DevTools');
    try {
      const { DevTools } = await import('./engine/modules/dev-tools/dev-tools.js');
      const devTools = new DevTools(); // Initialize the DevTools instance
      window.devTools = devTools; // Make accessible globally for debugging
    } catch (error) {
      console.info('Dev tools failed to load:', error);
      // Continue execution - DevTools are optional
    }
    console.info('PHASE 1 End: DevTools initialization complete');
    
    // ======================================================================
    // PHASE 2: Initialize Engine
    // ======================================================================
    console.info('PHASE 2 Start: Initialize Engine');
    const { startEngine } = await import('./engine/start.js');
    const portfolio = await startEngine();
    
    // ======================================================================
    // PHASE 3: Start Engine and Navigate
    // ======================================================================
    console.info('PHASE 3 Start: Start Engine and Navigate');
    // Start the engine and load the initial page
    portfolio.start();
    
    // Navigate to the home page
    window.location.hash = 'home';
    
    console.info('PHASE 3 End: Engine running and navigation initiated');
    
  } catch (error) {
    console.error('Failed to start:', error);
    const loadingContent = document.querySelector('.loading-content');
    if (loadingContent) {
      // Show error message in the loading indicator
      loadingContent.innerHTML = `
        <div class="loading-error" style="max-height: auto; overflow-y: auto;">
          Failed to start: ${error.message}
        </div>
        <button class="loading-retry"
          onclick="window.location.reload()">
          Retry
        </button>
      `;
    }
  }

  console.info('App initialization complete');
}, 50);

console.info('App.js End');