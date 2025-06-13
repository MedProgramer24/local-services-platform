import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IServiceProvider } from './ServiceProvider';

export interface IBooking extends Document {
  customer: mongoose.Types.ObjectId | IUser;
  provider: mongoose.Types.ObjectId | IServiceProvider;
  serviceName: string;
  serviceDescription?: string;
  date: Date;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  price: number;
  address: string;
  customerNotes?: string;
  providerNotes?: string;
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  serviceName: {
    type: String,
    required: true,
    trim: true
  },
  serviceDescription: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  customerNotes: {
    type: String,
    trim: true
  },
  providerNotes: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create indexes
bookingSchema.index({ customer: 1, date: -1 });
bookingSchema.index({ provider: 1, date: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ date: 1 });

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema); 