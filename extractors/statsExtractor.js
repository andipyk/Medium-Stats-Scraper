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
      
      // Split content into lines
      const lines = contentAfterLatest.split('\n');
      
      let currentArticle = null;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines
        if (!line) continue;
        
        // If line contains "min read", look 6 lines above for the title
        if (line.includes('min read')) {
          // If we have a previous article, save it
          if (currentArticle) {
            articles.push(currentArticle);
          }
          
          // Look 6 lines above for the title
          let titleLine = '';
          for (let j = 1; j <= 6; j++) {
            const potentialTitleLine = lines[i - j]?.trim();
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
        }
        
        // Look for views
        if (line.includes('Views') && currentArticle) {
          const viewsLine = lines[i - 1]?.trim();
          if (viewsLine) {
            currentArticle.views = convertToNumber(viewsLine);
          }
        }
        
        // Look for reads
        if (line.includes('Reads') && currentArticle) {
          const readsLine = lines[i - 1]?.trim();
          if (readsLine) {
            currentArticle.reads = convertToNumber(readsLine);
          }
        }
        
        // Look for earnings
        if (line.includes('Earnings') && currentArticle) {
          const earningsLine = lines[i - 1]?.trim();
          if (earningsLine && earningsLine !== '-') {
            currentArticle.earnings = convertToNumber(earningsLine.replace('$', ''));
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