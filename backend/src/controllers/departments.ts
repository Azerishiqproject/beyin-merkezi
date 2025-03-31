import { Request, Response } from 'express';
import Department from '../models/Department';

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private/Admin
export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    // Create department
    const department = await Department.create({
      name,
      description,
    });

    return res.status(201).json({
      success: true,
      data: department,
    });
  } catch (error: any) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists',
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await Department.find();

    return res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// @desc    Get department by ID
// @route   GET /api/departments/:id
// @access  Public
export const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    // Find and update department
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error: any) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists',
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    await Department.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      data: {},
      message: 'Department deleted successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
}; 