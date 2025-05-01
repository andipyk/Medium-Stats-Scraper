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
  // Extract stats from text content
  extractStats(textContent) {
    try {
      console.log('Starting stats extraction...');
      
      // Find the "Latest" section
      const latestIndex = textContent.indexOf('Latest');
      if (latestIndex === -1) {
        console.log('No Latest section found');
        return [];
      }
      
      const contentAfterLatest = textContent.substring(latestIndex);
      const articles = [];
      
      // Split content into lines and clean up
      const lines = contentAfterLatest.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      let currentArticle = null;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // If line contains "min read", this is a new article
        if (line.includes('min read')) {
          // If we have a previous article, save it
          if (currentArticle) {
            articles.push(currentArticle);
          }
          
          // Look for the title (2 lines above "min read")
          let titleLine = '';
          for (let j = 2; j <= 4; j++) {
            const potentialTitleLine = lines[i - j];
            if (potentialTitleLine && 
                !potentialTitleLine.includes('min read') && 
                !potentialTitleLine.includes('Views') && 
                !potentialTitleLine.includes('Reads') && 
                !potentialTitleLine.includes('Earnings') &&
                !potentialTitleLine.includes('·') &&
                potentialTitleLine.length > 0) {
              titleLine = potentialTitleLine;
              break;
            }
          }
          
          // Clean up title
          const title = titleLine
            .replace(/[·\s]+/g, ' ') // Replace multiple spaces and dots with single space
            .trim();
          
          // Start new article
          currentArticle = {
            title: title || 'Unknown Title',
            views: 0,
            reads: 0,
            earnings: 0
          };
          
          // Look for stats in the next lines
          let j = i + 1;
          while (j < lines.length && !lines[j].includes('min read')) {
            const currentLine = lines[j];
            
            // Look for Views
            if (currentLine === 'Views' && j > 0) {
              const viewsValue = lines[j - 1];
              if (viewsValue) {
                currentArticle.views = convertToNumber(viewsValue);
              }
            }
            
            // Look for Reads
            if (currentLine === 'Reads' && j > 0) {
              const readsValue = lines[j - 1];
              if (readsValue) {
                currentArticle.reads = convertToNumber(readsValue);
              }
            }
            
            // Look for Earnings
            if (currentLine === 'Earnings' && j > 0) {
              const earningsValue = lines[j - 1];
              if (earningsValue && earningsValue !== '-') {
                currentArticle.earnings = convertToNumber(earningsValue.replace('$', ''));
              }
            }
            
            j++;
          }
        }
      }
      
      // Add the last article if exists
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