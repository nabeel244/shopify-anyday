# 🔧 Step-by-Step: Fix Permissions Error

## ❌ Error You're Seeing:

```
Sync failed: Failed to connect: Exception: 
Specified permissions are not sufficient to call UrlFetchApp.fetch. 
Required permissions:
```

---

## ✅ **QUICK FIX (5 Steps):**

### **Step 1: Open Apps Script**
1. Open your Google Sheet
2. Click **"Extensions"** → **"Apps Script"**

### **Step 2: Select Function**
1. At the top toolbar, you'll see a **function dropdown** (it might say "onEdit" or be empty)
2. Click the dropdown and select **`requestPermissions`**

### **Step 3: Click Run**
1. Click the **"Run" (▶️)** button (green play button in the toolbar)
2. You'll see a popup asking for authorization

### **Step 4: Grant Permissions**
1. Click **"Review Permissions"** (or "Continue" or "Allow")
2. Select your **Google account**
3. You'll see a warning: **"Google hasn't verified this app"**
4. Click **"Advanced"**
5. Click **"Go to [Your Project Name] (unsafe)"**
6. Click **"Allow"**

### **Step 5: Test It**
1. Run **`requestPermissions`** again
2. Should see: **"✅ Permissions Granted!"**
3. Now change Status to `CANCELLED` in your sheet
4. It should work! ✅

---

## 📸 **Visual Guide:**

### **In Apps Script Editor:**

```
┌─────────────────────────────────────────┐
│ [function dropdown ▼]  [▶️ Run]          │
│                                         │
│ Select: requestPermissions              │
│ Then click: [▶️ Run]                    │
└─────────────────────────────────────────┘
```

### **When You Click Run:**

```
┌─────────────────────────────────────────┐
│  Authorization Required                 │
│                                         │
│  [Review Permissions]  [Cancel]        │
└─────────────────────────────────────────┘
```

### **In Permission Screen:**

```
┌─────────────────────────────────────────┐
│  Google hasn't verified this app       │
│                                         │
│  [Advanced]                             │
│  ↓                                     │
│  [Go to [Project Name] (unsafe)]       │
│                                         │
│  [Allow]                               │
└─────────────────────────────────────────┘
```

---

## 🔍 **Detailed Instructions:**

### **1. Open Apps Script Editor**

1. **Go to your Google Sheet**
2. **Click "Extensions"** in the top menu
3. **Click "Apps Script"**
4. A new tab will open with the code editor

### **2. Select the Function**

In the Apps Script editor:

1. **Look at the top toolbar**
2. **Find the function dropdown** (next to the "Run" button)
   - It might currently show "onEdit" or be empty
3. **Click the dropdown**
4. **Select `requestPermissions`** from the list

### **3. Run the Function**

1. **Click the "Run" button** (▶️ green play button)
2. **A popup will appear** asking for authorization

### **4. Grant Permissions (IMPORTANT!)**

When the popup appears:

**Option A: If you see "Authorization Required"**
1. Click **"Review Permissions"**
2. Select your Google account
3. You'll see: **"Google hasn't verified this app"**
4. Click **"Advanced"** (at the bottom)
5. Click **"Go to [Your Project Name] (unsafe)"**
6. Click **"Allow"**

**Option B: If you see "Review Permissions"**
1. Click **"Review Permissions"**
2. Select your Google account
3. Click **"Advanced"** → **"Go to [Project Name] (unsafe)"**
4. Click **"Allow"**

**⚠️ Important:** You MUST click "Advanced" → "Go to [Project Name] (unsafe)" to grant external request permissions!

### **5. Verify Permissions**

1. **Run `requestPermissions` again**
2. **Should see success message:**
   ```
   ✅ Permissions Granted!
   The script can now connect to your website.
   ```
3. **If you see this, permissions are granted!** ✅

### **6. Test the Sync**

1. **Go back to your Google Sheet**
2. **Find a booking with Status = `CONFIRMED`**
3. **Change Status to `CANCELLED`**
4. **Wait 2-3 seconds**
5. **Should see success toast:** "✅ Sync successful!"
6. **Check your website** - booking should be cancelled!

---

## 🆘 **Troubleshooting:**

### **Problem 1: "Review Permissions" button doesn't appear**

**Solution:**
1. Close the popup
2. Click **"Run" (▶️)** again
3. This time it should show the permission dialog

### **Problem 2: Can't find "Advanced" option**

**Solution:**
1. Scroll down on the warning page
2. Look for small text at the bottom
3. Click on the project name or "unsafe" link
4. Or try refreshing the page

### **Problem 3: Still getting permission error after granting**

**Solution:**
1. **Check website URL** in script:
   - Should NOT say `your-ngrok-url`
   - Should be your actual URL
2. **Run `requestPermissions` again**
3. **Make sure you clicked "Allow"**

### **Problem 4: "Website URL not configured" error**

**Solution:**
1. **Open Apps Script editor**
2. **Find this line:**
   ```javascript
   const WEBSITE_URL = 'https://your-ngrok-url.ngrok-free.app/webhooks/google-sheets-sync?shop=default-shop';
   ```
3. **Replace `your-ngrok-url`** with your actual ngrok URL
4. **Save the file**
5. **Run `requestPermissions` again**

---

## ✅ **Success Checklist:**

After following these steps, you should have:

- [ ] ✅ Run `requestPermissions` function
- [ ] ✅ Clicked "Review Permissions"
- [ ] ✅ Selected your Google account
- [ ] ✅ Clicked "Advanced" → "Go to [Project Name] (unsafe)"
- [ ] ✅ Clicked "Allow"
- [ ] ✅ Saw success message: "Permissions Granted!"
- [ ] ✅ Changed Status to CANCELLED in sheet
- [ ] ✅ Sync worked without errors!

---

## 🎯 **After Fixing Permissions:**

Once permissions are granted:

1. **The error will stop appearing**
2. **Sync will work automatically** when you change Status to CANCELLED
3. **No need to grant permissions again** (one-time setup)
4. **Works for all users** with access to the sheet

---

## 📝 **Quick Reference:**

**Function to run:** `requestPermissions`  
**Button to click:** "Run" (▶️)  
**Dialog to click:** "Review Permissions" → "Advanced" → "Go to [Project] (unsafe)" → "Allow"  
**Time needed:** 2 minutes  
**Result:** Automatic sync working! ✅

---

**Follow these steps exactly, and the permissions error will be fixed!** 🎉

