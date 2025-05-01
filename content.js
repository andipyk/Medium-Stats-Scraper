const contentScript = {
  // Debug mode state
  debugMode: false,

  // Custom error class
  MediumStatsError: class extends Error {
    constructor(message, type = 'UNKNOWN') {
      super(message);
      this.name = 'MediumStatsError';
      this.type = type;
    }
  },

  // Logger utility
  logger: {
    log(message, data = null) {
      if (this.debugMode) {
        console.log(`[Medium Stats] ${message}`, data || '');
      }
    },
    error(error) {
      console.error(`[Medium Stats] Error:`, error);
    }
  },

  // Initialize the content script
  init() {
    this.setupMessageListener();
    this.loadDebugMode();
    this.logger.log('Content script initialized');
  },

  // Load debug mode from storage
  loadDebugMode() {
    chrome.storage.local.get(['DEBUG_MODE'], (result) => {
      if (result && result.DEBUG_MODE !== undefined) {
        this.debugMode = result.DEBUG_MODE;
      }
    });
  },

  // Set debug mode
  setDebugMode(value) {
    this.debugMode = value;
    chrome.storage.local.set({ DEBUG_MODE: value });
  },

  // Setup message listener
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'scrapeStats') {
        this.handleScrapeStats(request, sendResponse);
      } else if (request.action === 'previewStats') {
        this.handlePreviewStats(request, sendResponse);
      }
      return true;
    });
  },

  // Handle scrape stats request
  async handleScrapeStats(request, sendResponse) {
    if (request.debug !== undefined) {
      this.setDebugMode(request.debug);
    }
    
    this.logger.log('Starting scrape stats process');
    sendResponse({ success: true, message: "Starting export process" });
    
    try {
      await this.scrapeAndExport();
    } catch (error) {
      this.logger.error(error);
      throw new this.MediumStatsError(
        error.message || 'Failed to scrape stats',
        'SCRAPE_ERROR'
      );
    }
  },

  // Handle preview stats request
  async handlePreviewStats(request, sendResponse) {
    if (request.debug !== undefined) {
      this.setDebugMode(request.debug);
    }
    
    sendResponse({ success: true, message: "Starting preview process" });
    
    try {
      await this.previewStats();
    } catch (error) {
      console.error('Error in previewStats:', error);
    }
  },

  // Force page refresh and clear cache
  async forcePageRefresh() {
    console.log('Forcing page refresh...');
    
    // Scroll to bottom to load all lazy-loaded content
    await new Promise(resolve => {
      let lastScrollHeight = 0;
      let attempts = 0;
      const maxAttempts = 10;
      
      const scrollInterval = setInterval(() => {
        window.scrollTo(0, document.body.scrollHeight);
        
        if (document.body.scrollHeight === lastScrollHeight) {
          attempts++;
          if (attempts >= maxAttempts) {
            clearInterval(scrollInterval);
            resolve();
          }
        } else {
          attempts = 0;
          lastScrollHeight = document.body.scrollHeight;
        }
      }, 500);
    });
    
    // Wait for any dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Page refresh complete');
  },

  // Preview stats
  async previewStats() {
    try {
      await this.forcePageRefresh();
      
      const textContent = document.body.innerText;
      const articles = window.statsExtractor.extractStats(textContent);
      
      if (articles.length > 0) {
        const previewData = articles.slice(0, 20).map(article => ({
          ...article,
          earnings: window.statsExtractor.formatEarnings(article.earnings)
        }));
        
        chrome.runtime.sendMessage({
          action: 'previewData',
          success: true,
          data: previewData
        });
      } else {
        throw new Error('No articles found after Latest section');
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      chrome.runtime.sendMessage({
        action: 'previewData',
        success: false,
        error: error.message || 'Unknown error occurred'
      });
    }
  },

  // Scrape and export stats
  async scrapeAndExport() {
    try {
      await this.forcePageRefresh();
      
      const textContent = document.body.innerText;
      const articles = window.statsExtractor.extractStats(textContent);
      
      if (articles.length > 0) {
        this.exportToCSV(articles);
        this.showNotification('success', `Successfully exported ${articles.length} articles to CSV.`);
        
        chrome.runtime.sendMessage({
          action: 'exportComplete',
          success: true,
          count: articles.length
        });
      } else {
        throw new Error('No articles found after Latest section');
      }
    } catch (error) {
      console.error('Error scraping stats:', error);
      this.showNotification('error', `Error: ${error.message || 'Unknown error occurred'}`);
      
      chrome.runtime.sendMessage({
        action: 'exportComplete',
        success: false,
        error: error.message || 'Unknown error occurred'
      });
    }
  },

  // Export data to CSV
  exportToCSV(data) {
    // CSV header
    let csvContent = 'Title,Views,Reads,Earnings\n';
    
    // Add each row of data
    data.forEach(article => {
      const title = `"${article.title.replace(/"/g, '""')}"`;
      const views = window.numberHelper.formatNumber(article.views);
      const reads = window.numberHelper.formatNumber(article.reads);
      const earnings = article.earnings ? window.statsExtractor.formatEarnings(article.earnings) : '-';
      csvContent += `${title},${views},${reads},${earnings}\n`;
    });
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element to trigger download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `medium_stats_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.display = 'none';
    
    // Add to document, trigger click, and remove
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  },

  // Show notification
  showNotification(type, message) {
    const NOTIFICATION_CONFIG = {
      duration: 5000,
      styles: {
        success: {
          backgroundColor: '#1a8917',
          color: 'white'
        },
        error: {
          backgroundColor: '#e74c3c',
          color: 'white'
        },
        info: {
          backgroundColor: '#3498db',
          color: 'white'
        }
      }
    };

    // Remove any existing notifications
    const existingNotification = document.getElementById('medium-stats-notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'medium-stats-notification';
    
    // Apply base styles
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: '9999',
      padding: '15px 20px',
      borderRadius: '5px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      transition: 'opacity 0.3s ease-in-out',
      maxWidth: '300px',
      ...NOTIFICATION_CONFIG.styles[type]
    });
    
    // Add message
    notification.textContent = message;
    
    // Add close button
    const closeButton = document.createElement('span');
    closeButton.textContent = '×';
    Object.assign(closeButton.style, {
      position: 'absolute',
      top: '5px',
      right: '10px',
      cursor: 'pointer',
      fontSize: '18px',
      fontWeight: 'bold'
    });
    
    closeButton.addEventListener('click', () => {
      notification.remove();
    });
    
    notification.appendChild(closeButton);
    document.body.appendChild(notification);
    
    // Auto remove after duration
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
      }
    }, NOTIFICATION_CONFIG.duration);
  }
};

// Initialize the content script
contentScript.init(); 