import { json } from "@remix-run/node";
// import { GoogleSheetsService } from "../services/googleSheets.server.js";

export async function action({ request }) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { spreadsheetId, sheetName, credentials } = await request.json();

    // Validate required fields
    if (!spreadsheetId || !sheetName || !credentials) {
      return json({ error: 'All fields are required' }, { status: 400 });
    }

    // Google Sheets functionality temporarily disabled
    return json({ 
      success: true, 
      message: 'Google Sheets functionality temporarily disabled',
      spreadsheetTitle: 'Disabled'
    });
    
    /* Original code commented out
    // Test the connection
    const sheetsService = new GoogleSheetsService('test-shop');
    
    // Temporarily set the configuration for testing
    sheetsService.spreadsheetId = spreadsheetId;
    sheetsService.sheetName = sheetName;
    
    // Initialize with test credentials
    const credentialsObj = JSON.parse(credentials);
    const { google } = await import('googleapis');
    
    const auth = new google.auth.GoogleAuth({
      credentials: credentialsObj,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Test by trying to read the spreadsheet
    const response = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId
    });

    if (response.data) {
      return json({ 
        success: true, 
        message: 'Connection successful!',
        spreadsheetTitle: response.data.properties?.title || 'Unknown'
      });
    } else {
      return json({ error: 'Failed to access spreadsheet' }, { status: 400 });
    }
    */

  } catch (error) {
    console.error('Google Sheets connection test failed:', error);
    
    let errorMessage = 'Connection test failed';
    
    if (error.message.includes('PERMISSION_DENIED')) {
      errorMessage = 'Permission denied. Make sure the service account has access to the spreadsheet.';
    } else if (error.message.includes('NOT_FOUND')) {
      errorMessage = 'Spreadsheet not found. Check the spreadsheet ID.';
    } else if (error.message.includes('invalid_grant')) {
      errorMessage = 'Invalid credentials. Check your service account JSON.';
    }
    
    return json({ error: errorMessage }, { status: 400 });
  }
}
