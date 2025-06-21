import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'document' | 'audio' | 'file';
  attachments: Array<{
    type: 'image' | 'document' | 'audio' | 'file';
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    thumbnailUrl?: string; // For images
    duration?: number; // For audio files (in seconds)
  }>;
  replyTo?: mongoose.Types.ObjectId;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: function() {
      // Content is required only if there are no attachments
      return !this.attachments || this.attachments.length === 0;
    },
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'document', 'audio', 'file'],
    default: 'text'
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'document', 'audio', 'file'],
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    thumbnailUrl: {
      type: String,
      required: false
    },
    duration: {
      type: Number,
      required: false
    }
  }],
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
    required: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ isRead: 1 });

// Auto-update conversation's lastMessage when new message is created
messageSchema.post('save', async function(doc) {
  const Conversation = mongoose.model('Conversation');
  
  await Conversation.findByIdAndUpdate(
    doc.conversationId,
    {
      lastMessage: {
        content: doc.content,
        sender: doc.sender,
        timestamp: doc.createdAt
      },
      updatedAt: new Date()
    }
  );
});

export const Message = mongoose.model<IMessage>('Message', messageSchema); 