import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { GoogleSheetsService } from "../services/googleSheets.server.js";
import { emailService } from "../services/email.server.js";

const prisma = new PrismaClient();

export async function action({ request }) {
  try {
    const { shopDomain, location } = await request.json();
    const shopDomainToUse = shopDomain || 'default-shop';

    // Get all active Google Sheet configs for this shop
    const allConfigs = await prisma.googleSheetConfig.findMany({
      where: {
        shopDomain: shopDomainToUse,
        isActive: true
      }
    });

    if (allConfigs.length === 0) {
      return json({ 
        success: true, 
        message: 'No Google Sheets configurations found',
        deletedBookings: []
      });
    }

    let allDeletedBookings = [];

    // Sync each location's sheet
    for (const config of allConfigs) {
      try {
        // If specific location requested, only sync that one
        if (location && config.location !== location) {
          continue;
        }

        console.log(`🔄 Syncing Google Sheets for location: ${config.location}`);
        
        const sheetsService = new GoogleSheetsService(shopDomainToUse, config.location);
        await sheetsService.initialize();

        // Sync changes from Google Sheets
        const deletedBookings = await sheetsService.syncFromSheets();
        
        console.log(`✅ Found ${deletedBookings.length} cancelled bookings in ${config.location}`);

        // Update booking statuses in database and send cancellation emails
        for (const bookingId of deletedBookings) {
          const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
              user: true,
              service: true,
              productBookingConfig: true
            }
          });

          if (booking && booking.status !== 'CANCELLED') {
            console.log(`🔄 Cancelling booking: ${bookingId}`);
            console.log(`   Customer: ${booking.user.firstName} ${booking.user.lastName}`);
            console.log(`   Date: ${booking.bookingDate.toDateString()}`);
            console.log(`   Time: ${booking.startTime} - ${booking.endTime}`);
            
            // Update status to cancelled - this automatically frees up the time slot
            await prisma.booking.update({
              where: { id: bookingId },
              data: { 
                status: 'CANCELLED',
                paymentStatus: booking.paymentStatus === 'COMPLETED' ? 'REFUNDED' : booking.paymentStatus
              }
            });

            console.log(`✅ Booking ${bookingId} status updated to CANCELLED`);
            console.log(`   Time slot ${booking.startTime} - ${booking.endTime} on ${booking.bookingDate.toDateString()} is now AVAILABLE`);

            // Send cancellation email to customer
            try {
              await emailService.sendBookingCancellation(booking, `Cancelled by manager from Google Sheets (${config.location})`);
              console.log('✅ Cancellation email sent for booking:', bookingId);
            } catch (emailError) {
              console.error('❌ Failed to send cancellation email:', emailError);
            }

            console.log(`✅ Cancelled booking from Google Sheets (${config.location}):`, bookingId);
            allDeletedBookings.push(bookingId);
          } else if (booking && booking.status === 'CANCELLED') {
            console.log(`⚠️ Booking ${bookingId} is already cancelled - skipping`);
          } else {
            console.log(`⚠️ Booking ${bookingId} not found - skipping`);
          }
        }
      } catch (locationError) {
        console.error(`❌ Failed to sync location ${config.location}:`, locationError);
      }
    }

    return json({ 
      success: true, 
      message: `Synced ${allDeletedBookings.length} booking changes from Google Sheets`,
      deletedBookings: allDeletedBookings 
    });

  } catch (error) {
    console.error('Failed to sync from Google Sheets:', error);
    return json({ error: 'Failed to sync from Google Sheets' }, { status: 500 });
  }
}

// This endpoint can be called periodically to sync changes from all locations
// Can be called via GET request from Google Apps Script
export async function loader({ request }) {
  try {
    const url = new URL(request.url);
    const shopDomain = url.searchParams.get('shop') || 'default-shop';
    const location = url.searchParams.get('location'); // Optional: sync specific location

    console.log(`📥 Sync request received - Shop: ${shopDomain}, Location: ${location || 'all'}`);

    // Get all active Google Sheet configs for this shop
    const allConfigs = await prisma.googleSheetConfig.findMany({
      where: {
        shopDomain,
        isActive: true,
        ...(location && { location })
      }
    });

    console.log(`📊 Found ${allConfigs.length} active Google Sheet config(s)`);

    if (allConfigs.length === 0) {
      return json({ 
        success: true, 
        message: 'No Google Sheets configurations found',
        deletedBookings: []
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    let allDeletedBookings = [];

    // Sync each location's sheet
    for (const config of allConfigs) {
      try {
        console.log(`🔄 Syncing Google Sheets for location: ${config.location}`);
        
        const sheetsService = new GoogleSheetsService(shopDomain, config.location);
        await sheetsService.initialize();

        // Sync changes from Google Sheets
        const deletedBookings = await sheetsService.syncFromSheets();
        
        console.log(`✅ Found ${deletedBookings.length} cancelled bookings in ${config.location}`);

        // Update booking statuses in database and send cancellation emails
        for (const bookingId of deletedBookings) {
          const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
              user: true,
              service: true,
              productBookingConfig: true
            }
          });

          if (booking && booking.status !== 'CANCELLED') {
            console.log(`🔄 Cancelling booking: ${bookingId}`);
            console.log(`   Customer: ${booking.user.firstName} ${booking.user.lastName}`);
            console.log(`   Date: ${booking.bookingDate.toDateString()}`);
            console.log(`   Time: ${booking.startTime} - ${booking.endTime}`);
            
            // Update status to cancelled - this automatically frees up the time slot
            await prisma.booking.update({
              where: { id: bookingId },
              data: { 
                status: 'CANCELLED',
                paymentStatus: booking.paymentStatus === 'COMPLETED' ? 'REFUNDED' : booking.paymentStatus
              }
            });

            console.log(`✅ Booking ${bookingId} status updated to CANCELLED`);
            console.log(`   Time slot ${booking.startTime} - ${booking.endTime} on ${booking.bookingDate.toDateString()} is now AVAILABLE`);

            // Send cancellation email to customer
            try {
              await emailService.sendBookingCancellation(booking, `Cancelled by manager from Google Sheets (${config.location})`);
              console.log('✅ Cancellation email sent for booking:', bookingId);
            } catch (emailError) {
              console.error('❌ Failed to send cancellation email:', emailError);
            }

            console.log(`✅ Cancelled booking from Google Sheets (${config.location}):`, bookingId);
            allDeletedBookings.push(bookingId);
          } else if (booking && booking.status === 'CANCELLED') {
            console.log(`⚠️ Booking ${bookingId} is already cancelled - skipping`);
          } else {
            console.log(`⚠️ Booking ${bookingId} not found - skipping`);
          }
        }
      } catch (locationError) {
        console.error(`❌ Failed to sync location ${config.location}:`, locationError);
        console.error('Location error details:', locationError.message);
        console.error('Location error stack:', locationError.stack);
      }
    }

    console.log(`✅ Sync complete - Total cancelled bookings: ${allDeletedBookings.length}`);

    return json({ 
      success: true, 
      message: `Synced ${allDeletedBookings.length} booking changes from Google Sheets`,
      deletedBookings: allDeletedBookings 
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('❌ Failed to sync from Google Sheets:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return json({ 
      success: false,
      error: 'Failed to sync from Google Sheets',
      message: error.message || 'Unknown error'
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
}
