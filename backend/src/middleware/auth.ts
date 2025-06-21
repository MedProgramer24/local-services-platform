import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../types/express';

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Auth middleware - Token:', token ? 'Present' : 'Missing');

    if (!token) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
    console.log('Auth middleware - Decoded token:', decoded);
    
    const user = await User.findOne({ _id: (decoded as any)._id });
    console.log('Auth middleware - User found:', user ? { id: user._id, role: user.role } : 'Not found');

    if (!user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    req.user = {
      _id: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      businessName: user.businessName,
      phoneNumber: user.phoneNumber,
      address: user.address,
      cities: user.cities,
      serviceCategories: user.serviceCategories,
      description: user.description,
      commercialRegistration: user.commercialRegistration,
    };
    
    console.log('Auth middleware - User set in request:', { id: req.user.id, role: req.user.role });
    next();
  } catch (error) {
    console.error('Auth middleware - Error:', error);
    return res.status(401).json({ message: 'Please authenticate.' });
  }
};

export const checkRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log('Role check - Required roles:', roles);
    console.log('Role check - User role:', req.user?.role);
    
    if (!req.user) {
      console.log('Role check - No user found');
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    if (!roles.includes(req.user.role)) {
      console.log('Role check - Access denied. User role:', req.user.role, 'Required roles:', roles);
      return res.status(403).json({ message: 'Access denied.' });
    }

    console.log('Role check - Access granted');
    next();
  };
}; 