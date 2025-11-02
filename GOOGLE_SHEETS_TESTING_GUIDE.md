# Google Sheets Integration Testing Guide

This guide explains how to test the bidirectional sync between your booking system and Google Sheets.

## Overview

The system now supports:
1. **Automatic booking sync to Google Sheets** - After payment is completed, bookings are automatically added to Google Sheets
2. **Email notifications** - Confirmation emails are sent to both the business and customer after payment
3. **Bidirectional sync** - If a manager cancels a booking from Google Sheets (by changing status to "CANCELLED"), it will be cancelled in the website database and the customer will receive a cancellation email

## Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```env
# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
COMPANY_EMAIL=booking-notifications@yourcompany.com
```

**Note:** For Gmail, you'll need to create an app-specific password. Go to your Google Account settings > Security > 2-Step Verification > App passwords.

### 2. Google Sheets Setup

#### Step 1: Create a Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API
4. Go to "APIs & Services" > "Credentials"
5. Click "Create Credentials" > "Service Account"
6. Download the JSON credentials file

#### Step 2: Share Google Sheet with Service Account

1. Create a new Google Sheet
2. Copy the spreadsheet ID from the URL (e.g., `https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit`)
3. Share the sheet with the service account email (found in the JSON file, e.g., `your-service@project.iam.gserviceaccount.com`)
4. Give it "Editor" permissions

#### Step 3: Configure in the App

1. In your Shopify app admin, go to the Google Sheets Configuration page
2. Enter:
   - **Spreadsheet ID**: The ID from step 2.2
   - **Sheet Name**: Usually "Sheet1" or your custom sheet name
   - **Credentials**: Paste the entire JSON content from the downloaded credentials file
3. Click "Save Configuration"

## Testing the Integration

### Test 1: Booking Flow (Website → Google Sheets)

1. **Create a booking**:
   - Go to your store and create a booking
   - Complete the payment
   - Check your console logs for: `✅ Synced to Google Sheets`

2. **Verify in Google Sheets**:
   - Open your Google Sheet
   - You should see a new row with:
     - Booking ID
     - Customer Name
     - Email
     - Phone
     - Service/Product
     - Booking Date
     - Start Time
     - End Time
     - Status (should be "CONFIRMED")
     - Total Price

3. **Verify emails**:
   - Check the business email (COMPANY_EMAIL)
   - Check the customer email
   - Both should receive confirmation emails with booking details

### Test 2: Cancellation Flow (Google Sheets → Website)

#### Option A: Change Status to "CANCELLED"

1. Open your Google Sheet
2. Find a booking row
3. Change the "Status" column" to "CANCELLED"
4. Run the sync webhook:
   ```bash
   # Using curl
   curl -X GET "http://localhost:3000/webhooks/google-sheets-sync?shop=default-shop"
   ```

5. **Verify cancellation**:
   - Check your website's bookings page - the booking should now show "CANCELLED"
   - Check the database: The booking status should be "CANCELLED"
   - Check customer email - they should receive a cancellation email

#### Option B: Delete the Row

1. Open your Google Sheet
2. Delete an entire booking row
3. Run the sync webhook (same as above)

**Note:** The current implementation detects when status changes to "CANCELLED" in the sheet. If you delete a row completely, you may need to manually mark it as cancelled or implement row deletion detection.

### Test 3: Automatic Sync (Webhook)

You can set up a cron job to automatically sync cancellations from Google Sheets:

```bash
# Add to your crontab (runs every 5 minutes)
*/5 * * * * curl -X GET "https://your-app.com/webhooks/google-sheets-sync?shop=default-shop"
```

Or use a service like [cron-job.org](https://cron-job.org) to trigger this endpoint periodically.

## Google Sheet Structure

Your Google Sheet will have these columns:

| Column | Description |
|--------|-------------|
| A | Booking ID |
| B | Customer Name |
| C | Email |
| D | Phone |
| E | Service/Product |
| F | Price |
| G | Booking Date |
| H | Start Time |
| I | End Time |
| J | Status |
| K | Special Requests |
| L | Total Price |
| M | Created At |

## Troubleshooting

### Issue: Bookings not appearing in Google Sheets

**Possible causes:**
- Google Sheets API not enabled in Google Cloud Console
- Service account doesn't have permission to write to the sheet
- Credentials JSON is incorrect
- Check console logs for error messages

**Solution:**
```bash
# Check logs
tail -f logs/app.log

# Verify service account has editor access to the sheet
```

### Issue: Emails not sending

**Possible causes:**
- SMTP credentials incorrect
- Firewall blocking SMTP port
- Gmail requires app-specific password (not regular password)

**Solution:**
```bash
# Test SMTP connection
node test-smtp.js  # Create this file to test connection
```

### Issue: Sync not detecting cancellations

**Possible causes:**
- Status column has a different value
- Webhook not being called
- Service account doesn't have read access

**Solution:**
- Ensure status is exactly "CANCELLED" (all caps)
- Check console logs when running sync
- Verify service account has Editor permissions

## Manual Sync Endpoint

You can manually trigger a sync at any time:

**GET Request:**
```
https://your-app.com/webhooks/google-sheets-sync?shop=default-shop
```

**POST Request:**
```bash
curl -X POST https://your-app.com/webhooks/google-sheets-sync \
  -H "Content-Type: application/json" \
  -d '{"shopDomain": "default-shop"}'
```

## Email Templates

The system sends three types of emails:

1. **Booking Confirmation (Business)**: Sent to COMPANY_EMAIL when payment is completed
2. **Booking Confirmation (Customer)**: Sent to customer when payment is completed
3. **Booking Cancellation**: Sent to customer when booking is cancelled from Google Sheets

All emails are HTML formatted and include booking details.

## Status Flow

```
Booking Created → Payment Pending → Payment Completed → CONFIRMED
                                                          ↓
                                              (if manager changes to "CANCELLED" in sheet)
                                                          ↓
                                                      CANCELLED
                                                          ↓
                                              (customer receives email)
```

## Next Steps

1. Set up cron job for automatic sync
2. Monitor logs for any errors
3. Test both directions of sync
4. Train team on using Google Sheets to manage bookings

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set
3. Test Google Sheets API permissions
4. Verify SMTP credentials

