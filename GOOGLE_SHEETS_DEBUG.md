# 🔍 Debugging Google Sheets Sync Issues

## Problem: Bookings not appearing in Google Sheets

### Step 1: Check Console Logs

When you create a booking, check your **server console/terminal** for these messages:

#### ✅ Success Messages:
- `🧪 TEST MODE: Booking auto-confirmed`
- `🔄 Attempting to sync to Google Sheets...`
- `Location from productBookingConfig: [city name]`
- `Using location: [location name]`
- `✅ Google Sheets service initialized successfully`
- `📊 Adding booking to Google Sheets: [booking-id]`
- `✅ Booking added to Google Sheets successfully`

#### ❌ Error Messages:
- `❌ Google Sheets service failed to initialize`
- `Google Sheets configuration not found or inactive`
- `❌ Failed to sync to Google Sheets`

### Step 2: Common Issues

#### Issue 1: Location Mismatch ⚠️ **MOST COMMON**

**Problem:** The `city` field in Product Booking Config doesn't match the `location` in Google Sheets Config.

**Solution:**
1. Check Product Booking Config:
   - Go to Admin → Product Config
   - Check the **City** field value (e.g., "Tbilisi", "Test")

2. Check Google Sheets Config:
   - Go to Admin → Google Sheets Configuration
   - Check the **Location** field value (e.g., "Tbilisi", "Test")

3. **They must match exactly** (case-sensitive):
   - ✅ Product `city: "Tbilisi"` → Sheet `location: "Tbilisi"` ✓
   - ❌ Product `city: "Tbilisi"` → Sheet `location: "tbilisi"` ✗
   - ❌ Product `city: "Tbilisi"` → Sheet `location: ""` ✗

#### Issue 2: Google Sheets Not Configured

**Problem:** No Google Sheets config exists for the location.

**Solution:**
- Go to Admin → Google Sheets Configuration
- Make sure you've saved a configuration for the location
- Check "Configured Locations" section - your location should appear there

#### Issue 3: Service Account Permissions

**Problem:** Service account doesn't have access to the sheet.

**Solution:**
1. Open your Google Sheet
2. Click "Share" button
3. Add the service account email (from JSON credentials: `client_email` field)
4. Give it "Editor" permissions
5. Click "Share"

#### Issue 4: Invalid Credentials

**Problem:** Service account credentials are invalid or incomplete.

**Solution:**
1. Go to Admin → Google Sheets Configuration
2. Click "Test Connection" button
3. If it fails, check:
   - Credentials JSON is complete
   - No extra characters or formatting issues
   - JSON file was downloaded correctly

### Step 3: Use Diagnostic Endpoint

Test your Google Sheets configuration:

```bash
# Test config only
GET /api/test-google-sheets-sync?location=Tbilisi

# Test config + sync a specific booking
GET /api/test-google-sheets-sync?location=Tbilisi&bookingId=your-booking-id
```

**Example using browser:**
```
http://localhost:3000/api/test-google-sheets-sync?location=Test
```

### Step 4: Verify Data

#### Check Product Booking Config:
```sql
-- Check what city is set for your products
SELECT id, productTitle, city FROM product_booking_configs;
```

#### Check Google Sheets Config:
```sql
-- Check configured locations
SELECT location, spreadsheetId, sheetName, isActive 
FROM google_sheet_configs 
WHERE shopDomain = 'default-shop';
```

#### Check Booking Data:
```sql
-- Check booking and its related product config
SELECT 
  b.id,
  b.status,
  pbc.city as productCity,
  u.firstName,
  u.lastName
FROM bookings b
LEFT JOIN product_booking_configs pbc ON b.productBookingConfigId = pbc.id
LEFT JOIN users u ON b.userId = u.id
ORDER BY b.createdAt DESC
LIMIT 5;
```

### Step 5: Manual Test

1. **Create a test booking** (with payment bypass enabled)
2. **Check server console** for all the log messages
3. **Look for**:
   - What location is being used
   - Whether config is found
   - Whether initialization succeeds
   - Any error messages

### Step 6: Check Google Sheet

1. Open your Google Sheet
2. Go to the sheet tab name you configured (e.g., "Bookings")
3. Check if headers were created:
   - Row 1 should have: Booking ID, Customer Name, Email, Phone, etc.
4. Check if data appears below headers

## Quick Diagnostic Checklist

- [ ] Location in Product Config matches Location in Google Sheets Config
- [ ] Google Sheets config exists and is active
- [ ] Service account has Editor access to the sheet
- [ ] Credentials JSON is valid (test connection succeeds)
- [ ] Sheet name matches the actual tab name in Google Sheet
- [ ] Server console shows successful initialization messages
- [ ] No error messages in server console

## Expected Console Output (Success)

```
🧪 TEST MODE: Booking auto-confirmed (payment bypassed)
   Customer: John Doe
   Date: Mon Nov 04 2024
   Time: 14:00 - 22:00
   Service: Test Birthday Center
   Total Price: $100
   Booking ID: clx1234567890
🔄 Attempting to sync to Google Sheets...
   Location from productBookingConfig: Test
   Using location: Test
✅ Google Sheets initialized for default-shop - Location: Test
✅ Google Sheets service initialized successfully
📊 Adding booking to Google Sheets: clx1234567890
   Spreadsheet ID: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
   Sheet Name: Bookings
   Location: Test
📊 Appending booking row to sheet: Bookings
✅ Booking added to Google Sheets successfully: clx1234567890
   Updated cells: 13
   Updated range: Bookings!A2:M2
✅ Synced to Google Sheets for location: Test
```

## If Still Not Working

1. **Share the console output** from your server
2. **Check the diagnostic endpoint** response
3. **Verify** location names match exactly
4. **Test connection** in admin panel
5. **Check** Google Sheet permissions

The enhanced logging should now show you exactly where the issue is!

