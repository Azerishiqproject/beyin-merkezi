import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import generateToken from '../utils/generateToken';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const { 
      email, 
      password, 
      userType, 
      departmentId,
      firstName,
      lastName,
      academicDegree,
      averageScore
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      userType,
      departmentId,
      firstName,
      lastName,
      academicDegree,
      averageScore
    });

    if (user) {
      // Generate token
      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          email: user.email,
          userType: user.userType,
          departmentId: user.departmentId,
          firstName: user.firstName,
          lastName: user.lastName,
          academicDegree: user.academicDegree,
          averageScore: user.averageScore,
          token,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user data',
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        userType: user.userType,
        departmentId: user.departmentId,
        firstName: user.firstName,
        lastName: user.lastName,
        academicDegree: user.academicDegree,
        averageScore: user.averageScore,
        token,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
}; 