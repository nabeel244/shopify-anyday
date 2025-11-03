# 🔧 Troubleshooting Google Sheets Configuration Error

## Error: 500 Internal Server Error when saving config

### Step 1: Check Server Logs

The server should now show detailed error messages. Check your **server console/terminal** for:
- Error messages starting with "Failed to save Google Sheets config:"
- Database error details
- Stack traces

### Step 2: Common Issues & Solutions

#### Issue 1: Location Field Empty

**Problem:** If location is empty, it defaults to 'default'. If you already have a config with location='default', you'll get a unique constraint error.

**Solution:**
- Enter a specific location name (e.g., "Tbilisi", "Test", "Batumi")
- Or delete the existing 'default' config first

#### Issue 2: Invalid JSON Credentials

**Problem:** The service account credentials JSON is malformed.

**Solution:**
- Make sure you copied the **entire** JSON file contents
- Verify it's valid JSON (no extra characters)
- JSON should start with `{` and end with `}`

#### Issue 3: Database Constraint Error

**Problem:** Unique constraint violation - location already exists for this shop.

**Solution:**
- Each location can only have one config per shop
- Either:
  - Use a different location name
  - Or update the existing config (it will update automatically if location matches)

#### Issue 4: Google Sheets API Not Enabled

**Problem:** Google Sheets API not enabled in Google Cloud.

**Solution:**
- Go to Google Cloud Console
- Enable Google Sheets API for your project

#### Issue 5: Service Account Permissions

**Problem:** Service account doesn't have access to the sheet.

**Solution:**
- Share your Google Sheet with the service account email
- Give it "Editor" permissions
- Service account email is in the JSON: `client_email` field

### Step 3: Verify Your Data

Before saving, check:
- ✅ Spreadsheet ID is correct (long string between `/d/` and `/edit` in URL)
- ✅ Sheet Name matches the actual sheet tab name (case-sensitive)
- ✅ Location field is filled (e.g., "Test" or "Tbilisi")
- ✅ Credentials JSON is complete and valid

### Step 4: Check Browser Console

Open browser developer tools (F12) and check:
- Network tab → Look at the POST request to `/api/google-sheets-config`
- Response tab → See the actual error message

### Step 5: Database Check

If you suspect database issues, you can check existing configs:

```bash
# Check database (if you have access to Prisma Studio)
npx prisma studio
```

Or check the table directly:
```sql
SELECT * FROM google_sheet_configs;
```

## Quick Fix: Try This

1. **Fill Location Field**: Make sure location is not empty (e.g., enter "Test")
2. **Check Credentials**: Paste the entire JSON file content (no extra spaces)
3. **Check Server Logs**: Look for the actual error message
4. **Try Different Location**: If "Test" doesn't work, try "Tbilisi" or another name

## Detailed Error Messages

The system now shows detailed error messages:
- **In Browser**: Check the error banner message
- **In Server Logs**: Check terminal/console for full error details
- **Network Response**: Check browser Network tab for response body

## Still Not Working?

1. **Check server terminal/console** - Error details are logged there
2. **Share the error message** - The exact error message will help identify the issue
3. **Verify database migration** - Run: `npx prisma migrate status`

## Expected Behavior

When you click "Save Configuration":
1. System validates all fields
2. Validates JSON credentials
3. Saves to database
4. Initializes Google Sheets service
5. Sets up headers in the sheet
6. Returns success message

If any step fails, you'll see an error with details.

