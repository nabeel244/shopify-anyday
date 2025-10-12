# Date Range Troubleshooting Guide

## 🎯 **Issue: Date Range Not Showing in Calendar**

### **Step 1: Check API Response**
1. Go to your product page with the booking widget
2. Open browser console (F12)
3. Run the debug script: `debugDateRange()`
4. Check the console output for:
   - API response status (should be 200)
   - Configuration details
   - Date range values

### **Step 2: Verify Admin Configuration**
1. Go to your Shopify app admin panel
2. Navigate to "Product Booking Configuration"
3. Click "Edit" on your configured product
4. Scroll to "📅 Booking Date Range (Optional)" section
5. Verify you have set:
   - **Booking Start Date**: e.g., 2024-10-04
   - **Booking End Date**: e.g., 2024-11-30
6. Click "Update Configuration"
7. Check for success message

### **Step 3: Check Database**
If date ranges are not saving:
1. The database migration might not have applied properly
2. Try restarting your development server
3. Check if the new fields exist in the database

### **Step 4: Test Frontend Widget**
1. Refresh your product page
2. Look for the booking widget summary
3. Check if "Booking Period" shows your date range
4. If it shows "No date range set", the API is not returning the data

### **Step 5: Debug Console Logs**
Check browser console for these logs:
```
🔍 Date Range Debug:
  - bookingStartDate: 2024-10-04
  - bookingEndDate: 2024-11-30
```

If these show `null` or `undefined`, the issue is in the API/database.

### **Step 6: Test Calendar**
1. Click "📅 Show Calendar View"
2. Look for:
   - 🟡 Yellow dates with 🚫 = Outside date range
   - 🟢 Green dates = Available for booking
   - Legend should show "Outside Range" option

### **Expected Behavior:**
- Dates before Oct 4 should be yellow with 🚫
- Dates after Nov 30 should be yellow with 🚫
- Dates between Oct 4 - Nov 30 should follow normal rules
- Widget summary should show "Booking Period: 10/4/2024 - 11/30/2024"

### **Common Issues:**
1. **Date range not saved**: Check admin form validation
2. **API not returning data**: Check database migration
3. **Frontend not displaying**: Check console logs for errors
4. **Calendar not updating**: Check if config is properly passed to calendar functions

### **Quick Fix Commands:**
```javascript
// Test API directly
fetch('https://395117533979.ngrok-free.app/api/product-booking-check?productId=YOUR_PRODUCT_ID')
  .then(r => r.json())
  .then(data => console.log('API Response:', data));

// Check widget config
console.log('Widget Config:', window.config);
```

### **If Still Not Working:**
1. Check browser console for any JavaScript errors
2. Verify ngrok URL is correct and accessible
3. Test with a fresh product configuration
4. Check if Prisma client needs regeneration
