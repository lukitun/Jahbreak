const nodemailer = require('nodemailer');
const logger = require('./logger');

let transporter;

const initEmailTransporter = () => {
  if (process.env.NODE_ENV === 'test') {
    // Use ethereal for testing
    transporter = nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
    return;
  }

  // Production email configuration
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else if (process.env.SENDGRID_API_KEY) {
    transporter = nodemailer.createTransporter({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  } else {
    logger.warn('No email configuration found. Email features will be disabled.');
  }
};

const sendEmail = async (options) => {
  if (!transporter) {
    logger.error('Email transporter not configured');
    return false;
  }

  try {
    const mailOptions = {
      from: options.from || process.env.EMAIL_FROM || 'noreply@blogplatform.com',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${options.to}`);
    return result;
  } catch (error) {
    logger.error('Email sending failed:', error);
    return false;
  }
};

const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Our Blog Platform!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Welcome to Our Blog Platform!</h1>
      <p>Hello ${user.firstName},</p>
      <p>Thank you for joining our blog platform. We're excited to have you as part of our community!</p>
      <p>You can now:</p>
      <ul>
        <li>Read and discover amazing content</li>
        <li>Leave comments and engage with other readers</li>
        <li>Create your own posts (if you're an author)</li>
      </ul>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Happy reading!</p>
      <p style="color: #666; font-size: 14px;">
        Best regards,<br>
        The Blog Platform Team
      </p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html
  });
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const subject = 'Password Reset Request';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Password Reset Request</h1>
      <p>Hello ${user.firstName},</p>
      <p>We received a request to reset your password for your blog platform account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">
        Reset Password
      </a>
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <p style="color: #666; font-size: 14px;">
        Best regards,<br>
        The Blog Platform Team
      </p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html
  });
};

const sendEmailVerification = async (user, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  const subject = 'Please Verify Your Email Address';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Email Verification</h1>
      <p>Hello ${user.firstName},</p>
      <p>Thank you for registering with our blog platform. Please verify your email address to complete your registration.</p>
      <p>Click the link below to verify your email:</p>
      <a href="${verificationUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">
        Verify Email
      </a>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create this account, please ignore this email.</p>
      <p style="color: #666; font-size: 14px;">
        Best regards,<br>
        The Blog Platform Team
      </p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html
  });
};

const sendCommentNotification = async (postAuthor, commenter, post, comment) => {
  if (postAuthor.email === commenter.email) return; // Don't notify self

  const subject = `New comment on your post: ${post.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">New Comment on Your Post</h1>
      <p>Hello ${postAuthor.firstName},</p>
      <p>${commenter.getFullName()} left a comment on your post "${post.title}":</p>
      <blockquote style="border-left: 4px solid #007bff; padding-left: 16px; margin: 16px 0; color: #666;">
        ${comment.content}
      </blockquote>
      <a href="${process.env.FRONTEND_URL}/blog/${post.slug}#comment-${comment.id}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">
        View Comment
      </a>
      <p style="color: #666; font-size: 14px;">
        Best regards,<br>
        The Blog Platform Team
      </p>
    </div>
  `;

  return sendEmail({
    to: postAuthor.email,
    subject,
    html
  });
};

module.exports = {
  initEmailTransporter,
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendCommentNotification
};