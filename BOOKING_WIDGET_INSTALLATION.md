# 📅 Product Page Booking Widget - Installation Guide

This guide will help you integrate the booking widget into your Shopify product pages, similar to the BookX plugin functionality.

## 🎯 Features

- ✅ **Inline booking form** (no modal popup)
- ✅ **Date and time selection** with availability checking
- ✅ **Customer information fields** (name, email, phone)
- ✅ **Special requests** support
- ✅ **Real-time booking summary**
- ✅ **Responsive design** for mobile and desktop
- ✅ **Professional styling** that matches your theme
- ✅ **Instant confirmation** with email notifications

## 📦 Files Included

1. `app/components/ProductPageBookingForm.jsx` - React component for admin panel
2. `public/booking-widget.html` - Standalone HTML version
3. `public/booking-widget.liquid` - Shopify Liquid snippet
4. This installation guide

## 🚀 Installation Methods

### Method 1: Shopify Liquid Snippet (Recommended)

#### Step 1: Upload the Snippet
1. Go to your Shopify admin → Online Store → Themes
2. Click "Actions" → "Edit code" on your current theme
3. Navigate to `Snippets` folder
4. Create a new file called `booking-widget.liquid`
5. Copy the contents from `public/booking-widget.liquid` into this file

#### Step 2: Add to Product Template
1. Navigate to `Templates` folder
2. Open `product.liquid` (or your custom product template)
3. Find the section where you want to show the booking widget (usually before the "Add to Cart" button)
4. Add this code:

```liquid
{% comment %} Add booking widget before add to cart button {% endcomment %}
{% render 'booking-widget', product: product %}
```

#### Step 3: Enable Booking for Products
To enable booking for a specific product, add a metafield:

1. Go to Products in your Shopify admin
2. Edit the product where you want to show booking
3. Go to "Metafields" section
4. Add a new metafield:
   - **Namespace and key**: `custom.booking_enabled`
   - **Type**: Boolean
   - **Value**: `true`

### Method 2: Direct HTML Integration

If you prefer to add the widget directly to your theme files:

1. Copy the HTML, CSS, and JavaScript from `public/booking-widget.html`
2. Add the CSS to your theme's main stylesheet
3. Add the HTML where you want the widget to appear
4. Add the JavaScript to your theme's main JavaScript file

### Method 3: Using the React Component (Admin Panel)

The React component is already integrated into your admin panel and can be used in the Shopify app interface.

## 🎨 Customization

### Styling
The widget includes comprehensive CSS that you can customize:

- **Colors**: Change the gradient colors in `.booking-header` and `.booking-button`
- **Fonts**: Modify the `font-family` in `.booking-widget`
- **Spacing**: Adjust padding and margins in `.booking-content`
- **Border radius**: Change the `border-radius` for different corner styles

### Time Slots
To modify available time slots, edit the `<select>` options in the HTML:

```html
<select id="startTime" name="startTime" required>
  <option value="">Select a time...</option>
  <option value="09:00">9:00 AM</option>
  <option value="10:00">10:00 AM</option>
  <!-- Add more time slots as needed -->
</select>
```

### Duration
Change the default booking duration by modifying the `calculateEndTime` function:

```javascript
const endTime = calculateEndTime(time, 480); // 480 minutes = 8 hours
```

## 🔧 Configuration

### Product Setup
For each product where you want to show the booking widget:

1. **Enable booking**: Set `custom.booking_enabled` metafield to `true`
2. **Configure time slots**: Use the admin panel to set up specific time slots
3. **Set duration**: Configure the booking duration (default: 8 hours)
4. **Disable dates**: Set specific dates as unavailable

### API Endpoint
The widget sends booking data to `/api/bookings` endpoint. Make sure this endpoint is properly configured in your app.

## 📱 Responsive Design

The widget is fully responsive and will adapt to:
- **Desktop**: Full-width layout with side-by-side form fields
- **Tablet**: Adjusted spacing and layout
- **Mobile**: Single-column layout with touch-friendly buttons

## 🎯 User Experience Flow

1. **Product Page**: Customer sees the booking widget with service details
2. **Click to Book**: Customer clicks "Book Appointment" button
3. **Fill Form**: Customer fills in personal information and selects date/time
4. **Review Summary**: Customer reviews their booking details
5. **Confirm**: Customer submits the booking
6. **Confirmation**: Customer receives instant confirmation and email

## 🔍 Testing

### Test the Widget
1. Add the widget to a product page
2. Enable booking for that product
3. Fill out the form and submit a test booking
4. Check that the booking appears in your admin panel
5. Verify that confirmation emails are sent

### Test Different Scenarios
- Different time slots
- Various date selections
- Form validation (empty fields, invalid email)
- Mobile responsiveness
- Error handling

## 🚨 Troubleshooting

### Widget Not Showing
- Check that `custom.booking_enabled` metafield is set to `true`
- Verify the Liquid snippet is properly included in the product template
- Check browser console for JavaScript errors

### Booking Not Submitting
- Verify the `/api/bookings` endpoint is working
- Check network tab for API errors
- Ensure all required fields are filled

### Styling Issues
- Check for CSS conflicts with your theme
- Verify the CSS is properly loaded
- Test on different screen sizes

## 📞 Support

If you encounter any issues:

1. Check the browser console for JavaScript errors
2. Verify all files are properly uploaded
3. Test the API endpoints directly
4. Check the admin panel for booking data

## 🎉 Success!

Once installed, your customers will be able to:
- View available booking options on product pages
- Select their preferred date and time
- Fill in their contact information
- Receive instant booking confirmations
- Get email notifications about their bookings

The booking widget provides a professional, user-friendly experience similar to popular booking plugins like BookX, while being fully integrated with your Shopify app's backend system.
