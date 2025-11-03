# 🔄 Google Sheets Sync Instructions

## How to Sync Cancellations from Google Sheets to Website

When a manager changes the **Status** column from `CONFIRMED` to `CANCELLED` in Google Sheets, you need to trigger a sync to update the website.

### Method 1: Manual Sync (Immediate)

Call the sync endpoint to sync cancellations:

```bash
GET /webhooks/google-sheets-sync?shop=default-shop
```

Or for a specific location:
```bash
GET /webhooks/google-sheets-sync?shop=default-shop&location=Tbilisi
```

**In Browser:**
```
http://localhost:3000/webhooks/google-sheets-sync?shop=default-shop
```

**Using curl:**
```bash
curl http://localhost:3000/webhooks/google-sheets-sync?shop=default-shop
```

### Method 2: Automatic Sync (Recommended)

Set up automatic sync that runs periodically (every 5-10 minutes).

#### Option A: Using Browser Automation
Create a simple HTML page that refreshes and calls the sync endpoint:

```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="300">
    <script>
        fetch('/webhooks/google-sheets-sync?shop=default-shop')
            .then(r => r.json())
            .then(data => console.log('Sync result:', data));
    </script>
</head>
<body>
    <h1>Auto-syncing every 5 minutes...</h1>
</body>
</html>
```

#### Option B: Using Cron Job (Server)

**Linux/Mac:**
```bash
# Edit crontab
crontab -e

# Add this line (runs every 5 minutes)
*/5 * * * * curl http://your-domain.com/webhooks/google-sheets-sync?shop=default-shop
```

**Windows Task Scheduler:**
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: Every 5 minutes
4. Action: Start a program
5. Program: `curl`
6. Arguments: `http://your-domain.com/webhooks/google-sheets-sync?shop=default-shop`

#### Option C: Using Online Cron Services

Use services like:
- **EasyCron** (https://www.easycron.com)
- **Cronitor** (https://cronitor.io)
- **UptimeRobot** (https://uptimerobot.com)

Set URL: `https://your-domain.com/webhooks/google-sheets-sync?shop=default-shop`
Interval: Every 5 minutes

#### Option D: Using GitHub Actions (Free)

Create `.github/workflows/sync-sheets.yml`:

```yaml
name: Sync Google Sheets
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:  # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Sync Sheets
        run: |
          curl https://your-domain.com/webhooks/google-sheets-sync?shop=default-shop
```

## How It Works

1. **Manager changes Status in Google Sheet:**
   - Opens Google Sheet
   - Finds booking row
   - Changes Status column from `CONFIRMED` to `CANCELLED`
   - Saves the sheet

2. **Sync is triggered:**
   - Either manually call the endpoint
   - Or wait for automatic sync (if configured)

3. **System processes changes:**
   - Reads all bookings from Google Sheet
   - Checks Status column for each booking
   - Finds bookings with `CANCELLED` status (case-insensitive)
   - Updates database: Sets booking status to `CANCELLED`
   - **Automatically frees up the time slot** (excluded from availability checks)
   - Sends cancellation email to customer

4. **Website reflects changes:**
   - Admin panel shows booking as `CANCELLED`
   - Time slot becomes available for new bookings
   - Customer receives cancellation email

## Status Values (Case-Insensitive)

The system accepts these status values (any case):
- `CONFIRMED` / `Confirmed` / `confirmed` → Booking is active
- `CANCELLED` / `Cancelled` / `cancelled` → Booking is cancelled (triggers sync)

## Testing Sync

1. **Create a test booking** (with payment bypass)
2. **Check Google Sheet** - booking should appear
3. **Change Status to `CANCELLED`** in the sheet
4. **Call sync endpoint** manually or wait for auto-sync
5. **Check admin panel** - booking should show as `CANCELLED`
6. **Try to book the same time slot** - should now be available

## Troubleshooting

### Sync not working?

1. **Check console logs** when calling sync endpoint:
   ```
   🔄 Syncing Google Sheets for location: Tbilisi
   📊 Found X bookings in Google Sheet
   ✅ Found X cancelled bookings in Tbilisi
   ```

2. **Check Status column format:**
   - Must be exactly `CANCELLED` (case-insensitive)
   - No extra spaces
   - Value must be in the Status column

3. **Check booking exists:**
   - Booking ID in sheet must match database
   - Booking must be in `CONFIRMED` or `PENDING` status (not already cancelled)

4. **Manual test:**
   ```bash
   GET /api/test-google-sheets-sync?location=Tbilisi
   ```

### Time slot still not available?

1. **Check availability API:**
   ```bash
   GET /api/availability?date=2024-11-15&productBookingConfigId=xxx
   ```

2. **Verify booking status in database:**
   - Booking should be `CANCELLED`
   - Not `CONFIRMED` or `PENDING`

3. **Clear browser cache** if testing in browser

## Summary

✅ **Status changes sync automatically** when sync endpoint is called  
✅ **Time slots are freed** when booking is cancelled  
✅ **Admin panel updates** to show cancelled status  
✅ **Customer receives email** notification  
✅ **Works with location-based sheets**  

Just remember to **trigger the sync** (manually or automatically) after making changes in Google Sheets!

