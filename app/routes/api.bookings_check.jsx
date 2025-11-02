import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
  
  return json({ error: 'Method not allowed' }, { 
    status: 405,
    headers: corsHeaders
  });
}

export async function loader({ request }) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const productBookingConfigId = url.searchParams.get('productBookingConfigId');

    // Support both single date and date range queries
    let startOfDay, endOfDay;
    
    if (startDate && endDate) {
      // Date range query
      startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
    } else if (date) {
      // Single date query
      const bookingDate = new Date(date);
      startOfDay = new Date(bookingDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      endOfDay = new Date(bookingDate);
      endOfDay.setHours(23, 59, 59, 999);
    } else {
      return json({ error: 'Date or date range is required' }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    console.log('🔍 Checking bookings from:', startOfDay.toISOString(), 'to:', endOfDay.toISOString());

    const whereClause = {
      bookingDate: {
        gte: startOfDay,
        lte: endOfDay
      },
      status: {
        in: ['PENDING', 'CONFIRMED']
      },
      isTemporary: false // Only check confirmed bookings (exclude temporary payment-pending bookings)
    };

    if (productBookingConfigId) {
      whereClause.productBookingConfigId = productBookingConfigId;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        service: {
          select: {
            name: true
          }
        },
        productBookingConfig: {
          select: {
            productTitle: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    console.log('🔍 Found bookings:', bookings.length);

    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      customer: `${booking.user.firstName} ${booking.user.lastName}`,
      email: booking.user.email,
      date: booking.bookingDate.toISOString().split('T')[0],
      time: `${booking.startTime} - ${booking.endTime}`,
      service: booking.service?.name || booking.productBookingConfig?.productTitle,
      status: booking.status,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt
    }));

    console.log('📅 BOOKINGS:', formattedBookings.length);
    formattedBookings.forEach(booking => {
      console.log(`   - ${booking.customer}: ${booking.date} ${booking.time} - ${booking.service} - $${booking.totalPrice}`);
    });

    return json({ 
      bookings: formattedBookings,
      count: bookings.length,
      dateRange: {
        start: startOfDay.toISOString().split('T')[0],
        end: endOfDay.toISOString().split('T')[0]
      }
    }, {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Failed to check bookings:', error);
    return json({ error: 'Failed to check bookings' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}