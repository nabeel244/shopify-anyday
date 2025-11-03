import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { GoogleSheetsService } from "../services/googleSheets.server.js";

const prisma = new PrismaClient();

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

/**
 * Diagnostic endpoint to test Google Sheets sync
 * Usage: GET /api/test-google-sheets-sync?location=Tbilisi&bookingId=xxx
 */
export async function loader({ request }) {
  try {
    const url = new URL(request.url);
    const location = url.searchParams.get('location') || 'default';
    const bookingId = url.searchParams.get('bookingId');

    console.log('🧪 Testing Google Sheets sync...');
    console.log(`   Location: ${location}`);
    console.log(`   Booking ID: ${bookingId || 'Not provided - will test config only'}`);

    // Get Google Sheets config
    const config = await prisma.googleSheetConfig.findUnique({
      where: {
        shopDomain_location: {
          shopDomain: 'default-shop',
          location: location
        }
      }
    });

    if (!config) {
      return json({
        success: false,
        error: 'Google Sheets config not found',
        message: `No configuration found for location: ${location}`,
        suggestion: 'Check if you configured Google Sheets for this location in admin panel'
      }, {
        headers: corsHeaders
      });
    }

    console.log('✅ Config found:', {
      id: config.id,
      location: config.location,
      spreadsheetId: config.spreadsheetId,
      sheetName: config.sheetName,
      isActive: config.isActive
    });

    // Test initialization
    const sheetsService = new GoogleSheetsService('default-shop', location);
    const initialized = await sheetsService.initialize();

    if (!initialized) {
      return json({
        success: false,
        error: 'Failed to initialize Google Sheets service',
        message: 'Check service account credentials and permissions',
        config: {
          location: config.location,
          spreadsheetId: config.spreadsheetId,
          sheetName: config.sheetName
        }
      }, {
        headers: corsHeaders
      });
    }

    console.log('✅ Google Sheets service initialized');

    // If booking ID provided, try to sync it
    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          productBookingConfig: true,
          service: true
        }
      });

      if (!booking) {
        return json({
          success: false,
          error: 'Booking not found',
          bookingId: bookingId
        }, {
          headers: corsHeaders
        });
      }

      console.log('📊 Attempting to sync booking:', bookingId);

      try {
        await sheetsService.addBooking(booking);
        console.log('✅ Booking synced successfully');

        return json({
          success: true,
          message: 'Booking synced to Google Sheets successfully',
          bookingId: bookingId,
          location: location,
          config: {
            spreadsheetId: config.spreadsheetId,
            sheetName: config.sheetName
          }
        }, {
          headers: corsHeaders
        });
      } catch (syncError) {
        console.error('❌ Sync failed:', syncError);
        return json({
          success: false,
          error: 'Failed to sync booking',
          message: syncError.message,
          details: syncError.response?.data || syncError.code
        }, {
          headers: corsHeaders
        });
      }
    }

    // Just test config without syncing
    return json({
      success: true,
      message: 'Google Sheets configuration is valid',
      location: location,
      config: {
        spreadsheetId: config.spreadsheetId,
        sheetName: config.sheetName
      },
      test: 'Configuration looks good. Provide bookingId parameter to test actual sync.'
    }, {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Test failed:', error);
    return json({
      success: false,
      error: 'Test failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, {
      status: 500,
      headers: corsHeaders
    });
  }
}

