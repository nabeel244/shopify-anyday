import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class GoogleSheetsService {
  constructor(shopDomain) {
    this.shopDomain = shopDomain;
    this.auth = null;
    this.sheets = null;
    this.spreadsheetId = null;
    this.sheetName = null;
  }

  async initialize() {
    try {
      const config = await prisma.googleSheetConfig.findUnique({
        where: { shopDomain: this.shopDomain }
      });

      if (!config || !config.isActive) {
        console.log('Google Sheets configuration not found or inactive for:', this.shopDomain);
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
      const initialized = await this.initialize();
      if (!initialized) {
        console.log('Google Sheets not initialized, skipping addBooking');
        return { success: false, message: 'Google Sheets not configured' };
      }
    }

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

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:M`,
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      });

      console.log('✅ Booking added to Google Sheets:', bookingData.id);
      return response.data;
    } catch (error) {
      console.error('Failed to add booking to Google Sheets:', error);
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
      for (let i = 1; i < rows.length; i++) {
        const bookingId = rows[i][bookingIdColumnIndex];
        const status = rows[i][statusColumnIndex];
        
        if (bookingId) {
          sheetBookingIds.push({
            id: bookingId,
            status: status || 'CONFIRMED'
          });
        }
      }

      // Get all confirmed bookings from the database
      const confirmedBookings = await prisma.booking.findMany({
        where: {
          status: {
            in: ['CONFIRMED', 'PAYMENT_PENDING']
          },
          paymentStatus: {
            in: ['COMPLETED', 'PENDING']
          }
        },
        select: {
          id: true
        }
      });

      const dbBookingIds = new Set(confirmedBookings.map(b => b.id));

      // Find bookings that exist in DB but not in the sheet (likely deleted by manager)
      const deletedInSheet = [];
      
      // First, check if any bookings in DB have a row in the sheet
      for (const dbBooking of confirmedBookings) {
        const existsInSheet = sheetBookingIds.find(sb => sb.id === dbBooking.id);
        
        // If booking exists in DB but not in sheet (and not marked as cancelled in DB), mark as cancelled
        // Also check if the status in the sheet is "CANCELLED"
        if (existsInSheet && existsInSheet.status === 'CANCELLED') {
          deletedInSheet.push(dbBooking.id);
        }
      }

      console.log('Found bookings cancelled in Google Sheets:', deletedInSheet.length);
      return deletedInSheet;

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

export async function setupGoogleSheetsConfig(shopDomain, spreadsheetId, sheetName, credentials) {
  try {
    const config = await prisma.googleSheetConfig.upsert({
      where: { shopDomain },
      update: {
        spreadsheetId,
        sheetName,
        credentials: JSON.stringify(credentials),
        isActive: true
      },
      create: {
        shopDomain,
        spreadsheetId,
        sheetName,
        credentials: JSON.stringify(credentials),
        isActive: true
      }
    });

    // Setup initial headers
    const sheetsService = new GoogleSheetsService(shopDomain);
    await sheetsService.initialize();
    await sheetsService.setupInitialHeaders();

    return true;
  } catch (error) {
    console.error('Failed to setup Google Sheets config:', error);
    throw error;
  }
}
