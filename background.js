// Background script to handle messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Forward messages between popup and content scripts
  if (message.action === 'scrapeStats') {
    debugLog('info', 'background', 'Received scrape request from popup');
  } else if (message.action === 'exportComplete') {
    // Forward the export completion message to the popup
    const status = message.success ? 'Success' : 'Failed';
    debugLog('info', 'background', `Export completed: ${status}`, message);
    
    // In development mode, log more details
    if (!message.success) {
      debugLog('error', 'background', 'Export failed:', message.error);
    }
  }
});

// Import debug utilities (since background can't access window object directly)
function debugLog(type, context, message, data) {
  // Check if we're in debug mode via storage or assume false
  chrome.storage.local.get(['DEBUG_MODE'], function(result) {
    const DEBUG_MODE = result.DEBUG_MODE || false;
    
    if (!DEBUG_MODE) return;
    
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${context.toUpperCase()}] ${message}`;
    
    switch (type) {
      case 'error':
        console.error(formattedMessage, data || '');
        break;
      case 'warn':
        console.warn(formattedMessage, data || '');
        break;
      case 'info':
        console.info(formattedMessage, data || '');
        break;
      default:
        console.log(formattedMessage, data || '');
    }
  });
} 