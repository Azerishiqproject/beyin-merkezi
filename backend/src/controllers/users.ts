import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import mongoose from 'mongoose';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req: Request, res: Response) => {
  try {
    // Extract query parameters
    const departmentId = req.query.departmentId as string;
    const year = req.query.year as string;
    
    console.log('Query params for users:', { departmentId, year });
    
    // Build query
    let query: any = {};
    
    // If departmentId is provided, filter users by department
    if (departmentId) {
      query.departmentId = departmentId;
    }
    
    // If year is provided, filter users by creation date
    if (year) {
      const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
      query.createdAt = { $gte: startDate, $lte: endDate };
    }
    
    console.log('Built query for users:', query);

    const users = await User.find(query)
      .select('-password')
      .populate('departmentId', 'name');

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('departmentId', 'name');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is admin or the user is requesting their own data
    if (
      req.user?.userType !== 'Admin' && 
      // @ts-ignore - Ignoring type issues with req.user._id
      req.user?._id.toString() !== req.params.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this user data',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = async (req: Request, res: Response) => {
  try {
    // Check if user is admin or the user is updating their own data
    if (
      req.user?.userType !== 'Admin' && 
      // @ts-ignore - Ignoring type issues with req.user._id
      req.user?._id.toString() !== req.params.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user',
      });
    }

    // Find user
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Only admin can change userType
    if (req.body.userType && req.user?.userType !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to change user type',
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    )
      .select('-password')
      .populate('departmentId', 'name');

    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
export const deleteUser = async (req: Request, res: Response) => {
  try {
    // Check if user is admin or the user is deleting their own account
    if (
      req.user?.userType !== 'Admin' && 
      // @ts-ignore - Ignoring type issues with req.user._id
      req.user?._id.toString() !== req.params.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this user',
      });
    }

    // Find user
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      data: {},
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
}; 