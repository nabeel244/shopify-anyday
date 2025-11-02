import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { GoogleSheetsService } from "../services/googleSheets.server.js";
import { emailService } from "../services/email.server.js";

const prisma = new PrismaClient();

export async function action({ request }) {
  try {
    const { shopDomain } = await request.json();

    if (!shopDomain) {
      return json({ error: 'Shop domain is required' }, { status: 400 });
    }

    // Initialize Google Sheets service
    const sheetsService = new GoogleSheetsService(shopDomain);
    await sheetsService.initialize();

    // Sync changes from Google Sheets
    const deletedBookings = await sheetsService.syncFromSheets();

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
        // Update status to cancelled
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'CANCELLED' }
        });

        // Send cancellation email to customer
        try {
          await emailService.sendBookingCancellation(booking, 'Cancelled by manager from Google Sheets');
          console.log('✅ Cancellation email sent for booking:', bookingId);
        } catch (emailError) {
          console.error('❌ Failed to send cancellation email:', emailError);
        }

        console.log('✅ Cancelled booking from Google Sheets:', bookingId);
      }
    }

    return json({ 
      success: true, 
      message: `Synced ${deletedBookings.length} booking changes from Google Sheets`,
      deletedBookings 
    });

  } catch (error) {
    console.error('Failed to sync from Google Sheets:', error);
    return json({ error: 'Failed to sync from Google Sheets' }, { status: 500 });
  }
}

// This endpoint can be called periodically to sync changes
export async function loader({ request }) {
  try {
    const url = new URL(request.url);
    const shopDomain = url.searchParams.get('shop') || 'default-shop';

    // Initialize Google Sheets service
    const sheetsService = new GoogleSheetsService(shopDomain);
    await sheetsService.initialize();

    // Sync changes from Google Sheets
    const deletedBookings = await sheetsService.syncFromSheets();

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
        // Update status to cancelled
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'CANCELLED' }
        });

        // Send cancellation email to customer
        try {
          await emailService.sendBookingCancellation(booking, 'Cancelled by manager from Google Sheets');
          console.log('✅ Cancellation email sent for booking:', bookingId);
        } catch (emailError) {
          console.error('❌ Failed to send cancellation email:', emailError);
        }

        console.log('✅ Cancelled booking from Google Sheets:', bookingId);
      }
    }

    return json({ 
      success: true, 
      message: `Synced ${deletedBookings.length} booking changes from Google Sheets`,
      deletedBookings 
    });

  } catch (error) {
    console.error('Failed to sync from Google Sheets:', error);
    return json({ error: 'Failed to sync from Google Sheets' }, { status: 500 });
  }
}
