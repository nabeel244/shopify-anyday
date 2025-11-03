# 🚨 Missing Features Analysis - Anyday Booking System

After reviewing the requirements document and comparing it with the current implementation, here are the missing features:

---

## ❌ **CRITICAL MISSING FEATURES**

### 1. **Child's Name Field** ❌
**Requirement:** Step 2 should collect "her child's name"

**Current Status:** 
- ❌ Not in `BookingForm.jsx` (Step 1 only collects parent info)
- ❌ Not in database schema (`User` model or `Booking` model)
- ❌ Not displayed anywhere in the booking flow

**Location to Add:**
- `app/components/BookingForm.jsx` - Step 2 (Personal Information)
- `prisma/schema.prisma` - Add `childName` field to `Booking` model
- `app/routes/api.bookings.jsx` - Include in booking creation

---

### 2. **Booking Fee System (20-25 GEL)** ❌
**Requirement:** 
- Small booking fee (20-25 GEL) paid on website to confirm booking
- This is separate from the deposit

**Current Status:**
- ❌ No separate booking fee field
- ❌ Currently uses `totalPrice` for full payment
- ❌ No configuration for booking fee amount per center
- ❌ Booking fee should be fixed (20-25 GEL), not the full amount

**What Needs to Change:**
- Add `bookingFee` field to `ProductBookingConfig` model
- Modify payment flow to charge booking fee first (not full price)
- Store booking fee separately from total price
- Booking fee should be non-refundable

---

### 3. **Deposit System (10% to Center's Bank Account)** ❌
**Requirement:**
- After booking fee payment, customer must pay 10% deposit to center's unique bank account
- Must be paid within 30 minutes or booking auto-cancels
- Each center has its own bank account

**Current Status:**
- ❌ No deposit tracking
- ❌ No 30-minute timer/automated cancellation
- ❌ No bank account field per center
- ❌ No deposit payment status tracking

**What Needs to Be Added:**

#### Database Changes:
```prisma
model ProductBookingConfig {
  // ... existing fields ...
  bookingFee        Float?   // 20-25 GEL booking fee
  bankAccountNumber String?  // Center's unique bank account
  bankAccountName   String?  // Bank account holder name
  bankName          String?  // Bank name
  depositPercentage Float?   @default(10.0) // Default 10%
}

model Booking {
  // ... existing fields ...
  childName         String?  // Child's name
  bookingFee        Float?   // Booking fee paid
  depositAmount     Float?   // 10% deposit amount
  depositPaid       Boolean  @default(false)
  depositPaidAt     DateTime?
  depositDeadline   DateTime? // 30 minutes after booking fee payment
}
```

#### New Features Needed:
1. **Deposit Payment Notification Email**
   - Send email after booking fee payment with:
     - Bank account details (center-specific)
     - Deposit amount (10% of total)
     - 30-minute deadline
     - Payment instructions

2. **30-Minute Timer & Auto-Cancellation**
   - Background job/cron to check bookings
   - If `depositDeadline` passed and `depositPaid === false`
   - Auto-cancel booking
   - Send cancellation email
   - Release date/time slot

3. **Deposit Payment Tracking**
   - Manual confirmation by manager OR
   - Automatic tracking (if integrated with bank API)

---

### 4. **Number of Kids Field** ❌
**Requirement:** Booking should include number of kids attending

**Current Status:**
- ❌ Not in booking form
- ❌ Not in database schema
- ❌ Not in Google Sheets sync

**Location to Add:**
- `app/components/BookingForm.jsx`
- `prisma/schema.prisma` - Add `numberOfKids Int?` to `Booking` model
- `app/services/googleSheets.server.js` - Include in sheet columns

---

### 5. **Manual Booking by Manager** ❌
**Requirement:** Manager should be able to manually enter bookings in spreadsheet, which blocks date/time on website

**Current Status:**
- ❌ No UI for managers to create manual bookings
- ❌ No API endpoint for manual booking creation
- ✅ Google Sheets sync exists (but only one-way: website → sheets)
- ❌ No bidirectional sync for manual entries

**What Needs to Be Added:**

1. **Admin UI for Manual Bookings**
   - Create new route: `app/routes/app.manual-booking.jsx`
   - Form to enter:
     - Customer name, email, phone
     - Child's name
     - Date, time
     - Selected services
     - Number of kids
     - Special requests

2. **API Endpoint**
   - `app/routes/api.manual-booking.jsx`
   - Accept manager-entered bookings
   - Create booking with status `MANUAL`
   - Block date/time immediately
   - Sync to Google Sheets

3. **Google Sheets → Website Sync (Enhanced)**
   - Current: Only syncs cancellations from sheets
   - Needed: Also sync new bookings from sheets
   - Detect new rows added by manager
   - Create bookings in database
   - Block date/time slots

---

### 6. **Service Selection with Individual Prices** ⚠️ **PARTIAL**
**Requirement:** 
- Step 3 should allow selecting services (Spider-Man, Superman, fireworks, etc.)
- Each service has its own price
- Some services are free (included in package)
- Total price should show sum of all selected services

**Current Status:**
- ✅ `selectedServices` field exists in `Booking` model (JSON)
- ✅ Services can be configured in `ProductBookingConfig.services` (JSON)
- ⚠️ **UI Implementation Unclear** - Need to verify if service selection UI exists in booking form

**What to Verify:**
- Check if `ProductPageBookingForm.jsx` includes service selection
- Check if service prices are calculated correctly
- Ensure free services are marked and included automatically

---

### 7. **Enhanced Notification System** ❌
**Requirement:** 
- After booking fee payment: Send notification with deposit payment details
- Include center-specific bank account info
- Explain 30-minute deadline
- Remind about cancellation if deposit not paid

**Current Status:**
- ✅ Basic confirmation emails exist
- ❌ No deposit payment instruction email
- ❌ No 30-minute deadline warning email

**What Needs to Be Added:**

1. **Deposit Payment Instruction Email** (`sendDepositPaymentInstructions`)
   - Template with:
     - Center's bank account details
     - Deposit amount (10% of total)
     - Payment instructions
     - 30-minute deadline countdown
     - Warning about auto-cancellation

2. **30-Minute Warning Email** (optional)
   - Send at 15 minutes remaining
   - Remind about deadline

3. **Auto-Cancellation Email**
   - If deposit not paid: Send cancellation notification
   - Explain booking fee is non-refundable

---

### 8. **Enhanced Cancellation Scenarios** ⚠️ **PARTIAL**

#### Scenario 1: Customer Cancels
**Requirement:** 
- Customer contacts center directly
- Booking fee is non-refundable
- Manager deletes from spreadsheet → date/time becomes available

**Current Status:**
- ✅ Cancellation exists in system
- ✅ Google Sheets deletion syncs back to website
- ❌ No explicit handling of "booking fee non-refundable" message
- ⚠️ Need to verify: Does deletion from sheets release the slot?

#### Scenario 2: Deposit Not Paid (30 minutes)
**Requirement:**
- Auto-cancel if deposit not paid within 30 minutes
- Booking fee remains non-refundable
- Date/time becomes available

**Current Status:**
- ❌ No automated cancellation system
- ❌ No 30-minute timer

#### Scenario 3: Physical Booking at Center
**Requirement:**
- Manager enters booking manually in spreadsheet
- Date/time automatically blocked on website

**Current Status:**
- ❌ No manual booking feature
- ❌ No sync from sheets → website for new bookings

---

### 9. **Booking Fee vs Total Price Clarity** ❌
**Requirement:**
- Booking fee = 20-25 GEL (paid to website)
- Deposit = 10% of total (paid to center's bank)
- Total price = Full birthday package price

**Current Status:**
- ❌ All prices are mixed - no clear distinction
- ❌ No separation between booking fee, deposit, and total

**What Needs Clarity:**
- Display breakdown:
  - Booking Fee: 20-25 GEL (non-refundable)
  - Deposit: 10% of total (to be paid to center)
  - Total Package Price: [full amount]
  - Remaining Balance: [total - deposit]

---

### 10. **Date/Time Slot Blocking Logic** ⚠️ **NEEDS VERIFICATION**
**Requirement:**
- When booking fee is paid → block date/time
- When booking is cancelled → release date/time
- When manual booking added → block date/time

**Current Status:**
- ✅ Availability checking exists (`api.availability.jsx`)
- ⚠️ Need to verify:
  - Does temporary booking (before payment) block slots?
  - Does cancellation properly release slots?
  - Are manual bookings checked in availability?

---

## ✅ **FEATURES THAT EXIST**

1. ✅ Filter system (date, time, city)
2. ✅ Booking form (3 steps)
3. ✅ Service selection field (JSON storage)
4. ✅ Payment integration (Shopify checkout)
5. ✅ Google Sheets sync (website → sheets)
6. ✅ Email notifications (confirmation, cancellation)
7. ✅ Cancellation from Google Sheets
8. ✅ Date/time availability checking
9. ✅ Multiple centers support

---

## 📋 **IMPLEMENTATION PRIORITY**

### **Priority 1 - Critical for MVP:**
1. Child's name field
2. Booking fee system (20-25 GEL)
3. Deposit system with bank account per center
4. Deposit payment notification email
5. Number of kids field

### **Priority 2 - Important for Full Functionality:**
6. 30-minute timer & auto-cancellation
7. Manual booking feature
8. Enhanced Google Sheets sync (bidirectional)

### **Priority 3 - Nice to Have:**
9. 15-minute warning email
10. Enhanced price breakdown display

---

## 🔧 **FILES THAT NEED MODIFICATION**

### Database Schema:
- `prisma/schema.prisma` - Add fields for childName, bookingFee, deposit, bankAccount, numberOfKids

### Components:
- `app/components/BookingForm.jsx` - Add child's name, number of kids, service selection UI
- `app/components/ProductPageBookingForm.jsx` - Verify service selection implementation

### API Routes:
- `app/routes/api.bookings.jsx` - Handle booking fee, deposit tracking
- `app/routes/api.manual-booking.jsx` - **NEW** - Create manual bookings
- `app/routes/api.deposit-confirm.jsx` - **NEW** - Confirm deposit payment

### Services:
- `app/services/email.server.js` - Add deposit payment instruction email
- `app/services/googleSheets.server.js` - Add bidirectional sync for manual bookings

### Background Jobs:
- `app/routes/api.deposit-checker.jsx` - **NEW** - Cron job to check 30-minute deadlines

### Admin UI:
- `app/routes/app.manual-booking.jsx` - **NEW** - Manual booking form

---

## 📝 **SUMMARY**

**Total Missing Features:** 10 major features
**Partially Implemented:** 2 features (service selection, cancellation)
**Fully Implemented:** 9 features (filter, basic booking, payment, emails, etc.)

**Estimated Implementation Effort:**
- Priority 1: ~2-3 days
- Priority 2: ~2 days
- Priority 3: ~1 day

**Total Estimated Time:** 5-6 days for complete implementation

