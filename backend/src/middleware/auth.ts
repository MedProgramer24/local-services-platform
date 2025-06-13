import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../types/express';

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
    const user = await User.findOne({ _id: (decoded as any)._id });

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
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Please authenticate.' });
  }
};

export const checkRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    next();
  };
}; 