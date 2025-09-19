// import nodemailer from 'nodemailer';

// Email functionality temporarily disabled
// Will be enabled after installing nodemailer package

export class EmailService {
  constructor() {
    this.transporter = null;
    // this.initializeTransporter();
  }

  initializeTransporter() {
    // Email functionality temporarily disabled
    console.log('Email functionality temporarily disabled');
    return;
    
    /* Original code commented out
    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
    */
  }

  async sendBookingConfirmation(bookingData, companyEmail) {
    // Email functionality temporarily disabled
    console.log('Email sendBookingConfirmation temporarily disabled');
    return { success: true, message: 'Email disabled' };
    
    /* Original code commented out
    if (!this.transporter) {
      throw new Error('Email service not initialized');
    }

    try {
      const { user, service, bookingDate, startTime, endTime, specialRequests, totalPrice } = bookingData;

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: companyEmail,
        subject: `New Booking Confirmation - ${user.firstName} ${user.lastName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
              New Booking Confirmation
            </h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #007bff; margin-top: 0;">Customer Information</h3>
              <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Phone:</strong> ${user.phone}</p>
            </div>

            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #28a745; margin-top: 0;">Booking Details</h3>
              <p><strong>Service:</strong> ${service.name}</p>
              <p><strong>Date:</strong> ${new Date(bookingDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
              <p><strong>Duration:</strong> ${service.duration} minutes</p>
              <p><strong>Price:</strong> $${totalPrice}</p>
              ${specialRequests ? `<p><strong>Special Requests:</strong> ${specialRequests}</p>` : ''}
            </div>

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>Note:</strong> This booking has been automatically logged to your Google Sheet for easy management.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
              <p style="color: #6c757d; font-size: 14px;">
                This email was sent automatically by your booking system.
              </p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      console.error('Failed to send booking confirmation email:', error);
      throw error;
    }
    */
  }

  async sendCustomerConfirmation(bookingData) {
    // Email functionality temporarily disabled
    console.log('Email sendCustomerConfirmation temporarily disabled');
    return { success: true, message: 'Email disabled' };
    
    /* Original code commented out - same pattern as above */
  }

  async sendBookingCancellation(bookingData, reason = '') {
    // Email functionality temporarily disabled
    console.log('Email sendBookingCancellation temporarily disabled');
    return { success: true, message: 'Email disabled' };
    
    /* Original code commented out - same pattern as above */
  }
}

export const emailService = new EmailService();
