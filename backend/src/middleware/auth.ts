import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import mongoose from 'mongoose';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface JwtPayload {
  id: string;
}

// Middleware to protect routes
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_jwt_secret_key_here'
    ) as JwtPayload;

    // Get user from database
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Attach user to request object
    // @ts-ignore - Ignoring type issues with req.user
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Middleware to authorize specific user types
export const authorize = (userType: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.userType === userType) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: `Access denied: ${userType} only`,
      });
    }
  };
};

// Middleware to restrict access to admin only
export const adminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user && req.user.userType === 'Admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Admin only',
    });
  }
}; 