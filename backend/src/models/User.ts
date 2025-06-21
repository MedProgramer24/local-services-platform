import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  role: 'user' | 'admin' | 'service_provider';
  phoneNumber?: string;
  address?: string;
  profileImage?: string; // URL to profile image
  // Provider specific fields
  businessName?: string;
  cities?: string[];
  serviceCategories?: string[];
  description?: string;
  commercialRegistration?: string;
  // Notification settings
  notificationSettings?: {
    bookingNotifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingNotifications: boolean;
    reminderNotifications: boolean;
  };
  // Payment metadata
  metadata?: {
    stripeCustomerId?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: function() {
      return this.role !== 'service_provider';
    },
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'service_provider'],
    default: 'user'
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    trim: true
  },
  // Provider specific fields
  businessName: {
    type: String,
    trim: true
  },
  cities: [{
    type: String,
    trim: true
  }],
  serviceCategories: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true
  },
  commercialRegistration: {
    type: String,
    trim: true
  },
  // Notification settings
  notificationSettings: {
    bookingNotifications: {
      type: Boolean,
      default: false
    },
    emailNotifications: {
      type: Boolean,
      default: false
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    marketingNotifications: {
      type: Boolean,
      default: false
    },
    reminderNotifications: {
      type: Boolean,
      default: false
    }
  },
  // Payment metadata
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema); 