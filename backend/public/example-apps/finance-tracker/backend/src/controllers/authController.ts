import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import User from '../models/User';
import { verify2FA } from '../middleware/authMiddleware';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, defaultCurrency } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      defaultCurrency: defaultCurrency || 'USD'
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id }, 
      process.env.JWT_SECRET || 'default_secret', 
      { expiresIn: '1h' }
    );

    res.status(201).json({ 
      token, 
      user: { 
        id: newUser._id, 
        email: newUser.email, 
        firstName: newUser.firstName, 
        lastName: newUser.lastName 
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'default_secret', 
      { expiresIn: '1h' }
    );

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName,
        isTwoFactorEnabled: user.isTwoFactorEnabled
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const enable2FA = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    // Generate 2FA secret
    const secret = speakeasy.generateSecret({ name: "FinanceTracker" });

    // Update user with 2FA secret
    await User.findByIdAndUpdate(userId, {
      twoFactorSecret: secret.base32,
      isTwoFactorEnabled: true
    });

    res.json({ 
      secret: secret.base32,
      otpAuthUrl: secret.otpauth_url 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error enabling two-factor authentication' });
  }
};

export const verify2FAToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.userId);

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: 'Two-factor authentication not set up' });
    }

    const isValid = verify2FA(user.twoFactorSecret, token);

    if (isValid) {
      res.json({ message: 'Two-factor authentication verified successfully' });
    } else {
      res.status(400).json({ message: 'Invalid two-factor authentication token' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying two-factor authentication' });
  }
};