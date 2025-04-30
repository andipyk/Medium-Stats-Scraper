// State management
const state = {
  isDebugMode: false,
  isLoading: false,
  lastError: null
};

// UI Elements
const elements = {
  scrapeButton: document.getElementById('scrapeButton'),
  previewButton: document.getElementById('previewButton'),
  statusElement: document.getElementById('status'),
  previewContainer: document.getElementById('previewContainer'),
  previewTable: document.getElementById('previewTable').querySelector('tbody'),
  debugToggle: document.getElementById('debug-toggle')
};

// Constants
const CONSTANTS = {
  MEDIUM_STATS_URL: 'medium.com/me/stats',
  STATUS_TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info'
  }
};

document.addEventListener('DOMContentLoaded', function() {
  console.log('Popup loaded');
  
  initializeState();
  setupEventListeners();
  setupMessageListener();
});

function initializeState() {
  // Load debug mode from storage
  chrome.storage.local.get(['DEBUG_MODE'], function(result) {
    if (result && result.DEBUG_MODE !== undefined) {
      state.isDebugMode = result.DEBUG_MODE;
      updateDebugToggleText();
    }
  });
}

function setupEventListeners() {
  // Debug toggle click handler
  elements.debugToggle.addEventListener('click', () => {
    state.isDebugMode = !state.isDebugMode;
    chrome.storage.local.set({ DEBUG_MODE: state.isDebugMode });
    updateDebugToggleText();
  });
  
  // Preview button click handler
  if (elements.previewButton) {
    elements.previewButton.addEventListener('click', () => {
      if (state.isLoading) return;
      showStatus(CONSTANTS.STATUS_TYPES.INFO, 'Loading preview...');
      sendMessageToActiveTab({
        action: 'previewStats',
        debug: state.isDebugMode
      });
    });
  }

  // Scrape button click handler
  if (elements.scrapeButton) {
    elements.scrapeButton.addEventListener('click', () => {
      if (state.isLoading) return;
      showStatus(CONSTANTS.STATUS_TYPES.INFO, 'Exporting data...');
      sendMessageToActiveTab({
        action: 'scrapeStats',
        debug: state.isDebugMode
      });
    });
  }
}

function updateDebugToggleText() {
  elements.debugToggle.textContent = `Debug Mode: ${state.isDebugMode ? 'On' : 'Off'}`;
}

function setupMessageListener() {
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'exportComplete') {
      handleExportComplete(message);
    } else if (message.action === 'previewData') {
      handlePreviewData(message);
    }
  });
}

function handleExportComplete(message) {
  if (message.success) {
    showStatus(CONSTANTS.STATUS_TYPES.SUCCESS, `Successfully exported ${message.count} articles to CSV.`);
  } else {
    showStatus(CONSTANTS.STATUS_TYPES.ERROR, `Error: ${message.error}`);
  }
}

function handlePreviewData(message) {
  if (message.success && message.data) {
    displayPreviewData(message.data);
    showStatus(CONSTANTS.STATUS_TYPES.SUCCESS, `Preview loaded with ${message.data.length} articles.`);
  } else {
    showStatus(CONSTANTS.STATUS_TYPES.ERROR, `Error loading preview: ${message.error}`);
  }
}

// Display preview data in the table
function displayPreviewData(data) {
  // Clear existing table content
  elements.previewTable.innerHTML = '';
  
  if (data.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.textContent = 'No data found';
    cell.style.textAlign = 'center';
    row.appendChild(cell);
    elements.previewTable.appendChild(row);
  } else {
    // Add each article to the table
    data.forEach(article => {
      const row = document.createElement('tr');
      
      const titleCell = document.createElement('td');
      const displayTitle = article.title || 'Unknown Title';
      titleCell.textContent = displayTitle.length > 30 ? displayTitle.substring(0, 30) + '...' : displayTitle;
      titleCell.style.maxWidth = '180px';
      titleCell.style.overflow = 'hidden';
      titleCell.style.textOverflow = 'ellipsis';
      titleCell.style.whiteSpace = 'nowrap';
      titleCell.title = displayTitle;
      row.appendChild(titleCell);
      
      const viewsCell = document.createElement('td');
      viewsCell.textContent = article.views === 0 ? '0' : article.views.toString();
      viewsCell.style.textAlign = 'right';
      viewsCell.style.padding = '0 10px';
      row.appendChild(viewsCell);
      
      const readsCell = document.createElement('td');
      readsCell.textContent = article.reads === 0 ? '0' : article.reads.toString();
      readsCell.style.textAlign = 'right';
      readsCell.style.padding = '0 10px';
      row.appendChild(readsCell);
      
      const earningsCell = document.createElement('td');
      earningsCell.textContent = article.earnings ? article.earnings : '-';
      earningsCell.style.textAlign = 'right';
      earningsCell.style.padding = '0 10px';
      row.appendChild(earningsCell);
      
      elements.previewTable.appendChild(row);
    });
  }
  
  // Show the preview container
  elements.previewContainer.style.display = 'block';
}

// Function to safely send a message to the content script
function sendMessageToActiveTab(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (!tabs || tabs.length === 0) {
      showStatus(CONSTANTS.STATUS_TYPES.ERROR, 'No active tab found');
      return;
    }
    
    const tab = tabs[0];
    if (!tab.url || !tab.url.includes('medium.com/me/stats')) {
      showStatus(CONSTANTS.STATUS_TYPES.ERROR, 'Please navigate to Medium stats page first');
      return;
    }
    
    // First try to inject the content script
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['extractors/statsExtractor.js', 'utils/numberHelper.js', 'content.js']
    }, () => {
      // Then send the message
      chrome.tabs.sendMessage(tab.id, message, function(response) {
        if (chrome.runtime.lastError) {
          showStatus(CONSTANTS.STATUS_TYPES.ERROR, 'Error: ' + chrome.runtime.lastError.message);
          return;
        }
      });
    });
  });
}

// Helper function to show status
function showStatus(type, message) {
  elements.statusElement.style.display = 'block';
  elements.statusElement.textContent = message;
  elements.statusElement.className = type;
}
