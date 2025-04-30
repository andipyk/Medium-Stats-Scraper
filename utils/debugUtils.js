// Debug mode configuration - default is false for production
let DEBUG_MODE = false;

/**
 * Enhanced logging function that only outputs in debug mode
 * @param {string} type - The type of log (log, error, warn, info)
 * @param {string} context - The context of the log (popup, content, background)
 * @param {string} message - The log message
 * @param {any} data - Additional data to log
 */
function debugLog(type, context, message, data) {
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
}

/**
 * Gets the current debug mode value
 * @returns {boolean} - Current debug mode value
 */
function getDebugMode() {
  return DEBUG_MODE;
}

/**
 * Sets debug mode value
 * @param {boolean} value - Debug mode value
 */
function setDebugModeValue(value) {
  DEBUG_MODE = value;
}

module.exports = {
  debugLog,
  getDebugMode,
  setDebugModeValue
}; 