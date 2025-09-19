# 🏪 Simple Guide: Install Booking App on Live Store

## 📋 **What You Have:**
- ✅ Client's Shopify store: anyday.ge
- ✅ Your Shopify Partner account with the booking app
- ✅ Access to client's store admin
- ✅ App Client ID: 83d8bbef5c1e5717eba7bb0fd1252451

## 🚀 **Simple Steps to Install:**

### **Step 1: Get Your App URL**

**Option A: Use ngrok (Recommended)**
1. Download ngrok from: https://ngrok.com/download
2. Open new terminal/command prompt
3. Run: `ngrok http 3000`
4. Copy the URL (looks like: `https://abc123.ngrok.io`)

**Option B: Use Shopify CLI**
1. Run: `shopify app dev`
2. It will give you a URL automatically

### **Step 2: Update Shopify Partners Dashboard**

1. Go to: https://partners.shopify.com/4508311/apps/282154795009/edit#app-urls-anchor
2. Fill in:
   - **App URL:** Your ngrok URL (e.g., `https://abc123.ngrok.io`)
   - **Allowed redirection URLs:** `https://abc123.ngrok.io/api/auth`
3. Click "Save"

### **Step 3: Install on Client's Store**

**Use this installation URL (replace YOUR_NGROK_URL with your actual ngrok URL):**

```
https://55361c-bc.myshopify.com/admin/oauth/authorize?client_id=83d8bbef5c1e5717eba7bb0fd1252451&scope=write_products,read_products,read_orders,write_orders&redirect_uri=https://YOUR_NGROK_URL/api/auth&state=booking-app-install
```

**Example with real ngrok URL:**
```
https://55361c-bc.myshopify.com/admin/oauth/authorize?client_id=83d8bbef5c1e5717eba7bb0fd1252451&scope=write_products,read_products,read_orders,write_orders&redirect_uri=https://abc123.ngrok.io/api/auth&state=booking-app-install
```

### **Step 4: Complete Installation**

1. **Open the installation URL** in your browser
2. **Make sure you're logged into** the store admin
3. **Click "Install"** when prompted
4. **Authorize the app** with the requested permissions

### **Step 5: Access Your Booking System**

**After installation:**
1. Go to: https://admin.shopify.com/store/55361c-bc/apps
2. Find: "booking-app-google-sheet" in the apps list
3. Click to open the booking system

## 🧪 **Test Your App:**

### **Admin Panel Testing:**
1. **Services:** Add birthday party services
2. **Bookings:** View and manage bookings
3. **Search & Filters:** Test all features

### **Product Page Integration:**
**Add this code to your client's product template:**

```liquid
<div id="booking-widget-container" style="margin: 20px 0; padding: 20px; border: 1px solid #ddd;">
  <h3>Book This Service</h3>
  <div id="booking-widget"></div>
</div>

<script>
fetch('/app/booking-widget?productId={{ product.id }}&title={{ product.title }}&price={{ product.price }}')
  .then(response => response.text())
  .then(html => {
    document.getElementById('booking-widget').innerHTML = html;
  });
</script>
```

## 🆘 **If Something Goes Wrong:**

### **Common Issues:**
1. **App not installing:** Check if ngrok URL is correct
2. **Widget not loading:** Check browser console for errors
3. **No services showing:** Go to Services section and add services

### **Need Help?**
1. Check if your app is running (should show on localhost:3000)
2. Verify ngrok is working (should show public URL)
3. Make sure you're logged into the store admin

## ✅ **Success Checklist:**

- [ ] App is running locally
- [ ] ngrok URL is working
- [ ] Shopify Partners dashboard updated
- [ ] App installed on client's store
- [ ] Can access booking system in admin
- [ ] Can add services and manage bookings
- [ ] Booking widget works on product pages

## 🎯 **What Happens Next:**

Once installed, your client can:
1. **Manage services** (birthday party packages, VIP centers, etc.)
2. **View bookings** from customers
3. **Customers can book** directly from product pages
4. **Get email notifications** for new bookings
5. **Sync data** with Google Sheets (next phase)

---

**Ready to start?** Begin with Step 1 - getting your ngrok URL!
