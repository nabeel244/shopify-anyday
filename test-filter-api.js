/**
 * Test Collection Filter API
 * 
 * This script tests if your collection filter API is working correctly
 * Run with: node test-filter-api.js
 */

const API_URL = process.env.SHOPIFY_APP_URL || 'http://localhost:3000';

async function testFilterAPI() {
  console.log('🧪 Testing Collection Filter API\n');
  console.log('━'.repeat(50));
  console.log(`API URL: ${API_URL}/api/collection-filters`);
  console.log('━'.repeat(50));
  console.log('');

  try {
    console.log('📡 Fetching filter data...');
    
    const response = await fetch(`${API_URL}/api/collection-filters`);
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('\n✅ API Response received!\n');
    console.log('━'.repeat(50));
    console.log('FILTER DATA SUMMARY');
    console.log('━'.repeat(50));
    
    if (data.success) {
      const { filters } = data;
      
      console.log('\n📅 DATES:');
      if (filters.dates.length > 0) {
        console.log(`   Found ${filters.dates.length} available dates`);
        console.log(`   First 5: ${filters.dates.slice(0, 5).join(', ')}`);
      } else {
        console.log('   ⚠️  No dates available');
      }
      
      console.log('\n⏰ TIME SLOTS:');
      if (filters.times.length > 0) {
        console.log(`   Found ${filters.times.length} time slots`);
        console.log(`   Times: ${filters.times.join(', ')}`);
      } else {
        console.log('   ⚠️  No time slots available');
      }
      
      console.log('\n🎭 SERVICES:');
      if (filters.services.length > 0) {
        console.log(`   Found ${filters.services.length} services`);
        filters.services.forEach(service => {
          console.log(`   - ${service}`);
        });
      } else {
        console.log('   ⚠️  No services available');
      }
      
      console.log('\n💰 PRICE RANGE:');
      console.log(`   Min: $${filters.priceRange.min}`);
      console.log(`   Max: $${filters.priceRange.max}`);
      
      console.log('\n📦 PRODUCTS:');
      console.log(`   Total configured products: ${filters.products.length}`);
      
      if (filters.products.length > 0) {
        console.log('\n   Product Details:');
        filters.products.forEach((product, index) => {
          console.log(`\n   ${index + 1}. ${product.title}`);
          console.log(`      ID: ${product.productId}`);
          console.log(`      Price: $${product.price}`);
          console.log(`      Available Days: ${product.availableDays.join(', ')}`);
          console.log(`      Time Slots: ${product.timeSlots.length} slots`);
          console.log(`      Services: ${product.services.length} services`);
          if (product.dateRange.start && product.dateRange.end) {
            console.log(`      Date Range: ${product.dateRange.start} to ${product.dateRange.end}`);
          }
        });
      } else {
        console.log('\n   ⚠️  No products configured!');
        console.log('   Go to Product Booking Configuration to add products.');
      }
      
      console.log('\n━'.repeat(50));
      console.log('✅ TEST PASSED - API is working correctly!');
      console.log('━'.repeat(50));
      console.log('\n📋 Next Steps:');
      console.log('   1. Update API URL in theme.liquid');
      console.log(`      window.shopifyAppApiUrl = '${API_URL}';`);
      console.log('   2. Add filter snippet to collection page');
      console.log('   3. Add data-product-id to product cards');
      console.log('   4. Test on collection page');
      console.log('');
      
    } else {
      console.log('❌ API returned error:', data.error);
      console.log('Details:', data.details);
    }
    
  } catch (error) {
    console.log('\n❌ TEST FAILED\n');
    console.log('Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure your app is running (npm run dev)');
    console.log('   2. Check if the API URL is correct');
    console.log('   3. Verify database has product configurations');
    console.log('   4. Check app/routes/api.collection-filters.jsx exists');
    console.log('');
  }
}

// Run the test
testFilterAPI().catch(console.error);

