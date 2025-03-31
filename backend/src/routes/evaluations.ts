import express from 'express';
import { protect, adminOnly } from '../middleware/auth';
import {
  createEvaluation,
  getEvaluations,
  getEvaluationsByUserId,
  getEvaluationById,
  updateEvaluation,
  deleteEvaluation
} from '../controllers/evaluations';

const router = express.Router();

// Protect all routes
// @ts-ignore - Ignoring type issues with router.use
router.use(protect);

// Admin only routes
// @ts-ignore - Ignoring type issues with router.route
router.route('/')
  // @ts-ignore - Ignoring type issues with get
  .get(getEvaluations)
  // @ts-ignore - Ignoring type issues with post
  .post(adminOnly, createEvaluation);

// Get evaluations by user ID
// @ts-ignore - Ignoring type issues with router.route
router.route('/user/:userId')
  // @ts-ignore - Ignoring type issues with get
  .get(getEvaluationsByUserId);

// Evaluation routes by ID
// @ts-ignore - Ignoring type issues with router.route
router.route('/:id')
  // @ts-ignore - Ignoring type issues with get
  .get(getEvaluationById)
  // @ts-ignore - Ignoring type issues with put
  .put(adminOnly, updateEvaluation)
  // @ts-ignore - Ignoring type issues with delete
  .delete(adminOnly, deleteEvaluation);

export default router; 