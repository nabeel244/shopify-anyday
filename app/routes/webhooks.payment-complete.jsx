import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { emailService } from "../services/email.server.js";
import { GoogleSheetsService } from "../services/googleSheets.server.js";

const prisma = new PrismaClient();

export async function action({ request }) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const webhookData = await request.json();
    
    console.log('🔍 Payment webhook received:', webhookData);

    // Extract booking ID from webhook data
    // This will depend on how you structure your Shopify checkout
    const bookingId = webhookData.booking_id || webhookData.custom_attributes?.booking_id;
    
    if (!bookingId) {
      console.error('❌ No booking ID found in webhook data');
      return json({ error: 'Booking ID not found' }, { status: 400 });
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
      console.error('❌ Booking not found:', bookingId);
      return json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check payment status from webhook
    const paymentStatus = webhookData.financial_status || webhookData.payment_status;
    const shopifyOrderId = webhookData.id || webhookData.order_id;

    console.log('🔍 Payment status:', paymentStatus);
    console.log('🔍 Shopify Order ID:', shopifyOrderId);

    if (paymentStatus === 'paid' || paymentStatus === 'COMPLETED') {
      // Payment successful - convert temporary booking to confirmed booking
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'CONFIRMED',
          shopifyOrderId: shopifyOrderId,
          isTemporary: false // Convert from temporary to permanent booking
        },
        include: {
          user: true,
          productBookingConfig: true,
          service: true
        }
      });

      console.log('✅ BOOKING CONFIRMED AFTER PAYMENT:');
      console.log(`   Customer: ${updatedBooking.user.firstName} ${updatedBooking.user.lastName}`);
      console.log(`   Date: ${updatedBooking.bookingDate.toDateString()}`);
      console.log(`   Time: ${updatedBooking.startTime} - ${updatedBooking.endTime}`);
      console.log(`   Service: ${updatedBooking.service?.name || updatedBooking.productBookingConfig?.productTitle}`);
      console.log(`   Total Price: $${updatedBooking.totalPrice}`);
      console.log(`   Shopify Order ID: ${shopifyOrderId}`);

      // Sync to Google Sheets - Use location from productBookingConfig
      try {
        const location = updatedBooking.productBookingConfig?.city || 'default';
        const sheetsService = new GoogleSheetsService('default-shop', location);
        await sheetsService.initialize();
        await sheetsService.addBooking(updatedBooking);
        console.log(`✅ Synced to Google Sheets for location: ${location}`);
      } catch (sheetsError) {
        console.error('❌ Failed to sync to Google Sheets:', sheetsError);
      }

      // Send confirmation emails
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
        message: 'Booking confirmed successfully',
        bookingId: bookingId
      });

    } else if (paymentStatus === 'failed' || paymentStatus === 'FAILED') {
      // Payment failed
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'FAILED'
        }
      });

      console.log('❌ PAYMENT FAILED FOR BOOKING:', bookingId);
      
      return json({
        success: true,
        message: 'Payment failed - booking remains pending',
        bookingId: bookingId
      });
    }

    return json({
      success: true,
      message: 'Webhook processed',
      bookingId: bookingId
    });

  } catch (error) {
    console.error('❌ Payment webhook error:', error);
    return json({ 
      error: 'Webhook processing failed',
      details: error.message 
    }, { status: 500 });
  }
}
