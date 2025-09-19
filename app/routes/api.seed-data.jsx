import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function action({ request }) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Create sample services
    const services = await Promise.all([
      prisma.service.upsert({
        where: { name: 'Haircut & Styling' },
        update: {},
        create: {
          name: 'Haircut & Styling',
          description: 'Professional haircut with styling and consultation',
          price: 45.00,
          duration: 60
        }
      }),
      prisma.service.upsert({
        where: { name: 'Hair Coloring' },
        update: {},
        create: {
          name: 'Hair Coloring',
          description: 'Full hair coloring service with consultation',
          price: 120.00,
          duration: 120
        }
      }),
      prisma.service.upsert({
        where: { name: 'Manicure' },
        update: {},
        create: {
          name: 'Manicure',
          description: 'Classic manicure with nail polish',
          price: 25.00,
          duration: 45
        }
      }),
      prisma.service.upsert({
        where: { name: 'Facial Treatment' },
        update: {},
        create: {
          name: 'Facial Treatment',
          description: 'Deep cleansing facial with moisturizing treatment',
          price: 80.00,
          duration: 90
        }
      })
    ]);

    // Create sample users
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'john.doe@example.com' },
        update: {},
        create: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1-555-0123'
        }
      }),
      prisma.user.upsert({
        where: { email: 'jane.smith@example.com' },
        update: {},
        create: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+1-555-0456'
        }
      }),
      prisma.user.upsert({
        where: { email: 'mike.johnson@example.com' },
        update: {},
        create: {
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike.johnson@example.com',
          phone: '+1-555-0789'
        }
      })
    ]);

    // Create sample bookings
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const bookings = await Promise.all([
      prisma.booking.upsert({
        where: { id: 'sample-booking-1' },
        update: {},
        create: {
          id: 'sample-booking-1',
          userId: users[0].id,
          serviceId: services[0].id,
          status: 'CONFIRMED',
          bookingDate: tomorrow,
          startTime: '10:00',
          endTime: '11:00',
          specialRequests: 'Please use organic products if possible',
          totalPrice: services[0].price
        }
      }),
      prisma.booking.upsert({
        where: { id: 'sample-booking-2' },
        update: {},
        create: {
          id: 'sample-booking-2',
          userId: users[1].id,
          serviceId: services[1].id,
          status: 'PENDING',
          bookingDate: dayAfterTomorrow,
          startTime: '14:00',
          endTime: '16:00',
          specialRequests: null,
          totalPrice: services[1].price
        }
      }),
      prisma.booking.upsert({
        where: { id: 'sample-booking-3' },
        update: {},
        create: {
          id: 'sample-booking-3',
          userId: users[2].id,
          serviceId: services[2].id,
          status: 'CONFIRMED',
          bookingDate: tomorrow,
          startTime: '15:30',
          endTime: '16:15',
          specialRequests: 'French manicure please',
          totalPrice: services[2].price
        }
      })
    ]);

    return json({ 
      success: true, 
      message: 'Sample data created successfully',
      data: {
        services: services.length,
        users: users.length,
        bookings: bookings.length
      }
    });

  } catch (error) {
    console.error('Failed to seed data:', error);
    return json({ error: 'Failed to create sample data' }, { status: 500 });
  }
}
