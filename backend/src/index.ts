import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import userDataRoutes from './routes/userData';
import departmentRoutes from './routes/departments';
import evaluationRoutes from './routes/evaluations';

// Load environment variables
dotenv.config();

// Create Express application
const app: Application = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://beyin-merkezi.vercel.app', 
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user-data', userDataRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/evaluations', evaluationRoutes);

// Default route
app.get('/', (req: Request, res: Response) => {
  res.send('Beyin Merkezi API is running');
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beyin-merkezi';
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGODB_URI, {
    ssl: true,
    tlsAllowInvalidCertificates: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

export default app; 