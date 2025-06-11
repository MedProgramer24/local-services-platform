import { Request, Response } from 'express';
import { Document, Types } from 'mongoose';
import { User } from '../models/User';
import { ServiceProvider } from '../models/ServiceProvider';
import { initializeSubscription } from './subscriptionController';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Define User document type
interface IUserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'service_provider';
  phoneNumber: string;
  address?: string;
  businessName?: string;
  cities?: string[];
  serviceCategories?: string[];
  description?: string;
  commercialRegistration?: string;
}

const generateToken = (userId: string): string => {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET || 'your-super-secret-jwt-key', {
    expiresIn: '7d'
  });
};

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  type: 'customer' | 'provider';
  city?: string;
  contactName?: string;
  cities?: string[];
  serviceCategories?: string[];
  description?: string;
  commercialRegistration?: string;
}

export const register = async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  try {
    const { 
      name,
      email, 
      password, 
      phone,
      type,
      city,
      contactName,
      cities,
      serviceCategories,
      description,
      commercialRegistration,
    } = req.body;

    // Validate required fields
    if (!email || !password || !name || !phone || !type) {
      return res.status(400).json({ 
        message: 'جميع الحقول المطلوبة يجب ملؤها',
        fields: {
          email: !email ? 'البريد الإلكتروني مطلوب' : undefined,
          password: !password ? 'كلمة المرور مطلوبة' : undefined,
          name: !name ? 'الاسم مطلوب' : undefined,
          phone: !phone ? 'رقم الهاتف مطلوب' : undefined,
          type: !type ? 'نوع الحساب مطلوب' : undefined,
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'البريد الإلكتروني مسجل مسبقاً' });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName: type === 'provider' ? contactName || name : name.split(' ')[0],
      lastName: type === 'provider' ? undefined : name.split(' ').slice(1).join(' '),
      role: type === 'provider' ? 'service_provider' : 'user',
      phoneNumber: phone,
      address: type === 'customer' ? city : undefined,
      ...(type === 'provider' && {
        businessName: name,
        cities,
        serviceCategories,
        description,
        commercialRegistration,
      }),
    }) as IUserDocument;

    // If user is a service provider, create their service provider profile
    if (type === 'provider') {
      try {
        // Create a basic service provider profile
        const serviceProvider = await ServiceProvider.create({
          user: user._id,
          businessName: name,
          description: description || 'وصف الخدمات قيد التحديث',
          categories: [], // Will be updated later
          services: [], // Will be updated later
          location: {
            type: 'Point',
            coordinates: [0, 0], // Default coordinates, should be updated
            address: cities?.[0] || 'عنوان قيد التحديث',
            city: cities?.[0] || 'مدينة قيد التحديث',
            state: 'Morocco',
            country: 'Morocco',
            postalCode: '00000'
          },
          contactInfo: {
            phone,
            email
          },
          availability: {
            days: [
              { day: 'monday', isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
              { day: 'tuesday', isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
              { day: 'wednesday', isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
              { day: 'thursday', isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
              { day: 'friday', isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
              { day: 'saturday', isAvailable: false, slots: [] },
              { day: 'sunday', isAvailable: false, slots: [] }
            ]
          },
          isActive: true
        });

        // Initialize subscription for the service provider
        await initializeSubscription(serviceProvider._id);
      } catch (error) {
        console.error('Error creating service provider profile:', error);
        // Don't fail registration if profile creation fails
        // The user can update their profile later
      }
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Return user data and token
    res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: type === 'provider' ? user.businessName : `${user.firstName} ${user.lastName || ''}`.trim(),
        type,
        phone: user.phoneNumber,
        city: user.address,
        ...(type === 'provider' && {
          contactName: user.firstName,
          cities: user.cities,
          serviceCategories: user.serviceCategories,
          description: user.description,
          commercialRegistration: user.commercialRegistration,
        }),
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الحساب' });
  }
};

interface LoginRequest {
  email: string;
  password: string;
  type?: 'customer' | 'provider';
}

export const login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password, type } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'جميع الحقول المطلوبة يجب ملؤها',
        fields: {
          email: !email ? 'البريد الإلكتروني مطلوب' : undefined,
          password: !password ? 'كلمة المرور مطلوبة' : undefined,
        }
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    // Check if user type matches
    const userType = user.role === 'service_provider' ? 'provider' : 'customer';
    if (type && userType !== type) {
      return res.status(401).json({ message: 'نوع الحساب غير صحيح' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.role === 'service_provider' ? user.businessName : `${user.firstName} ${user.lastName}`.trim(),
        type: userType,
        phone: user.phoneNumber,
        city: user.role === 'user' ? user.address : undefined,
        // Additional provider fields
        ...(user.role === 'service_provider' && {
          contactName: user.firstName,
          cities: user.cities,
          serviceCategories: user.serviceCategories,
          description: user.description,
          commercialRegistration: user.commercialRegistration,
        }),
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الدخول' });
  }
}; 