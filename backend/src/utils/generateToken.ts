import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

const generateToken = (user: IUser): string => {
  const payload = { id: user._id };
  const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
  const options = { expiresIn: process.env.JWT_EXPIRE || '30d' };
  
  // @ts-ignore - Ignoring type issues with jwt.sign
  return jwt.sign(payload, secret, options);
};

export default generateToken; 