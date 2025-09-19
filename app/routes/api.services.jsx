import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function loader({ request }) {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    return json({ services });
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function action({ request }) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { name, description, price, duration } = await request.json();

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration)
      }
    });

    return json({ service });
  } catch (error) {
    console.error('Failed to create service:', error);
    return json({ error: 'Failed to create service' }, { status: 500 });
  }
}
