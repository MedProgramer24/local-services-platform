import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
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
    required: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
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