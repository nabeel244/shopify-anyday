// Collection Filters Test Script
// Run this in your browser console on the collection page to test filters

console.log('🧪 COLLECTION FILTERS TEST SCRIPT');

async function testFilters() {
  const APP_BASE_URL = 'https://cdcc902533c4.ngrok-free.app'; // Update with your ngrok URL
  
  console.log('========================================');
  console.log('1️⃣ TESTING API ENDPOINT');
  console.log('========================================');
  
  try {
    const response = await fetch(`${APP_BASE_URL}/api/collection-filters`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    if (!response.ok) {
      console.error(`❌ API Error: HTTP ${response.status}`);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response:', data);
    
    if (!data.success) {
      console.error('❌ API returned error:', data.error);
      return;
    }
    
    const filters = data.filters;
    
    console.log('\n📊 Filter Data Summary:');
    console.log(`  - Available Dates: ${filters.dates.length}`);
    console.log(`  - Time Slots: ${filters.times.length}`);
    console.log(`  - Services: ${filters.services.length}`);
    console.log(`  - Price Range: $${filters.priceRange.min} - $${filters.priceRange.max}`);
    console.log(`  - Configured Products: ${filters.products.length}`);
    
    console.log('\n========================================');
    console.log('2️⃣ CHECKING PAGE ELEMENTS');
    console.log('========================================');
    
    const filterWrapper = document.querySelector('.collection-filters-wrapper');
    const filterSidebar = document.querySelector('.collection-filters');
    const productsOnPage = document.querySelectorAll('[data-product-id]');
    
    console.log('✅ Elements Found:');
    console.log(`  - Filter Wrapper: ${filterWrapper ? 'YES' : 'NO'}`);
    console.log(`  - Filter Sidebar: ${filterSidebar ? 'YES' : 'NO'}`);
    console.log(`  - Products with data-product-id: ${productsOnPage.length}`);
    
    if (productsOnPage.length === 0) {
      console.warn('⚠️ NO PRODUCTS WITH data-product-id ATTRIBUTE FOUND!');
      console.log('\nTo fix this, add data-product-id to your product cards:');
      console.log('<div class="product-card" data-product-id="{{ product.id }}">');
    } else {
      console.log('\n📦 Product IDs on page:');
      productsOnPage.forEach((el, i) => {
        console.log(`  ${i + 1}. ${el.dataset.productId}`);
      });
    }
    
    console.log('\n========================================');
    console.log('3️⃣ TESTING FILTER FUNCTIONALITY');
    console.log('========================================');
    
    if (filters.dates.length > 0) {
      console.log(`\n📅 Testing Date Filter with: ${filters.dates[0]}`);
      const dateInput = document.getElementById('filter-date');
      if (dateInput) {
        dateInput.value = filters.dates[0];
        dateInput.dispatchEvent(new Event('change'));
        console.log('✅ Date filter applied');
      } else {
        console.error('❌ Date input not found');
      }
    }
    
    setTimeout(() => {
      const visibleProducts = Array.from(productsOnPage).filter(p => p.style.display !== 'none');
      console.log(`\n📊 Filter Results: ${visibleProducts.length} / ${productsOnPage.length} products visible`);
      
      console.log('\n========================================');
      console.log('4️⃣ CHECKING FILTER UI');
      console.log('========================================');
      
      const filterSections = {
        'Date Filter': document.getElementById('date-filter'),
        'Time Filter': document.getElementById('time-filter'),
        'Service Filter': document.getElementById('service-filter'),
        'Price Filter': document.getElementById('price-filter')
      };
      
      Object.entries(filterSections).forEach(([name, element]) => {
        console.log(`  ${name}: ${element ? '✅ Found' : '❌ Missing'}`);
      });
      
      const timeSlotsList = document.getElementById('time-slots-list');
      const servicesList = document.getElementById('services-list');
      
      if (timeSlotsList) {
        const timeOptions = timeSlotsList.querySelectorAll('.filter-checkbox');
        console.log(`  - Time Slot Options: ${timeOptions.length}`);
      }
      
      if (servicesList) {
        const serviceOptions = servicesList.querySelectorAll('.filter-checkbox');
        console.log(`  - Service Options: ${serviceOptions.length}`);
      }
      
      console.log('\n========================================');
      console.log('5️⃣ TEST COMPLETE');
      console.log('========================================');
      console.log('\n✅ All tests completed!');
      console.log('\nNext steps:');
      console.log('1. Try selecting different filters manually');
      console.log('2. Check that products filter correctly');
      console.log('3. Verify active filters display');
      console.log('4. Test clear all filters button');
      
    }, 500);
    
  } catch (error) {
    console.error('❌ Test Error:', error);
    console.log('\nPossible causes:');
    console.log('  - Remix app not running');
    console.log('  - Incorrect ngrok URL');
    console.log('  - Network connectivity issues');
  }
}

// Run the test
testFilters();

// Helper function to manually test filter clearing
window.testClearFilters = function() {
  console.log('🧹 Testing Clear Filters...');
  clearAllFilters();
  console.log('✅ Filters cleared');
};

// Helper function to check current active filters
window.checkActiveFilters = function() {
  console.log('🔍 Current Active Filters:', activeFilters);
};

console.log(`
🎯 COLLECTION FILTERS TEST

Available test functions:
- testFilters() - Run full test suite
- testClearFilters() - Test clear all filters
- checkActiveFilters() - Check current filter state

Type any function name in console to run it.
`);
