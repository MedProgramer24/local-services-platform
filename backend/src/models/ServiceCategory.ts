import mongoose, { Document, Schema } from 'mongoose';

export interface IServiceCategory extends Document {
  name: string;
  description: string;
  icon?: string;
  slug: string;
  parent?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceCategorySchema = new Schema<IServiceCategory>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceCategory'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create slug from name before saving
serviceCategorySchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  next();
});

export const ServiceCategory = mongoose.model<IServiceCategory>('ServiceCategory', serviceCategorySchema); 