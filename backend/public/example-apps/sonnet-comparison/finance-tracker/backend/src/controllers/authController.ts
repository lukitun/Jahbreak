import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User, { IUser } from '../models/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { createError } from '../middleware/errorHandler';
import emailService from '../utils/emailService';

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, preferredCurrency } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError('User already exists', 400);
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      preferredCurrency: preferredCurrency || 'USD'
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id.toString());

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(email, firstName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        preferredCurrency: user.preferredCurrency,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    throw error;
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password +twoFactorSecret');
    if (!user) {
      throw createError('Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw createError('Invalid credentials', 401);
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      if (!twoFactorCode) {
        return res.status(200).json({
          success: true,
          requiresTwoFactor: true,
          message: 'Two-factor authentication required'
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 2
      });

      if (!verified) {
        throw createError('Invalid two-factor authentication code', 401);
      }
    }

    // Generate JWT token
    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        preferredCurrency: user.preferredCurrency,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    throw error;
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { firstName, lastName, preferredCurrency } = req.body;
    const userId = req.user!._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, preferredCurrency },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!._id;

    // Get user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw createError('User not found', 404);
    }

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw createError('Current password is incorrect', 400);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    throw error;
  }
};

export const setup2FA = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Finance Tracker (${user.email})`,
      issuer: 'Finance Tracker'
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Save secret temporarily (not activated until verified)
    await User.findByIdAndUpdate(user._id, {
      twoFactorSecret: secret.base32
    });

    res.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      message: 'Scan the QR code with your authenticator app'
    });
  } catch (error) {
    throw error;
  }
};

export const verify2FA = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { token } = req.body;
    const userId = req.user!._id;

    // Get user with 2FA secret
    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user || !user.twoFactorSecret) {
      throw createError('Two-factor authentication not set up', 400);
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2
    });

    if (!verified) {
      throw createError('Invalid authentication code', 400);
    }

    // Enable 2FA
    await User.findByIdAndUpdate(userId, {
      twoFactorEnabled: true
    });

    res.json({
      success: true,
      message: 'Two-factor authentication enabled successfully'
    });
  } catch (error) {
    throw error;
  }
};

export const disable2FA = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { password } = req.body;
    const userId = req.user!._id;

    // Get user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw createError('User not found', 404);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw createError('Invalid password', 400);
    }

    // Disable 2FA
    await User.findByIdAndUpdate(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: undefined
    });

    res.json({
      success: true,
      message: 'Two-factor authentication disabled successfully'
    });
  } catch (error) {
    throw error;
  }
};

export const refreshToken = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const token = generateToken(userId.toString());

    res.json({
      success: true,
      token
    });
  } catch (error) {
    throw error;
  }
};