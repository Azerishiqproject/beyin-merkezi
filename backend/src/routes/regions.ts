import express from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../controllers/departmentController';

const router = express.Router();

// @ts-ignore
router.get('/', protect, getDepartments);
// @ts-ignore
router.post('/', protect, authorize('Admin'), createDepartment);

// @ts-ignore
router.get('/:id', protect, getDepartment);
// @ts-ignore
router.put('/:id', protect, authorize('Admin'), updateDepartment);
// @ts-ignore
router.delete('/:id', protect, authorize('Admin'), deleteDepartment);

export default router; 