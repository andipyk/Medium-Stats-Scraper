// Convert string with K/M suffix to number
// e.g. "1.2K" -> 1200, "1M" -> 1000000
const numberHelper = {
  convertToNumber(str) {
    if (!str) return 0;
    
    // Remove any commas and trim whitespace
    str = str.replace(/,/g, '').trim();
    
    // If it's just a number, return it as integer
    if (!isNaN(str)) return parseInt(str);
    
    // Handle K suffix
    if (str.endsWith('K')) {
      return parseInt(str.replace('K', '')) * 1000;
    }
    
    return 0;
  },

  // Format number without commas
  formatNumber(num) {
    return num.toString();
  }
};

// Export the helper
window.numberHelper = numberHelper; 