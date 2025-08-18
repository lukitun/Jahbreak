import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `Finance Tracker <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendBudgetAlert(email: string, budgetName: string, percentage: number, spent: number, total: number, currency: string): Promise<void> {
    const subject = `Budget Alert: ${budgetName} is ${percentage}% spent`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${percentage >= 100 ? '#dc3545' : '#ffc107'};">Budget Alert</h2>
        <p>Your budget <strong>${budgetName}</strong> has reached ${percentage}% of its limit.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Spent:</strong> ${spent.toFixed(2)} ${currency}</p>
          <p><strong>Total Budget:</strong> ${total.toFixed(2)} ${currency}</p>
          <p><strong>Remaining:</strong> ${Math.max(0, total - spent).toFixed(2)} ${currency}</p>
        </div>
        <p style="color: #6c757d; font-size: 14px;">
          This is an automated message from your Finance Tracker app.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject,
      html
    });
  }

  async sendTwoFactorCode(email: string, code: string): Promise<void> {
    const subject = 'Your Two-Factor Authentication Code';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">Two-Factor Authentication</h2>
        <p>Your verification code is:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <h1 style="color: #007bff; font-size: 36px; margin: 0;">${code}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p style="color: #6c757d; font-size: 14px;">
          If you didn't request this code, please ignore this email.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject,
      html
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const subject = 'Welcome to Finance Tracker!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Welcome to Finance Tracker!</h2>
        <p>Hi ${firstName},</p>
        <p>Thank you for joining Finance Tracker! We're excited to help you take control of your finances.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Getting Started:</h3>
          <ul>
            <li>Add your first expense</li>
            <li>Set up monthly budgets</li>
            <li>Create savings goals</li>
            <li>View your financial reports</li>
          </ul>
        </div>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Happy tracking!</p>
        <p style="color: #6c757d; font-size: 14px;">
          The Finance Tracker Team
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject,
      html
    });
  }
}

export default new EmailService();