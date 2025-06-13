import express from 'express';
import { register, login, updateProfile, changePassword, updateNotificationSettings } from '../controllers/authController';
import { body } from 'express-validator';
import { auth } from '../middleware/auth';
import { User } from '../models/User';

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('role').optional().isIn(['user', 'admin', 'service_provider']).withMessage('Invalid role')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const profileUpdateValidation = [
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('phone').optional().isLength({ min: 10 }).withMessage('Phone number must be at least 10 characters'),
  body('city').optional().notEmpty().withMessage('City is required'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
];

// Routes
router.get('/customers', auth, async (req, res) => {
  try {
    console.log('Fetching customers...');
    console.log('User making request:', req.user);
    
    // Check if database is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected');
      return res.status(500).json({ message: 'Database not connected' });
    }
    
    const customers = await User.find({ role: 'user' })
      .select('_id firstName lastName email phoneNumber address')
      .sort({ firstName: 1, lastName: 1 });

    console.log('Found customers:', customers.length);

    const formattedCustomers = customers.map((customer: any) => ({
      id: customer._id,
      _id: customer._id,
      name: `${customer.firstName} ${customer.lastName || ''}`.trim(),
      email: customer.email,
      phone: customer.phoneNumber,
      city: customer.address
    }));

    console.log('Formatted customers:', formattedCustomers.length);
    return res.json({ customers: formattedCustomers });
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.put('/profile', auth, profileUpdateValidation, updateProfile);
router.put('/change-password', auth, changePasswordValidation, changePassword);
router.put('/notifications', auth, updateNotificationSettings);

export default router; 