import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { setupGoogleSheetsConfig } from "../services/googleSheets.server.js";

const prisma = new PrismaClient();

export async function action({ request }) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { spreadsheetId, sheetName, credentials, location } = body;

    console.log('Received Google Sheets config:', {
      spreadsheetId: spreadsheetId ? 'provided' : 'missing',
      sheetName: sheetName ? 'provided' : 'missing',
      credentials: credentials ? 'provided' : 'missing',
      location: location || 'default'
    });

    // Validate required fields
    if (!spreadsheetId || !sheetName || !credentials) {
      return json({ 
        error: 'All required fields are missing',
        details: !spreadsheetId ? 'Spreadsheet ID is required' : 
                 !sheetName ? 'Sheet Name is required' : 
                 'Service Account Credentials are required'
      }, { status: 400 });
    }

    // Validate credentials JSON
    try {
      const parsedCredentials = JSON.parse(credentials);
      if (!parsedCredentials.type || !parsedCredentials.project_id) {
        throw new Error('Invalid credentials format');
      }
    } catch (error) {
      return json({ error: 'Invalid credentials JSON format' }, { status: 400 });
    }

    // Setup Google Sheets configuration with location
    await setupGoogleSheetsConfig('default-shop', spreadsheetId, sheetName, JSON.parse(credentials), location || null);

    return json({ 
      success: true, 
      message: `Google Sheets configuration saved successfully for location: ${location || 'default'}` 
    });

  } catch (error) {
    console.error('Failed to save Google Sheets config:', error);
    console.error('Error stack:', error.stack);
    return json({ 
      error: 'Failed to save configuration',
      details: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function loader({ request }) {
  try {
    const url = new URL(request.url);
    const location = url.searchParams.get('location');
    const shopDomain = 'default-shop';

    // If location specified, get config for that location
    if (location) {
      const config = await prisma.googleSheetConfig.findUnique({
        where: {
          shopDomain_location: {
            shopDomain,
            location
          }
        }
      });
      return json({ config });
    }

    // Otherwise, get all configs for the shop
    const configs = await prisma.googleSheetConfig.findMany({
      where: { shopDomain },
      orderBy: { location: 'asc' }
    });

    return json({ configs, config: configs[0] }); // Return both array and first config for backward compatibility
  } catch (error) {
    console.error('Failed to fetch Google Sheets config:', error);
    return json({ error: 'Failed to fetch configuration' }, { status: 500 });
  }
}
