# 🔄 Automatic Sync Setup - No Button Required!

## ✅ How It Works

When someone changes the **Status** column in Google Sheets to `CANCELLED`, it will **automatically sync to your website** in real-time - no button click needed!

---

## 📋 Step-by-Step Setup (5 Minutes)

### Step 1: Open Google Apps Script

1. **Open your Google Sheet** (the one connected to your website)
2. Click **"Extensions"** in the menu bar
3. Click **"Apps Script"**
4. A new tab will open with the Apps Script editor

### Step 2: Paste the Code

1. **Delete all existing code** in the editor (if any)
2. **Open the file**: `google-apps-script-auto-sync.gs` (provided in this project)
3. **Copy all the code** from that file
4. **Paste it** into the Apps Script editor

### Step 3: Configure Your Website URL

1. **Find this line** in the code:
   ```javascript
   const WEBSITE_URL = 'https://your-ngrok-url.ngrok-free.app/webhooks/google-sheets-sync?shop=default-shop';
   ```

2. **Replace `your-ngrok-url`** with your actual website URL
   
   **Example:**
   ```javascript
   const WEBSITE_URL = 'https://2d65d8470472.ngrok-free.app/webhooks/google-sheets-sync?shop=default-shop';
   ```
   
   ⚠️ **Important:** 
   - If using ngrok, replace with your ngrok URL
   - For production, use your actual domain URL
   - Keep `?shop=default-shop` at the end

### Step 4: Check Status Column

1. **Find this line** in the code:
   ```javascript
   const STATUS_COLUMN = 10; // Column J
   ```
   
2. **Check your Google Sheet** - what column is "Status" in?
   - Column A = 1
   - Column B = 2
   - Column C = 3
   - ...
   - Column J = 10
   - Column K = 11
   
3. **Update the number** if your Status column is different

### Step 5: Save and Authorize

1. Click **"Save"** (💾 icon or Ctrl+S)
2. Give it a name like: `"Auto Sync to Website"`
3. Click **"Run"** (▶️ icon)
4. **Authorize the script** (if prompted):
   - Click "Review Permissions"
   - Select your Google account
   - Click "Advanced" → "Go to [Project Name] (unsafe)"
   - Click "Allow"
   
   ⚠️ **This is safe** - the script only needs permission to:
   - Read/edit your sheet
   - Make HTTP requests to your website

### Step 6: Set Up the Trigger

1. **Click the clock icon** (⏰) on the left sidebar - "Triggers"
2. Click **"+ Add Trigger"** (bottom right)
3. Fill in:
   - **Function to run:** `onEdit`
   - **Event source:** `From spreadsheet`
   - **Event type:** `On edit`
4. Click **"Save"**
5. **Done!** ✅

---

## 🎯 How It Works Now

### Automatic Flow:

1. **Manager opens Google Sheet**
2. **Changes Status column** from `CONFIRMED` to `CANCELLED`
3. **Google Apps Script automatically detects** the change
4. **Sends sync request** to your website (automatically!)
5. **Website updates** the booking status to `CANCELLED`
6. **Time slot becomes available** again
7. **Customer receives** cancellation email

**All happens automatically - no button click needed!** 🎉

---

## ✅ Testing

### Test the Automatic Sync:

1. **Open your Google Sheet**
2. **Find a booking** with Status = `CONFIRMED`
3. **Change Status** to `CANCELLED`
4. **Wait 2-3 seconds**
5. **Check your website/admin panel** - booking should be cancelled!
6. **Time slot should be available** for new bookings

### Check if It's Working:

1. **Open Apps Script** (Extensions > Apps Script)
2. **Click "View"** → **"Logs"** (or click the bug icon 🐛)
3. You should see messages like:
   ```
   Status changed to CANCELLED for booking: [booking-id]
   Triggering sync to: [your-url]
   Response Code: 200
   Sync successful!
   ```

---

## 🔧 Troubleshooting

### Not Working?

#### 1. Check the Website URL
- Open Apps Script editor
- Make sure `WEBSITE_URL` has your correct website URL
- Test the URL in your browser: `https://your-url/webhooks/google-sheets-sync?shop=default-shop`
- Should return a JSON response

#### 2. Check Status Column Number
- Make sure `STATUS_COLUMN` matches your actual Status column
- Count columns: A=1, B=2, C=3, ..., J=10, K=11
- Update the number if needed

#### 3. Check Trigger is Set Up
- Go to Apps Script → Click clock icon ⏰ (Triggers)
- Make sure you see a trigger with:
  - Function: `onEdit`
  - Event: `On edit`
  - Status: Active

#### 4. Check Permissions
- Run the script manually (click "Run" ▶️)
- If it asks for permissions again, click "Allow"

#### 5. Test Manually
- In Apps Script, click "Run" ▶️
- Select function: `manualSync`
- Click "Run"
- Check the logs for any errors

---

## 📝 Important Notes

### Status Values:
- Script detects: `CANCELLED`, `Cancelled`, `cancelled` (case-insensitive)
- Any case variation works

### Real-Time Updates:
- Sync happens **immediately** when status is changed
- Usually takes 1-3 seconds to sync to website
- No delay, no manual button needed!

### Multiple Users:
- **Any user** with edit access to the sheet can cancel bookings
- Changes automatically sync to website
- Works for all users simultaneously

### Website URL Changes:
- If your ngrok URL changes, **update `WEBSITE_URL`** in Apps Script
- For production, use your permanent domain URL

---

## 🎉 Summary

**Before:** Had to click "Sync Now" button manually  
**Now:** Changes in Google Sheets automatically sync to website! ✅

**Setup Time:** 5 minutes  
**Maintenance:** None (just update URL if it changes)  
**Works:** 24/7 automatically  

**No button needed - it's fully automatic!** 🚀

---

## 📞 Support

If you need help:
1. Check the **Troubleshooting** section above
2. Check Apps Script **Logs** (View → Logs)
3. Make sure your website is accessible from the internet
4. Verify the sync endpoint URL is correct

