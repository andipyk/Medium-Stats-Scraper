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
        
        if (this.patterns.minRead.test(line)) {
          if (currentArticle) {
            articles.push(currentArticle);
          }
          
          // Optimized title search
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
      
      console.log(`Found ${articles.length} articles`);
      return articles;
    } catch (error) {
      console.error('Error extracting stats:', error);
      return [];
    }
  },

  // Helper method to find title
  findTitle(lines, currentIndex) {
    for (let j = 2; j <= 4; j++) {
      const potentialTitleLine = lines[currentIndex - j];
      if (potentialTitleLine && 
          !this.patterns.minRead.test(potentialTitleLine) && 
          !this.patterns.views.test(potentialTitleLine) && 
          !this.patterns.reads.test(potentialTitleLine) && 
          !this.patterns.earnings.test(potentialTitleLine) &&
          !potentialTitleLine.includes('·') &&
          potentialTitleLine.length > 0) {
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
      
      if (i > 0) {
        const prevLine = lines[i - 1];
        
        if (this.patterns.views.test(currentLine)) {
          article.views = convertToNumber(prevLine);
        } else if (this.patterns.reads.test(currentLine)) {
          article.reads = convertToNumber(prevLine);
        } else if (this.patterns.earnings.test(currentLine) && prevLine !== '-') {
          article.earnings = convertToNumber(prevLine.replace('$', ''));
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