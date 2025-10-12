// Debug script to test configuration creation
// Run this in your browser console on the admin page

console.log('🧪 Testing Configuration Creation');

// Test the form data before submission
function testFormData() {
  console.log('🔍 Testing form data structure...');
  
  // Check if the form data has all required fields
  const requiredFields = [
    'availableDays',
    'timeRanges', 
    'timeSlots',
    'duration',
    'maxBookings'
  ];
  
  console.log('Required fields check:', requiredFields);
  
  // Test time ranges structure
  const sampleTimeRange = {
    id: 'test-123',
    start: '10:00',
    end: '12:00',
    duration: 120
  };
  
  console.log('Sample time range structure:', sampleTimeRange);
  
  // Test JSON stringification
  try {
    const jsonString = JSON.stringify([sampleTimeRange]);
    console.log('✅ JSON stringification works:', jsonString);
    
    const parsed = JSON.parse(jsonString);
    console.log('✅ JSON parsing works:', parsed);
  } catch (error) {
    console.error('❌ JSON error:', error);
  }
}

// Test API endpoint
async function testAPIEndpoint() {
  console.log('🔍 Testing API endpoint...');
  
  try {
    const testData = {
      productId: 'test-product-id',
      productTitle: 'Test Product',
      productPrice: 100,
      availableDays: ['monday', 'tuesday'],
      timeRanges: [{
        id: 'test-123',
        start: '10:00',
        end: '12:00',
        duration: 120
      }],
      timeSlots: [],
      timeRangeStart: '09:00',
      timeRangeEnd: '17:00',
      slotDuration: 30,
      disabledDates: [],
      services: [],
      duration: 480,
      maxBookings: 1,
      bookingStartDate: '',
      bookingEndDate: '',
      isActive: true
    };
    
    console.log('🔍 Sending test data:', testData);
    
    const response = await fetch('/api/product-booking-configs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('🔍 Response status:', response.status);
    
    const data = await response.json();
    console.log('🔍 Response data:', data);
    
    if (data.error) {
      console.error('❌ API Error:', data.error);
      console.error('❌ Error details:', data.details);
    } else {
      console.log('✅ API Success:', data);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Run tests
console.log('🧪 Starting configuration creation tests...');
testFormData();
testAPIEndpoint();

console.log('🧪 Tests complete. Check the console output above for results.');



