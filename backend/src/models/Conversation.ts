import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  bookingId?: mongoose.Types.ObjectId;
  lastMessage?: {
    content: string;
    sender: mongoose.Types.ObjectId;
    timestamp: Date;
  };
  unreadCount: Map<string, number>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: false
  },
  lastMessage: {
    content: {
      type: String,
      required: false
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    timestamp: {
      type: Date,
      required: false
    }
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
conversationSchema.index({ participants: 1, isActive: 1 });
conversationSchema.index({ updatedAt: -1 });

// Ensure participants array has exactly 2 users
conversationSchema.pre('save', function(next) {
  if (this.participants.length !== 2) {
    return next(new Error('Conversation must have exactly 2 participants'));
  }
  next();
});

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema); 