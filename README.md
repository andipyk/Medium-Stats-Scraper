# Medium Stats Scraper

A Chrome extension that scrapes your Medium article statistics and exports them to a CSV file for easy analysis and tracking.

## Features

- Scrapes article titles, views, reads, and earnings from your Medium stats page
- Preview functionality to see your stats before exporting to CSV
- Exports data to a CSV file with a single click
- Works with both new and old Medium stats interfaces
- Robust error handling for reliable operation
- Debug mode to help troubleshoot any issues
- Works offline once the page has loaded
- Respects your privacy - all data processing happens locally

## Installation

1. Download or clone this repository to your local machine
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the folder containing the extension files
5. The extension should now appear in your Chrome toolbar

## Usage

1. Navigate to your Medium stats page: [https://medium.com/me/stats](https://medium.com/me/stats)
2. Click on the Medium Stats Scraper extension icon in your Chrome toolbar
3. You'll see two options:
   - **Preview Stats**: View your stats directly in the popup before exporting
   - **Export to CSV**: Download all your stats as a CSV file
4. If you choose to export, a CSV file will be downloaded to your default download location

## Preview Feature

The preview feature allows you to:
- Quickly check if the data extraction is working correctly
- See your article titles, views, and reads without downloading a file
- Verify the data before exporting to CSV

## Debug Mode

If you encounter any issues:
1. Toggle "Debug Mode" at the bottom of the popup
2. Try your operation again
3. Check the browser console (F12 or right-click > Inspect > Console) for detailed logs
4. This information can be helpful if you need to report an issue

## CSV Format

The exported CSV contains the following columns:
- **Title**: The title of your Medium article
- **Views**: Number of views
- **Reads**: Number of reads
- **Earnings**: Earnings in dollars (if applicable)

## Troubleshooting

If the extension doesn't work:
- Make sure you're on the correct Medium stats page (https://medium.com/me/stats)
- Try refreshing the page
- Check if you're logged into your Medium account
- Enable Debug Mode and check the console logs for more information
- Make sure your browser is up to date
- Try disabling other extensions that might interfere

## Technical Details

The extension uses:
- Chrome Extension Manifest V3
- Content scripts to safely extract data from the page
- Multiple extraction methods for reliability with different Medium layouts
- Local storage for remembering your debug preferences

## Privacy Notice

This extension operates entirely on your local machine. No data is sent to any external servers. Your Medium stats remain private and are only saved locally when you export to CSV.

## Contributing

Contributions are welcome! If you find a bug or have an enhancement in mind, please open an issue or submit a pull request. 