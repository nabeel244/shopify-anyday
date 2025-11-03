# ⚡ Quick Setup - Automatic Sync (2 Minutes!)

## 🎯 Goal
When someone changes Status to `CANCELLED` in Google Sheets, it automatically updates on your website - **no button needed!**

---

## 📋 Setup Steps

### 1. Open Apps Script
- Open your Google Sheet
- Click **Extensions** → **Apps Script**

### 2. Paste Code
- Open `google-apps-script-auto-sync.gs` file
- Copy all code
- Paste in Apps Script editor

### 3. Update URL
Find this line:
```javascript
const WEBSITE_URL = 'https://your-ngrok-url.ngrok-free.app/webhooks/google-sheets-sync?shop=default-shop';
```

Replace with your actual URL:
```javascript
const WEBSITE_URL = 'https://2d65d8470472.ngrok-free.app/webhooks/google-sheets-sync?shop=default-shop';
```

### 4. Check Status Column
If your Status column is NOT column J:
- Update `const STATUS_COLUMN = 10;` to your column number
- A=1, B=2, C=3, ..., J=10

### 5. Save & Run
- Click **Save** 💾
- Click **Run** ▶️
- Click **Authorize** if asked

### 6. Set Trigger
- Click clock icon ⏰ (Triggers)
- Click **+ Add Trigger**
- Set:
  - Function: `onEdit`
  - Event: `On edit`
- Click **Save**

### 7. Done! ✅
- Change Status to `CANCELLED` in sheet
- It automatically syncs to website!

---

## ✅ Test It
1. Change Status = `CANCELLED` in Google Sheet
2. Wait 2 seconds
3. Check admin panel - booking should be cancelled!

---

## 🆘 Not Working?
- Check URL is correct (test in browser)
- Check Status column number
- Check trigger is set up (clock icon ⏰)
- Check Apps Script logs (View → Logs)

---

**That's it! Now it's fully automatic!** 🎉

