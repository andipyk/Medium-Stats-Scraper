const { debugLog, getDebugMode, setDebugModeValue } = require('./debugUtils');
const { isStorageAvailable, initializeDebugMode, saveDebugMode } = require('./storageUtils');
const { convertToNumber, formatNumber } = require('./numberHelper');

/**
 * Set debug mode and save it to storage
 * @param {boolean} value - Debug mode value
 */
function setDebugMode(value) {
  setDebugModeValue(value);
  saveDebugMode(value);
}

// Initialize debug mode from storage
initializeDebugMode();

// Export functions to be used in other scripts
window.debugLog = debugLog;
window.setDebugMode = setDebugMode;
window.getDebugMode = getDebugMode;
window.isStorageAvailable = isStorageAvailable;

// Export for module usage
module.exports = {
  debugLog,
  setDebugMode,
  getDebugMode,
  isStorageAvailable,
  convertToNumber,
  formatNumber
}; 