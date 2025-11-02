// Test Payment Flow
console.log('🧪 Testing Payment Flow...');

// Test 1: Create a booking (should require payment)
async function testBookingCreation() {
  try {
    console.log('📝 Test 1: Creating booking...');
    
    const bookingData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-1234',
      productId: 'test-product',
      productTitle: 'Test Service',
      bookingDate: '2025-01-20',
      startTime: '10:00',
      endTime: '18:00',
      totalPrice: 100.00,
      selectedServices: JSON.stringify([
        { name: 'Extra Service 1', price: 25 },
        { name: 'Extra Service 2', price: 15 }
      ])
    };

    const response = await fetch('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bookingData })
    });

    const result = await response.json();
    
    if (result.success && result.requiresPayment) {
      console.log('✅ Test 1 PASSED: Booking created, payment required');
      console.log('   Booking ID:', result.booking.id);
      console.log('   Payment Status:', result.booking.paymentStatus);
      console.log('   Booking Status:', result.booking.status);
      return result.booking.id;
    } else {
      console.log('❌ Test 1 FAILED: Booking should require payment');
      return null;
    }
  } catch (error) {
    console.error('❌ Test 1 ERROR:', error.message);
    return null;
  }
}

// Test 2: Create checkout URL
async function testCheckoutCreation(bookingId) {
  try {
    console.log('💳 Test 2: Creating checkout...');
    
    const response = await fetch('http://localhost:3000/api/shopify-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bookingId })
    });

    const result = await response.json();
    
    if (result.success && result.checkoutUrl) {
      console.log('✅ Test 2 PASSED: Checkout URL created');
      console.log('   Checkout URL:', result.checkoutUrl);
      return true;
    } else {
      console.log('❌ Test 2 FAILED: Checkout creation failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Test 2 ERROR:', error.message);
    return false;
  }
}

// Test 3: Simulate payment completion
async function testPaymentCompletion(bookingId) {
  try {
    console.log('💰 Test 3: Simulating payment completion...');
    
    const webhookData = {
      booking_id: bookingId,
      financial_status: 'paid',
      id: 'shopify_order_12345'
    };

    const response = await fetch('http://localhost:3000/webhooks/payment-complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Test 3 PASSED: Payment webhook processed');
      return true;
    } else {
      console.log('❌ Test 3 FAILED: Payment webhook failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Test 3 ERROR:', error.message);
    return false;
  }
}

// Run all tests
async function runPaymentTests() {
  console.log('🚀 Starting Payment Flow Tests...\n');
  
  const bookingId = await testBookingCreation();
  if (!bookingId) {
    console.log('❌ Cannot continue tests - booking creation failed');
    return;
  }
  
  console.log('');
  
  const checkoutSuccess = await testCheckoutCreation(bookingId);
  if (!checkoutSuccess) {
    console.log('❌ Cannot continue tests - checkout creation failed');
    return;
  }
  
  console.log('');
  
  const paymentSuccess = await testPaymentCompletion(bookingId);
  
  console.log('\n📊 Test Results Summary:');
  console.log('   Booking Creation:', bookingId ? '✅ PASSED' : '❌ FAILED');
  console.log('   Checkout Creation:', checkoutSuccess ? '✅ PASSED' : '❌ FAILED');
  console.log('   Payment Completion:', paymentSuccess ? '✅ PASSED' : '❌ FAILED');
  
  if (bookingId && checkoutSuccess && paymentSuccess) {
    console.log('\n🎉 ALL TESTS PASSED! Payment flow is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the implementation.');
  }
}

// Run tests
runPaymentTests();
