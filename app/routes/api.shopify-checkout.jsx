import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, ngrok-skip-browser-warning'
};

export async function loader({ request }) {
  try {
    const url = new URL(request.url);
    const bookingId = url.searchParams.get('bookingId');

    if (!bookingId) {
      return new Response('Booking ID is required', { 
        status: 400,
        headers: corsHeaders
      });
    }

    // Get the booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        productBookingConfig: true,
        service: true
      }
    });

    if (!booking) {
      return new Response('Booking not found', { 
        status: 404,
        headers: corsHeaders
      });
    }

    // Create Shopify checkout URL
    const checkoutUrl = await createShopifyCheckout(booking);

    // Update booking with checkout URL
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        shopifyCheckoutUrl: checkoutUrl,
        paymentStatus: 'PROCESSING'
      }
    });

    // Redirect to checkout URL
    return new Response(null, {
      status: 302,
      headers: {
        'Location': checkoutUrl,
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Failed to create checkout:', error);
    return new Response('Failed to create checkout', { 
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function action({ request }) {
  // Handle preflight OPTIONS requests
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

    // Get the booking details
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

    // Create Shopify checkout URL
    const checkoutUrl = await createShopifyCheckout(booking);

    // Update booking with checkout URL
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        shopifyCheckoutUrl: checkoutUrl,
        paymentStatus: 'PROCESSING'
      }
    });

    return json({
      success: true,
      checkoutUrl: checkoutUrl,
      bookingId: bookingId
    }, {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Failed to create checkout:', error);
    return json({ 
      error: 'Failed to create checkout',
      details: error.message 
    }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

async function createShopifyCheckout(booking) {
  // This is a simplified version - you'll need to implement actual Shopify checkout creation
  // For now, we'll create a mock checkout URL that includes the booking details
  
  const baseUrl = process.env.SHOPIFY_STORE_URL || 'https://your-store.myshopify.com';
  const checkoutParams = new URLSearchParams({
    booking_id: booking.id,
    amount: booking.totalPrice.toString(),
    customer_email: booking.user.email,
    customer_name: `${booking.user.firstName} ${booking.user.lastName}`,
    service_name: booking.service?.name || booking.productBookingConfig?.productTitle || 'Booking Service',
    booking_date: booking.bookingDate.toISOString().split('T')[0],
    booking_time: `${booking.startTime} - ${booking.endTime}`
  });

  // In a real implementation, you would:
  // 1. Create a Shopify checkout session
  // 2. Add the booking as a line item
  // 3. Set up webhooks to handle payment completion
  // 4. Return the actual checkout URL

  return `${baseUrl}/checkout?${checkoutParams.toString()}`;
}
