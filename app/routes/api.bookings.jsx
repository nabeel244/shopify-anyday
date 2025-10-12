import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { GoogleSheetsService } from "../services/googleSheets.server.js";
import { emailService } from "../services/email.server.js";

const prisma = new PrismaClient();

export async function action({ request }) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
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
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'productId', 'productTitle', 'bookingDate', 'startTime', 'endTime'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return json({ error: `${field} is required` }, { status: 400 });
      }
    }

    // Log the booking data for debugging
    console.log('Booking data received:', {
      ...data,
      selectedServices: data.selectedServices || []
    });

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

    // Create booking with product booking configuration
    const bookingCreateData = {
      userId: user.id,
      bookingDate: new Date(data.bookingDate),
      startTime: data.startTime,
      endTime: data.endTime,
      specialRequests: data.specialRequests || null,
      totalPrice: data.totalPrice,
      status: 'PENDING'
    };

    // Add product booking configuration if provided
    if (data.productBookingConfigId) {
      bookingCreateData.productBookingConfigId = data.productBookingConfigId;
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
      bookingCreateData.serviceId = service.id;
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: bookingCreateData,
      include: {
        user: true,
        service: true,
        productBookingConfig: true
      }
    });

    // Update booking status to CONFIRMED
    const confirmedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CONFIRMED' },
      include: {
        user: true,
        service: true,
        productBookingConfig: true
      }
    });

    // Sync to Google Sheets (if configured)
    try {
      const sheetsService = new GoogleSheetsService('default-shop'); // You might want to get this from session
      await sheetsService.initialize();
      await sheetsService.addBooking(confirmedBooking);
    } catch (sheetsError) {
      console.error('Failed to sync to Google Sheets:', sheetsError);
      // Don't fail the booking if Google Sheets sync fails
    }

    // Send confirmation emails
    try {
      // Send email to company (you might want to get this from shop settings)
      const companyEmail = process.env.COMPANY_EMAIL || 'admin@example.com';
      await emailService.sendBookingConfirmation(confirmedBooking, companyEmail);
      
      // Send confirmation email to customer
      await emailService.sendCustomerConfirmation(confirmedBooking);
    } catch (emailError) {
      console.error('Failed to send confirmation emails:', emailError);
      // Don't fail the booking if email sending fails
    }

    return json({ 
      success: true, 
      booking: confirmedBooking,
      message: 'Booking confirmed successfully! You will receive a confirmation email shortly.'
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
    }, { status: 500 });
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
      where: whereClause,
      include: {
        user: true,
        service: true
      },
      orderBy: { bookingDate: 'desc' }
    });

    return json({ bookings });
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
