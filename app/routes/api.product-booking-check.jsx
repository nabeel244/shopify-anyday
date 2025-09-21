import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function generateTimeSlotsFromRange(startTime, endTime, slotDuration) {
  const slots = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    slots.push(timeString);
  }
  
  return slots;
}

export async function loader({ request }) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');

    if (!productId) {
      return json({ error: 'Product ID is required' }, { status: 400 });
    }

    const configuration = await prisma.productBookingConfig.findUnique({
      where: { 
        productId,
        isActive: true
      }
    });

    if (!configuration) {
      return json({ 
        hasBooking: false,
        message: 'Booking not enabled for this product'
      });
    }

    // Parse the stored JSON data
    const availableDays = JSON.parse(configuration.availableDays);
    const timeSlots = JSON.parse(configuration.timeSlots);
    const disabledDates = configuration.disabledDates ? JSON.parse(configuration.disabledDates) : [];

    // Generate time slots from range if available
    let finalTimeSlots = timeSlots;
    if (configuration.timeRangeStart && configuration.timeRangeEnd) {
      finalTimeSlots = generateTimeSlotsFromRange(
        configuration.timeRangeStart,
        configuration.timeRangeEnd,
        configuration.slotDuration || 30
      );
    }

    return json({ 
      hasBooking: true,
      configuration: {
        id: configuration.id,
        productId: configuration.productId,
        productTitle: configuration.productTitle,
        productPrice: configuration.productPrice,
        availableDays,
        timeSlots: finalTimeSlots,
        timeRangeStart: configuration.timeRangeStart,
        timeRangeEnd: configuration.timeRangeEnd,
        slotDuration: configuration.slotDuration,
        disabledDates,
        duration: configuration.duration,
        maxBookings: configuration.maxBookings
      }
    });
  } catch (error) {
    console.error('Failed to check product booking configuration:', error);
    return json({ error: 'Failed to check configuration' }, { status: 500 });
  }
}
