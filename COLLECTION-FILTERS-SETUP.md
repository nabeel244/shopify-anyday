# 🔍 Collection Page Filters - Setup Guide

This guide will help you add interactive filters to your Shopify collection pages.

## 📋 Overview

The filter system allows customers to filter products by:
- **📅 Date Available**: Filter by specific booking dates
- **⏰ Time Slots**: Filter by available time slots
- **🎭 Services**: Filter by included services (superheroes, shows, ceremonies, etc.)
- **💰 Price Range**: Filter by product price
- **⭐ Ratings** (coming soon)

## 🚀 What's Been Created

### 1. Backend API Endpoint
**File**: `app/routes/api.collection-filters.jsx`
- Aggregates filter data from all configured products
- Returns available dates, times, services, and price ranges
- Endpoint: `/api/collection-filters`

### 2. Frontend Filter Snippet
**File**: `public/snippets/collection-filters.liquid`
- Complete filter UI with sidebar layout
- Interactive checkboxes, date picker, price range
- Real-time product filtering
- Active filters display

## 📦 Installation Steps

### Step 1: Update Your ngrok URL

Edit `public/snippets/collection-filters.liquid` and update line 117:

```javascript
const APP_BASE_URL = 'https://YOUR-NGROK-URL.ngrok-free.app';
```

Replace with your current ngrok URL.

### Step 2: Add Filter Snippet to Collection Page

You have **2 options** to add the filters:

#### Option A: Using Theme Editor (Recommended)

1. Go to **Shopify Admin** → **Online Store** → **Themes**
2. Click **Customize** on your active theme
3. Navigate to any **Collection page**
4. In the left sidebar, click **Add section**
5. Scroll to **Custom Liquid**
6. Add this code:
   ```liquid
   {% render 'collection-filters', collection: collection %}
   ```
7. Position it in the sidebar (usually left side)
8. Click **Save**

#### Option B: Edit Collection Template Directly

1. Go to **Shopify Admin** → **Online Store** → **Themes**
2. Click **Actions** → **Edit code**
3. Find your collection template (usually `sections/main-collection.liquid` or `templates/collection.json`)
4. Add the filter snippet before your product grid:

**For Liquid template:**
```liquid
<div class="collection-content-wrapper">
  <div class="collection-sidebar">
    {% render 'collection-filters', collection: collection %}
  </div>
  
  <div class="collection-products">
    <!-- Your existing product grid code -->
  </div>
</div>
```

**For JSON template (Dawn theme):**
```json
{
  "sections": {
    "filter-sidebar": {
      "type": "custom-liquid",
      "settings": {
        "custom_liquid": "{% render 'collection-filters', collection: collection %}"
      }
    },
    "product-grid": {
      "type": "main-collection-product-grid"
    }
  },
  "order": ["filter-sidebar", "product-grid"]
}
```

### Step 3: Add Product IDs to Your Products

For filters to work, products need `data-product-id` attributes:

**Edit your product card snippet** (usually `snippets/product-card.liquid` or similar):

```liquid
<div class="product-card" data-product-id="{{ product.id }}">
  <!-- Your existing product card content -->
</div>
```

Make sure each product has this attribute!

### Step 4: Test the Filters

1. **Start your Remix app**:
   ```bash
   npm run dev
   ```

2. **Visit your collection page** on your Shopify store

3. **Check browser console** for logs:
   ```
   🔍 Initializing collection filters...
   🔄 Fetching filters data from API...
   ✅ Filters data loaded
   🔧 Populating filter options...
   ```

4. **Try using filters**:
   - Select a date
   - Check time slots
   - Select services
   - Adjust price range
   - Products should filter in real-time!

## 🎨 Customizing the Filter Design

The filters are fully customizable via CSS. Edit the `<style>` section in `collection-filters.liquid`:

### Change Colors
```css
.collection-filters {
  background: #YOUR_COLOR;
  border-color: #YOUR_BORDER_COLOR;
}

.active-filter-tag {
  background: #YOUR_TAG_COLOR;
}
```

### Adjust Sizing
```css
.collection-filters-wrapper {
  max-width: 350px; /* Make sidebar wider */
}
```

### Mobile Responsive
The filters are responsive by default. To customize mobile view:
```css
@media (max-width: 768px) {
  .collection-filters-wrapper {
    /* Your mobile styles */
  }
}
```

## 🧪 Testing Filter Data

### Test API Endpoint

Open browser console on any page and run:

```javascript
fetch('https://YOUR-NGROK-URL.ngrok-free.app/api/collection-filters', {
  headers: { 'ngrok-skip-browser-warning': 'true' }
})
  .then(r => r.json())
  .then(data => console.log('Filter data:', data));
```

Expected output:
```json
{
  "success": true,
  "filters": {
    "dates": ["2025-10-06", "2025-10-07", ...],
    "times": ["09:00", "10:00", "11:00", ...],
    "services": ["Professional Photography", "Extra Catering", ...],
    "priceRange": { "min": 480, "max": 980 },
    "products": [...]
  }
}
```

## 🐛 Troubleshooting

### Filters Not Loading

1. **Check ngrok URL** is correct in the snippet
2. **Check Remix app is running** (`npm run dev`)
3. **Check browser console** for errors
4. **Test API endpoint** directly (see testing section above)

### Products Not Filtering

1. **Verify product cards have `data-product-id` attribute**:
   ```html
   <div class="product-card" data-product-id="9217115095314">
   ```

2. **Check product IDs match** between Shopify and your database:
   ```javascript
   console.log('Product IDs on page:', 
     Array.from(document.querySelectorAll('[data-product-id]'))
       .map(el => el.dataset.productId)
   );
   ```

3. **Verify products are configured** in admin panel

### No Filter Options Showing

1. **Configure products** in your admin panel first
2. **Make sure products are active** (`isActive: true`)
3. **Check API returns data** (see testing section)

## 📊 How Filters Work

1. **API aggregates data** from all `ProductBookingConfig` records
2. **Frontend fetches filter data** on page load
3. **JavaScript populates filter UI** with available options
4. **User selects filters** → Products are shown/hidden in real-time
5. **No page reload** required - instant filtering!

## 🎯 Filter Logic

### Date Filter
- Shows only products with dates in their `bookingStartDate` to `bookingEndDate` range
- Also checks if the selected date's day (Monday, Tuesday, etc.) is in `availableDays`

### Time Filter
- Shows products that have ANY of the selected time slots
- Uses `timeSlots` from product configuration

### Service Filter
- Shows products that have ANY of the selected services
- Uses `services` array from product configuration

### Price Filter
- Shows products within the min/max price range
- Uses `productPrice` from configuration

## 🚀 Next Steps

1. ✅ Configure more products in admin panel
2. ✅ Test filters on collection page
3. ✅ Customize design to match your theme
4. ✅ Add more filter options if needed
5. ✅ Consider adding city/location filter (requires schema update)

## 💡 Advanced Features

### Adding City Filter

1. Update `prisma/schema.prisma` to add `city` field
2. Run migration: `npx prisma migrate dev`
3. Add city input in admin panel
4. Update API to include cities
5. Add city filter section in snippet

### Adding Rating Filter

1. Add `rating` field to schema
2. Create rating system for products
3. Add rating filter UI
4. Filter products by minimum rating

## 📞 Need Help?

If you encounter issues:
1. Check browser console for error messages
2. Verify all files are in correct locations
3. Test API endpoint directly
4. Ensure products are configured in admin panel

---

**🎉 You're all set!** Your collection page now has powerful filtering capabilities that will improve customer experience and help them find exactly what they're looking for.

