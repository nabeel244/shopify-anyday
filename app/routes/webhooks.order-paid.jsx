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
    
    console.log('🔍 Order webhook received:', webhookData);

    // Check if this is a paid order
    if (webhookData.financial_status !== 'paid') {
      console.log('⚠️ Order not paid yet, skipping booking confirmation');
      return json({ success: true, message: 'Order not paid yet' });
    }

    // Look for booking ID in order properties
    const bookingId = webhookData.line_items?.find(item => 
      item.properties?.find(prop => prop.name === 'Booking ID')
    )?.properties?.find(prop => prop.name === 'Booking ID')?.value;

    if (!bookingId) {
      console.log('⚠️ No booking ID found in order properties');
      return json({ success: true, message: 'No booking ID found' });
    }

    console.log('🔍 Found booking ID:', bookingId);

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

    // Update booking to confirmed
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'COMPLETED',
        status: 'CONFIRMED',
        shopifyOrderId: webhookData.id?.toString(),
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
    console.log(`   Shopify Order ID: ${webhookData.id}`);

    // Sync to Google Sheets
    try {
      const sheetsService = new GoogleSheetsService('default-shop');
      await sheetsService.initialize();
      await sheetsService.addBooking(updatedBooking);
      console.log('✅ Synced to Google Sheets');
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

  } catch (error) {
    console.error('❌ Order webhook error:', error);
    return json({ 
      error: 'Webhook processing failed',
      details: error.message 
    }, { status: 500 });
  }
}
