import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function loader({ request }) {
  try {
    const url = new URL(request.url);
    const serviceId = url.searchParams.get('serviceId');
    const date = url.searchParams.get('date');

    if (!serviceId || !date) {
      return json({ error: 'Service ID and date are required' }, { status: 400 });
    }

    const bookingDate = new Date(date);
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get existing bookings for the selected date
    const existingBookings = await prisma.booking.findMany({
      where: {
        serviceId,
        bookingDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      },
      select: {
        startTime: true,
        endTime: true
      }
    });

    // Get service duration
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { duration: true }
    });

    if (!service) {
      return json({ error: 'Service not found' }, { status: 404 });
    }

    // Generate all possible time slots
    const allTimeSlots = generateTimeSlots();
    
    // Filter out booked time slots
    const availableTimeSlots = allTimeSlots.filter(timeSlot => {
      return !isTimeSlotBooked(timeSlot, existingBookings, service.duration);
    });

    return json({ availableTimes: availableTimeSlots });
  } catch (error) {
    console.error('Failed to fetch availability:', error);
    return json({ error: 'Failed to fetch availability' }, { status: 500 });
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
