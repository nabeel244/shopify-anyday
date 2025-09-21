import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function loader({ request }) {
  try {
    const configurations = await prisma.productBookingConfig.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return json({ configurations });
  } catch (error) {
    console.error('Failed to fetch product booking configurations:', error);
    return json({ error: 'Failed to fetch configurations' }, { status: 500 });
  }
}

export async function action({ request }) {
  if (request.method === 'POST') {
    return await createConfiguration(request);
  } else if (request.method === 'PATCH') {
    return await updateConfiguration(request);
  } else if (request.method === 'DELETE') {
    return await deleteConfiguration(request);
  } else {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }
}

async function createConfiguration(request) {
  try {
    console.log('Creating configuration...');
    console.log('Prisma client:', prisma);
    console.log('Available models:', Object.keys(prisma));
    
    const { 
      productId, 
      productTitle, 
      productPrice, 
      availableDays, 
      timeSlots, 
      timeRangeStart,
      timeRangeEnd,
      slotDuration,
      disabledDates,
      duration, 
      maxBookings, 
      isActive 
    } = await request.json();

    // Validate required fields
    if (!productId || !productTitle || !productPrice) {
      return json({ error: 'Product ID, title, and price are required' }, { status: 400 });
    }

    // Validate that at least one day is selected
    if (!availableDays || availableDays.length === 0) {
      return json({ error: 'Please select at least one available day' }, { status: 400 });
    }

    // Check if configuration already exists
    console.log('Checking for existing configuration with productId:', productId);
    const existingConfig = await prisma.productBookingConfig.findUnique({
      where: { productId }
    });
    console.log('Existing config found:', existingConfig);

    if (existingConfig) {
      return json({ error: 'Configuration already exists for this product' }, { status: 400 });
    }

    const configuration = await prisma.productBookingConfig.create({
      data: {
        productId,
        productTitle,
        productPrice: parseFloat(productPrice),
        availableDays: JSON.stringify(availableDays || []),
        timeSlots: JSON.stringify(timeSlots || []),
        timeRangeStart: timeRangeStart || null,
        timeRangeEnd: timeRangeEnd || null,
        slotDuration: parseInt(slotDuration) || 30,
        disabledDates: JSON.stringify(disabledDates || []),
        duration: parseInt(duration) || 480,
        maxBookings: parseInt(maxBookings) || 1,
        isActive: isActive !== false
      }
    });

    return json({ configuration });
  } catch (error) {
    console.error('Failed to create product booking configuration:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    return json({ 
      error: 'Failed to create configuration',
      details: error.message 
    }, { status: 500 });
  }
}

async function updateConfiguration(request) {
  try {
    const { id, isActive, availableDays, timeSlots, duration, maxBookings } = await request.json();

    if (!id) {
      return json({ error: 'Configuration ID is required' }, { status: 400 });
    }

    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (availableDays) updateData.availableDays = JSON.stringify(availableDays);
    if (timeSlots) updateData.timeSlots = JSON.stringify(timeSlots);
    if (duration) updateData.duration = parseInt(duration);
    if (maxBookings) updateData.maxBookings = parseInt(maxBookings);

    const configuration = await prisma.productBookingConfig.update({
      where: { id },
      data: updateData
    });

    return json({ configuration });
  } catch (error) {
    console.error('Failed to update product booking configuration:', error);
    return json({ error: 'Failed to update configuration' }, { status: 500 });
  }
}

async function deleteConfiguration(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return json({ error: 'Configuration ID is required' }, { status: 400 });
    }

    await prisma.productBookingConfig.delete({
      where: { id }
    });

    return json({ success: true });
  } catch (error) {
    console.error('Failed to delete product booking configuration:', error);
    return json({ error: 'Failed to delete configuration' }, { status: 500 });
  }
}
