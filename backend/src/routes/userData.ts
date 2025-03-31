import express from 'express';
import {
  createUserData,
  getAllUserData,
  getUserDataByUserId,
  updateUserData,
  deleteUserData,
} from '../controllers/userData';
import { protect, adminOnly } from '../middleware/auth';

const router = express.Router();

// Protect all routes
// @ts-ignore - Ignoring type issues with router.use
router.use(protect);

// Routes for all authenticated users
// @ts-ignore - Ignoring type issues with router.post
router.post('/', createUserData);
// @ts-ignore - Ignoring type issues with router.get
router.get('/:userId', getUserDataByUserId);
// @ts-ignore - Ignoring type issues with router.put
router.put('/:id', updateUserData);
// @ts-ignore - Ignoring type issues with router.delete
router.delete('/:id', deleteUserData);

// Admin only routes
// @ts-ignore - Ignoring type issues with router.get
router.get('/', adminOnly, getAllUserData);

export default router; 