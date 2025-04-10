/**
 * =====================================================================
 * Portfolio engine: app.js - Entry Point
 * =====================================================================
 */

// Show the loading indicator 
// Questions:
// in new to code and js
// - why are we starting with (function name)() what is this sintax mean?
// - usaly i see just function name(){} and then call the function name()
// - what do () do t a function?
// Answer:
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

    //setTimeout(async () => {
    try {
      
    // ======================================================================
    // PHASE 1:
    // ======================================================================
    // Add Devtools
    console.info('PHASE 1 Start');
    console.info('Adding DevTools');
    const { DevTools } = await import('./engine/modules/dev-tools/dev-tools.js');
    const devTools = new DevTools(); // Initialize the DevTools instance

    // error handling
    } catch (error) {
      console.info('Dev tools failed to load:', error);
      throw error; // Rethrow to handle in the main catch block
    }
    console.info('PHASE 1 End');
    
  //},50);
  
    // ======================================================================
    // PHASE 1: PREPARE THE ENVIRONMENT
    // ======================================================================
    // Start the engine
    console.info('PHASE 2 Start');
    console.info('Step 1 Start');
    const { startEngine } = await import('./engine/start.js');
    const portfolio = await startEngine();
    
    console.info('Step 1 End');
    console.info('Step 2 Start');
    // Start the engine and load the initial page
    portfolio.start();
    
    // Navigate to the learn page for testing
    window.location.hash = 'learn';
    
    console.info('Step 2 End');
    
    // error handling
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
  console.info('PHASE 2 End');


  console.info('App End');
}, 50);

console.info('App.js End');