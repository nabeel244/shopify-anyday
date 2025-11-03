/**
 * Google Apps Script for Automatic Sheet Sync
 * 
 * This script automatically syncs cancellations from Google Sheets to your website
 * whenever the Status column is changed to "CANCELLED".
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Paste this code
 * 4. Replace YOUR_WEBSITE_URL with your actual website URL
 * 5. Click Save
 * 6. Run the "requestPermissions" function FIRST (this will request all needed permissions)
 * 7. Click "Allow" when prompted for permissions
 * 8. Set up the trigger (see instructions at bottom)
 */

// ⚠️ IMPORTANT: Replace this with your actual website URL
// Make sure to include the full URL with https://
const WEBSITE_BASE_URL = 'https://your-ngrok-url.ngrok-free.app';

// Alternative: Use direct cancel endpoint (simpler, more reliable)
// Format: https://your-ngrok-url.ngrok-free.app/api/cancel-booking
const CANCEL_BOOKING_ENDPOINT = WEBSITE_BASE_URL + '/api/cancel-booking';

// OLD METHOD: Full sync endpoint (can still use if preferred)
const SYNC_ENDPOINT = WEBSITE_BASE_URL + '/webhooks/google-sheets-sync?shop=default-shop';

// The column index for Status (column J = 10, adjust if needed)
const STATUS_COLUMN = 10; // Column J (1=A, 2=B, ..., 10=J)
const BOOKING_ID_COLUMN = 1; // Column A

/**
 * This function runs automatically when the sheet is edited
 */
function onEdit(e) {
  try {
    // Log that function was triggered
    console.log('onEdit triggered');
    console.log('Event object:', JSON.stringify(e));
    
    const sheet = e.source.getActiveSheet();
    const range = e.range;
    const row = range.getRow();
    const col = range.getColumn();
    
    console.log(`Edit detected - Row: ${row}, Column: ${col}`);
    
    // Only trigger if Status column (J) was edited and it's not the header row
    if (col === STATUS_COLUMN && row > 1) {
      const statusValue = e.value;
      const oldValue = e.oldValue;
      
      console.log(`Status column edited - Old: ${oldValue}, New: ${statusValue}`);
      
      // Check if status was changed to CANCELLED (case-insensitive)
      const newStatus = statusValue ? statusValue.toString().trim().toUpperCase() : '';
      const isCancelled = newStatus === 'CANCELLED';
      
      console.log(`Normalized status: ${newStatus}, Is cancelled: ${isCancelled}`);
      
      // If status changed to CANCELLED, cancel booking directly
      if (isCancelled) {
        const bookingId = sheet.getRange(row, BOOKING_ID_COLUMN).getValue();
        
        console.log(`✅ Status changed to CANCELLED for booking: ${bookingId}`);
        console.log(`Row: ${row}, Column: ${col}, Old Value: ${oldValue}, New Value: ${statusValue}`);
        
        // Validate booking ID
        if (!bookingId || bookingId.toString().trim() === '') {
          console.warn(`⚠️ No booking ID found in row ${row}, column ${BOOKING_ID_COLUMN}`);
          SpreadsheetApp.getActiveSpreadsheet().toast(
            `⚠️ No booking ID found in row ${row}`,
            'Warning',
            5
          );
          return;
        }
        
        // Show notification in sheet
        SpreadsheetApp.getActiveSpreadsheet().toast(
          `Cancelling booking ${bookingId} on website...`,
          'Processing',
          3
        );
        
        // Cancel booking directly (NEW METHOD - simpler and more reliable)
        const cancelResult = cancelBookingDirectly(bookingId.toString().trim());
        
        if (cancelResult.success) {
          // Show success message
          SpreadsheetApp.getActiveSpreadsheet().toast(
            `✅ Booking ${bookingId} cancelled successfully on website!`,
            'Success',
            5
          );
          console.log(`✅ Booking ${bookingId} cancelled successfully`);
        } else {
          // Show error message
          SpreadsheetApp.getActiveSpreadsheet().toast(
            `❌ Failed to cancel booking: ${cancelResult.error || 'Unknown error'}`,
            'Error',
            10
          );
          console.error(`❌ Failed to cancel booking ${bookingId}:`, cancelResult.error);
        }
      } else {
        console.log(`Status is ${newStatus}, not CANCELLED - skipping`);
      }
    } else {
      console.log(`Edit was not in Status column or was header row - skipping`);
    }
  } catch (error) {
    const errorMsg = error.toString();
    console.error('❌ Error in onEdit:', errorMsg);
    console.error('Error stack:', error.stack);
    
    // Show user-friendly error
    SpreadsheetApp.getActiveSpreadsheet().toast(
      `Sync Error: ${errorMsg}`,
      'Error',
      10
    );
  }
}

/**
 * NEW METHOD: Cancel booking directly by ID (simpler and more reliable)
 * Returns: { success: boolean, error?: string, message?: string }
 */
function cancelBookingDirectly(bookingId) {
  try {
    // Validate URL
    if (!CANCEL_BOOKING_ENDPOINT || CANCEL_BOOKING_ENDPOINT.includes('your-ngrok-url')) {
      const error = 'Website URL not configured! Please update WEBSITE_BASE_URL in the script.';
      console.error('❌', error);
      return { success: false, error: error };
    }
    
    const url = CANCEL_BOOKING_ENDPOINT;
    
    console.log('🔄 Cancelling booking directly...');
    console.log(`URL: ${url}`);
    console.log(`Booking ID: ${bookingId}`);
    console.log(`Method: POST`);
    
    // Make the request
    let response;
    try {
      response = UrlFetchApp.fetch(url, {
        method: 'POST',
        muteHttpExceptions: true,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'GoogleAppsScript-CancelBooking/1.0'
        },
        payload: JSON.stringify({
          bookingId: bookingId,
          status: 'CANCELLED'
        }),
        followRedirects: true,
        validateHttpsCertificates: true
      });
    } catch (fetchError) {
      const errorMsg = `Failed to connect: ${fetchError.toString()}`;
      console.error('❌ Fetch error:', errorMsg);
      return { success: false, error: errorMsg };
    }
    
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    console.log(`📡 Response Code: ${responseCode}`);
    console.log(`📡 Response: ${responseText}`);
    
    // Check if response is HTML instead of JSON
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      const errorMsg = `Server returned HTML instead of JSON. Response code: ${responseCode}. The endpoint might be returning an error page.`;
      console.error('❌', errorMsg);
      return { 
        success: false, 
        error: errorMsg + ' Check server logs for details.'
      };
    }
    
    if (responseCode === 200 || responseCode === 201) {
      try {
        const data = JSON.parse(responseText);
        
        if (data.success) {
          console.log('✅ Booking cancelled successfully!');
          console.log('Response:', JSON.stringify(data));
          return { 
            success: true, 
            message: data.message || `Booking ${bookingId} cancelled successfully`
          };
        } else {
          const errorMsg = data.error || data.message || 'Unknown error';
          console.error('❌ API returned error:', errorMsg);
          return { success: false, error: errorMsg };
        }
      } catch (parseError) {
        const errorMsg = `Response parsing error: ${parseError.toString()}`;
        console.error('❌ Parse error:', errorMsg);
        console.error('Response text:', responseText);
        return { success: false, error: errorMsg };
      }
    } else {
      const errorMsg = `HTTP ${responseCode}: ${responseText.substring(0, 200)}`;
      console.error('❌ HTTP Error:', errorMsg);
      return { success: false, error: errorMsg };
    }
  } catch (error) {
    const errorMsg = error.toString();
    console.error('❌ Unexpected error in cancelBookingDirectly:', errorMsg);
    console.error('Error stack:', error.stack);
    return { success: false, error: errorMsg };
  }
}

/**
 * OLD METHOD: Triggers full sync to website
 * Returns: { success: boolean, error?: string, data?: object }
 */
function triggerSync() {
  try {
    // Validate URL
    if (!WEBSITE_URL || WEBSITE_URL.includes('your-ngrok-url')) {
      const error = 'Website URL not configured! Please update WEBSITE_URL in the script.';
      console.error('❌', error);
      return { success: false, error: error };
    }
    
    const url = WEBSITE_URL;
    
    console.log('🔄 Triggering sync...');
    console.log(`URL: ${url}`);
    console.log(`Method: GET`);
    
    // Make the request with better error handling
    let response;
    try {
      response = UrlFetchApp.fetch(url, {
        method: 'GET',
        muteHttpExceptions: true,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'GoogleAppsScript-Sync/1.0'
        },
        followRedirects: true,
        validateHttpsCertificates: true
      });
    } catch (fetchError) {
      const errorMsg = `Failed to connect: ${fetchError.toString()}`;
      console.error('❌ Fetch error:', errorMsg);
      return { success: false, error: errorMsg };
    }
    
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    console.log(`📡 Response Code: ${responseCode}`);
    console.log(`📡 Response Length: ${responseText.length} characters`);
    console.log(`📡 Response (first 500 chars): ${responseText.substring(0, 500)}`);
    
    // Check if response is HTML instead of JSON
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      const errorMsg = `Server returned HTML instead of JSON. Response code: ${responseCode}. The endpoint might be returning an error page.`;
      console.error('❌', errorMsg);
      console.error('Full response:', responseText);
      return { 
        success: false, 
        error: errorMsg + ' Check server logs for details.'
      };
    }
    
    if (responseCode === 200 || responseCode === 201) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ Sync successful!');
        console.log('Response data:', JSON.stringify(data));
        
        const cancelledCount = data.deletedBookings ? data.deletedBookings.length : 0;
        console.log(`📊 Cancelled bookings synced: ${cancelledCount}`);
        
        if (cancelledCount > 0) {
          console.log(`Booking IDs: ${data.deletedBookings.join(', ')}`);
        }
        
        return { 
          success: true, 
          data: data,
          message: `Successfully synced ${cancelledCount} cancelled booking(s)`
        };
      } catch (parseError) {
        const errorMsg = `Response parsing error: ${parseError.toString()}`;
        console.error('❌ Parse error:', errorMsg);
        console.error('Response text:', responseText);
        return { success: false, error: errorMsg };
      }
    } else {
      const errorMsg = `HTTP ${responseCode}: ${responseText.substring(0, 200)}`;
      console.error('❌ HTTP Error:', errorMsg);
      return { success: false, error: errorMsg };
    }
  } catch (error) {
    const errorMsg = error.toString();
    console.error('❌ Unexpected error in triggerSync:', errorMsg);
    console.error('Error stack:', error.stack);
    return { success: false, error: errorMsg };
  }
}

/**
 * REQUEST PERMISSIONS - Run this function FIRST!
 * 
 * This function will explicitly request all necessary permissions
 * including permission to make external HTTP requests.
 * 
 * HOW TO USE:
 * 1. Select "requestPermissions" from the function dropdown
 * 2. Click "Run" (▶️)
 * 3. When prompted, click "Review Permissions"
 * 4. Select your Google account
 * 5. Click "Advanced" → "Go to [Project Name] (unsafe)"
 * 6. Click "Allow"
 */
function requestPermissions() {
  try {
    console.log('🔐 Requesting permissions...');
    
    // Validate URL first
    if (!WEBSITE_BASE_URL || WEBSITE_BASE_URL.includes('your-ngrok-url')) {
      const errorMsg = 'Website URL not configured! Please update WEBSITE_BASE_URL in the script first.';
      console.error('❌', errorMsg);
      SpreadsheetApp.getUi().alert(
        '❌ Configuration Error!\n\n' +
        errorMsg + '\n\n' +
        'Please update the WEBSITE_BASE_URL constant with your actual website URL.'
      );
      return;
    }
    
    // This will trigger the permission request dialog
    // We make a test request to your actual website to request permissions
    const testUrl = CANCEL_BOOKING_ENDPOINT || (WEBSITE_BASE_URL + '/api/cancel-booking');
    console.log(`Testing connection to: ${testUrl}`);
    
    try {
      // Try to fetch your website - this will trigger permission request
      const response = UrlFetchApp.fetch(testUrl, {
        method: 'GET',
        muteHttpExceptions: true,
        followRedirects: true
      });
      
      const responseCode = response.getResponseCode();
      console.log(`✅ Permissions granted! Response code: ${responseCode}`);
      
      if (responseCode === 200 || responseCode === 201) {
        SpreadsheetApp.getUi().alert(
          '✅ Permissions Granted!\n\n' +
          'The script can now connect to your website.\n\n' +
          'You can now:\n' +
          '1. Run "testConnection" to verify it works\n' +
          '2. Run "setupTrigger" to enable automatic sync\n' +
          '3. Change Status to CANCELLED in sheet - it will sync automatically!'
        );
      } else {
        console.warn(`Warning: Response code ${responseCode}`);
        SpreadsheetApp.getUi().alert(
          '⚠️ Permissions granted, but website returned error.\n\n' +
          `Response code: ${responseCode}\n\n` +
          'Please check:\n' +
          '1. Website URL is correct\n' +
          '2. Website is online and accessible\n' +
          '3. ngrok is running (if using ngrok)'
        );
      }
    } catch (error) {
      // This error will trigger Google's permission dialog
      const errorMsg = error.toString();
      console.error('❌ Permission error:', errorMsg);
      
      // Show helpful error message
      SpreadsheetApp.getUi().alert(
        '⚠️ Permissions Required!\n\n' +
        'You need to grant permissions for the script to make external requests.\n\n' +
        'Steps to fix:\n' +
        '1. Click "OK" on this dialog\n' +
        '2. Click "Run" (▶️) button again\n' +
        '3. Click "Review Permissions" when prompted\n' +
        '4. Select your Google account\n' +
        '5. Click "Advanced" → "Go to [Project Name] (unsafe)"\n' +
        '6. Click "Allow"\n\n' +
        'Then run this function again!'
      );
      
      // Re-throw to trigger Google's permission dialog
      throw error;
    }
  } catch (error) {
    // Log the error for debugging
    console.error('Permission request error:', error.toString());
    console.error('Error stack:', error.stack);
    
    // If it's a permission error, we want it to throw so Google shows the dialog
    if (error.toString().includes('permissions') || error.toString().includes('UrlFetchApp')) {
      throw error; // This will trigger Google's permission dialog
    } else {
      // Other errors should be shown to user
      SpreadsheetApp.getUi().alert(
        '❌ Error:\n\n' + error.toString() + '\n\nPlease check the script configuration.'
      );
    }
  }
}

/**
 * Manual sync function (for testing)
 * You can also call this manually from the Apps Script editor
 * 
 * IMPORTANT: Run "requestPermissions" first if you get permission errors!
 */
function manualSync() {
  console.log('🔄 Manual sync triggered');
  const result = triggerSync();
  
  if (result.success) {
    console.log('✅ Manual sync successful!');
    console.log('Result:', JSON.stringify(result));
    SpreadsheetApp.getUi().alert(
      `Sync Successful!\n\n${result.message || 'Bookings synced to website.'}`
    );
  } else {
    console.error('❌ Manual sync failed:', result.error);
    SpreadsheetApp.getUi().alert(
      `Sync Failed!\n\n${result.error}\n\nPlease check:\n` +
      `1. Website URL is correct\n` +
      `2. Website is accessible\n` +
      `3. Permissions are granted (run requestPermissions function)`
    );
  }
  
  return result;
}

/**
 * Test function to verify URL and connection
 */
function testConnection() {
  console.log('🧪 Testing connection...');
  
  if (!WEBSITE_URL || WEBSITE_URL.includes('your-ngrok-url')) {
    SpreadsheetApp.getUi().alert(
      '❌ Website URL not configured!\n\n' +
      'Please update WEBSITE_URL in the script with your actual website URL.'
    );
    return;
  }
  
  if (!WEBSITE_BASE_URL || WEBSITE_BASE_URL.includes('your-ngrok-url')) {
    SpreadsheetApp.getUi().alert(
      '❌ Website URL not configured!\n\n' +
      'Please update WEBSITE_BASE_URL in the script with your actual website URL.'
    );
    return;
  }
  
  console.log(`Testing URL: ${CANCEL_BOOKING_ENDPOINT}`);
  
  // Test with a dummy booking ID (this will fail but test the connection)
  const result = cancelBookingDirectly('test-connection');
  
  if (result.success) {
    SpreadsheetApp.getUi().alert(
      '✅ Connection Test Successful!\n\n' +
      `Website is reachable and responding correctly.\n\n` +
      `Response: ${result.message || 'OK'}`
    );
  } else {
    SpreadsheetApp.getUi().alert(
      '❌ Connection Test Failed!\n\n' +
      `Error: ${result.error}\n\n` +
      `Please check:\n` +
      `1. Website URL is correct: ${WEBSITE_URL}\n` +
      `2. Website is online and accessible\n` +
      `3. ngrok is running (if using ngrok)\n` +
      `4. No firewall blocking the request`
    );
  }
}

/**
 * Setup function - run this once to set up the trigger
 */
function setupTrigger() {
  try {
    // Delete existing triggers
    const triggers = ScriptApp.getProjectTriggers();
    let deletedCount = 0;
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'onEdit') {
        ScriptApp.deleteTrigger(trigger);
        deletedCount++;
      }
    });
    
    if (deletedCount > 0) {
      console.log(`🗑️ Deleted ${deletedCount} existing trigger(s)`);
    }
    
    // Create new trigger
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    ScriptApp.newTrigger('onEdit')
      .onEdit()
      .create();
    
    console.log('✅ Trigger set up successfully!');
    SpreadsheetApp.getUi().alert(
      '✅ Trigger Set Up Successfully!\n\n' +
      'The sync will now work automatically when Status is changed to CANCELLED.\n\n' +
      'Don\'t forget to:\n' +
      '1. Update WEBSITE_URL with your actual URL\n' +
      '2. Run "requestPermissions" to grant permissions\n' +
      '3. Run "testConnection" to verify it works'
    );
  } catch (error) {
    console.error('Error setting up trigger:', error);
    SpreadsheetApp.getUi().alert(`Error: ${error.toString()}`);
  }
}

