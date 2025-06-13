import express from 'express';
import { auth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  getConversations,
  getConversation,
  createConversation,
  sendMessage,
  markAsRead,
  deleteConversation,
  getUnreadCount
} from '../controllers/conversationController';

const router = express.Router();

// Get all conversations for the authenticated user
router.get('/', auth, getConversations);

// Get unread message count
router.get('/unread-count', auth, getUnreadCount);

// Get a specific conversation with messages
router.get('/:conversationId', auth, getConversation);

// Create a new conversation
router.post('/', auth, createConversation);

// Send a message in a conversation (with file upload support)
router.post('/:conversationId/messages', auth, upload.array('attachments', 5), sendMessage);

// Mark conversation as read
router.post('/:conversationId/read', auth, markAsRead);

// Delete a conversation
router.delete('/:conversationId', auth, deleteConversation);

export default router; 