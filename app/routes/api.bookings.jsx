import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { GoogleSheetsService } from "../services/googleSheets.server.js";
import { emailService } from "../services/email.server.js";

const prisma = new PrismaClient();

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, ngrok-skip-browser-warning'
};

export async function action({ request }) {
  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }
  
  if (request.method === 'PATCH') {
    return handleBookingUpdate(request);
  }
  
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { 
      status: 405,
      headers: corsHeaders
    });
  }

  try {
    // Handle both JSON and FormData requests
    let data;
    const contentType = request.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      // Handle JSON request (from frontend widget)
      const requestBody = await request.json();
      data = requestBody.bookingData || requestBody;
    } else {
      // Handle FormData request (from admin panel)
      const formData = await request.formData();
      data = JSON.parse(formData.get('bookingData'));
    }

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'productId', 'productTitle', 'bookingDate', 'startTime', 'endTime', 'totalPrice'];
    for (const field of requiredFields) {
      if (!data[field]) {
            return json({ error: `${field} is required` }, { 
              status: 400,
              headers: corsHeaders
            });
      }
    }

    // Log the booking data for debugging
    console.log('Booking data received:', {
      ...data,
      selectedServices: data.selectedServices || []
    });
    
    // Debug specific fields
    console.log('🔍 bookingDate value:', data.bookingDate);
    console.log('🔍 bookingDate type:', typeof data.bookingDate);
    console.log('🔍 bookingDate truthy:', !!data.bookingDate);

    // Check if user already exists, if not create them
    let user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone
        }
      });
    } else {
      // Update user info if it has changed
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone
        }
      });
    }

    // Instead of creating a booking immediately, we'll create a temporary booking request
    // that will be converted to a real booking only after successful payment
    
    // Create a temporary booking request (this will be stored temporarily)
    const bookingRequestData = {
      userId: user.id,
      bookingDate: new Date(data.bookingDate),
      startTime: data.startTime,
      endTime: data.endTime,
      specialRequests: data.specialRequests || null,
      totalPrice: data.totalPrice,
      status: 'PAYMENT_PENDING', // New status for payment-first approach
      paymentStatus: 'PENDING',
      selectedServices: data.selectedServices ? (Array.isArray(data.selectedServices) ? JSON.stringify(data.selectedServices) : data.selectedServices) : null,
      isTemporary: true // Flag to identify temporary bookings
    };

    // Add product booking configuration if provided
    if (data.productBookingConfigId) {
      bookingRequestData.productBookingConfigId = data.productBookingConfigId;
    } else {
      // Fallback: create or get service based on product
      let service = await prisma.service.findFirst({
        where: { name: data.productTitle }
      });

      if (!service) {
        service = await prisma.service.create({
          data: {
            name: data.productTitle,
            description: `Birthday party center service - ${data.productTitle}`,
            price: data.totalPrice,
            duration: 480 // 8 hours
          }
        });
      }
      bookingRequestData.serviceId = service.id;
    }

    // Create temporary booking request
    const bookingRequest = await prisma.booking.create({
      data: bookingRequestData,
      include: {
        user: true,
        service: true,
        productBookingConfig: true
      }
    });

    console.log('⏳ TEMPORARY BOOKING REQUEST CREATED - PAYMENT REQUIRED:');
    console.log(`   Customer: ${bookingRequest.user.firstName} ${bookingRequest.user.lastName}`);
    console.log(`   Date: ${bookingRequest.bookingDate.toDateString()}`);
    console.log(`   Time: ${bookingRequest.startTime} - ${bookingRequest.endTime}`);
    console.log(`   Service: ${bookingRequest.service?.name || bookingRequest.productBookingConfig?.productTitle}`);
    console.log(`   Total Price: $${bookingRequest.totalPrice}`);
    console.log(`   Booking ID: ${bookingRequest.id}`);
    console.log(`   Status: ${bookingRequest.status}`);

    return json({ 
      success: true, 
      booking: bookingRequest,
      message: 'Booking request created! Please complete payment to confirm your booking.',
      requiresPayment: true,
      checkoutRequired: true
    }, {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Failed to create booking:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    return json({ 
      error: 'Failed to create booking',
      details: error.message 
    }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

async function handleBookingUpdate(request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return json({ error: 'Booking ID and status are required' }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    // Get the booking with all related data
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        service: true,
        productBookingConfig: true
      }
    });

    if (!booking) {
      return json({ error: 'Booking not found' }, { 
        status: 404,
        headers: corsHeaders
      });
    }

    // Update the booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        service: true,
        productBookingConfig: true
      }
    });

    // If booking is being cancelled, send cancellation email
    if (status === 'CANCELLED' && booking.status !== 'CANCELLED') {
      try {
        await emailService.sendBookingCancellation(booking, 'Cancelled by admin');
        console.log('✅ Cancellation email sent for booking:', id);
      } catch (emailError) {
        console.error('❌ Failed to send cancellation email:', emailError);
      }
    }

    // Update Google Sheets if booking is cancelled
    if (status === 'CANCELLED') {
      try {
        const sheetsService = new GoogleSheetsService('default-shop');
        await sheetsService.initialize();
        await sheetsService.updateBookingStatus(id, 'CANCELLED');
        console.log('✅ Updated Google Sheets for cancelled booking:', id);
      } catch (sheetsError) {
        console.error('❌ Failed to update Google Sheets:', sheetsError);
      }
    }

    console.log('✅ Booking status updated:', id, 'to', status);

    return json({ 
      success: true, 
      booking: updatedBooking,
      message: `Booking status updated to ${status}` 
    }, {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Failed to update booking:', error);
    return json({ 
      error: 'Failed to update booking',
      details: error.message 
    }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function loader({ request }) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const userId = url.searchParams.get('userId');

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    if (userId) {
      whereClause.userId = userId;
    }

    const bookings = await prisma.booking.findMany({
      where: {
        ...whereClause,
        isTemporary: false // Only show confirmed bookings (non-temporary)
      },
      include: {
        user: true,
        service: true
      },
      orderBy: { bookingDate: 'desc' }
    });

    return json({ bookings }, {
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return json({ error: 'Failed to fetch bookings' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}
