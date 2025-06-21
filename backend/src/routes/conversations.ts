import express from 'express';
import { body } from 'express-validator';
import { auth, checkRole } from '../middleware/auth';
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
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { AuthRequest } from '../types/express';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Route to serve images with proper CORS headers
router.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, '../../uploads/chat/images', filename);
  
  // Check if file exists
  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ error: 'Image not found' });
  }
  
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  // Set appropriate content type
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  
  if (mimeTypes[ext]) {
    res.header('Content-Type', mimeTypes[ext]);
  }
  
  // Stream the file
  const stream = fs.createReadStream(imagePath);
  stream.pipe(res);
  
  stream.on('error', (err) => {
    console.error('Error streaming image:', err);
    res.status(500).json({ error: 'Error serving image' });
  });
});

// Route to serve audio files with proper CORS headers
router.get('/audio/:filename', (req, res) => {
  const filename = req.params.filename;
  const audioPath = path.join(__dirname, '../../uploads/chat/audio', filename);
  
  // Check if file exists
  if (!fs.existsSync(audioPath)) {
    return res.status(404).json({ error: 'Audio file not found' });
  }
  
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Range');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.header('Accept-Ranges', 'bytes');
  
  // Set appropriate content type
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.webm': 'audio/webm',
    '.m4a': 'audio/mp4'
  };
  
  if (mimeTypes[ext]) {
    res.header('Content-Type', mimeTypes[ext]);
  }
  
  // Stream the file
  const stream = fs.createReadStream(audioPath);
  stream.pipe(res);
  
  stream.on('error', (err) => {
    console.error('Error streaming audio:', err);
    res.status(500).json({ error: 'Error serving audio file' });
  });
});

// Test endpoint for debugging
router.post('/test-message', auth, (req, res) => {
  console.log('=== TEST MESSAGE ENDPOINT ===');
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);
  console.log('User:', req.user);
  
  res.json({ 
    message: 'Test endpoint working',
    body: req.body,
    files: req.files,
    user: req.user
  });
});

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