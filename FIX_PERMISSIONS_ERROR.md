# 🔧 Fix Permissions Error

## ❌ Error You're Seeing:

```
Sync failed: Specified permissions are not sufficient to call UrlFetchApp.fetch. 
Required permissions: https://www.googleapis.com/auth/script.external_request
```

## ✅ Solution: Grant Permissions

### **Step 1: Run the Permission Request Function**

1. **Open Apps Script** (Extensions → Apps Script)
2. In the function dropdown (top toolbar), select **`requestPermissions`**
3. Click **"Run"** (▶️ button)
4. A popup will appear asking for authorization
5. Click **"Review Permissions"** or **"Allow"**

### **Step 2: Select Your Google Account**

- Select the Google account that owns the sheet
- Click **"Allow"**

### **Step 3: Grant All Permissions**

- Click **"Advanced"** → **"Go to [Project Name] (unsafe)"**
  - ⚠️ This is safe! Google shows this warning for external requests
- Click **"Allow"** to grant permissions

### **Step 4: Test the Connection**

1. Select function: **`testConnection`**
2. Click **"Run"**
3. Should show: "✅ Connection Test Successful!"

### **Step 5: Test the Sync**

1. Go back to your Google Sheet
2. Change a Status to `CANCELLED`
3. Should sync automatically without errors!

---

## 🐛 Still Not Working?

### **Check 1: Website URL is Correct**

1. Open Apps Script
2. Check this line:
   ```javascript
   const WEBSITE_URL = 'https://your-ngrok-url.ngrok-free.app/webhooks/google-sheets-sync?shop=default-shop';
   ```
3. Make sure it's updated with your actual URL
4. Test the URL in your browser - should show JSON response

### **Check 2: View Execution Logs**

1. In Apps Script, click **"Executions"** (clock icon ⏰)
2. Look for recent executions
3. Click on one to see detailed logs
4. Check for any errors

### **Check 3: View Logs**

1. In Apps Script, click **"View"** → **"Logs"**
2. Or click the bug icon 🐛
3. Should see messages like:
   ```
   🔄 Triggering sync...
   📡 Response Code: 200
   ✅ Sync successful!
   ```

### **Check 4: Manual Test**

1. Select function: **`manualSync`**
2. Click **"Run"**
3. Check the logs for errors
4. Should see success message

---

## 📋 Complete Setup Checklist

- [ ] Code pasted into Apps Script
- [ ] WEBSITE_URL updated with actual URL
- [ ] `requestPermissions` function run and permissions granted
- [ ] `testConnection` function run successfully
- [ ] Trigger set up (run `setupTrigger` function)
- [ ] Tested by changing Status to CANCELLED in sheet

---

## 🎯 Quick Fix Steps

**If you just want to fix it quickly:**

1. Open Apps Script
2. Select **`requestPermissions`** from dropdown
3. Click **"Run"**
4. Click **"Review Permissions"** → **"Allow"**
5. Done! ✅

Now try changing Status to CANCELLED again - should work!

---

## 💡 Understanding the Error

The error happens because:
- Google Apps Script needs **explicit permission** to make external HTTP requests
- The `UrlFetchApp.fetch()` function requires special permissions
- You must **manually grant** these permissions the first time

**Once granted, it will work automatically!** No need to grant permissions again.

---

## 🔍 Debugging Tips

### View Detailed Logs:
1. **Executions tab** - See when script ran and result
2. **Logs** - See console.log() messages
3. **Triggers** - Verify trigger is active

### Common Issues:
- ❌ URL not updated → Update WEBSITE_URL
- ❌ Permissions not granted → Run requestPermissions
- ❌ Website not accessible → Check ngrok is running
- ❌ Wrong Status column → Check STATUS_COLUMN number

---

**After fixing permissions, the sync should work automatically!** 🎉

