# 🧪 Testing Guide - Payment Bypass & Google Sheets Setup

## 🚀 Payment Bypass for Testing

There are **two ways** to bypass payment for testing:

### Method 1: Environment Variable (Recommended)

Set the environment variable to bypass payment globally:

1. **Create or edit `.env` file** in your project root:
```env
BYPASS_PAYMENT=true
```

2. **Restart your development server**

3. **Now all bookings will be auto-confirmed** without requiring payment

### Method 2: Test Endpoint (Manual Confirmation)

Use the test endpoint to manually confirm specific bookings:

1. **Create a booking** (it will be in `PAYMENT_PENDING` status)

2. **Call the test endpoint** to confirm it:
```bash
POST /api/test-booking-confirm
Content-Type: application/json

{
  "bookingId": "your-booking-id-here"
}
```

**Example using curl:**
```bash
curl -X POST http://localhost:3000/api/test-booking-confirm \
  -H "Content-Type: application/json" \
  -d '{"bookingId": "clx1234567890"}'
```

**Example using JavaScript:**
```javascript
fetch('/api/test-booking-confirm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ bookingId: 'your-booking-id' })
})
.then(res => res.json())
.then(data => console.log(data));
```

## 📊 Setting Up Google Sheets for Testing

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it (e.g., "Anyday Bookings Test")
4. **Copy the Spreadsheet ID** from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Example: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`
   - The Spreadsheet ID is the long string between `/d/` and `/edit`

### Step 2: Create a Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **Create a new project** or select existing one
3. **Enable Google Sheets API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click "Enable"
4. **Create Service Account**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Name it (e.g., "anyday-sheets-service")
   - Click "Create and Continue"
   - Skip optional steps, click "Done"
5. **Create Key**:
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Select "JSON"
   - Click "Create" - JSON file will download
6. **Share Google Sheet with Service Account**:
   - Open the JSON file you downloaded
   - Find the `client_email` field (e.g., `anyday-sheets-service@project-id.iam.gserviceaccount.com`)
   - Open your Google Sheet
   - Click "Share" button
   - Paste the service account email
   - Give it "Editor" permissions
   - Click "Share"

### Step 3: Configure in Admin Panel

1. **Go to your Shopify Admin** → **Apps** → **Anyday Booking App**
2. **Navigate to "Google Sheets Configuration"**
3. **Fill in the form**:
   - **Location/City**: Enter the city name (e.g., `Tbilisi`, `Batumi`, or `Test`)
     - **Important**: This must match the `city` field in your Product Booking Config!
   - **Spreadsheet ID**: Paste the ID from Step 1
   - **Sheet Name**: Enter `Bookings` (or the name of your sheet tab)
   - **Service Account Credentials**: Open the JSON file from Step 2, copy the entire contents, and paste here
4. **Click "Save Configuration"**
5. **Click "Test Connection"** to verify it works

### Step 4: Set City in Product Config

Make sure your **Product Booking Configuration** has the `city` field set:

1. Go to **Product Config** in admin panel
2. Select a product
3. Set the **City** field to match the location you configured in Google Sheets
   - Example: If Google Sheet config has `location: "Tbilisi"`, product config should have `city: "Tbilisi"`

## 🧪 Testing Workflow

### Complete Testing Flow:

1. **Enable Payment Bypass**:
   ```env
   BYPASS_PAYMENT=true
   ```

2. **Configure Google Sheets** (see above)

3. **Create a Test Booking**:
   - Go to your Shopify storefront
   - Select a product that has booking enabled
   - Fill out the booking form
   - Submit

4. **Verify Booking is Created**:
   - Booking should be automatically confirmed (no payment required)
   - Check console logs for confirmation messages

5. **Check Google Sheets**:
   - Open your Google Sheet
   - You should see the new booking row with all details

6. **Test Cancellation from Sheet**:
   - Find the booking in Google Sheets
   - Change Status column to `CANCELLED`
   - Save the sheet
   - Call sync endpoint: `GET /webhooks/google-sheets-sync?shop=default-shop`
   - Or wait for automatic sync (if configured)
   - Booking should be cancelled in database
   - Customer should receive cancellation email

## 📝 Example: Complete Test Script

```javascript
// Step 1: Create a booking (will be auto-confirmed if BYPASS_PAYMENT=true)
const bookingResponse = await fetch('/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '555-1234',
    bookingDate: '2024-12-15',
    startTime: '14:00',
    productId: 'your-product-id',
    productTitle: 'Test Birthday Center',
    productPrice: 100,
    productBookingConfigId: 'your-config-id'
  })
});

const booking = await bookingResponse.json();
console.log('Booking created:', booking);

// Step 2: If payment was NOT bypassed, manually confirm
if (booking.requiresPayment) {
  const confirmResponse = await fetch('/api/test-booking-confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId: booking.booking.id })
  });
  
  const confirmed = await confirmResponse.json();
  console.log('Booking confirmed:', confirmed);
}

// Step 3: Check Google Sheets
console.log('Check your Google Sheet - booking should be there!');

// Step 4: Test cancellation
// - Change Status to "CANCELLED" in Google Sheets
// - Call sync endpoint
const syncResponse = await fetch('/webhooks/google-sheets-sync?shop=default-shop');
const syncResult = await syncResponse.json();
console.log('Sync result:', syncResult);
```

## 🔍 Verification Checklist

- [ ] `.env` file has `BYPASS_PAYMENT=true` (or use test endpoint)
- [ ] Google Sheets created and ID copied
- [ ] Google Cloud Service Account created
- [ ] Service Account JSON credentials saved
- [ ] Google Sheet shared with service account email
- [ ] Google Sheets API enabled in Google Cloud
- [ ] Configuration saved in admin panel
- [ ] Test connection successful
- [ ] Product Booking Config has correct `city` field
- [ ] Test booking created
- [ ] Booking appears in Google Sheets
- [ ] Cancellation from sheet syncs back to website

## 🐛 Troubleshooting

### Booking not syncing to Google Sheets?

1. **Check location matching**:
   - Product `city` must match Google Sheet config `location`
   - Example: Both should be `"Tbilisi"` (case-sensitive)

2. **Check service account permissions**:
   - Sheet must be shared with service account email
   - Service account must have "Editor" access

3. **Check credentials**:
   - JSON credentials must be complete and valid
   - Use "Test Connection" button to verify

4. **Check console logs**:
   - Look for error messages
   - Check if Google Sheets service initialized

### Payment bypass not working?

1. **Check environment variable**:
   - `.env` file must have `BYPASS_PAYMENT=true`
   - Server must be restarted after adding env variable

2. **Check console logs**:
   - Look for "TEST MODE" messages
   - Check if booking is being created as `CONFIRMED`

### Cancellation not syncing?

1. **Check Status column**:
   - Must be exactly `"CANCELLED"` (all caps)
   - No extra spaces

2. **Call sync endpoint manually**:
   ```bash
   GET /webhooks/google-sheets-sync?shop=default-shop&location=Tbilisi
   ```

3. **Check console logs**:
   - Look for sync messages
   - Check for errors

## 🎯 Quick Reference

### Environment Variables:
```env
BYPASS_PAYMENT=true          # Auto-confirm bookings (testing)
COMPANY_EMAIL=admin@example.com  # Email for notifications
```

### API Endpoints:
```bash
POST /api/bookings                    # Create booking
POST /api/test-booking-confirm        # Manually confirm booking (test)
GET  /webhooks/google-sheets-sync     # Sync cancellations from sheets
GET  /api/google-sheets-config        # Get sheet configs
POST /api/google-sheets-config        # Save sheet config
```

### Google Sheets Status Values:
- `CONFIRMED` - Booking is active
- `CANCELLED` - Booking is cancelled (will sync to website)

---

**Happy Testing! 🎉**

