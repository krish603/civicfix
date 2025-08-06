import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { extractTokenFromHeader, verifyToken, JWTPayload } from '../utils/jwt';
import { mockAuthService, defaultMockUser } from './mockAuth';
import mongoose from 'mongoose';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Use mock authentication
      const user = mockAuthService.getUser(token);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
      req.user = user;
      return next();
    }

    const decoded: JWTPayload = verifyToken(token);

    // Find user and attach to request
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user account deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      // Check if MongoDB is connected
      if (mongoose.connection.readyState !== 1) {
        // Use mock authentication
        const user = mockAuthService.getUser(token);
        if (user) {
          req.user = user;
        }
      } else {
        const decoded: JWTPayload = verifyToken(token);
        const user = await User.findById(decoded.userId).select('-password');

        if (user && user.status === 'active') {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};
