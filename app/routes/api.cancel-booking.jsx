import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { emailService } from "../services/email.server.js";

const prisma = new PrismaClient();

// CORS headers for Google Apps Script
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// Handle OPTIONS preflight requests
export async function loader({ request }) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // For GET requests, just return success (health check)
  return json({ 
    success: true, 
    message: 'Cancel booking API is available',
    usage: 'POST with { bookingId: "xxx" } or { bookingId: "xxx", status: "CANCELLED" }'
  }, { headers: corsHeaders });
}

export async function action({ request }) {
  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { 
      status: 405,
      headers: corsHeaders
    });
  }

  try {
    const body = await request.json();
    const { bookingId, status } = body;

    console.log(`📥 Cancel booking request - Booking ID: ${bookingId}, Status: ${status || 'CANCELLED'}`);

    // Validate booking ID
    if (!bookingId) {
      return json({ 
        success: false,
        error: 'Booking ID is required' 
      }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        service: true,
        productBookingConfig: true
      }
    });

    if (!booking) {
      return json({ 
        success: false,
        error: 'Booking not found',
        bookingId 
      }, { 
        status: 404,
        headers: corsHeaders
      });
    }

    // Check if already cancelled
    if (booking.status === 'CANCELLED') {
      return json({ 
        success: true,
        message: 'Booking is already cancelled',
        bookingId,
        status: booking.status
      }, { 
        headers: corsHeaders
      });
    }

    // Cancel the booking
    const newStatus = status || 'CANCELLED';
    
    console.log(`🔄 Cancelling booking: ${bookingId}`);
    console.log(`   Customer: ${booking.user.firstName} ${booking.user.lastName}`);
    console.log(`   Date: ${booking.bookingDate.toDateString()}`);
    console.log(`   Time: ${booking.startTime} - ${booking.endTime}`);
    console.log(`   Current Status: ${booking.status} → New Status: ${newStatus}`);

    await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status: newStatus,
        paymentStatus: booking.paymentStatus === 'COMPLETED' ? 'REFUNDED' : booking.paymentStatus
      }
    });

    console.log(`✅ Booking ${bookingId} status updated to ${newStatus}`);
    console.log(`   Time slot ${booking.startTime} - ${booking.endTime} on ${booking.bookingDate.toDateString()} is now AVAILABLE`);

    // Send cancellation email to customer
    try {
      await emailService.sendBookingCancellation(booking, 'Cancelled from Google Sheets');
      console.log('✅ Cancellation email sent for booking:', bookingId);
    } catch (emailError) {
      console.error('❌ Failed to send cancellation email:', emailError);
      // Don't fail the request if email fails
    }

    return json({ 
      success: true,
      message: `Booking ${bookingId} cancelled successfully`,
      bookingId,
      status: newStatus,
      customer: `${booking.user.firstName} ${booking.user.lastName}`,
      date: booking.bookingDate.toISOString(),
      time: `${booking.startTime} - ${booking.endTime}`
    }, { 
      headers: corsHeaders
    });

  } catch (error) {
    console.error('❌ Failed to cancel booking:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return json({ 
      success: false,
      error: 'Failed to cancel booking',
      message: error.message || 'Unknown error'
    }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

