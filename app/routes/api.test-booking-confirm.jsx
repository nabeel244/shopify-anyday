import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { GoogleSheetsService } from "../services/googleSheets.server.js";
import { emailService } from "../services/email.server.js";

const prisma = new PrismaClient();

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

/**
 * TEST ENDPOINT: Manually confirm a booking (bypasses payment)
 * Usage: POST /api/test-booking-confirm with { bookingId: "..." }
 * This is useful for testing Google Sheets sync without going through payment
 */
export async function action({ request }) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { 
      status: 405,
      headers: corsHeaders
    });
  }

  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return json({ error: 'Booking ID is required' }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        productBookingConfig: true,
        service: true
      }
    });

    if (!booking) {
      return json({ error: 'Booking not found' }, { 
        status: 404,
        headers: corsHeaders
      });
    }

    // Update booking to confirmed (bypass payment)
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'COMPLETED',
        status: 'CONFIRMED',
        isTemporary: false
      },
      include: {
        user: true,
        productBookingConfig: true,
        service: true
      }
    });

    console.log('🧪 TEST MODE: Booking manually confirmed:', bookingId);
    console.log(`   Customer: ${updatedBooking.user.firstName} ${updatedBooking.user.lastName}`);
    console.log(`   Date: ${updatedBooking.bookingDate.toDateString()}`);
    console.log(`   Time: ${updatedBooking.startTime} - ${updatedBooking.endTime}`);

    // Sync to Google Sheets
    try {
      const location = updatedBooking.productBookingConfig?.city || 'default';
      const sheetsService = new GoogleSheetsService('default-shop', location);
      await sheetsService.initialize();
      await sheetsService.addBooking(updatedBooking);
      console.log(`✅ Synced to Google Sheets for location: ${location}`);
    } catch (sheetsError) {
      console.error('❌ Failed to sync to Google Sheets:', sheetsError);
    }

    // Send confirmation emails (optional for testing)
    try {
      const companyEmail = process.env.COMPANY_EMAIL || 'admin@example.com';
      await emailService.sendBookingConfirmation(updatedBooking, companyEmail);
      await emailService.sendCustomerConfirmation(updatedBooking);
      console.log('✅ Confirmation emails sent');
    } catch (emailError) {
      console.error('❌ Failed to send confirmation emails:', emailError);
    }

    return json({
      success: true,
      message: 'Booking confirmed and synced to Google Sheets (Test mode)',
      booking: updatedBooking
    }, {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Failed to confirm booking:', error);
    return json({ 
      error: 'Failed to confirm booking',
      details: error.message 
    }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

