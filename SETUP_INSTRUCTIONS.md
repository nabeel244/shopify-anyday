# Advanced Booking System for Shopify

A comprehensive booking system built for Shopify apps with Google Sheets integration, email notifications, and real-time availability management.

## Features

### ✅ Completed Features

1. **Advanced Booking System**
   - Multi-step booking form (Personal Info → Service Selection → Date/Time → Confirmation)
   - Real-time availability checking
   - Special requests/comments support
   - Automatic confirmation emails

2. **Google Sheets Integration**
   - Automatic booking data sync to Google Sheets
   - Real-time updates when bookings are modified
   - Manual entry support with website sync
   - Bidirectional synchronization

3. **Email Notification System**
   - Automatic confirmation emails to customers
   - Booking notifications to company email
   - Cancellation notifications
   - Professional email templates

4. **Admin Dashboard**
   - Complete booking management interface
   - Service management (CRUD operations)
   - Google Sheets configuration
   - Real-time statistics and overview

5. **Product Page Integration**
   - Booking widget for product pages
   - Responsive design
   - Easy integration with existing Shopify themes

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed sample data
curl -X POST http://localhost:3000/api/seed-data
```

### 3. Environment Variables

Create a `.env` file with the following variables:

```env
# Shopify App Configuration
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=write_products,read_orders

# Database
DATABASE_URL="file:./dev.sqlite"

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
COMPANY_EMAIL=admin@yourcompany.com

# Google Sheets (optional)
GOOGLE_SHEETS_CREDENTIALS=path/to/credentials.json
```

### 4. Google Sheets Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Google Sheets API
4. Create a service account and download JSON credentials
5. Create a Google Sheet and share it with the service account email
6. Configure the integration in the app admin panel

### 5. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## Usage Guide

### For Store Owners

1. **Setup Services**
   - Go to `/app/services`
   - Add your services with prices and durations
   - Set service descriptions

2. **Configure Google Sheets** (Optional)
   - Go to `/app/google-sheets-config`
   - Enter your spreadsheet ID and credentials
   - Test the connection

3. **Manage Bookings**
   - View all bookings at `/app/bookings`
   - Update booking statuses
   - Handle cancellations

### For Customers

1. **Booking Process**
   - Visit product page with booking widget
   - Fill in personal information
   - Select service and time slot
   - Add special requests
   - Confirm booking

2. **Email Confirmations**
   - Automatic confirmation emails
   - Booking details and reminders
   - Cancellation notifications

## API Endpoints

### Services
- `GET /api/services` - List all services
- `POST /api/services` - Create new service
- `PATCH /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Bookings
- `GET /api/bookings` - List bookings (with filters)
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

### Availability
- `GET /api/availability?serviceId=X&date=Y` - Get available time slots

### Google Sheets
- `POST /api/google-sheets-config` - Save configuration
- `POST /api/google-sheets-test` - Test connection
- `GET /webhooks/google-sheets-sync` - Sync from sheets

## Integration with Shopify

### Product Page Widget

To add the booking widget to your product pages:

```javascript
// In your theme's product.liquid or product template
<div id="booking-widget"></div>

<script>
// Load the booking widget
fetch('/app/booking-widget?productId={{ product.id }}&title={{ product.title }}&price={{ product.price }}')
  .then(response => response.text())
  .then(html => {
    document.getElementById('booking-widget').innerHTML = html;
  });
</script>
```

### Theme Integration

For better integration, you can:

1. **Create a Shopify App Block**
   - Add the booking widget as a Shopify app block
   - Allow merchants to add it to any page

2. **Use Shopify Scripts**
   - Add booking functionality to checkout
   - Integrate with Shopify's order system

## Customization

### Styling
- Modify Polaris components in the React components
- Add custom CSS for theme-specific styling
- Use Shopify's design tokens for consistency

### Email Templates
- Customize email templates in `app/services/email.server.js`
- Add your company branding
- Modify notification content

### Booking Flow
- Extend the booking form in `app/components/BookingForm.jsx`
- Add custom validation rules
- Modify the multi-step process

## Troubleshooting

### Common Issues

1. **Database Connection**
   - Ensure SQLite file permissions
   - Check DATABASE_URL in .env

2. **Email Notifications**
   - Verify SMTP credentials
   - Check spam folders
   - Test with different email providers

3. **Google Sheets Integration**
   - Verify service account permissions
   - Check spreadsheet sharing settings
   - Validate JSON credentials format

4. **Booking Widget Not Loading**
   - Check CORS settings
   - Verify API endpoints
   - Test in different browsers

### Support

For technical support or feature requests, please check:
- Shopify App Development documentation
- Polaris Design System documentation
- Prisma ORM documentation

## Security Considerations

1. **Data Protection**
   - All customer data is encrypted in transit
   - Database uses secure connections
   - API endpoints require authentication

2. **Google Sheets Security**
   - Service account credentials are encrypted
   - Limited API permissions
   - Regular credential rotation recommended

3. **Email Security**
   - SMTP over TLS
   - No sensitive data in email content
   - Secure credential storage

## Performance Optimization

1. **Database**
   - Indexed queries for fast lookups
   - Connection pooling
   - Query optimization

2. **Frontend**
   - Lazy loading of components
   - Optimized bundle size
   - Caching strategies

3. **API**
   - Rate limiting
   - Response caching
   - Efficient data serialization

## Future Enhancements

Potential features for future development:

1. **Advanced Features**
   - Recurring appointments
   - Group bookings
   - Payment integration
   - Calendar integration

2. **Analytics**
   - Booking analytics dashboard
   - Revenue tracking
   - Customer insights

3. **Mobile App**
   - React Native mobile app
   - Push notifications
   - Offline support

4. **Integrations**
   - Calendar apps (Google Calendar, Outlook)
   - Payment processors (Stripe, PayPal)
   - CRM systems
   - Marketing tools

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Changelog

### Version 1.0.0
- Initial release
- Multi-step booking system
- Google Sheets integration
- Email notifications
- Admin dashboard
- Product page widget
