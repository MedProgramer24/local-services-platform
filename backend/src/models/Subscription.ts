import mongoose, { Document, Schema } from 'mongoose';
import { IServiceProvider } from './ServiceProvider';

export interface ISubscription extends Document {
  serviceProvider: mongoose.Types.ObjectId | IServiceProvider;
  status: 'trial' | 'active' | 'expired';
  startDate: Date;
  endDate: Date;
  trialEndDate: Date;
  lastPaymentDate?: Date;
  paymentAmount?: number;
  paymentStatus?: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>({
  serviceProvider: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  status: {
    type: String,
    enum: ['trial', 'active', 'expired'],
    default: 'trial'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  trialEndDate: {
    type: Date,
    required: true
  },
  lastPaymentDate: {
    type: Date
  },
  paymentAmount: {
    type: Number,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed']
  }
}, {
  timestamps: true
});

// Add index for faster queries
subscriptionSchema.index({ serviceProvider: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 }, { expireAfterSeconds: 0 }); // TTL index for expired subscriptions

export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema); 