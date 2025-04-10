/**
 * Loading Indicator Module
 * 
 * Provides a reusable loading indicator for the application
 */

// Private singleton instance
let instance = null;

// Create the loading indicator functionality
function createLoadingIndicator() {
  return {
    // Update progress for the initial loading indicator
    updateProgress: function(percent, message) {
      const progressFill = document.querySelector('.progress-fill');
      const loadingText = document.querySelector('.loading-text');  
      if (progressFill) {
        progressFill.style.width = `${percent}%`;
      }
      
      if (message && loadingText) {
        loadingText.textContent = message;
      }
    },
    
    // Hide the initial loading screen
    hideInitialLoading: function() {
      const loadingScreen = document.getElementById('initial-loading');
      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.remove();
        }, 500);
      }
    },
    
    // Show an error on the loading indicator
    showError: function(message) {
      const loadingContent = document.querySelector('.loading-content');
      if (loadingContent) {
        const errorElement = document.createElement('div');
        errorElement.className = 'loading-error';
        errorElement.textContent = message;
        
        const retryButton = document.createElement('button');
        retryButton.className = 'loading-retry';
        retryButton.textContent = 'Retry';
        retryButton.onclick = () => window.location.reload();
        
        loadingContent.appendChild(errorElement);
        loadingContent.appendChild(retryButton);
      }
    },
    
    // Create a new loading indicator anywhere in the app
    show: function(options = {}) {
      const { message = 'Loading...', overlay = false, parent = document.body, progress = false } = options;
      
      let overlayElement = null;
      if (overlay) {
        overlayElement = document.createElement('div');
        overlayElement.className = 'loading-overlay';
        overlayElement.style.position = 'fixed';
        overlayElement.style.top = '0';
        overlayElement.style.left = '0';
        overlayElement.style.width = '100%';
        overlayElement.style.height = '100%';
        overlayElement.style.backgroundColor = 'rgba(0,0,0,0.5)';
        overlayElement.style.zIndex = '9999';
        document.body.appendChild(overlayElement);
      }
      
      const indicator = document.createElement('div');
      indicator.className = 'loading-indicator';
      
      let content = `
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <div class="loading-text">${message}</div>
      `;
      
      if (progress) {
        content += `
          <div class="loading-progress">
            <div class="progress-fill"></div>
          </div>
        `;
      }
      
      content += '</div>';
      indicator.innerHTML = content;
      
      if (overlayElement) {
        indicator.dataset.overlay = true;
        overlayElement.appendChild(indicator);
      } else {
        parent.appendChild(indicator);
      }
      
      return indicator;
    },
    
    // Hide any loading indicator
    hide: function(indicator) {
      if (!indicator) return;
      
      const hasOverlay = indicator.dataset.overlay;
      const parent = indicator.parentNode;
      
      indicator.style.opacity = '0';
      setTimeout(() => {
        indicator.remove();
        if (hasOverlay && parent && parent.classList.contains('loading-overlay')) {
          parent.remove();
        }
      }, 500);
    },
    
    // Update progress for any loading indicator
    updateProgressFor: function(indicator, percent, message) {
      if (!indicator) return;
      
      const progressFill = indicator.querySelector('.progress-fill');
      const loadingText = indicator.querySelector('.loading-text');
      
      if (progressFill) {
        progressFill.style.width = `${percent}%`;
      }
      
      if (message && loadingText) {
        loadingText.textContent = message;
      }
    },
    
    // Complete the loading process
    complete: function() {
      this.updateProgress(100, 'Engine started successfully!');
      
      // Add a slight delay before hiding to show the 100% state
      setTimeout(() => {
        this.hideInitialLoading();
      }, 300);
    }
  };
}

// Export a getter function that always returns the same instance
export function LoadingIndicator() {
  if (!instance) {
    instance = createLoadingIndicator();
    
    // Automatically attach to window for global access
    if (typeof window !== 'undefined') {
      window.loadingIndicator = instance;
    }
  }
  return instance;
}

// Also export the instance directly for modern import usage
export const loadingIndicator = LoadingIndicator();
