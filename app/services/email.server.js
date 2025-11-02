import nodemailer from 'nodemailer';

export class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  async sendBookingConfirmation(bookingData, companyEmail) {
    if (!this.transporter) {
      console.log('Email transporter not initialized');
      return { success: false, message: 'Email not configured' };
    }

    try {
      const { user, service, productBookingConfig, bookingDate, startTime, endTime, specialRequests, totalPrice } = bookingData;
      const serviceName = service?.name || productBookingConfig?.productTitle || 'Service';

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
              <p><strong>Phone:</strong> ${user.phone || 'Not provided'}</p>
            </div>

            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #28a745; margin-top: 0;">Booking Details</h3>
              <p><strong>Service:</strong> ${serviceName}</p>
              <p><strong>Date:</strong> ${new Date(bookingDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
              <p><strong>Total Price:</strong> $${totalPrice}</p>
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
      console.log('✅ Booking confirmation email sent to:', companyEmail);
      return result;
    } catch (error) {
      console.error('Failed to send booking confirmation email:', error);
      throw error;
    }
  }

  async sendCustomerConfirmation(bookingData) {
    if (!this.transporter) {
      console.log('Email transporter not initialized');
      return { success: false, message: 'Email not configured' };
    }

    try {
      const { user, service, productBookingConfig, bookingDate, startTime, endTime, specialRequests, totalPrice } = bookingData;
      const serviceName = service?.name || productBookingConfig?.productTitle || 'Service';

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: user.email,
        subject: `Booking Confirmation - ${serviceName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
              Booking Confirmed! 🎉
            </h2>
            
            <p>Dear ${user.firstName},</p>
            
            <p>Thank you for booking with us! Your booking has been confirmed.</p>

            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #28a745; margin-top: 0;">Booking Details</h3>
              <p><strong>Service:</strong> ${serviceName}</p>
              <p><strong>Date:</strong> ${new Date(bookingDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
              <p><strong>Total Price:</strong> $${totalPrice}</p>
              ${specialRequests ? `<p><strong>Special Requests:</strong> ${specialRequests}</p>` : ''}
            </div>

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>Important:</strong> Please arrive on time for your appointment. If you need to make any changes, please contact us as soon as possible.
              </p>
            </div>

            <p>We look forward to serving you!</p>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
              <p style="color: #6c757d; font-size: 14px;">
                This is an automated confirmation email. Please do not reply.
              </p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Customer confirmation email sent to:', user.email);
      return result;
    } catch (error) {
      console.error('Failed to send customer confirmation email:', error);
      throw error;
    }
  }

  async sendBookingCancellation(bookingData, reason = '') {
    if (!this.transporter) {
      console.log('Email transporter not initialized');
      return { success: false, message: 'Email not configured' };
    }

    try {
      const { user, service, productBookingConfig, bookingDate, startTime, endTime, totalPrice } = bookingData;
      const serviceName = service?.name || productBookingConfig?.productTitle || 'Service';

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: user.email,
        subject: `Booking Cancelled - ${serviceName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">
              Booking Cancelled
            </h2>
            
            <p>Dear ${user.firstName},</p>
            
            <p>We regret to inform you that your booking has been cancelled.</p>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Original Booking Details</h3>
              <p><strong>Service:</strong> ${serviceName}</p>
              <p><strong>Date:</strong> ${new Date(bookingDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
              <p><strong>Total Price:</strong> $${totalPrice}</p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            </div>

            <p>If you have any questions or would like to reschedule, please contact us.</p>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
              <p style="color: #6c757d; font-size: 14px;">
                This is an automated email. Please do not reply.
              </p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Cancellation email sent to:', user.email);
      return result;
    } catch (error) {
      console.error('Failed to send cancellation email:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
