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
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '');
  }
};

// Export the helper
window.numberHelper = numberHelper; 