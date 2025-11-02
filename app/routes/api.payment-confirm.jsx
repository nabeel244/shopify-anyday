import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { emailService } from "../services/email.server.js";

const prisma = new PrismaClient();

export async function action({ request }) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { bookingId, shopifyOrderId, paymentStatus } = await request.json();

    if (!bookingId) {
      return json({ error: 'Booking ID is required' }, { status: 400 });
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
      return json({ error: 'Booking not found' }, { status: 404 });
    }

    // Update booking based on payment status
    let updatedBooking;
    
    if (paymentStatus === 'COMPLETED' || paymentStatus === 'PAID') {
      // Payment successful - convert temporary booking to confirmed booking
      updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'CONFIRMED',
          shopifyOrderId: shopifyOrderId || null,
          isTemporary: false // Convert from temporary to permanent booking
        },
        include: {
          user: true,
          productBookingConfig: true,
          service: true
        }
      });

      // Send confirmation emails
      try {
        const companyEmail = process.env.COMPANY_EMAIL || 'admin@example.com';
        await emailService.sendBookingConfirmation(updatedBooking, companyEmail);
        await emailService.sendCustomerConfirmation(updatedBooking);
      } catch (emailError) {
        console.error('Failed to send confirmation emails:', emailError);
        // Don't fail the booking if email sending fails
      }

      console.log('✅ BOOKING CONFIRMED AFTER PAYMENT:');
      console.log(`   Customer: ${updatedBooking.user.firstName} ${updatedBooking.user.lastName}`);
      console.log(`   Date: ${updatedBooking.bookingDate.toDateString()}`);
      console.log(`   Time: ${updatedBooking.startTime} - ${updatedBooking.endTime}`);
      console.log(`   Service: ${updatedBooking.service?.name || updatedBooking.productBookingConfig?.productTitle}`);
      console.log(`   Total Price: $${updatedBooking.totalPrice}`);
      console.log(`   Shopify Order ID: ${shopifyOrderId}`);

    } else if (paymentStatus === 'FAILED') {
      // Payment failed - keep booking as pending
      updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'FAILED'
        },
        include: {
          user: true,
          productBookingConfig: true,
          service: true
        }
      });

      console.log('❌ PAYMENT FAILED FOR BOOKING:', bookingId);
    }

    return json({
      success: true,
      booking: updatedBooking,
      message: paymentStatus === 'COMPLETED' ? 'Booking confirmed successfully!' : 'Payment status updated'
    });

  } catch (error) {
    console.error('Failed to confirm payment:', error);
    return json({ 
      error: 'Failed to confirm payment',
      details: error.message 
    }, { status: 500 });
  }
}
