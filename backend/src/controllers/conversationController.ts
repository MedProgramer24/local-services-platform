import { Request, Response } from 'express';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { AuthRequest } from '../types/auth';

// Get all conversations for a user
export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    })
    .populate('participants', 'name email avatar type')
    .populate('bookingId', 'serviceName date time status')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Conversation.countDocuments({
      participants: userId,
      isActive: true
    });

    // Get unread counts for each conversation
    const conversationsWithUnread = conversations.map(conv => {
      const unreadCount = conv.unreadCount.get(userId) || 0;
      return {
        ...conv.toObject(),
        unreadCount
      };
    });

    return res.json({
      conversations: conversationsWithUnread,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء جلب المحادثات' });
  }
};

// Get a specific conversation with messages
export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
      isActive: true
    })
    .populate('participants', 'name email avatar type')
    .populate('bookingId', 'serviceName date time status price');

    if (!conversation) {
      return res.status(404).json({ message: 'المحادثة غير موجودة' });
    }

    // Get messages for this conversation
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name email avatar type')
      .populate('replyTo', 'content sender')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ conversationId });

    // Mark messages as read
    await Message.updateMany(
      { 
        conversationId, 
        sender: { $ne: userId }, 
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    // Reset unread count for this conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      [`unreadCount.${userId}`]: 0
    });

    return res.json({
      conversation,
      messages: messages.reverse(), // Show oldest first
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء جلب المحادثة' });
  }
};

// Create a new conversation
export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    const { participantId, bookingId, initialMessage } = req.body;
    const userId = req.user._id;

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] },
      isActive: true
    });

    if (existingConversation) {
      return res.json({ 
        conversation: existingConversation,
        message: 'المحادثة موجودة بالفعل'
      });
    }

    // Create new conversation
    const conversation = new Conversation({
      participants: [userId, participantId],
      bookingId: bookingId || null,
      unreadCount: new Map([[participantId, 0]])
    });

    await conversation.save();

    // Send initial message if provided
    if (initialMessage) {
      const message = new Message({
        conversationId: conversation._id,
        sender: userId,
        content: initialMessage,
        messageType: 'text'
      });

      await message.save();

      // Update conversation with last message
      conversation.lastMessage = {
        content: initialMessage,
        sender: userId,
        timestamp: message.createdAt
      };
      conversation.unreadCount.set(participantId, 1);
      await conversation.save();
    }

    // Populate conversation data
    await conversation.populate('participants', 'name email avatar type');
    if (bookingId) {
      await conversation.populate('bookingId', 'serviceName date time status');
    }

    // Emit socket event to notify participants about new conversation
    const io = req.app.get('io');
    if (io) {
      console.log('Emitting newConversation to participants:', [userId, participantId]);
      io.to(userId.toString()).emit('newConversation', conversation);
      io.to(participantId.toString()).emit('newConversation', conversation);
    }

    return res.status(201).json({ 
      conversation,
      message: 'تم إنشاء المحادثة بنجاح'
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء إنشاء المحادثة' });
  }
};

// Send a message
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    const { conversationId } = req.params;
    const { content, messageType = 'text', attachments, replyTo } = req.body;
    const userId = req.user._id;

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
      isActive: true
    });

    if (!conversation) {
      return res.status(404).json({ message: 'المحادثة غير موجودة' });
    }

    // Create message
    const message = new Message({
      conversationId,
      sender: userId,
      content,
      messageType,
      attachments: attachments || [],
      replyTo: replyTo || null
    });

    await message.save();

    // Update conversation unread count for other participant
    const otherParticipant = conversation.participants.find(
      p => p.toString() !== userId.toString()
    );
    
    if (otherParticipant) {
      const currentUnread = conversation.unreadCount.get(otherParticipant.toString()) || 0;
      conversation.unreadCount.set(otherParticipant.toString(), currentUnread + 1);
      await conversation.save();
    }

    // Populate message data
    await message.populate('sender', 'name email avatar type');
    if (replyTo) {
      await message.populate('replyTo', 'content sender');
    }

    // Emit socket event for real-time delivery
    const io = req.app.get('io');
    if (io) {
      console.log('Emitting newMessage to conversation:', conversationId);
      io.to(conversationId.toString()).emit('newMessage', message);
    }

    return res.status(201).json({ 
      message: message,
      success: true
    });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء إرسال الرسالة' });
  }
};

// Mark conversation as read
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    const { conversationId } = req.params;
    const userId = req.user._id;

    // Mark all unread messages as read
    await Message.updateMany(
      { 
        conversationId, 
        sender: { $ne: userId }, 
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    // Reset unread count
    await Conversation.findByIdAndUpdate(conversationId, {
      [`unreadCount.${userId}`]: 0
    });

    return res.json({ message: 'تم تحديث حالة القراءة' });
  } catch (error) {
    console.error('Mark as read error:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء تحديث حالة القراءة' });
  }
};

// Delete conversation
export const deleteConversation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
      isActive: true
    });

    if (!conversation) {
      return res.status(404).json({ message: 'المحادثة غير موجودة' });
    }

    // Soft delete - mark as inactive
    conversation.isActive = false;
    await conversation.save();

    return res.json({ message: 'تم حذف المحادثة بنجاح' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء حذف المحادثة' });
  }
};

// Get unread count for user
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }

    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    });

    const totalUnread = conversations.reduce((total, conv) => {
      return total + (conv.unreadCount.get(userId) || 0);
    }, 0);

    return res.json({ unreadCount: totalUnread });
  } catch (error) {
    console.error('Get unread count error:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء جلب عدد الرسائل غير المقروءة' });
  }
}; 