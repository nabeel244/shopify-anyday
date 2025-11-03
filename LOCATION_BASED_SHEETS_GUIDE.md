# 📊 Location-Based Google Sheets Integration Guide

## 🎯 Overview

The system now supports **location-based Google Sheets** - each city/location can have its own Google Sheet. Bookings from birthday centers in different locations will automatically sync to their respective sheets.

## ✨ Features

### 1. **Location-Based Sync**
- Each location/city can have its own Google Sheet
- Bookings automatically sync to the sheet that matches the center's location
- Example: 
  - **Tbilisi** bookings → **Sheet 1**
  - **Batumi** bookings → **Sheet 2**
  - **Kutaisi** bookings → **Sheet 3**

### 2. **Bidirectional Sync - Cancellation from Sheets**
- ✅ **YES!** Managers can cancel bookings directly from Google Sheets
- When a manager writes "CANCELLED" in the Status column, the booking is automatically cancelled on the website
- When a manager deletes a row, the booking is cancelled
- The system syncs cancellations from all location sheets periodically

## 📋 Setup Instructions

### Step 1: Configure Google Sheets for Each Location

1. **Go to Admin Panel** → **Google Sheets Configuration**
2. **For each location**, fill in:
   - **Location/City**: Enter the city name (must match the `city` field in your Product Booking Config)
     - Examples: `Tbilisi`, `Batumi`, `Kutaisi`
   - **Spreadsheet ID**: Your Google Sheet ID
   - **Sheet Name**: The sheet tab name (e.g., `Bookings`)
   - **Service Account Credentials**: JSON credentials from Google Cloud

3. **Save** - The configuration is saved for that location

4. **Repeat** for each location you have birthday centers in

### Step 2: Ensure Product Configurations Match

Make sure your **Product Booking Configurations** have the `city` field set correctly:

- Product "Birthday Center DEJAVU" → City: `Tbilisi`
- Product "Birthday Center ABC" → City: `Batumi`

The system will automatically match bookings to the correct sheet based on the `city` field.

## 🔄 How It Works

### Booking Creation Flow

1. **Customer books** a birthday center
2. System checks the center's `city` field from `ProductBookingConfig`
3. System finds the Google Sheet config for that location
4. Booking is synced to the **correct location's sheet**

### Cancellation from Sheets

Managers can cancel bookings in two ways:

#### Method 1: Set Status to "CANCELLED"
1. Open the Google Sheet
2. Find the booking row
3. In the **Status** column, change the value to `CANCELLED`
4. Save the sheet
5. System will sync and cancel the booking automatically

#### Method 2: Delete the Row
1. Open the Google Sheet
2. Find the booking row
3. Delete the entire row
4. System will detect the deletion and cancel the booking

### Automatic Sync

The system syncs cancellations from Google Sheets:

- **Manual Sync**: Call the endpoint `/webhooks/google-sheets-sync`
- **Automatic Sync**: Set up a cron job to call this endpoint periodically

The sync checks **all configured locations** and updates bookings accordingly.

## 📝 Google Sheet Format

Each sheet should have these columns:

```
Booking ID | Customer Name | Email | Phone | Service/Product | Price | 
Booking Date | Start Time | End Time | Status | Special Requests | 
Total Price | Created At
```

### Important Notes:

1. **Status Column**: 
   - `CONFIRMED` - Booking is active
   - `CANCELLED` - Booking is cancelled (will sync to website)
   - Other statuses are ignored

2. **Booking ID Column**: 
   - Must match the booking ID from the website
   - This is used to link sheet rows to database bookings

3. **Location Matching**: 
   - The `city` field in `ProductBookingConfig` must match the `location` field in `GoogleSheetConfig`
   - Example: Product has `city: "Tbilisi"` → Must configure Google Sheet with `location: "Tbilisi"`

## 🔧 API Endpoints

### Sync All Locations
```bash
GET /webhooks/google-sheets-sync?shop=default-shop
```

### Sync Specific Location
```bash
GET /webhooks/google-sheets-sync?shop=default-shop&location=Tbilisi
```

### POST Sync (with body)
```json
POST /webhooks/google-sheets-sync
{
  "shopDomain": "default-shop",
  "location": "Tbilisi" // Optional: sync specific location
}
```

## 📊 Example: Multiple Locations

### Setup Example:

**Location 1 - Tbilisi:**
- Location: `Tbilisi`
- Spreadsheet ID: `abc123...`
- Sheet Name: `Bookings`

**Location 2 - Batumi:**
- Location: `Batumi`
- Spreadsheet ID: `xyz789...`
- Sheet Name: `Bookings`

**Location 3 - Kutaisi:**
- Location: `Kutaisi`
- Spreadsheet ID: `def456...`
- Sheet Name: `Bookings`

### Booking Flow:

1. Customer books "DEJAVU" (city: `Tbilisi`) → Syncs to Tbilisi sheet
2. Customer books "ABC Center" (city: `Batumi`) → Syncs to Batumi sheet
3. Customer books "XYZ Place" (city: `Kutaisi`) → Syncs to Kutaisi sheet

## ⚠️ Important Notes

1. **Location Names Must Match**: 
   - The `city` field in `ProductBookingConfig` must exactly match the `location` field in `GoogleSheetConfig`
   - Example: If product has `city: "Tbilisi"`, Google Sheet config must have `location: "Tbilisi"` (case-sensitive)

2. **Fallback Behavior**:
   - If no sheet config exists for a location, the system falls back to the first available config
   - If no configs exist, bookings won't sync to sheets

3. **Multiple Centers, Same Location**:
   - All centers in the same city share the same Google Sheet
   - Example: 5 Tbilisi centers → All bookings go to the Tbilisi sheet

4. **Cancellation Sync**:
   - Cancellations sync from all location sheets
   - The system checks each location's sheet for `CANCELLED` status or deleted rows
   - Customer receives automatic cancellation email

## 🚀 Setting Up Automatic Sync

To automatically sync cancellations from Google Sheets, set up a cron job:

```bash
# Run every 5 minutes
*/5 * * * * curl https://your-domain.com/webhooks/google-sheets-sync?shop=default-shop
```

Or use a service like:
- **Vercel Cron Jobs**
- **GitHub Actions**
- **Google Cloud Scheduler**
- Any other cron service

## ✅ Verification Checklist

- [ ] Google Sheets configured for each location
- [ ] Location names match `city` field in Product Booking Configs
- [ ] Service account credentials are correct
- [ ] Google Sheets are shared with service account email
- [ ] Test booking syncs to correct location's sheet
- [ ] Test cancellation from sheet syncs back to website
- [ ] Automatic sync is set up (optional)

## 🎉 Summary

✅ **Location-based Google Sheets** - Each city has its own sheet  
✅ **Automatic location matching** - Bookings sync to correct sheet based on city  
✅ **Bidirectional cancellation** - Cancel from sheets → Reflects on website  
✅ **Multiple location support** - Configure unlimited locations  
✅ **Automatic sync** - Set up periodic sync for cancellations  

The system is now fully location-aware and supports multiple Google Sheets based on location!

