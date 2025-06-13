import { Request, Response } from 'express';
import { Document, Types } from 'mongoose';
import { User } from '../models/User';
import { ServiceProvider } from '../models/ServiceProvider';
import { initializeSubscription } from './subscriptionController';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../types/express';

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
        await initializeSubscription(serviceProvider._id.toString());
      } catch (error) {
        console.error('Error creating service provider profile:', error);
        // Don't fail registration if profile creation fails
        // The user can update their profile later
      }
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Return user data and token
    return res.status(201).json({
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
    return res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الحساب' });
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

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    // Check user type if specified
    if (type && user.role !== (type === 'provider' ? 'service_provider' : 'user')) {
      return res.status(401).json({ message: 'نوع الحساب غير صحيح' });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Return user data and token
    return res.status(200).json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.role === 'service_provider' ? user.businessName : `${user.firstName} ${user.lastName || ''}`.trim(),
        type: user.role === 'service_provider' ? 'provider' : 'customer',
        phone: user.phoneNumber,
        city: user.address,
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
    return res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الدخول' });
  }
};

interface ProfileUpdateRequest {
  name?: string;
  businessName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  city?: string;
  description?: string;
  commercialRegistration?: string;
}

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }
    
    const userId = req.user._id;
    const updateData = req.body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // Check if email is being updated and if it's already taken
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ email: updateData.email });
      if (existingUser) {
        return res.status(400).json({ message: 'البريد الإلكتروني مسجل مسبقاً' });
      }
    }

    // Update user fields
    const userUpdates: any = {};
    
    if (user.role === 'service_provider') {
      // Provider updates
      if (updateData.businessName) userUpdates.businessName = updateData.businessName;
      if (updateData.contactName) userUpdates.firstName = updateData.contactName;
      if (updateData.description) userUpdates.description = updateData.description;
      if (updateData.commercialRegistration) userUpdates.commercialRegistration = updateData.commercialRegistration;
    } else {
      // Customer updates
      if (updateData.name) {
        const nameParts = updateData.name.split(' ');
        userUpdates.firstName = nameParts[0];
        userUpdates.lastName = nameParts.slice(1).join(' ');
      }
    }

    // Common updates
    if (updateData.email) userUpdates.email = updateData.email;
    if (updateData.phone) userUpdates.phoneNumber = updateData.phone;
    if (updateData.city) userUpdates.address = updateData.city;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: userUpdates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // If user is a provider, also update their service provider profile
    if (user.role === 'service_provider') {
      const serviceProviderUpdates: any = {};
      
      if (updateData.businessName) serviceProviderUpdates.businessName = updateData.businessName;
      if (updateData.description) serviceProviderUpdates.description = updateData.description;
      if (updateData.phone) serviceProviderUpdates['contactInfo.phone'] = updateData.phone;
      if (updateData.email) serviceProviderUpdates['contactInfo.email'] = updateData.email;
      if (updateData.city) serviceProviderUpdates['location.city'] = updateData.city;

      await ServiceProvider.findOneAndUpdate(
        { user: userId },
        { $set: serviceProviderUpdates },
        { new: true }
      );
    }

    // Return updated user data
    return res.json({
      message: 'تم تحديث الملف الشخصي بنجاح',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.role === 'service_provider' ? updatedUser.businessName : `${updatedUser.firstName} ${updatedUser.lastName || ''}`.trim(),
        type: updatedUser.role === 'service_provider' ? 'provider' : 'customer',
        phone: updatedUser.phoneNumber,
        city: updatedUser.address,
        ...(updatedUser.role === 'service_provider' && {
          contactName: updatedUser.firstName,
          cities: updatedUser.cities,
          serviceCategories: updatedUser.serviceCategories,
          description: updatedUser.description,
          commercialRegistration: updatedUser.commercialRegistration,
        }),
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء تحديث الملف الشخصي' });
  }
};

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }
    
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'كلمة المرور الحالية غير صحيحة' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    return res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء تغيير كلمة المرور' });
  }
};

interface NotificationSettings {
  bookingNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingNotifications: boolean;
  reminderNotifications: boolean;
}

export const updateNotificationSettings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }
    
    const userId = req.user._id;
    const settings = req.body;

    // Update user's notification settings
    await User.findByIdAndUpdate(userId, { 
      notificationSettings: settings 
    });

    return res.json({ 
      message: 'تم حفظ إعدادات الإشعارات بنجاح',
      settings 
    });
  } catch (error) {
    console.error('Notification settings update error:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء حفظ إعدادات الإشعارات' });
  }
}; 