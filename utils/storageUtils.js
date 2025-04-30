const { debugLog, setDebugModeValue } = require('./debugUtils');

/**
 * Check if chrome.storage is available
 * @returns {boolean} - Whether chrome.storage is available
 */
function isStorageAvailable() {
  return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
}

/**
 * Initialize debug mode from storage
 */
async function initializeDebugMode() {
  if (!isStorageAvailable()) return;
  
  try {
    chrome.storage.local.get(['DEBUG_MODE'], function(result) {
      if (result && result.DEBUG_MODE !== undefined) {
        setDebugModeValue(result.DEBUG_MODE);
        debugLog('info', 'storage', 'Debug mode loaded from storage:', result.DEBUG_MODE);
      }
    });
  } catch (error) {
    console.error('Error accessing chrome.storage:', error);
  }
}

/**
 * Save debug mode to storage
 * @param {boolean} value - Debug mode value to save
 */
async function saveDebugMode(value) {
  if (!isStorageAvailable()) {
    debugLog('warn', 'storage', 'Storage not available, debug mode only set locally');
    return;
  }
  
  try {
    chrome.storage.local.set({ DEBUG_MODE: value }, function() {
      debugLog('info', 'storage', `Debug mode ${value ? 'enabled' : 'disabled'} and saved to storage`);
    });
  } catch (error) {
    console.error('Error saving debug mode to storage:', error);
    debugLog('error', 'storage', 'Failed to save debug mode to storage');
  }
}

module.exports = {
  isStorageAvailable,
  initializeDebugMode,
  saveDebugMode
}; 