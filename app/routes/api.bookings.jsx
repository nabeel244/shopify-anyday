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
    const { bookingData } = await request.formData();
    const data = JSON.parse(bookingData);

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'serviceId', 'bookingDate', 'startTime', 'endTime'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return json({ error: `${field} is required` }, { status: 400 });
      }
    }

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

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId }
    });

    if (!service) {
      return json({ error: 'Service not found' }, { status: 404 });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        serviceId: data.serviceId,
        bookingDate: new Date(data.bookingDate),
        startTime: data.startTime,
        endTime: data.endTime,
        specialRequests: data.specialRequests || null,
        totalPrice: data.totalPrice,
        status: 'PENDING'
      },
      include: {
        user: true,
        service: true
      }
    });

    // Update booking status to CONFIRMED
    const confirmedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CONFIRMED' },
      include: {
        user: true,
        service: true
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
    return json({ error: 'Failed to create booking' }, { status: 500 });
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
