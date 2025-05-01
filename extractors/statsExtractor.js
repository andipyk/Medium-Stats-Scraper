// Helper function to convert string to number
function convertToNumber(str) {
  if (!str) return 0;
  
  // Remove any commas and trim whitespace
  str = str.replace(/,/g, '').trim();
  
  // If it's just a number, return it
  if (!isNaN(str)) return Number(str);
  
  // Handle K suffix
  if (str.endsWith('K')) {
    const num = parseFloat(str.replace('K', ''));
    return Math.round(num * 1000);
  }
  
  // Handle M suffix
  if (str.endsWith('M')) {
    const num = parseFloat(str.replace('M', ''));
    return Math.round(num * 1000000);
  }
  
  // If we can't parse it, return 0
  return 0;
}

const statsExtractor = {
  // Cache for frequently used regex patterns
  patterns: {
    minRead: /min read/,
    views: /Views/,
    reads: /Reads/,
    earnings: /Earnings/,
    number: /[.,]/g,
    whitespace: /[·\s]+/g
  },

  // Extract stats from text content
  extractStats(textContent) {
    try {
      console.log('Starting stats extraction...');
      
      const latestIndex = textContent.indexOf('Latest');
      if (latestIndex === -1) {
        console.log('No Latest section found');
        return [];
      }
      
      const contentAfterLatest = textContent.substring(latestIndex);
      const articles = [];
      
      // Pre-process lines once
      const lines = contentAfterLatest.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      let currentArticle = null;
      let i = 0;
      
      while (i < lines.length) {
        const line = lines[i];
        
        // Skip month headers (e.g. "Apr 2025", "Mar 2025")
        if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}$/.test(line)) {
          i++;
          continue;
        }
        
        if (this.patterns.minRead.test(line)) {
          if (currentArticle) {
            articles.push(currentArticle);
          }
          
          // Find title by looking backwards until we find a non-empty line that's not a stat
          const titleLine = this.findTitle(lines, i);
          const title = titleLine.replace(this.patterns.whitespace, ' ').trim();
          
          currentArticle = {
            title: title || 'Unknown Title',
            views: 0,
            reads: 0,
            earnings: 0
          };
          
          // Process stats in one pass
          i = this.processStats(lines, i + 1, currentArticle);
          continue;
        }
        
        i++;
      }
      
      if (currentArticle) {
        articles.push(currentArticle);
      }
      
      // Filter out articles with invalid titles (just numbers or empty)
      const validArticles = articles.filter(article => {
        const title = article.title;
        return title && 
               title !== 'Unknown Title' && 
               !/^\d+$/.test(title) &&
               !/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/.test(title);
      });
      
      console.log(`Found ${validArticles.length} valid articles`);
      return validArticles;
    } catch (error) {
      console.error('Error extracting stats:', error);
      return [];
    }
  },

  // Helper method to find title
  findTitle(lines, currentIndex) {
    // Check if this is a non-monetized page by looking for "Apply to Partner Program"
    const isNonMonetized = lines.some(line => line.includes('Apply to Partner Program'));
    
    // Look backwards for the title, skipping empty lines and stat lines
    for (let j = 1; j <= 5; j++) {
      const potentialTitleLine = lines[currentIndex - j];
      if (!potentialTitleLine) continue;
      
      // Skip if line is just a number or month header
      if (/^\d+$/.test(potentialTitleLine) || 
          /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/.test(potentialTitleLine)) {
        continue;
      }
      
      // Skip stat labels and metadata
      if (this.patterns.minRead.test(potentialTitleLine) ||
          this.patterns.views.test(potentialTitleLine) ||
          this.patterns.reads.test(potentialTitleLine) ||
          (!isNonMonetized && this.patterns.earnings.test(potentialTitleLine)) ||
          potentialTitleLine.includes('·')) {
        continue;
      }
      
      // Found a valid title
      if (potentialTitleLine.trim().length > 0) {
        return potentialTitleLine;
      }
    }
    
    return '';
  },

  // Helper method to process stats
  processStats(lines, startIndex, article) {
    let i = startIndex;
    while (i < lines.length && !this.patterns.minRead.test(lines[i])) {
      const currentLine = lines[i];
      
      // Check if current line is a label
      if (this.patterns.views.test(currentLine)) {
        // Check both previous and next lines for the value
        const prevLine = i > 0 ? lines[i - 1] : '';
        const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
        
        // Try to get the value from either line
        const value = convertToNumber(prevLine) || convertToNumber(nextLine);
        article.views = value;
      } else if (this.patterns.reads.test(currentLine)) {
        // Check both previous and next lines for the value
        const prevLine = i > 0 ? lines[i - 1] : '';
        const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
        
        // Try to get the value from either line
        const value = convertToNumber(prevLine) || convertToNumber(nextLine);
        article.reads = value;
      } else if (this.patterns.earnings.test(currentLine)) {
        // Check both previous and next lines for the value
        const prevLine = i > 0 ? lines[i - 1] : '';
        const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
        
        // Try to get the value from either line, but skip if it's a dash
        if (prevLine !== '-' && nextLine !== '-') {
          const value = convertToNumber(prevLine.replace('$', '')) || convertToNumber(nextLine.replace('$', ''));
          article.earnings = value;
        }
      }
      
      i++;
    }
    return i;
  },

  // Format earnings as dollars without commas or decimals
  formatEarnings(amount) {
    return `$${Math.floor(amount).toString().replace(/[.,]/g, '')}`;
  },

  // Format views without commas or dots
  formatViews(amount) {
    return amount.toString().replace(/[.,]/g, '');
  },

  // Format reads without commas or dots
  formatReads(amount) {
    return amount.toString().replace(/[.,]/g, '');
  }
};

// Export the extractor
window.statsExtractor = statsExtractor; 