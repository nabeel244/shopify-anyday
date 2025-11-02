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
    const serviceId = url.searchParams.get('serviceId');
    const productBookingConfigId = url.searchParams.get('productBookingConfigId');
    const date = url.searchParams.get('date');

    if (!date) {
      return json({ error: 'Date is required' }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    const bookingDate = new Date(date);
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('🔍 Checking availability for date:', date);
    console.log('🔍 Service ID:', serviceId);
    console.log('🔍 Product Booking Config ID:', productBookingConfigId);

    // Get existing bookings for the selected date
    const whereClause = {
      bookingDate: {
        gte: startOfDay,
        lte: endOfDay
      },
      status: {
        in: ['PENDING', 'CONFIRMED']
      }
    };

    // Add service or product booking config filter
    if (serviceId) {
      whereClause.serviceId = serviceId;
    } else if (productBookingConfigId) {
      whereClause.productBookingConfigId = productBookingConfigId;
    }

    const existingBookings = await prisma.booking.findMany({
      where: whereClause,
      select: {
        startTime: true,
        endTime: true,
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log('🔍 Found existing bookings:', existingBookings.length);
    if (existingBookings.length > 0) {
      console.log('📅 BOOKED SLOTS:');
      existingBookings.forEach(booking => {
        console.log(`   - ${booking.user.firstName} ${booking.user.lastName}: ${booking.startTime} - ${booking.endTime}`);
      });
    }

    // Get service duration or product booking config
    let duration = 480; // Default 8 hours
    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: { duration: true }
      });
      if (service) {
        duration = service.duration;
      }
    } else if (productBookingConfigId) {
      const config = await prisma.productBookingConfig.findUnique({
        where: { id: productBookingConfigId },
        select: { duration: true }
      });
      if (config) {
        duration = config.duration;
      }
    }

    console.log('🔍 Using duration:', duration, 'minutes');

    // Generate all possible time slots
    const allTimeSlots = generateTimeSlots();
    
    // Filter out booked time slots
    const availableTimeSlots = allTimeSlots.filter(timeSlot => {
      return !isTimeSlotBooked(timeSlot, existingBookings, duration);
    });

    console.log('🔍 Available time slots:', availableTimeSlots.length);
    console.log('🔍 Available slots:', availableTimeSlots);

    return json({ 
      availableTimes: availableTimeSlots,
      bookedSlots: existingBookings.map(b => ({
        time: `${b.startTime} - ${b.endTime}`,
        customer: `${b.user.firstName} ${b.user.lastName}`
      }))
    }, {
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Failed to fetch availability:', error);
    return json({ error: 'Failed to fetch availability' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

function generateTimeSlots() {
  const slots = [];
  const startHour = 9; // 9 AM
  const endHour = 17; // 5 PM
  const interval = 30; // 30 minutes

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minutes = 0; minutes < 60; minutes += interval) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }

  return slots;
}

function isTimeSlotBooked(timeSlot, existingBookings, serviceDuration) {
  const [startHour, startMinute] = timeSlot.split(':').map(Number);
  const startTimeMinutes = startHour * 60 + startMinute;
  const endTimeMinutes = startTimeMinutes + serviceDuration;

  return existingBookings.some(booking => {
    const [bookingStartHour, bookingStartMinute] = booking.startTime.split(':').map(Number);
    const [bookingEndHour, bookingEndMinute] = booking.endTime.split(':').map(Number);
    
    const bookingStartMinutes = bookingStartHour * 60 + bookingStartMinute;
    const bookingEndMinutes = bookingEndHour * 60 + bookingEndMinute;

    // Check for overlap
    return (startTimeMinutes < bookingEndMinutes && endTimeMinutes > bookingStartMinutes);
  });
}
