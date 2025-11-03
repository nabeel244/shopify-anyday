# 🚀 Quick Test Start Guide

## Step 1: Enable Payment Bypass

Add this to your `.env` file (create it if it doesn't exist):

```env
BYPASS_PAYMENT=true
```

Then **restart your server**.

## Step 2: Set Up Google Sheets

### Quick Setup:

1. **Create Google Sheet**:
   - Go to [Google Sheets](https://sheets.google.com)
   - Create new spreadsheet
   - Copy the **Spreadsheet ID** from URL (the long string between `/d/` and `/edit`)

2. **Create Service Account**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create project → Enable Google Sheets API
   - Create Service Account → Download JSON key
   - **Share your sheet** with the service account email (from JSON file)

3. **Configure in Admin**:
   - Go to Admin Panel → Google Sheets Configuration
   - Enter:
     - **Location**: `Test` (or your city name)
     - **Spreadsheet ID**: Paste the ID from step 1
     - **Sheet Name**: `Bookings`
     - **Credentials**: Paste entire JSON file contents
   - Click "Save"

4. **Set Product City**:
   - Go to Product Config
   - Set **City** field to match the Location you entered above (e.g., `Test`)

## Step 3: Test!

1. **Create a booking** on your storefront
2. **Check console** - you should see "🧪 TEST MODE: Booking auto-confirmed"
3. **Check Google Sheets** - booking should appear automatically!

## Test Cancellation:

1. Open Google Sheet
2. Find your booking
3. Change **Status** column to `CANCELLED`
4. Call sync: `GET /webhooks/google-sheets-sync?shop=default-shop`
5. Booking should be cancelled in database

---

**That's it!** For detailed instructions, see `TESTING_GUIDE.md`

