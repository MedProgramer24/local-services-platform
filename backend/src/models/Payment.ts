import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IServiceProvider } from './ServiceProvider';
import { IBooking } from './Booking';

export interface IPayment extends Document {
  customer: mongoose.Types.ObjectId | IUser;
  provider?: mongoose.Types.ObjectId | IServiceProvider;
  booking?: mongoose.Types.ObjectId | IBooking;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod: 'card' | 'mobile_money' | 'bank_transfer' | 'cash';
  paymentProvider: 'stripe' | 'paypal' | 'local';
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  description: string;
  metadata?: Record<string, any>;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceProvider'
  },
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'mad',
    enum: ['mad', 'usd', 'eur']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'mobile_money', 'bank_transfer', 'cash'],
    required: true
  },
  paymentProvider: {
    type: String,
    enum: ['stripe', 'paypal', 'local'],
    required: true
  },
  stripePaymentIntentId: {
    type: String
  },
  stripeCustomerId: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: Schema.Types.Mixed
  },
  refundAmount: {
    type: Number,
    min: 0
  },
  refundReason: {
    type: String
  },
  refundedAt: {
    type: Date
  },
  failureReason: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
paymentSchema.index({ customer: 1, createdAt: -1 });
paymentSchema.index({ provider: 1, createdAt: -1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 }, { sparse: true });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema); 