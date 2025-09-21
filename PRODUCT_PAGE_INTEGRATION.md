# Product Page Integration Guide

## 🎯 **How to Add Booking Form to Product Pages**

### **Method 1: Manual HTML Integration (Easiest)**

Add this HTML code to your product page template in Shopify:

```html
<!-- Booking Form Widget - Only shows if booking is enabled for this product -->
<div id="booking-widget" style="max-width: 500px; margin: 20px auto; padding: 20px; border: 1px solid #e1e5e9; border-radius: 8px; background: #fff; display: none;">
  <h3>Book This Service</h3>
  <p>Fill out the form below to book your appointment:</p>
  
  <form id="booking-form">
    <div style="margin-bottom: 15px;">
      <label for="firstName">First Name *</label>
      <input type="text" id="firstName" name="firstName" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
    </div>
    
    <div style="margin-bottom: 15px;">
      <label for="lastName">Last Name *</label>
      <input type="text" id="lastName" name="lastName" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
    </div>
    
    <div style="margin-bottom: 15px;">
      <label for="email">Email *</label>
      <input type="email" id="email" name="email" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
    </div>
    
    <div style="margin-bottom: 15px;">
      <label for="phone">Phone *</label>
      <input type="tel" id="phone" name="phone" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
    </div>
    
    <div style="margin-bottom: 15px;">
      <label for="bookingDate">Booking Date *</label>
      <input type="date" id="bookingDate" name="bookingDate" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
    </div>
    
    <div style="margin-bottom: 15px;">
      <label for="startTime">Time Slot *</label>
      <select id="startTime" name="startTime" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        <option value="">Select a time...</option>
        <option value="09:00">09:00 AM</option>
        <option value="09:30">09:30 AM</option>
        <option value="10:00">10:00 AM</option>
        <option value="10:30">10:30 AM</option>
        <option value="11:00">11:00 AM</option>
        <option value="11:30">11:30 AM</option>
        <option value="12:00">12:00 PM</option>
        <option value="12:30">12:30 PM</option>
        <option value="13:00">01:00 PM</option>
        <option value="13:30">01:30 PM</option>
        <option value="14:00">02:00 PM</option>
        <option value="14:30">02:30 PM</option>
        <option value="15:00">03:00 PM</option>
        <option value="15:30">03:30 PM</option>
        <option value="16:00">04:00 PM</option>
        <option value="16:30">04:30 PM</option>
        <option value="17:00">05:00 PM</option>
      </select>
    </div>
    
    <div style="margin-bottom: 15px;">
      <label for="specialRequests">Special Requests (Optional)</label>
      <textarea id="specialRequests" name="specialRequests" rows="3" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></textarea>
    </div>
    
    <button type="submit" style="width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">
      Book Appointment
    </button>
  </form>
  
  <div id="booking-message" style="margin-top: 15px; padding: 10px; border-radius: 4px; display: none;"></div>
</div>

<script>
document.getElementById('booking-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());
  
  // Add product information
  data.productId = '{{ product.id }}';
  data.productTitle = '{{ product.title }}';
  data.productPrice = {{ product.price | money_without_currency }};
  
  const messageDiv = document.getElementById('booking-message');
  const submitBtn = this.querySelector('button[type="submit"]');
  
  // Show loading state
  submitBtn.textContent = 'Submitting...';
  submitBtn.disabled = true;
  
  try {
    const response = await fetch('https://a2223278496f.ngrok-free.app/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.error) {
      messageDiv.style.display = 'block';
      messageDiv.style.backgroundColor = '#f8d7da';
      messageDiv.style.color = '#721c24';
      messageDiv.style.border = '1px solid #f5c6cb';
      messageDiv.textContent = 'Error: ' + result.error;
    } else {
      messageDiv.style.display = 'block';
      messageDiv.style.backgroundColor = '#d4edda';
      messageDiv.style.color = '#155724';
      messageDiv.style.border = '1px solid #c3e6cb';
      messageDiv.textContent = 'Booking submitted successfully! You will receive a confirmation email shortly.';
      
      // Reset form
      this.reset();
    }
  } catch (error) {
    messageDiv.style.display = 'block';
    messageDiv.style.backgroundColor = '#f8d7da';
    messageDiv.style.color = '#721c24';
    messageDiv.style.border = '1px solid #f5c6cb';
    messageDiv.textContent = 'Failed to submit booking. Please try again.';
    console.error('Booking error:', error);
  } finally {
    submitBtn.textContent = 'Book Appointment';
    submitBtn.disabled = false;
  }
});

// Set minimum date to today
document.getElementById('bookingDate').min = new Date().toISOString().split('T')[0];

// Check if booking is enabled for this product
async function checkBookingEnabled() {
  try {
    const response = await fetch(`https://a2223278496f.ngrok-free.app/api/product-booking-check?productId={{ product.id }}`);
    const data = await response.json();
    
    if (data.hasBooking) {
      document.getElementById('booking-widget').style.display = 'block';
      
      // Update time slots based on configuration
      if (data.configuration && data.configuration.timeSlots) {
        const timeSelect = document.getElementById('startTime');
        timeSelect.innerHTML = '<option value="">Select a time...</option>';
        
        data.configuration.timeSlots.forEach(timeSlot => {
          const option = document.createElement('option');
          option.value = timeSlot;
          option.textContent = timeSlot;
          timeSelect.appendChild(option);
        });
      }

      // Disable specific dates
      if (data.configuration && data.configuration.disabledDates) {
        const dateInput = document.getElementById('bookingDate');
        dateInput.addEventListener('change', function() {
          const selectedDate = this.value;
          if (data.configuration.disabledDates.includes(selectedDate)) {
            alert('This date is not available for booking. Please select another date.');
            this.value = '';
          }
        });
      }
    }
  } catch (error) {
    console.error('Failed to check booking configuration:', error);
  }
}

// Check booking status when page loads
checkBookingEnabled();
</script>
```

### **Method 2: Using Shopify App Blocks (Advanced)**

1. **Deploy the extension:**
   ```bash
   shopify app deploy
   ```

2. **Add to product template:**
   - Go to Online Store → Themes → Customize
   - Select a product page
   - Add a new block
   - Choose "Product Booking Block"

### **Method 3: Using Liquid Templates**

Add this to your `product.liquid` template:

```liquid
{% if product.tags contains 'bookable' %}
  <div id="booking-widget">
    <!-- Include the HTML from Method 1 here -->
  </div>
{% endif %}
```

## 🔧 **Admin Setup**

### **1. Set Available Time Slots**

Go to your app admin → Services → Add/Edit Services:
- Set available time slots for each service
- Set pricing and duration
- Enable/disable services

### **2. Manage Bookings**

Go to your app admin → Bookings:
- View all customer bookings
- See customer details (name, email, phone)
- Manage booking status
- Export booking data

## 📱 **Testing**

1. **Add the HTML to a product page**
2. **Test the booking form:**
   - Fill out customer details
   - Select date and time
   - Submit the form
3. **Check admin dashboard:**
   - Go to your app admin
   - Check Bookings section
   - Verify the booking appears

## 🎯 **Next Steps**

1. **Test the integration** on your product pages
2. **Customize the styling** to match your store theme
3. **Set up email notifications** (when ready)
4. **Configure Google Sheets sync** (when ready)

## 🆘 **Troubleshooting**

- **Form not submitting:** Check the ngrok URL is correct
- **Styling issues:** Adjust the CSS in the HTML
- **No bookings showing:** Check the API endpoint is working
- **Date/time issues:** Verify the time slots are properly configured

## 📞 **Support**

If you need help:
1. Check the app admin dashboard for errors
2. Test the API endpoints directly
3. Verify the ngrok URL is accessible
4. Check browser console for JavaScript errors
