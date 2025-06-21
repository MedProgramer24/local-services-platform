import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IServiceCategory } from './ServiceCategory';

export interface IServiceProvider extends Document {
  user: mongoose.Types.ObjectId | IUser;
  businessName: string;
  description: string;
  profileImage?: string; // URL to profile image
  coverImage?: string; // URL to cover image
  categories: mongoose.Types.ObjectId[] | IServiceCategory[];
  services: {
    name: string;
    description: string;
    price: number;
    duration: number; // in minutes
    category: mongoose.Types.ObjectId | IServiceCategory;
    images?: string[]; // URLs to service images
  }[];
  location: {
    type: string;
    coordinates: number[];
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  availability: {
    days: {
      day: string;
      isAvailable: boolean;
      slots: {
        start: string;
        end: string;
      }[];
    }[];
  };
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  isActive: boolean;
  subscriptionStatus: 'trial' | 'active' | 'expired';
  subscriptionEndDate?: Date;
  trialEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const serviceProviderSchema = new Schema<IServiceProvider>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  profileImage: {
    type: String,
    trim: true
  },
  coverImage: {
    type: String,
    trim: true
  },
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'ServiceCategory',
    required: true
  }],
  services: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    duration: {
      type: Number,
      required: true,
      min: 15 // minimum 15 minutes
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      required: true
    },
    images: [{
      type: String,
      trim: true
    }]
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    },
    postalCode: {
      type: String,
      required: true,
      trim: true
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  availability: {
    days: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        required: true
      },
      isAvailable: {
        type: Boolean,
        default: true
      },
      slots: [{
        start: {
          type: String,
          required: true,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        },
        end: {
          type: String,
          required: true,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        }
      }]
    }]
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscriptionStatus: {
    type: String,
    enum: ['trial', 'active', 'expired'],
    default: 'trial'
  },
  subscriptionEndDate: {
    type: Date
  },
  trialEndDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Create indexes
serviceProviderSchema.index({ 'location.coordinates': '2dsphere' });
serviceProviderSchema.index({ businessName: 'text', description: 'text' });

export const ServiceProvider = mongoose.model<IServiceProvider>('ServiceProvider', serviceProviderSchema); 