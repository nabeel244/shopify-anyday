# 🏪 Live Shopify Store Testing Guide

## 🚀 **Step-by-Step Process to Test on Your Client's Live Store**

### **Step 1: Get Your Client's Store Information**

**You need:**
- Client's store domain (e.g., `client-store.myshopify.com`)
- Client's admin access (or they need to install the app)

### **Step 2: Update App Configuration**

**Replace in the installation URL:**
- `your-client-store` → `client-store` (their actual store domain)
- `https://your-app-url.com` → Your actual app URL (you'll get this from Shopify Partners)

### **Step 3: Generate Installation URL**

**For your client's store, use this URL format:**
```
https://CLIENT-STORE-DOMAIN.myshopify.com/admin/oauth/authorize?client_id=83d8bbef5c1e5717eba7bb0fd1252451&scope=write_products,read_products,read_orders,write_orders&redirect_uri=YOUR-APP-URL&state=booking-app-install
```

**Example:**
```
https://myclientstore.myshopify.com/admin/oauth/authorize?client_id=83d8bbef5c1e5717eba7bb0fd1252451&scope=write_products,read_products,read_orders,write_orders&redirect_uri=https://your-app-url.com/api/auth&state=booking-app-install
```

### **Step 4: Install App on Client's Store**

**Process:**
1. **Send installation URL to your client**
2. **Client clicks the URL**
3. **Client authorizes the app**
4. **App gets installed in their admin panel**

### **Step 5: Access the Booking System**

**After installation, your client can access:**
- **Admin Panel**: `https://CLIENT-STORE.myshopify.com/admin/apps`
- **Booking Dashboard**: Look for "booking-app-google-sheet" in the apps list

---

## 🧪 **Testing Process on Live Store**

### **Phase 1: Admin Panel Testing**

**1. Access Admin Dashboard**
- Go to client's Shopify admin
- Navigate to Apps → Find "booking-app-google-sheet"
- Click to open the booking system

**2. Test Services Management**
- Go to Services section
- Add your client's actual services
- Test editing, deleting services
- Verify pricing and duration settings

**3. Test Bookings Management**
- View existing bookings (if any)
- Test search functionality
- Test filtering by status
- Test date range filtering

### **Phase 2: Product Page Integration**

**1. Add Booking Widget to Product Pages**

**Method 1: Theme Integration (Recommended)**
```liquid
<!-- Add this to your client's product.liquid template -->
<div id="booking-widget-container" style="margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
  <h3 style="margin-bottom: 15px;">Book This Service</h3>
  <div id="booking-widget"></div>
</div>

<script>
// Load the booking widget
fetch('/app/booking-widget?productId={{ product.id }}&title={{ product.title }}&price={{ product.price }}')
  .then(response => response.text())
  .then(html => {
    document.getElementById('booking-widget').innerHTML = html;
  })
  .catch(error => {
    console.error('Error loading booking widget:', error);
    document.getElementById('booking-widget').innerHTML = '<p>Booking widget temporarily unavailable. Please contact us to book this service.</p>';
  });
</script>
```

**Method 2: App Block (Advanced)**
- Create a Shopify app block
- Allow client to add booking widget to any page
- More flexible but requires additional development

### **Phase 3: Customer Booking Flow Testing**

**1. Test Complete Booking Process**
- Visit a product page with the booking widget
- Click "Book Appointment"
- Complete all 4 steps:
  - Personal information
  - Service selection
  - Date/time selection
  - Confirmation

**2. Test Real-time Features**
- Try booking the same time slot twice
- Verify availability updates in real-time
- Test different dates and times

**3. Test Email Notifications**
- Check if confirmation emails are sent
- Verify email content and formatting
- Test both customer and admin notifications

---

## 🔧 **Configuration for Live Store**

### **Environment Variables**

**Create `.env` file with:**
```env
# Shopify App Configuration
SHOPIFY_API_KEY=83d8bbef5c1e5717eba7bb0fd1252451
SHOPIFY_API_SECRET=your_api_secret
SCOPES=write_products,read_products,read_orders,write_orders

# Database
DATABASE_URL="file:./dev.sqlite"

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
COMPANY_EMAIL=client@theircompany.com

# App URL (get from Shopify Partners)
APP_URL=https://your-app-url.com
```

### **Client Store Setup**

**1. Services Configuration**
- Add client's actual services
- Set correct pricing
- Configure durations
- Add descriptions

**2. Business Hours Setup**
- Configure available time slots
- Set business hours
- Handle holidays/closures

**3. Email Templates**
- Customize email templates
- Add client's branding
- Set correct company email

---

## 📱 **Testing Checklist**

### **Admin Panel Testing**
- [ ] Can access booking system from Shopify admin
- [ ] Can add/edit/delete services
- [ ] Can view all bookings
- [ ] Can search bookings
- [ ] Can filter by status
- [ ] Can filter by date range
- [ ] Can update booking status
- [ ] Can delete bookings

### **Product Page Testing**
- [ ] Booking widget appears on product pages
- [ ] Widget is responsive on mobile
- [ ] Widget matches store's design
- [ ] All services are listed correctly
- [ ] Pricing is accurate
- [ ] Time slots are available

### **Customer Booking Flow**
- [ ] Can complete 4-step booking process
- [ ] Personal information validation works
- [ ] Service selection works
- [ ] Date/time selection works
- [ ] Confirmation step works
- [ ] Booking is saved to database
- [ ] Email notifications are sent
- [ ] Real-time availability prevents double bookings

### **Email Testing**
- [ ] Customer receives confirmation email
- [ ] Admin receives booking notification
- [ ] Email content is correct
- [ ] Email formatting is professional
- [ ] Links in emails work correctly

---

## 🚨 **Troubleshooting Common Issues**

### **Issue 1: App Not Installing**
**Solutions:**
- Check client_id is correct
- Verify store domain format
- Ensure app is deployed
- Check Shopify Partners dashboard

### **Issue 2: Booking Widget Not Loading**
**Solutions:**
- Check browser console for errors
- Verify app is installed correctly
- Check network requests
- Ensure product template is correct

### **Issue 3: No Available Time Slots**
**Solutions:**
- Check if services are created
- Verify business hours settings
- Check for existing bookings
- Test with different dates

### **Issue 4: Email Notifications Not Working**
**Solutions:**
- Check SMTP configuration
- Verify email credentials
- Check spam folders
- Test with different email providers

---

## 📊 **Success Metrics**

**Your booking system is working correctly if:**
- ✅ App installs successfully on client's store
- ✅ Admin can manage services and bookings
- ✅ Booking widget appears on product pages
- ✅ Customers can complete booking process
- ✅ Email notifications are sent
- ✅ Real-time availability works
- ✅ All filters and search functions work

---

## 🎯 **Next Steps After Testing**

**Once testing is complete:**
1. **Deploy to production** (if not already done)
2. **Set up Google Sheets integration** (next phase)
3. **Configure email templates** with client branding
4. **Train client** on using the admin panel
5. **Monitor performance** and user feedback
6. **Plan additional features** based on client needs

---

## 📞 **Support**

**If you encounter issues:**
1. Check Shopify Partners dashboard for app status
2. Verify all environment variables are set
3. Check browser console for JavaScript errors
4. Test with different browsers and devices
5. Contact Shopify support if needed

**Ready to test?** Start with the installation process and work through each phase systematically!
