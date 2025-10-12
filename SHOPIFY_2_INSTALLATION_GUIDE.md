# 📅 Booking Widget Installation Guide - Shopify 2.0 Themes

This guide will help you integrate the booking widget into your Shopify 2.0 theme using JSON templates.

## 🎯 What You Need to Do

### Step 1: Upload the Section Files

1. **Go to your Shopify admin** → Online Store → Themes
2. **Click "Actions"** → "Edit code" on your current theme
3. **Upload the section file:**
   - Navigate to `sections` folder
   - Upload the `booking-widget.liquid` file from `public/sections/`
4. **Upload the CSS file:**
   - Navigate to `assets` folder  
   - Upload the `booking-widget.css` file from `public/assets/`

### Step 2: Update Your Product Template

You have **two options**:

#### Option A: Manual Update (Recommended)

1. **Download your current `product.json`** file from the theme editor
2. **Replace it with the updated version** I created (`product-with-booking.json`)
3. **Upload the updated `product.json`** file

#### Option B: Theme Editor (Easy)

1. **Go to your theme editor** (Online Store → Themes → Customize)
2. **Navigate to a product page**
3. **Click "Add section"**
4. **Search for "Booking Widget"** and add it
5. **Drag it to position** it before the "Add to cart" button
6. **Configure the settings** as needed
7. **Save the theme**

### Step 3: Enable Booking for Products

To show the booking widget on specific products:

1. **Go to Products** in your Shopify admin
2. **Edit the product** where you want to show booking
3. **Go to "Metafields" section** (at the bottom of the product page)
4. **Add a new metafield:**
   - **Namespace and key**: `custom.booking_enabled`
   - **Type**: Boolean
   - **Value**: `true`

## 🔧 Configuration Options

The booking widget has several customizable settings:

### Basic Settings
- **Service Duration**: Text description (e.g., "Full day service (8 hours)")
- **Duration in Minutes**: Number (e.g., 480 for 8 hours)
- **Info Section Title**: Title for the "What's included" section
- **Booking Description**: Text shown below the booking button

### What's Included
- **Include Item 1-4**: List items for the "What's included" section
  - Instant booking confirmation
  - Email notifications
  - Easy rescheduling
  - Professional service

### Time Slots
- **Available Time Slots**: Comma-separated list of time slots
  - Example: `09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00`

## 📱 How It Works

### For Customers:
1. **See the booking widget** on product pages (when enabled)
2. **Click "Book Appointment"** to expand the form
3. **Fill in personal information** (name, email, phone)
4. **Select date and time** from available options
5. **Add special requests** (optional)
6. **Review booking summary**
7. **Submit booking** and receive confirmation

### For You:
1. **Bookings appear** in your Shopify app admin panel
2. **Email notifications** sent to customers and you
3. **Google Sheets sync** (if configured)
4. **Manage bookings** through the admin interface

## 🎨 Customization

### Styling
The widget uses CSS that you can customize:

```css
/* Change the gradient colors */
.booking-header {
  background: linear-gradient(135deg, #your-color1 0%, #your-color2 100%);
}

/* Change button colors */
.booking-button {
  background: linear-gradient(135deg, #your-color1 0%, #your-color2 100%);
}
```

### Time Slots
Edit the time slots in the theme editor or directly in the section settings.

### Content
All text content can be customized through the theme editor settings.

## 🔍 Testing

### Test the Installation:
1. **Enable booking** for a test product
2. **Visit the product page** on your store
3. **Verify the widget appears** before the "Add to Cart" button
4. **Test the booking form** by filling it out
5. **Check that bookings** appear in your admin panel

### Test Different Scenarios:
- Different time slots
- Various date selections
- Form validation (empty fields, invalid email)
- Mobile responsiveness
- Error handling

## 🚨 Troubleshooting

### Widget Not Showing
- ✅ Check that `custom.booking_enabled` metafield is set to `true`
- ✅ Verify the section files are uploaded correctly
- ✅ Check browser console for JavaScript errors
- ✅ Ensure the section is added to the product template

### Booking Not Submitting
- ✅ Verify your app's `/api/bookings` endpoint is working
- ✅ Check network tab for API errors
- ✅ Ensure all required fields are filled
- ✅ Test the API endpoint directly

### Styling Issues
- ✅ Check for CSS conflicts with your theme
- ✅ Verify the CSS file is properly loaded
- ✅ Test on different screen sizes
- ✅ Clear browser cache

## 📞 Support

If you encounter issues:

1. **Check browser console** for JavaScript errors
2. **Verify all files** are properly uploaded
3. **Test the API endpoints** directly
4. **Check the admin panel** for booking data

## 🎉 Success!

Once installed, your customers will be able to:

- ✅ **View booking options** on product pages
- ✅ **Select preferred date and time**
- ✅ **Fill in contact information**
- ✅ **Receive instant confirmations**
- ✅ **Get email notifications**

The booking widget provides a professional, user-friendly experience similar to popular booking plugins like BookX, while being fully integrated with your Shopify app's backend system.

## 📋 Quick Checklist

- [ ] Upload `booking-widget.liquid` to sections folder
- [ ] Upload `booking-widget.css` to assets folder  
- [ ] Update `product.json` template (or use theme editor)
- [ ] Enable booking metafield for test product
- [ ] Test the booking widget on product page
- [ ] Verify bookings appear in admin panel
- [ ] Test email notifications
- [ ] Configure time slots and settings
- [ ] Test mobile responsiveness
- [ ] Go live! 🚀
