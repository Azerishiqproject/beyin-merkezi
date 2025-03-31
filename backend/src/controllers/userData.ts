import { Request, Response } from 'express';
import UserData from '../models/UserData';
import User from '../models/User';
import mongoose from 'mongoose';

// @desc    Create user data
// @route   POST /api/user-data
// @access  Private
export const createUserData = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    
    // Set userId to the authenticated user's ID
    // @ts-ignore - Ignoring type issues with req.user._id
    const userId = req.user?._id;

    // Create user data
    const userData = await UserData.create({
      userId,
      title,
      content,
    });

    return res.status(201).json({
      success: true,
      data: userData,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// @desc    Get all user data (with optional department filter)
// @route   GET /api/user-data
// @access  Private/Admin
export const getAllUserData = async (req: Request, res: Response) => {
  try {
    let query = {};
    
    // If department filter is provided
    if (req.query.departments) {
      // Find users in the specified department
      const users = await User.find({ 
        departmentId: req.query.departments 
      }).select('_id');
      
      // Extract user IDs
      const userIds = users.map(user => user._id);
      
      // Filter user data by these user IDs
      query = { userId: { $in: userIds } };
    }

    // Find user data based on query
    const userData = await UserData.find(query).populate({
      path: 'userId',
      select: 'email userType departmentId',
      populate: {
        path: 'departmentId',
        select: 'name'
      }
    });

    return res.status(200).json({
      success: true,
      count: userData.length,
      data: userData,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// @desc    Get user data by user ID
// @route   GET /api/user-data/:userId
// @access  Private
export const getUserDataByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    
    // Check if user is admin or the user is requesting their own data
    if (
      req.user?.userType !== 'Admin' && 
      // @ts-ignore - Ignoring type issues with req.user._id
      req.user?._id.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this user data',
      });
    }

    // Find user data
    const userData = await UserData.find({ userId });

    return res.status(200).json({
      success: true,
      count: userData.length,
      data: userData,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// @desc    Update user data
// @route   PUT /api/user-data/:id
// @access  Private
export const updateUserData = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    
    // Find user data
    const userData = await UserData.findById(req.params.id);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User data not found',
      });
    }

    // Check if user is admin or the owner of the data
    if (
      req.user?.userType !== 'Admin' && 
      // @ts-ignore - Ignoring type issues with req.user._id
      req.user?._id.toString() !== userData.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user data',
      });
    }

    // Update user data
    const updatedUserData = await UserData.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: updatedUserData,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// @desc    Delete user data
// @route   DELETE /api/user-data/:id
// @access  Private
export const deleteUserData = async (req: Request, res: Response) => {
  try {
    // Find user data
    const userData = await UserData.findById(req.params.id);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User data not found',
      });
    }

    // Check if user is admin or the owner of the data
    if (
      req.user?.userType !== 'Admin' && 
      // @ts-ignore - Ignoring type issues with req.user._id
      req.user?._id.toString() !== userData.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this user data',
      });
    }

    // Delete user data
    await UserData.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      data: {},
      message: 'User data deleted successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
}; 