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
    
    const requestData = await request.json();
    console.log('🔍 Received request data:', requestData);
    
    const { 
      productId, 
      productTitle, 
      productPrice, 
      city,
      availableDays, 
      timeSlots, 
      timeRanges,
      timeRangeStart,
      timeRangeEnd,
      slotDuration,
      disabledDates,
      services,
      duration, 
      maxBookings,
      bookingStartDate,
      bookingEndDate,
      isActive 
    } = requestData;

    // Validate required fields
    if (!productId || !productTitle || !productPrice) {
      return json({ error: 'Product ID, title, and price are required' }, { status: 400 });
    }

    // Validate that at least one day is selected
    if (!availableDays || availableDays.length === 0) {
      return json({ error: 'Please select at least one available day' }, { status: 400 });
    }

    // Validate that at least one time configuration is available
    if ((!timeRanges || timeRanges.length === 0) && (!timeSlots || timeSlots.length === 0) && (!timeRangeStart || !timeRangeEnd)) {
      return json({ error: 'Please configure time availability: add time ranges, time slots, or set a time range' }, { status: 400 });
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

    const configData = {
      productId,
      productTitle,
      productPrice: parseFloat(productPrice),
      city: city || null,
      availableDays: JSON.stringify(availableDays || []),
      timeSlots: JSON.stringify(timeSlots || []),
      timeRanges: JSON.stringify(timeRanges || []),
      timeRangeStart: timeRangeStart || null,
      timeRangeEnd: timeRangeEnd || null,
      slotDuration: parseInt(slotDuration) || 30,
      disabledDates: JSON.stringify(disabledDates || []),
      services: JSON.stringify(services || []),
      duration: parseInt(duration) || 480,
      maxBookings: parseInt(maxBookings) || 1,
      bookingStartDate: bookingStartDate || null,
      bookingEndDate: bookingEndDate || null,
      isActive: isActive !== false
    };

    console.log('🔍 Creating configuration with data:', configData);

    const configuration = await prisma.productBookingConfig.create({
      data: configData
    });

    console.log('✅ Configuration created successfully:', configuration);

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
    const { 
      id, 
      isActive, 
      city,
      availableDays, 
      timeSlots, 
      timeRanges,
      timeRangeStart,
      timeRangeEnd,
      slotDuration,
      disabledDates,
      services,
      duration, 
      maxBookings,
      bookingStartDate,
      bookingEndDate
    } = await request.json();

    if (!id) {
      return json({ error: 'Configuration ID is required' }, { status: 400 });
    }

    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (city !== undefined) updateData.city = city || null;
    if (availableDays) updateData.availableDays = JSON.stringify(availableDays);
    if (timeSlots) updateData.timeSlots = JSON.stringify(timeSlots);
    if (timeRanges) updateData.timeRanges = JSON.stringify(timeRanges);
    if (timeRangeStart !== undefined) updateData.timeRangeStart = timeRangeStart;
    if (timeRangeEnd !== undefined) updateData.timeRangeEnd = timeRangeEnd;
    if (slotDuration !== undefined) updateData.slotDuration = parseInt(slotDuration);
    if (disabledDates) updateData.disabledDates = JSON.stringify(disabledDates);
    if (services) updateData.services = JSON.stringify(services);
    if (duration !== undefined) updateData.duration = parseInt(duration);
    if (maxBookings !== undefined) updateData.maxBookings = parseInt(maxBookings);
    if (bookingStartDate !== undefined) updateData.bookingStartDate = bookingStartDate;
    if (bookingEndDate !== undefined) updateData.bookingEndDate = bookingEndDate;

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
