import express from 'express';
import { register, login } from '../controllers/auth';

const router = express.Router();

// Register route
// @ts-ignore - Ignoring type issues with router.post
router.post('/register', register);

// Login route
// @ts-ignore - Ignoring type issues with router.post
router.post('/login', login);

export default router; 