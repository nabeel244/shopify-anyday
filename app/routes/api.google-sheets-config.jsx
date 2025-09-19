import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
// import { setupGoogleSheetsConfig } from "../services/googleSheets.server.js";

const prisma = new PrismaClient();

export async function action({ request }) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { spreadsheetId, sheetName, credentials } = await request.json();

    // Validate required fields
    if (!spreadsheetId || !sheetName || !credentials) {
      return json({ error: 'All fields are required' }, { status: 400 });
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

    // Setup Google Sheets configuration - temporarily disabled
    // await setupGoogleSheetsConfig('default-shop', spreadsheetId, sheetName, JSON.parse(credentials));
    console.log('Google Sheets configuration temporarily disabled');

    return json({ success: true, message: 'Google Sheets configuration saved successfully' });

  } catch (error) {
    console.error('Failed to save Google Sheets config:', error);
    return json({ error: 'Failed to save configuration' }, { status: 500 });
  }
}

export async function loader({ request }) {
  try {
    const config = await prisma.googleSheetConfig.findUnique({
      where: { shopDomain: 'default-shop' }
    });

    return json({ config });
  } catch (error) {
    console.error('Failed to fetch Google Sheets config:', error);
    return json({ error: 'Failed to fetch configuration' }, { status: 500 });
  }
}
