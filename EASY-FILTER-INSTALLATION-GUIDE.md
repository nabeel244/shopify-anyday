# 🎯 Easy Collection Filter Installation for Dawn Theme

## ✨ What This Does

Adds powerful filters to your collection pages to filter products by:
- **📅 Date Available** - Based on your product's booking date range
- **⏰ Time Slots** - Based on configured time slots
- **🎭 Services** - Based on services added in product config
- **💰 Price Range** - Bonus filter for price

## 🚀 Quick 3-Step Installation

### Step 1: Upload the Filter Snippet ✅

1. Go to **Shopify Admin** → **Online Store** → **Themes**
2. Click **Actions** → **Edit code**
3. In the left sidebar, find **Snippets** folder
4. Click **Add a new snippet**
5. Name it: `collection-filters`
6. Copy the content from `public/snippets/collection-filters.liquid` and paste it
7. Click **Save**

### Step 2: Add API URL to Your Theme 🔗

You need to tell the filter where to fetch data from. Add this to your theme:

**Option A: Add to theme.liquid (Recommended)**

1. Open **Layout** → `theme.liquid`
2. Find the `</head>` closing tag
3. Add this BEFORE `</head>`:

```liquid
<script>
  // Set your app's API URL here - UPDATE THIS WITH YOUR ACTUAL NGROK/DEPLOYMENT URL
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

⚠️ **IMPORTANT:** Replace `YOUR-NGROK-URL` with your actual ngrok URL (you get this when you run `npm run dev`)

**Option B: Use Shopify Metafield (For Production)**

1. Go to **Settings** → **Metafields** → **Shops**
2. Add definition:
   - Namespace: `booking_app`
   - Key: `api_url`
   - Type: `Single line text`
3. Set the value to your app URL
4. The filter will automatically use this

### Step 3: Add Filters to Collection Page 📋

**Method 1: Using Theme Editor (Easiest - Dawn 2.0+)**

1. Go to **Themes** → **Customize**
2. Navigate to **Products** → **Collection**
3. In the left sidebar, find the **Main Collection** section
4. Look for the **Sidebar** or add a new section
5. Click **Add block** or **Add section** → **Custom Liquid**
6. Paste this code:
```liquid
{% render 'collection-filters' %}
```
7. Adjust position (drag to sidebar area)
8. Click **Save**

**Method 2: Edit Collection Template (Dawn 1.0 or manual control)**

1. In **Edit code**, find `sections/main-collection-product-grid.liquid`
2. Find the section where products are displayed (usually around line 10-30)
3. Add this code BEFORE the product grid:

```liquid
<div class="collection-filters-container">
  {% render 'collection-filters' %}
</div>
```

**Example placement:**
```liquid
<div class="collection{% if section.settings.filter_type == 'vertical' %} page-width{% endif %}">
  <div class="collection-wrapper">
    
    {%- if section.settings.enable_filtering -%}
      <div class="collection-sidebar">
        {% render 'collection-filters' %}
      </div>
    {%- endif -%}
    
    <div class="product-grid-container">
      <!-- existing product grid code -->
    </div>
  </div>
</div>
```

### Step 4: Add Product IDs to Product Cards 🏷️

This is CRITICAL - without this, filters won't work!

1. In **Edit code**, find your product card file (one of these):
   - `snippets/card-product.liquid`
   - `snippets/product-card.liquid`
   - `snippets/product-grid-item.liquid`

2. Find the main product card container (usually the first `<div>` with class `card` or `product-card`)

3. Add `data-product-id="{{ product.id }}"` to it:

**Before:**
```liquid
<div class="card-wrapper product-card-wrapper">
```

**After:**
```liquid
<div class="card-wrapper product-card-wrapper" data-product-id="{{ product.id }}">
```

**Full Example:**
```liquid
<div class="card-wrapper product-card-wrapper" data-product-id="{{ product.id }}">
  <div class="card card--product">
    <div class="card__inner">
      <!-- product content -->
    </div>
  </div>
</div>
```

## ✅ Testing Your Installation

### 1. Start Your App

```bash
npm run dev
```

Note your ngrok URL (e.g., `https://abc123.ngrok-free.app`)

### 2. Update the API URL

Go back to **theme.liquid** and update:
```liquid
<script>
  window.shopifyAppApiUrl = 'https://abc123.ngrok-free.app';  // Your actual URL
</script>
```

### 3. Configure Products

1. Open your app admin: `https://abc123.ngrok-free.app`
2. Go to **Product Booking Configuration**
3. Click **Add Product**
4. Configure at least one product with:
   - ✅ Available days (Monday, Tuesday, etc.)
   - ✅ Date range (Booking start & end dates)
   - ✅ Time slots (Generate time slots)
   - ✅ Services (Add at least one service)
5. Click **Save Configuration**

### 4. Visit Collection Page

1. Go to any collection page on your store
2. Open browser console (F12)
3. Look for these messages:

```
🔍 Initializing collection filters...
🔄 Fetching filters data from API...
📡 API URL: https://abc123.ngrok-free.app/api/collection-filters
✅ Filters data loaded
🔧 Populating filter options...
✅ Filters populated successfully
```

### 5. Test Filtering

1. **Select a date** - Should filter products to that date range
2. **Check a time slot** - Should show only products with that time
3. **Select a service** - Should show only products with that service
4. Watch console for detailed filter logs!

## 🐛 Troubleshooting

### ❌ "Failed to load filters"

**Problem:** API not accessible

**Solutions:**
1. Make sure your app is running (`npm run dev`)
2. Check the API URL in `theme.liquid` matches your ngrok URL
3. Check browser console for the exact error
4. Test API directly: Visit `https://your-ngrok-url.ngrok-free.app/api/collection-filters` in browser

### ❌ "Found 0 products on page"

**Problem:** Product cards don't have `data-product-id`

**Solution:**
1. Find your product card snippet
2. Add `data-product-id="{{ product.id }}"` to the main container
3. Refresh page and check console

### ❌ "No config data found for this product"

**Problem:** Product not configured

**Solution:**
1. Go to your app admin
2. Configure the product in **Product Booking Configuration**
3. Make sure it's marked as **Active**
4. Save and refresh collection page

### ❌ Filters show but products don't filter

**Problem:** Product ID mismatch

**Solution:**
1. Open console
2. Run this:
```javascript
// Check product IDs on page
document.querySelectorAll('[data-product-id]').forEach(el => {
  console.log('Page product ID:', el.dataset.productId);
});

// Check filter data
console.log('Filter products:', filtersData.products.map(p => p.productId));
```
3. IDs should match (the filter now handles both numeric and GID formats)

### ❌ Filters not showing in sidebar

**Problem:** Layout issue

**Solution:** Add this CSS to your theme:

1. Go to **Assets** → `theme.css` or `base.css`
2. Add at the bottom:

```css
/* Collection Filter Layout */
.collection-wrapper {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.collection-sidebar {
  position: sticky;
  top: 20px;
  height: fit-content;
}

.product-grid-container {
  flex: 1;
}

@media (max-width: 990px) {
  .collection-wrapper {
    grid-template-columns: 1fr;
  }
  
  .collection-sidebar {
    position: static;
  }
}
```

## 🎨 Customization

### Change Filter Colors

Edit the `<style>` section in `collection-filters.liquid`:

```css
.collection-filters {
  background: #f8f9fa;  /* Filter background */
  border-color: #dee2e6;  /* Border color */
}

.active-filter-tag {
  background: #0d6efd;  /* Active filter tag color */
}

.filter-toggle:hover {
  color: #0d6efd;  /* Hover color */
}
```

### Adjust Filter Width

```css
.collection-filters-wrapper {
  max-width: 350px;  /* Make wider/narrower */
}
```

### Hide Specific Filters

To hide price filter, add this in the `<style>` section:

```css
#price-filter, 
#price-filter + .filter-options {
  display: none !important;
}
```

## 📊 How It Works

1. **Filter snippet loads** on collection page
2. **JavaScript fetches** product data from your API
3. **Available filters** are populated based on configured products
4. **When user selects filters**, products are shown/hidden instantly
5. **Console logs** show exactly what's happening for debugging

## 🎯 Filter Logic Summary

### Date Filter
- Checks if selected date is within `bookingStartDate` to `bookingEndDate`
- Checks if the day of week is in `availableDays`
- Both must match to show product

### Time Filter
- Shows products that have ANY of the selected time slots
- OR logic (product needs at least one matching time)

### Service Filter  
- Shows products that have ANY of the selected services
- OR logic (product needs at least one matching service)

### Price Filter
- Shows products within min/max price range
- Simple numeric comparison

## 📋 Pre-Launch Checklist

Before going live, make sure:

- [ ] ✅ Filter snippet is uploaded to Snippets
- [ ] ✅ API URL is set in theme.liquid
- [ ] ✅ Filters are added to collection template
- [ ] ✅ Product cards have data-product-id attribute
- [ ] ✅ At least 3-5 products are fully configured
- [ ] ✅ Each product has date range, times, and services set
- [ ] ✅ Filters load successfully on collection page
- [ ] ✅ Products filter correctly when options selected
- [ ] ✅ "Clear All" button works
- [ ] ✅ Filters look good on mobile
- [ ] ✅ Console shows no errors

## 🚀 Going to Production

When deploying your app to production:

1. Deploy your Remix app to a hosting service (Fly.io, Heroku, etc.)
2. Update the API URL in `theme.liquid` to your production URL:
```liquid
<script>
  window.shopifyAppApiUrl = 'https://your-app.fly.dev';
</script>
```
3. Test filters on live store
4. All done! 🎉

## 💡 Pro Tips

1. **Configure many products** - More data = more useful filters
2. **Use date ranges** - Controls seasonal product availability
3. **Add diverse services** - Makes service filter valuable
4. **Check console regularly** - It tells you everything that's happening
5. **Test on mobile** - Filters are responsive but always check
6. **Use meaningful service names** - e.g., "Professional Photography" not "Photo"

## 🎊 Success!

When everything is working:
- ✅ Filters load automatically
- ✅ Date, time, and service options populate
- ✅ Selecting filters instantly shows/hides products
- ✅ Active filters display with remove buttons
- ✅ Console shows detailed filter logic
- ✅ Mobile experience is smooth

## 📞 Need Help?

If you're stuck:
1. Check browser console (F12) - it shows detailed logs
2. Test API URL directly in browser
3. Verify product IDs match between page and config
4. Make sure products are configured in admin
5. Check that app is running (`npm run dev`)

---

**Made with ❤️ for your Shopify booking app**

*Last updated: October 2025*

