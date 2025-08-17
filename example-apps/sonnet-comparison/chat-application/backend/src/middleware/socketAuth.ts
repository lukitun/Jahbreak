import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthenticatedSocket, JWTPayload } from '../types';

export const authenticateSocket = async (
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> => {
  try {
    // Get token from auth header or query
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next(new Error('JWT_SECRET not configured'));
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    if (!user) {
      return next(new Error('User not found'));
    }

    // Attach user info to socket
    (socket as AuthenticatedSocket).user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new Error('Invalid or expired token'));
    } else {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  }
};