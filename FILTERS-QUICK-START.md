# 🚀 Collection Filters - Quick Start Guide

## ✅ What's Working Now

The filter system focuses on **2 main filters** that work with your custom product configuration:

1. **📅 Date & Time Filter** - Filters products by booking dates and available time slots
2. **🎭 Services Filter** - Filters products by configured services

Both filters work **dynamically** based on data from your Product Config page!

---

## 🎯 How to Use

### Step 1: Add Filter Snippet to Collection Page

**Using Theme Editor (Easiest):**
1. Go to **Shopify Admin** → **Themes** → **Customize**
2. Navigate to any **Collection page**
3. Click **Add section** → **Custom Liquid**
4. Paste:
   ```liquid
   {% render 'collection-filters', collection: collection %}
   ```
5. Position in sidebar
6. **Save**

### Step 2: Add Product IDs to Product Cards

Edit your product card template (usually `snippets/product-card.liquid` or `card-product.liquid`):

```liquid
<div class="product-card" data-product-id="{{ product.id }}">
  <!-- your existing product card content -->
</div>
```

**Important:** Make sure EVERY product card has `data-product-id="{{ product.id }}"` attribute!

### Step 3: Test the Filters

1. **Visit your collection page**
2. **Open browser console** (F12)
3. **Look for logs**:
   ```
   🔍 Initializing collection filters...
   🔄 Fetching filters data from API...
   ✅ Filters data loaded
   ```

4. **Try filtering**:
   - Select a **date**
   - Check some **time slots**
   - Select some **services**
   - Watch console for detailed filtering logs!

---

## 📊 Console Output Explained

When you apply filters, you'll see detailed console logs:

```
========================================
🔍 APPLYING FILTERS
========================================
📋 Current Filters: {date: "2025-10-06", times: ["09:00"], services: ["Professional Photography"]}

📦 Found 5 products on page

--- Product 1: 9217115095314 ---
📊 Product Data: {title: "Dejavino", dateRange: {...}, timeSlots: [...], services: [...]}

🗓️ Checking DATE filter: 2025-10-06
  Range: 2025-10-06 to 2025-11-05
  ✅ Date within range
  Day of week: sunday
  Available days: monday, tuesday, wednesday
  ❌ Day not available

❌ HIDE this product
Reasons: sunday is not an available day

========================================
📊 FILTER RESULTS SUMMARY
========================================
Total products: 5
Visible: 2
Hidden: 3

Detailed Results: [...]
```

This shows **exactly why** each product is shown or hidden!

---

## 🔍 How Each Filter Works

### 📅 Date Filter

When you select a date, it checks:
1. ✅ Is the date within `bookingStartDate` to `bookingEndDate`?
2. ✅ Is the day of week (Mon/Tue/etc) in `availableDays`?

**Example:**
- Selected: October 6, 2025 (Sunday)
- Product range: Oct 6 - Nov 5
- Available days: Monday, Tuesday, Wednesday
- **Result: ❌ Hidden** (Sunday not available)

### ⏰ Time Filter

When you check time slots, it shows products that have **ANY** of the selected times.

**Example:**
- Selected times: 09:00, 10:00
- Product time slots: 09:00, 11:00, 12:00
- **Result: ✅ Shown** (has 09:00)

### 🎭 Service Filter

When you check services, it shows products that have **ANY** of the selected services.

**Example:**
- Selected services: Professional Photography
- Product services: Professional Photography, Extra Catering
- **Result: ✅ Shown** (has Professional Photography)

---

## 🧪 Quick Test

**Run this in browser console** on your collection page:

```javascript
// Check if filters loaded
console.log('Filter data:', filtersData);

// Check products on page
const products = document.querySelectorAll('[data-product-id]');
console.log('Products with IDs:', products.length);
products.forEach(p => console.log(' -', p.dataset.productId));

// Check active filters
console.log('Active filters:', activeFilters);
```

---

## ✅ Checklist

Before testing, make sure:

- [x] ✅ Remix app is running (`npm run dev`)
- [x] ✅ ngrok URL is correct in `collection-filters.liquid` (line 115)
- [x] ✅ Products are configured in admin panel
- [x] ✅ Date ranges, time slots, and services are set
- [x] ✅ Filter snippet is added to collection page
- [x] ✅ Product cards have `data-product-id` attribute

---

## 🐛 Troubleshooting

### "No products with data-product-id found"
**Fix:** Add `data-product-id="{{ product.id }}"` to your product card template

### "No config data found for this product"
**Fix:** Configure the product in admin panel → Product Booking Configuration

### "Filters not loading"
**Fix:** 
1. Check ngrok URL is correct
2. Verify Remix app is running
3. Check browser console for errors

### "Products not filtering"
**Fix:**
1. Open console and look for filter logs
2. Check product IDs match between page and database
3. Verify product configuration has the required data

---

## 📋 What You Need in Product Config

For filters to work, each product needs:

| Field | Used For | Example |
|-------|----------|---------|
| `bookingStartDate` | Date filter | "2025-10-06" |
| `bookingEndDate` | Date filter | "2025-11-05" |
| `availableDays` | Date filter | ["monday", "tuesday", "wednesday"] |
| `timeSlots` | Time filter | ["09:00", "10:00", "11:00"] |
| `services` | Service filter | [{name: "Photography", price: 50}] |

---

## 🎉 Success Indicators

When everything works, you'll see:

1. ✅ Filters load on page
2. ✅ Time slots and services populate automatically
3. ✅ Selecting filters immediately hides/shows products
4. ✅ Console shows detailed filter logic
5. ✅ Active filters display with remove buttons
6. ✅ "Clear All" button works

---

## 💡 Pro Tips

1. **Always check console** - It shows exactly what's happening
2. **Test one filter at a time** - Easier to debug
3. **Configure multiple products** - More filter options
4. **Use date ranges** - Controls seasonal availability
5. **Add diverse services** - Makes service filter useful

---

## 🚀 Next Steps

1. ✅ Add snippet to collection page
2. ✅ Add product IDs to product cards
3. ✅ Configure products in admin
4. ✅ Test filters on collection page
5. ✅ Check console logs
6. ✅ Customize design if needed

---

**🎊 You're ready!** Follow these steps and your filters will work perfectly with detailed console logging for easy debugging.

Need help? Check the console logs - they tell you everything!

