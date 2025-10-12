# 🎯 Collection Page Filters - Complete Setup Guide

## 📌 Overview

This guide will help you add **fully functional filters** to your Dawn theme collection pages. Filters work based on your product configurations: **Date, Time, and Services**.

## 🎁 What You Get

- **📅 Date Filter** - Filter by booking dates (checks date range + available days)
- **⏰ Time Slot Filter** - Filter by available time slots
- **🎭 Services Filter** - Filter by configured services
- **Real-time filtering** - No page reload needed
- **Detailed console logs** - See exactly what's happening
- **Mobile responsive** - Works on all devices

---

## 🚀 Installation (3 Easy Steps)

### Step 1: Upload Filter Snippet

1. Go to **Shopify Admin** → **Online Store** → **Themes**
2. Click **Actions** → **Edit code**
3. In **Snippets** folder, click **Add a new snippet**
4. Name it: `collection-filters-simple`
5. Copy content from `public/snippets/collection-filters-simple.liquid`
6. Paste and **Save**

### Step 2: Set Your API URL

Add this code to your theme's `<head>` section:

1. Open **Layout** → `theme.liquid`
2. Find `</head>`
3. Add this **BEFORE** `</head>`:

```liquid
<!-- Collection Filter API Configuration -->
<script>
  // IMPORTANT: Update this URL with your ngrok URL from 'npm run dev'
  window.shopifyAppApiUrl = 'https://YOUR-NGROK-URL.ngrok-free.app';
</script>
```

**Example:**
```liquid
<script>
  window.shopifyAppApiUrl = 'https://cdcc902533c4.ngrok-free.app';
</script>
</head>
```

⚠️ **You'll need to update this URL each time you restart your dev server** (unless you use a paid ngrok plan with a static URL)

### Step 3: Add Filters to Collection Page

**For Dawn Theme (JSON Templates):**

1. In **Edit code**, find `templates/collection.json`
2. Find the `"sections"` object
3. Add this section **BEFORE** the product grid section:

```json
{
  "type": "collection",
  "name": "Collection",
  "sections": {
    "collection-filters": {
      "type": "custom-liquid",
      "settings": {
        "custom_liquid": "{% render 'collection-filters-simple' %}"
      }
    },
    "product-grid": {
      "type": "main-collection-product-grid",
      "settings": {
      }
    }
  },
  "order": [
    "collection-filters",
    "product-grid"
  ]
}
```

**For Dawn Theme (Using Theme Editor):**

1. Go to **Themes** → **Customize**
2. Navigate to **Products** → **Collection**
3. Click **Add section** → **Custom Liquid**
4. Paste: `{% render 'collection-filters-simple' %}`
5. Drag section to sidebar area
6. Click **Save**

**For Older Dawn or Custom Theme:**

Edit `sections/main-collection-product-grid.liquid`:

```liquid
<div class="collection{% if section.settings.filter_type == 'vertical' %} page-width{% endif %}">
  <div class="collection-container">
    
    <!-- Add this filter section -->
    <aside class="collection-sidebar">
      {% render 'collection-filters-simple' %}
    </aside>
    
    <!-- Your existing product grid -->
    <div class="product-grid-container">
      <div class="collection-product-grid">
        <!-- existing grid code -->
      </div>
    </div>
    
  </div>
</div>
```

Then add this CSS (add to `assets/theme.css` or `assets/base.css`):

```css
/* Collection Filter Layout */
.collection-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
  max-width: var(--page-width);
  margin: 0 auto;
  padding: 0 var(--spacing-unit);
}

.collection-sidebar {
  position: sticky;
  top: 20px;
  height: fit-content;
}

@media (max-width: 990px) {
  .collection-container {
    grid-template-columns: 1fr;
  }
  
  .collection-sidebar {
    position: static;
  }
}
```

### Step 4: Add Product IDs (CRITICAL!)

Find your product card file (one of these):
- `snippets/card-product.liquid`
- `snippets/product-card.liquid`
- `snippets/product-grid-item.liquid`

**Find the main product div** (usually first div in the snippet)

**Add `data-product-id="{{ product.id }}"` to it:**

#### Before:
```liquid
<div class="card-wrapper product-card-wrapper">
  <div class="card card--product">
    <!-- product content -->
  </div>
</div>
```

#### After:
```liquid
<div class="card-wrapper product-card-wrapper" data-product-id="{{ product.id }}">
  <div class="card card--product">
    <!-- product content -->
  </div>
</div>
```

✅ **Save the file**

---

## ✅ Testing Your Installation

### 1. Start Your Dev Server

```bash
npm run dev
```

You'll see output like:
```
Remix: http://localhost:3000
ngrok: https://abc123.ngrok-free.app
```

**Copy the ngrok URL!**

### 2. Update API URL in Theme

Go back to `theme.liquid` and update:

```liquid
<script>
  window.shopifyAppApiUrl = 'https://abc123.ngrok-free.app';
</script>
```

**Save**

### 3. Configure Products

1. Visit your app: `https://abc123.ngrok-free.app`
2. Go to **Product Booking Configuration**
3. Click **Add Product**
4. Select a product
5. Configure it:
   - ✅ Select available days (e.g., Monday, Tuesday, Wednesday)
   - ✅ Set date range (e.g., Oct 6, 2025 - Nov 5, 2025)
   - ✅ Generate time slots (set start: 09:00, end: 17:00, duration: 60)
   - ✅ Add services (e.g., "Professional Photography", "Extra Catering")
6. **Save Configuration**
7. Configure at least 2-3 more products for testing

### 4. Test on Collection Page

1. Visit any collection page on your store
2. **Open browser console** (Press F12)
3. You should see:

```
🔍 Initializing simple collection filters...
🔄 Fetching filters data from API...
📡 API URL: https://abc123.ngrok-free.app/api/collection-filters
✅ Filters data loaded
🔧 Populating filter options...
✅ Filters populated successfully
   - 9 time slots
   - 2 services
   - 3 configured products
```

### 5. Test Filtering

**Try selecting filters:**

1. **Select a date** (e.g., October 15, 2025)
   - Console will show which products match
   - Products outside that date range will hide

2. **Check a time slot** (e.g., 09:00 AM)
   - Only products with that time slot remain visible

3. **Select a service** (e.g., "Professional Photography")
   - Only products with that service remain visible

**Check console for detailed logs:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 APPLYING FILTERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Active Filters: {date: "2025-10-15", times: ["09:00"], services: ["Professional Photography"]}

📦 Found 5 products on page

━━━ Product 1: 9217115095314 ━━━
📊 Dejavino
   Date Range: 2025-10-06 to 2025-11-05
   Days: monday, tuesday, wednesday
   Times: 09:00, 10:00, 11:00, 12:00
   Services: Professional Photography, Extra Catering

   🗓️ Checking DATE: 2025-10-15
      Day: tuesday
      ✅ Date OK

   ⏰ Checking TIMES: 09:00
      ✅ Time OK

   🎭 Checking SERVICES: Professional Photography
      ✅ Service OK

   ✅ SHOW

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RESULTS: 2 of 5 products visible
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Perfect! Your filters are working!** 🎉

---

## 🧪 Quick API Test

Want to test if your API is working before adding to theme?

Run this script:

```bash
node test-filter-api.js
```

You'll see:
```
🧪 Testing Collection Filter API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API URL: http://localhost:3000/api/collection-filters
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📡 Fetching filter data...
Status: 200 OK

✅ API Response received!
...
```

---

## 🐛 Troubleshooting

### ❌ "Failed to load filters"

**Cause:** API not accessible

**Fix:**
1. Check your app is running: `npm run dev`
2. Verify API URL in `theme.liquid` matches your ngrok URL
3. Test API directly: visit `https://your-ngrok-url.ngrok-free.app/api/collection-filters` in browser
4. Check browser console for exact error

### ❌ "Found 0 products on page"

**Cause:** Product cards missing `data-product-id`

**Fix:**
1. Find your product card file (`snippets/card-product.liquid`)
2. Add `data-product-id="{{ product.id }}"` to main div
3. Save and refresh
4. Check console - should now show products

### ❌ "No config data found for this product"

**Cause:** Product not configured in admin

**Fix:**
1. Go to your app admin
2. Navigate to **Product Booking Configuration**
3. Add the product
4. Configure dates, times, and services
5. **Save Configuration**
6. Refresh collection page

### ❌ Products don't filter properly

**Cause:** Product ID mismatch or config incomplete

**Fix:**

1. **Check Product IDs match:**
```javascript
// In browser console
document.querySelectorAll('[data-product-id]').forEach(el => {
  console.log('Page:', el.dataset.productId);
});

console.log('Configured:', filtersData.products.map(p => p.productId));
```

2. **Check product has complete config:**
   - Date range set (start & end dates)
   - Available days selected
   - Time slots generated
   - Services added

3. **Look at console logs** - they tell you exactly why each product is shown/hidden

### ❌ Filters show but look broken/unstyled

**Cause:** CSS not loading or theme conflicts

**Fix:**

Add this to `assets/theme.css`:

```css
/* Force filter styles */
.collection-filters-wrapper {
  width: 100%;
  max-width: 300px;
  margin: 0;
}

.collection-filters {
  background: #fff !important;
  border: 1px solid #e5e5e5 !important;
  border-radius: 8px !important;
  padding: 20px !important;
  position: sticky !important;
  top: 20px !important;
}
```

---

## 🎨 Customization

### Change Filter Colors

Edit `collection-filters-simple.liquid` styles:

```css
.collection-filters {
  background: #f8f9fa;  /* Light gray background */
  border-color: #dee2e6;  /* Border color */
}

.active-filter-tag {
  background: #28a745;  /* Green for active filters */
}

.filter-toggle:hover {
  color: #28a745;  /* Hover color */
}
```

### Make Filter Wider

```css
.collection-filters-wrapper {
  max-width: 350px;  /* Increase from 300px */
}
```

### Hide Specific Filters

To hide time filter:
```css
#time-filter,
#time-filter + .filter-options {
  display: none !important;
}
```

---

## 📊 How Filters Work

### Date Filter Logic

When a user selects a date:

1. ✅ Check if date is between `bookingStartDate` and `bookingEndDate`
2. ✅ Check if day of week (Monday, Tuesday, etc.) is in `availableDays`
3. ✅ Both must be true to show the product

**Example:**
- User selects: **October 15, 2025 (Tuesday)**
- Product range: **Oct 6 - Nov 5**
- Available days: **Monday, Tuesday, Wednesday**
- **Result: ✅ SHOW** (date in range AND Tuesday is available)

### Time Filter Logic

When user checks time slots:

- Shows products that have **ANY** of the selected times
- **OR logic** - product needs at least one matching time slot

**Example:**
- User selects: **09:00 AM, 10:00 AM**
- Product has: **09:00 AM, 11:00 AM, 12:00 PM**
- **Result: ✅ SHOW** (has 09:00 AM)

### Service Filter Logic

When user checks services:

- Shows products that have **ANY** of the selected services
- **OR logic** - product needs at least one matching service

**Example:**
- User selects: **Professional Photography**
- Product has: **Professional Photography, Extra Catering**
- **Result: ✅ SHOW** (has Professional Photography)

---

## 🎯 Best Practices

### For Products

1. **Always set date ranges** - Filters won't work without them
2. **Select realistic available days** - Don't just check all days
3. **Generate proper time slots** - Match your actual availability
4. **Add descriptive services** - "Professional Photography" not just "Photo"
5. **Configure many products** - More data = more useful filters

### For Testing

1. **Always check console first** - It shows exactly what's happening
2. **Test with multiple products** - Easier to see filtering in action
3. **Try different filter combinations** - Make sure all work together
4. **Test on mobile** - Filters are responsive but always verify
5. **Monitor ngrok URL** - Update in theme when it changes

### For Production

1. **Deploy app to permanent hosting** - No more ngrok URL changes
2. **Update API URL to production** - `window.shopifyAppApiUrl = 'https://your-app.com'`
3. **Test thoroughly before launch** - Try all filter combinations
4. **Monitor performance** - Check API response times
5. **Collect feedback** - See how customers use filters

---

## 📋 Pre-Launch Checklist

Before making your store live with filters:

- [ ] ✅ Filter snippet uploaded and saved
- [ ] ✅ API URL set in `theme.liquid`
- [ ] ✅ Filters added to collection template
- [ ] ✅ Product cards have `data-product-id`
- [ ] ✅ 5+ products fully configured with:
  - [ ] Date ranges set
  - [ ] Available days selected
  - [ ] Time slots generated
  - [ ] Services added
- [ ] ✅ Tested on collection page
- [ ] ✅ All three filters working (date, time, service)
- [ ] ✅ Console shows no errors
- [ ] ✅ Active filter tags display correctly
- [ ] ✅ "Clear All" button works
- [ ] ✅ Results counter updates
- [ ] ✅ Tested on mobile
- [ ] ✅ Filters match your theme design

---

## 🚀 Going Live

### Local Development (ngrok)

```liquid
<script>
  window.shopifyAppApiUrl = 'https://abc123.ngrok-free.app';
</script>
```

⚠️ **Cons:** URL changes every restart, manual updates needed

### Production Deployment

1. Deploy your Remix app to hosting (Fly.io, Heroku, Railway, etc.)
2. Get your production URL (e.g., `https://your-booking-app.fly.dev`)
3. Update `theme.liquid`:

```liquid
<script>
  window.shopifyAppApiUrl = 'https://your-booking-app.fly.dev';
</script>
```

✅ **Pros:** Permanent URL, no manual updates, faster, more reliable

---

## 💡 Advanced Tips

### Use Shopify Metafields (No theme edits needed)

Instead of editing `theme.liquid` each time:

1. Go to **Settings** → **Metafields** → **Shops**
2. Add definition:
   - **Namespace:** `booking_app`
   - **Key:** `api_url`
   - **Type:** Single line text
3. Set value to your API URL
4. The filter automatically uses this!

No more manual theme updates! 🎉

### Add Loading States

For better UX, the filters already show:
- Loading spinner while fetching data
- "Retry" button if loading fails
- Results counter showing filtered count

### Debug Mode

Enable verbose logging:

```javascript
// Add to browser console
localStorage.setItem('filterDebug', 'true');
// Refresh page for extra detailed logs
```

---

## 📚 Files Reference

### Files You Created:

1. **`public/snippets/collection-filters-simple.liquid`** - Simple filter UI (Date, Time, Services only)
2. **`public/snippets/collection-filters.liquid`** - Full filter UI (includes Price filter)
3. **`test-filter-api.js`** - API testing script
4. **`EASY-FILTER-INSTALLATION-GUIDE.md`** - Installation guide
5. **`COLLECTION-FILTERS-FINAL-GUIDE.md`** - This guide

### Backend Files:

1. **`app/routes/api.collection-filters.jsx`** - API endpoint
2. **`prisma/schema.prisma`** - Database schema with ProductBookingConfig
3. **`app/routes/app.product-config.jsx`** - Admin configuration page

---

## 🎉 You're Done!

Your collection page now has powerful, functional filters that work with your product configurations!

**What you accomplished:**
✅ Added date/time/service filters to collection page  
✅ Real-time product filtering with no page reload  
✅ Detailed console logging for easy debugging  
✅ Mobile responsive design  
✅ Integration with your existing product configs  

**Next steps:**
1. Configure more products
2. Test thoroughly
3. Customize design to match your brand
4. Deploy to production
5. Monitor and optimize

---

## 📞 Need Help?

**Check these in order:**

1. **Browser Console** - Press F12, check for errors and logs
2. **API Test** - Run `node test-filter-api.js`
3. **Product IDs** - Verify with `document.querySelectorAll('[data-product-id]')`
4. **Configurations** - Check products are fully configured in admin
5. **API URL** - Verify it matches your actual ngrok/production URL

**Common Issues & Solutions:** See Troubleshooting section above

---

**Happy Filtering! 🎊**

*Last updated: October 8, 2025*

