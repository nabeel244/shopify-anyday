// Debug script to test date range functionality
// Run this in your browser console on the product page

async function debugDateRange() {
  console.log('🔍 DEBUGGING DATE RANGE FUNCTIONALITY');
  
  // Get the current ngrok URL from the widget
  const APP_BASE_URL = 'https://395117533979.ngrok-free.app';
  
  // Get product ID from the page
  const productId = document.querySelector('[data-product-id]')?.dataset.productId || 
                   window.location.pathname.split('/').pop() ||
                   '{{ product.id }}'; // Fallback to Liquid variable
  
  console.log('🔍 Testing API for product:', productId);
  
  try {
    const response = await fetch(`${APP_BASE_URL}/api/product-booking-check?productId=${productId}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    console.log('🔍 API Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('🔍 Full API Response:', data);
    
    if (data.hasBooking && data.configuration) {
      console.log('✅ Product has booking configuration');
      console.log('🔍 Configuration details:');
      console.log('  - Product ID:', data.configuration.productId);
      console.log('  - Product Title:', data.configuration.productTitle);
      console.log('  - Available Days:', data.configuration.availableDays);
      console.log('  - Time Slots:', data.configuration.timeSlots);
      console.log('  - Booking Start Date:', data.configuration.bookingStartDate);
      console.log('  - Booking End Date:', data.configuration.bookingEndDate);
      console.log('  - Disabled Dates:', data.configuration.disabledDates);
      console.log('  - Services:', data.configuration.services);
      
      // Check if date range is properly configured
      if (data.configuration.bookingStartDate && data.configuration.bookingEndDate) {
        console.log('✅ Date range is configured:');
        console.log('  - Start:', new Date(data.configuration.bookingStartDate).toLocaleDateString());
        console.log('  - End:', new Date(data.configuration.bookingEndDate).toLocaleDateString());
      } else {
        console.log('❌ Date range is NOT configured');
        console.log('  - bookingStartDate:', data.configuration.bookingStartDate);
        console.log('  - bookingEndDate:', data.configuration.bookingEndDate);
      }
    } else {
      console.log('❌ No booking configuration found');
      console.log('  - hasBooking:', data.hasBooking);
      console.log('  - message:', data.message);
    }
  } catch (error) {
    console.error('❌ API Error:', error);
  }
}

// Instructions for testing
console.log(`
🎯 DATE RANGE DEBUG INSTRUCTIONS:

1. Run this function: debugDateRange()
2. Check the console output for:
   ✅ API response status
   ✅ Configuration details
   ✅ Date range values
   
3. If date range is not showing:
   - Go to admin panel
   - Edit your product configuration
   - Set booking start and end dates
   - Save configuration
   - Refresh product page
   - Run debugDateRange() again

4. If API returns null/undefined for date ranges:
   - Check if you saved the configuration properly
   - Verify the database has the date range fields
   - Check admin form is sending the data correctly
`);

// Auto-run the debug function
debugDateRange();
