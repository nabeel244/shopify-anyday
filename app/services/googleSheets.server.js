import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class GoogleSheetsService {
  constructor(shopDomain, location = null) {
    this.shopDomain = shopDomain;
    this.location = location;
    this.auth = null;
    this.sheets = null;
    this.spreadsheetId = null;
    this.sheetName = null;
  }

  async initialize() {
    try {
      // If location is provided, find config by shopDomain + location
      // Otherwise, try to find by shopDomain only (for backward compatibility)
      let config;
      
      if (this.location) {
        config = await prisma.googleSheetConfig.findUnique({
          where: {
            shopDomain_location: {
              shopDomain: this.shopDomain,
              location: this.location
            }
          }
        });
        
        // If not found by location, try to find default config for shopDomain
        if (!config) {
          config = await prisma.googleSheetConfig.findFirst({
            where: {
              shopDomain: this.shopDomain,
              isActive: true
            }
          });
        }
      } else {
        // Backward compatibility: find first active config for shopDomain
        config = await prisma.googleSheetConfig.findFirst({
          where: {
            shopDomain: this.shopDomain,
            isActive: true
          }
        });
      }

      if (!config || !config.isActive) {
        console.log('Google Sheets configuration not found or inactive for:', this.shopDomain, this.location ? `location: ${this.location}` : '');
        return false;
      }

      const credentials = JSON.parse(config.credentials);
      
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.spreadsheetId = config.spreadsheetId;
      this.sheetName = config.sheetName;

      console.log(`✅ Google Sheets initialized for ${this.shopDomain}${this.location ? ` - Location: ${this.location}` : ''}`);
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Sheets service:', error);
      return false;
    }
  }

  async setupInitialHeaders() {
    if (!this.sheets) {
      await this.initialize();
    }

    if (!this.sheets) {
      console.log('Google Sheets not initialized');
      return false;
    }

    try {
      // Setup headers for booking data
      const headers = [
        'Booking ID',
        'Customer Name',
        'Email',
        'Phone',
        'Service/Product',
        'Price',
        'Booking Date',
        'Start Time',
        'End Time',
        'Status',
        'Special Requests',
        'Total Price',
        'Created At'
      ];

      // Check if headers already exist
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A1:M1`
      });

      if (response.data.values && response.data.values.length > 0) {
        console.log('Headers already exist');
        return true;
      }

      // Add headers
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A1:M1`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [headers] }
      });

      console.log('Headers setup complete');
      return true;
    } catch (error) {
      console.error('Failed to setup headers:', error);
      throw error;
    }
  }

  async addBooking(bookingData) {
    if (!this.sheets) {
      console.log('📊 Google Sheets not initialized, attempting to initialize...');
      const initialized = await this.initialize();
      if (!initialized) {
        console.error('❌ Google Sheets not initialized, skipping addBooking');
        console.error(`   Shop Domain: ${this.shopDomain}`);
        console.error(`   Location: ${this.location || 'not set'}`);
        throw new Error('Google Sheets not configured for this location');
      }
    }

    console.log(`📊 Adding booking to Google Sheets: ${bookingData.id}`);
    console.log(`   Spreadsheet ID: ${this.spreadsheetId}`);
    console.log(`   Sheet Name: ${this.sheetName}`);
    console.log(`   Location: ${this.location || 'default'}`);

    try {
      const serviceName = bookingData.service?.name || bookingData.productBookingConfig?.productTitle || 'N/A';
      const servicePrice = bookingData.service?.price || bookingData.productBookingConfig?.productPrice || bookingData.totalPrice;

      const values = [
        [
          bookingData.id,
          bookingData.user.firstName + ' ' + bookingData.user.lastName,
          bookingData.user.email,
          bookingData.user.phone || '',
          serviceName,
          servicePrice,
          new Date(bookingData.bookingDate).toLocaleDateString(),
          bookingData.startTime,
          bookingData.endTime,
          bookingData.status,
          bookingData.specialRequests || '',
          bookingData.totalPrice,
          new Date(bookingData.createdAt).toISOString()
        ]
      ];

      console.log(`📊 Appending booking row to sheet: ${this.sheetName}`);
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:M`,
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      });

      console.log('✅ Booking added to Google Sheets successfully:', bookingData.id);
      console.log(`   Updated cells: ${response.data.updates?.updatedCells || 'N/A'}`);
      console.log(`   Updated range: ${response.data.updates?.updatedRange || 'N/A'}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to add booking to Google Sheets:', error);
      console.error('   Error message:', error.message);
      console.error('   Error code:', error.code);
      if (error.response) {
        console.error('   API Error:', error.response.data);
      }
      throw error;
    }
  }

  async updateBookingStatus(bookingId, newStatus) {
    if (!this.sheets) {
      await this.initialize();
    }

    if (!this.sheets) {
      console.log('Google Sheets not initialized');
      return false;
    }

    try {
      // First, get all data to find the row
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:M`
      });

      const rows = response.data.values;
      if (!rows || rows.length < 2) {
        throw new Error('No data rows found in spreadsheet');
      }

      const headerRow = rows[0];
      const bookingIdColumnIndex = headerRow.findIndex(header => header === 'Booking ID');
      const statusColumnIndex = headerRow.findIndex(header => header === 'Status');

      if (bookingIdColumnIndex === -1) {
        throw new Error('Booking ID column not found in spreadsheet');
      }

      // Find the row with matching booking ID
      let rowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][bookingIdColumnIndex] === bookingId) {
          rowIndex = i + 1; // +1 because sheets are 1-indexed
          break;
        }
      }

      if (rowIndex === -1) {
        throw new Error('Booking not found in spreadsheet');
      }

      // Update the status (assuming Status is in column J, which is index 9)
      const column = statusColumnIndex !== -1 ? 
        String.fromCharCode(65 + statusColumnIndex) : 'J';

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!${column}${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [[newStatus]] }
      });

      console.log('✅ Updated booking status in Google Sheets:', bookingId, 'to', newStatus);
      return true;
    } catch (error) {
      console.error('Failed to update booking status in Google Sheets:', error);
      throw error;
    }
  }

  async deleteBooking(bookingId) {
    if (!this.sheets) {
      await this.initialize();
    }

    if (!this.sheets) {
      console.log('Google Sheets not initialized');
      return false;
    }

    try {
      // Get all data to find the row
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:M`
      });

      const rows = response.data.values;
      if (!rows || rows.length < 2) {
        throw new Error('No data rows found in spreadsheet');
      }

      const headerRow = rows[0];
      const bookingIdColumnIndex = headerRow.findIndex(header => header === 'Booking ID');

      if (bookingIdColumnIndex === -1) {
        throw new Error('Booking ID column not found in spreadsheet');
      }

      // Find the row with matching booking ID
      let rowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][bookingIdColumnIndex] === bookingId) {
          rowIndex = i + 1; // +1 because sheets are 1-indexed
          break;
        }
      }

      if (rowIndex === -1) {
        throw new Error('Booking not found in spreadsheet');
      }

      // Delete the entire row
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: 0, // Assuming sheet 0, adjust if needed
                  dimension: 'ROWS',
                  startIndex: rowIndex - 1, // 0-indexed
                  endIndex: rowIndex
                }
              }
            }
          ]
        }
      });

      console.log('✅ Deleted booking from Google Sheets:', bookingId);
      return true;
    } catch (error) {
      console.error('Failed to delete booking from Google Sheets:', error);
      throw error;
    }
  }

  async syncFromSheets() {
    if (!this.sheets) {
      await this.initialize();
    }

    if (!this.sheets) {
      console.log('Google Sheets not initialized');
      return [];
    }

    try {
      // Get all bookings from the sheet
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:M`
      });

      const rows = response.data.values;
      if (!rows || rows.length < 2) {
        return [];
      }

      const headerRow = rows[0];
      const bookingIdColumnIndex = headerRow.findIndex(header => header === 'Booking ID');
      const statusColumnIndex = headerRow.findIndex(header => header === 'Status');

      if (bookingIdColumnIndex === -1) {
        throw new Error('Booking ID column not found');
      }

      // Extract booking IDs from the sheet
      const sheetBookingIds = [];
      console.log(`📊 Reading ${rows.length - 1} booking rows from sheet`);
      
      for (let i = 1; i < rows.length; i++) {
        const bookingId = rows[i][bookingIdColumnIndex];
        const status = rows[i][statusColumnIndex];
        
        if (bookingId) {
          // Normalize status (handle case variations, trim whitespace)
          const normalizedStatus = status 
            ? status.toString().trim().toUpperCase() 
            : 'CONFIRMED';
          
          sheetBookingIds.push({
            id: bookingId.toString().trim(), // Ensure ID is string and trimmed
            status: normalizedStatus
          });
          
          // Log cancelled bookings found in sheet
          if (normalizedStatus === 'CANCELLED') {
            console.log(`   📋 Found CANCELLED booking in sheet: ${bookingId}`);
          }
        }
      }

      console.log(`📊 Found ${sheetBookingIds.length} bookings in Google Sheet`);
      console.log(`📊 Status column index: ${statusColumnIndex}`);

      // Get all active bookings from the database (not already cancelled)
      const activeBookings = await prisma.booking.findMany({
        where: {
          status: {
            in: ['CONFIRMED', 'PAYMENT_PENDING', 'PENDING']
          }
        },
        select: {
          id: true,
          status: true,
          productBookingConfig: {
            select: {
              city: true
            }
          }
        }
      });

      console.log(`📊 Found ${activeBookings.length} active bookings in database`);

      // Find bookings that are cancelled in the sheet
      const cancelledBookings = [];
      
      // Check each active booking in database
      for (const dbBooking of activeBookings) {
        const sheetBooking = sheetBookingIds.find(sb => sb.id === dbBooking.id);
        
        // Case 1: Booking exists in sheet and status is "CANCELLED" (case-insensitive)
        if (sheetBooking && sheetBooking.status === 'CANCELLED') {
          console.log(`   ✓ Booking ${dbBooking.id} marked as CANCELLED in sheet`);
          cancelledBookings.push(dbBooking.id);
        }
        // Case 2: Booking exists in DB but not in sheet (manager deleted the row)
        // Only check this if booking should be in this location's sheet
        else if (!sheetBooking) {
          // Check if this booking belongs to this location
          const bookingLocation = dbBooking.productBookingConfig?.city || 'default';
          if (bookingLocation === this.location || (!this.location && bookingLocation === 'default')) {
            console.log(`   ⚠️ Booking ${dbBooking.id} exists in DB but not found in sheet (possibly deleted)`);
            // For safety, only mark as cancelled if explicitly set to CANCELLED
            // Uncomment the next line if you want deleted rows to be cancelled automatically:
            // cancelledBookings.push(dbBooking.id);
          }
        }
      }

      console.log(`✅ Found ${cancelledBookings.length} bookings cancelled in Google Sheets (location: ${this.location || 'default'})`);
      if (cancelledBookings.length > 0) {
        console.log(`   Cancelled booking IDs:`, cancelledBookings);
      }
      return cancelledBookings;

    } catch (error) {
      console.error('Failed to sync from Google Sheets:', error);
      return [];
    }
  }

  async getAllBookings() {
    if (!this.sheets) {
      await this.initialize();
    }

    if (!this.sheets) {
      console.log('Google Sheets not initialized');
      return [];
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:M`
      });

      const rows = response.data.values;
      if (!rows || rows.length < 2) {
        return [];
      }

      const headerRow = rows[0];
      const data = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const booking = {};
        
        headerRow.forEach((header, index) => {
          booking[header] = row[index] || '';
        });
        
        data.push(booking);
      }

      return data;
    } catch (error) {
      console.error('Failed to get bookings from Google Sheets:', error);
      return [];
    }
  }
}

export async function setupGoogleSheetsConfig(shopDomain, spreadsheetId, sheetName, credentials, location = null) {
  try {
    // Normalize location - if empty string or null, use 'default'
    const normalizedLocation = (location && location.trim()) ? location.trim() : 'default';
    
    console.log('Setting up Google Sheets config:', {
      shopDomain,
      location: normalizedLocation,
      spreadsheetId,
      sheetName
    });

    // Create unique key for upsert
    const uniqueKey = {
      shopDomain_location: {
        shopDomain,
        location: normalizedLocation
      }
    };

    console.log('Upsert key:', uniqueKey);

    const config = await prisma.googleSheetConfig.upsert({
      where: uniqueKey,
      update: {
        spreadsheetId,
        sheetName,
        credentials: JSON.stringify(credentials),
        location: normalizedLocation,
        isActive: true
      },
      create: {
        shopDomain,
        location: normalizedLocation,
        spreadsheetId,
        sheetName,
        credentials: JSON.stringify(credentials),
        isActive: true
      }
    });

    console.log('Google Sheets config saved:', config.id);

    // Setup initial headers
    try {
      const sheetsService = new GoogleSheetsService(shopDomain, normalizedLocation);
      const initialized = await sheetsService.initialize();
      
      if (initialized) {
        await sheetsService.setupInitialHeaders();
        console.log('Initial headers setup complete');
      } else {
        console.warn('Google Sheets service did not initialize - headers not set up');
      }
    } catch (headerError) {
      console.error('Warning: Failed to setup headers (config saved anyway):', headerError);
      // Don't throw - config is saved, headers can be set up later
    }

    return true;
  } catch (error) {
    console.error('Failed to setup Google Sheets config:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    throw error;
  }
}
