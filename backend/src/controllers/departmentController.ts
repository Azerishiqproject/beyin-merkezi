import { Request, Response, NextFunction } from 'express';
import Department from '../models/Department';

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
export const getDepartments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const departments = await Department.find();

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Departamentları getirirken bir xeta yaranadi'
    });
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
export const getDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      res.status(404).json({
        success: false,
        message: `Departament tapilmadi: ${req.params.id}`
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: department
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Departamentı getirirken bir xeta yaranadi'
    });
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private/Admin
export const createDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const department = await Department.create(req.body);

    res.status(201).json({
      success: true,
      data: department
    });
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Bu adla bir departament artıq var'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Departament yaradilirken bir xeta yaranadi'
    });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
export const updateDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let department = await Department.findById(req.params.id);

    if (!department) {
      res.status(404).json({
        success: false,
        message: `Departament tapilmadi: ${req.params.id}`
      });
      return;
    }

    department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: department
    });
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Bu adla bir departament artıq var'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Departament yenilenirken bir xeta yaranadi'
    });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
export const deleteDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      res.status(404).json({
        success: false,
        message: `Departament tapilmadi: ${req.params.id}`
      });
      return;
    }

    await department.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Departament silinirken bir xeta yaranadi'
    });
  }
}; 